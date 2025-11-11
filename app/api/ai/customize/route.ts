import { NextResponse } from "next/server";
import { z } from "zod";
import { callOpenRouterChat } from "@/lib/openrouter";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const Schema = z.object({
    currentPlan: z.any(),
    request: z.string(),
    role: z.string().optional()
  });

  let body: z.infer<typeof Schema>;
  try { body = Schema.parse(await req.json()); }
  catch { return NextResponse.json({ error: "bad_request" }, { status: 422 }); }

  const system = `Ты — редактор онбординг-планов. На входе JSON-план.
Верни ТОЛЬКО JSON того же формата, но скорректированный с учётом запроса пользователя.
Формат: { "title": string, "assumptions": string[], "days": [{ "day": number, "focus": string, "tasks": string[] }]}.
Язык — русский.`;

  const user = `Роль: ${body.role || "—"}\nЗапрос: ${body.request}\nИсходный план:\n${JSON.stringify(body.currentPlan, null, 2)}`;

  try {
    const r = await callOpenRouterChat({ system, user, reasoning: false, maxTokens: 900, temperature: 0.3 });
    let plan: any = null;
    try { plan = JSON.parse(r.text); } catch { plan = r.json; }
    if (!plan) return NextResponse.json({ error: "parse_failed", raw: r.text }, { status: 502 });
    return NextResponse.json(plan);
  } catch (e:any) {
    return NextResponse.json({ error: "customize_failed", detail: String(e?.message || e) }, { status: 500 });
  }
}
