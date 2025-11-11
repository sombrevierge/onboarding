// app/api/import/text/route.ts
import { NextResponse } from "next/server";

// Эти пакеты поставим в dependencies:
// mammoth (DOCX), pdf-parse (PDF), xlsx (XLSX/CSV), csv-parse (CSV fallback)
import mammoth from "mammoth";
import pdfParse from "pdf-parse";
import * as XLSX from "xlsx";
import { parse as parseCSV } from "csv-parse/sync";

export const runtime = "nodejs"; // нужен Node runtime для парсеров

// ограничители
const MAX_FILES = 5;
const MAX_BYTES = 15 * 1024 * 1024; // 15MB на все файлы в сумме

function trunc(s: string, lim = 60_000) {
  if (!s) return s;
  return s.length > lim ? s.slice(0, lim) + "\n[...truncated...]" : s;
}

async function extractOne(file: File): Promise<{ name: string; mime: string; text: string }> {
  const mime = file.type || "application/octet-stream";
  const name = file.name || "file";
  const ab = await file.arrayBuffer();
  const buf = Buffer.from(ab);

  // TXT / Markdown / JSON быстро
  if (/^text\/|markdown|json/.test(mime) || /\.(txt|md|json)$/i.test(name)) {
    return { name, mime, text: buf.toString("utf8") };
  }

  // DOCX
  if (mime.includes("wordprocessingml") || /\.docx$/i.test(name)) {
    const r = await mammoth.extractRawText({ buffer: buf });
    return { name, mime, text: r.value || "" };
  }

  // PDF
  if (mime.includes("pdf") || /\.pdf$/i.test(name)) {
    const r = await pdfParse(buf);
    return { name, mime, text: r.text || "" };
  }

  // XLSX / XLS / CSV
  if (mime.includes("spreadsheet") || /\.(xlsx|xls)$/i.test(name)) {
    const wb = XLSX.read(buf, { type: "buffer" });
    const out: string[] = [];
    for (const sn of wb.SheetNames) {
      const ws = wb.Sheets[sn];
      const rows = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 });
      out.push(`# ${sn}\n` + rows.map(r => (r || []).join(" | ")).join("\n"));
    }
    return { name, mime, text: out.join("\n\n") };
  }
  if (mime.includes("csv") || /\.csv$/i.test(name)) {
    const rows = parseCSV(buf.toString("utf8"), { columns: true, skip_empty_lines: true });
    const cols = Object.keys(rows[0] || {});
    const txt = [
      cols.join(" | "),
      ...rows.map((r: any) => cols.map(c => (r[c] ?? "")).join(" | ")),
    ].join("\n");
    return { name, mime, text: txt };
  }

  // Fallback — пробуем как текст
  return { name, mime, text: buf.toString("utf8") };
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const files = form.getAll("files").filter(v => v instanceof File) as File[];

    if (!files.length) {
      return NextResponse.json({ error: "no_files" }, { status: 400 });
    }
    if (files.length > MAX_FILES) {
      return NextResponse.json({ error: "too_many_files" }, { status: 413 });
    }
    const sum = files.reduce((acc, f) => acc + (f.size || 0), 0);
    if (sum > MAX_BYTES) {
      return NextResponse.json({ error: "too_large" }, { status: 413 });
    }

    const pieces = await Promise.all(files.map(extractOne));
    const merged = pieces
      .map(p => `\n=== FILE: ${p.name} (${p.mime}) ===\n${trunc(p.text)}`)
      .join("\n");

    // Возвращаем общий текст и краткую сводку
    return NextResponse.json({
      ok: true,
      bytes: sum,
      files: pieces.map(p => ({ name: p.name, mime: p.mime, len: p.text.length })),
      text: trunc(merged, 120_000),
    });
  } catch (e: any) {
    return NextResponse.json({ error: "extract_failed", detail: String(e?.message || e) }, { status: 500 });
  }
}
