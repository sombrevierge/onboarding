export type LogChunk = { at: number; bytes: number; textPreview: string };
export type LogEntry = {
  id: string;
  startedAt: number;
  finishedAt?: number;
  route: string;
  model?: string;
  purpose?: string;
  status: "ok" | "error" | "running";
  chunks: LogChunk[];
  totalBytes: number;
  error?: string;
};

// In-memory store (demo). Resets on cold start / redeploy.
const GLOBAL_KEY = Symbol.for("__DEMO_LOG_STORE__");
type Store = { entries: LogEntry[]; push: (e: LogEntry)=>void; };
function createStore(): Store {
  const entries: LogEntry[] = [];
  return {
    entries,
    push(e){ entries.unshift(e); if (entries.length > 100) entries.pop(); }
  };
}

// @ts-ignore
const g = globalThis as any;
export const logStore: Store = g[GLOBAL_KEY] || (g[GLOBAL_KEY] = createStore());

export function startLog(route: string, model?: string, purpose?: string) {
  const id = Math.random().toString(36).slice(2);
  const entry: LogEntry = {
    id, startedAt: Date.now(), route, model, purpose, status: "running", chunks: [], totalBytes: 0
  };
  logStore.push(entry);
  return entry;
}
export function appendChunk(entry: LogEntry, chunk: Uint8Array) {
  entry.chunks.push({ at: Date.now(), bytes: chunk.byteLength, textPreview: new TextDecoder().decode(chunk).slice(0, 80) });
  entry.totalBytes += chunk.byteLength;
}
export function finalizeLog(entry: LogEntry, ok: boolean, err?: string) {
  entry.status = ok ? "ok" : "error";
  entry.finishedAt = Date.now();
  if (!ok && err) entry.error = err;
}
