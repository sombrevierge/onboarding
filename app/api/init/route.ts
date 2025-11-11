import { NextResponse } from "next/server";
import { writeSession } from "@/lib/session-store";
import { z } from "zod";

const Schema = z.object({ roleKey: z.string(), dbProvider: z.string() });

export async function POST(req: Request) {
  const body = await req.text();
  let data;
  try { data = Schema.parse(JSON.parse(body||"{}")); }
  catch { return NextResponse.json({ ok: false, error: "Неверные параметры" }, { status: 422 }); }
  writeSession({ roleKey: data.roleKey, dbProvider: data.dbProvider });
  // In real project: test connection by provider
  return NextResponse.json({ ok: true });
}
