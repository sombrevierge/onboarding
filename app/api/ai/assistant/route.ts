import { NextResponse } from "next/server";
import { z } from "zod";
import { callOpenRouterChat } from "@/lib/openrouter";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const Schema = z.object({
    q: z.string(),
    role: z.string().nullable().optional(),
    progress: z.number().nullable().optional(),
    planTitle: z.string().nullable().optional()
  });

  let body: z.infer<typeof Schema>;
  try { body = Schema.parse(await req.json()); }
  catch { return NextResponse.json({ error: "bad_request" }, { status: 422 }); }

  const system = `Ты — AI-ассистент онбординга. Отвечай кратко и конкретно: шаги, чек-листы, советы.
Учитывай контекст: роль=${body.role || "—"}, прогресс=${body.progress ?? 0}%, план="${body.planTitle || "-"}". Язык — русский.`;

  try {
    const r = await callOpenRouterChat({ system, user: body.q, reasoning: false, maxTokens: 500, temperature: 0.3 });
    const answer = r?.text || "Нет ответа.";
    return NextResponse.json({ answer });
  } catch (e:any) {
    return NextResponse.json({ error: "assistant_failed", detail: String(e?.message || e) }, { status: 500 });
  }
}
