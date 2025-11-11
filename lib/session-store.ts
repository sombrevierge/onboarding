// Session-only demo store using cookies (server) + localStorage (client for UI state)
import { cookies } from "next/headers";

export type DemoSession = {
  roleKey?: string;
  dbProvider?: string;
  progress?: Record<string, any>;
};

const COOKIE = "demo_session";

export function readSession(): DemoSession {
  const c = cookies().get(COOKIE)?.value;
  if (!c) return {};
  try { return JSON.parse(c); } catch { return {}; }
}

export function writeSession(patch: Partial<DemoSession>) {
  const current = readSession();
  const next = { ...current, ...patch };
  cookies().set(COOKIE, JSON.stringify(next), { httpOnly: true, sameSite: "lax" });
  return next;
}
