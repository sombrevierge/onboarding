// app/api/ai/generate/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { generatePlanJSON } from "@/lib/openrouter";
import { startLog, appendChunk, finalizeLog } from "@/lib/logger";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const Schema = z.object({
    modelId: z.string().optional(),
    purpose: z.enum(["survey", "plan", "explain"]),
    input: z.string(),
    maxTokens: z.number().optional(),
    temperature: z.number().optional()
  });

  let payload: z.infer<typeof Schema>;
  try {
    payload = Schema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 422 });
  }

  if (payload.purpose === "plan") {
    const log = startLog("/api/ai/generate", payload.modelId, "plan");
    try {
      const plan = await generatePlanJSON(payload.input, payload.modelId);
      appendChunk(log, new TextEncoder().encode("[plan-json] ok\n"));
      finalizeLog(log, true);
      return NextResponse.json(plan, { headers: { "Cache-Control": "no-store" } });
    } catch (e: any) {
      finalizeLog(log, false, String(e?.message || e));
      return NextResponse.json({ error: "generation_failed", detail: String(e?.message || e) }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "unsupported_purpose" }, { status: 400 });
}
