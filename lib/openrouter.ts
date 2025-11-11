export type GenerateArgs = {
  modelId?: string;
  purpose: "survey" | "plan" | "explain";
  input: string;
  maxTokens?: number;
  temperature?: number;
};

const SYSTEM_PLAN = `Ты — ассистент онбординга. Отвечай строго на русском.
Верни ТОЛЬКО JSON без комментариев по схеме:
{
  "title": string,
  "assumptions": string[],
  "days": [
    { "day": number, "focus": string, "tasks": string[] }
  ]
}`;

// try to extract clean JSON
function extractJsonObject(text: string): any {
  if (!text) return null;
  const t = text.trim();
  if (t.startsWith("{")) {
    try { return JSON.parse(t); } catch {}
  }
  const m = t.match(/\{[\s\S]*\}/);
  if (m) {
    try { return JSON.parse(m[0]); } catch {}
  }
  return null;
}

// repair broken JSON
function salvageJson(text: string): any {
  if (!text) return null;
  let t = text.trim();
  const start = t.indexOf("{");
  if (start < 0) return null;
  let end = t.lastIndexOf("}");
  if (end < 0) { t += "}"; end = t.lastIndexOf("}"); }
  let cand = t.slice(start, end + 1);
  const q = (cand.match(/"/g) || []).length;
  if (q % 2 !== 0) cand += '"';
  const sq = (cand.match(/\[/g) || []).length - (cand.match(/\]/g) || []).length;
  if (sq > 0) cand += "]".repeat(sq);
  const br = (cand.match(/\{/g) || []).length - (cand.match(/\}/g) || []).length;
  if (br > 0) cand += "}".repeat(br);
  cand = cand.replace(/,\s*([}\]])/g, "$1");
  try { return JSON.parse(cand); } catch { return null; }
}

// demo plan if no key
function demoPlan() {
  return {
    title: "Индивидуальный план на 7 дней",
    assumptions: ["Роль: Product Manager", "Фокус: быстрый вход и первый результат"],
    days: [
      { day: 1, focus: "Контекст и цели", tasks: ["Встреча с руководителем", "Цели 30/60/90", "Метрики продукта"] },
      { day: 2, focus: "Доступы и данные", tasks: ["Проверить доступы", "Карта источников", "Выбрать метрику"] },
      { day: 3, focus: "Гипотезы", tasks: ["2–3 гипотезы", "Оценка трудозатрат", "Черновик PRD"] },
      { day: 4, focus: "Согласование", tasks: ["Ревью PRD", "Критерии успеха", "Слоты релиза"] },
      { day: 5, focus: "Запуск", tasks: ["Спринт-тикеты", "Кик-офф", "Дашборд"] },
      { day: 6, focus: "Мониторинг", tasks: ["Первые сигналы", "Качественный фидбек", "План B"] },
      { day: 7, focus: "Ретро", tasks: ["Короткое ретро", "Обновить PRD", "Next steps 2 недели"] }
    ]
  };
}

export async function callOpenRouterChat(args: {
  modelId?: string;
  system?: string;
  user: string;
  maxTokens?: number;
  temperature?: number;
  reasoning?: boolean;
}) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    const plan = demoPlan();
    return { text: JSON.stringify(plan), message: { content: JSON.stringify(plan) }, json: plan, http: { ok: true, status: 200 } };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  const payload: any = {
    model: args.modelId || process.env.AI_DEFAULT_MODEL || "openrouter/polaris-alpha",
    messages: [
      args.system ? { role: "system", content: args.system } : undefined,
      { role: "user", content: args.user }
    ].filter(Boolean),
    max_tokens: args.maxTokens ?? 900,
    temperature: args.temperature ?? 0.4,
    stream: false
  };
  if (args.reasoning) payload.reasoning = { enabled: true };

  let res: Response;
  try {
    res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost",
        "X-Title": "Onboarding Demo"
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
  } catch (e: any) {
    clearTimeout(timeout);
    throw new Error("fetch_failed: " + String(e?.message || e));
  }
  clearTimeout(timeout);

  const textBody = await res.text();
  if (!res.ok) {
    return { text: "", message: null, json: null, http: { ok: false, status: res.status, body: textBody } };
  }

  let parsed: any = null;
  try { parsed = JSON.parse(textBody); } catch {
    const obj = extractJsonObject(textBody);
    return { text: textBody, message: { content: textBody }, json: obj, http: { ok: true, status: res.status } };
  }

  const message = parsed?.choices?.[0]?.message ?? null;
  const text = message?.content ?? "";
  const obj = extractJsonObject(text);
  return { text, message, json: obj, http: { ok: true, status: res.status } };
}

export async function generatePlanJSON(input: string, modelId?: string) {
  const { json, text, http } = await callOpenRouterChat({
    modelId,
    system: SYSTEM_PLAN,
    user: `Сформируй индивидуальный план. Контекст: ${input}`,
    maxTokens: 900,
    temperature: 0.4,
    reasoning: true
  });
  if (!http.ok) throw new Error("openrouter_http_error_" + http.status + ": " + String((http as any).body || "").slice(0, 300));
  if (json) return json;
  const salvaged = salvageJson(text);
  if (salvaged) return salvaged;
  throw new Error("json_parse_failed: " + String(text || "").slice(0, 300));
}
