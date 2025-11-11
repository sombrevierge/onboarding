// app/wizard/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { ROLE_PRESETS } from "@/lib/rolePresets";
import { motion, AnimatePresence } from "framer-motion";

type Day = { day: number; focus: string; tasks: string[] };
type Plan = { title: string; assumptions: string[]; days: Day[] };

function isPlan(x: any): x is Plan {
  return x && typeof x.title === "string" && Array.isArray(x.assumptions) && Array.isArray(x.days);
}

type DataSource = "mock" | "vercel_postgres" | "supabase" | "planetscale" | "mongodb";
type ImportedByRole = Record<string, Day[]>;

const DS_KEY = "wizard_datasource";
const DS_CFG_KEY = "wizard_datasource_cfg";
const IMPORT_KEY = "wizard_imported_tasks";

function norm(s: string) {
  return (s || "").toLowerCase().replace(/[^a-z0-9а-я_]+/gi, "");
}

/* -------- минимальный CSV-парсер -------- */
function parseCSV(text: string): Array<Record<string, string>> {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];
  const header = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((l) => {
    const row: string[] = [];
    let cur = "", inQ = false;
    for (let i = 0; i < l.length; i++) {
      const ch = l[i];
      if (ch === '"' && l[i + 1] === '"') { cur += '"'; i++; continue; }
      if (ch === '"') { inQ = !inQ; continue; }
      if (ch === "," && !inQ) { row.push(cur.trim()); cur = ""; continue; }
      cur += ch;
    }
    row.push(cur.trim());
    const obj: Record<string, string> = {};
    header.forEach((h, i) => (obj[h] = row[i] ?? ""));
    return obj;
  });
}

function mergeCSVToDays(rows: Array<Record<string, string>>): ImportedByRole {
  const out: ImportedByRole = {};
  for (const r of rows) {
    const role = norm(r.role || "default");
    const day = Number(r.day || "0");
    const focus = r.focus?.trim() || "";
    const task = r.task?.trim() || "";
    if (!day || !task) continue;
    out[role] ??= [];
    let bucket = out[role].find((d) => d.day === day);
    if (!bucket) {
      bucket = { day, focus, tasks: [] };
      out[role].push(bucket);
    } else if (focus && !bucket.focus) {
      bucket.focus = focus;
    }
    bucket.tasks.push(task);
  }
  for (const k of Object.keys(out)) out[k].sort((a, b) => a.day - b.day);
  return out;
}

/* ----------------------------- Компонент ----------------------------- */

export default function WizardPage() {
  const [role, setRole] = useState<string | null>(null);

  // источник данных
  const [dataSource, setDataSource] = useState<DataSource>("mock");
  const [dsConfig, setDsConfig] = useState<string>("");
  const [dsValidated, setDsValidated] = useState<boolean | null>(null);

  // кастомизация, план и ошибки
  const [customRequest, setCustomRequest] = useState("");
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("");
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  // импортированные задачи (JSON/CSV)
  const [imported, setImported] = useState<ImportedByRole>({});

  // прикреплённые любые файлы → объединённый текст
  const [attachedText, setAttachedText] = useState<string>("");
  const [attachInfo, setAttachInfo] = useState<string>("");

  // чекбоксы выполнения по ключу роли
  const doneKey = useMemo(() => `done_tasks_${role || "unknown"}`, [role]);
  const [done, setDone] = useState<Record<string, boolean>>({});

  /* -------- инициализация из sessionStorage -------- */
  useEffect(() => {
    try {
      const r = sessionStorage.getItem("current_role");
      if (r) setRole(r);
      const ds = sessionStorage.getItem(DS_KEY) as DataSource | null;
      if (ds) setDataSource(ds);
      const cfg = sessionStorage.getItem(DS_CFG_KEY);
      if (cfg) setDsConfig(cfg);
      const imp = sessionStorage.getItem(IMPORT_KEY);
      if (imp) setImported(JSON.parse(imp));
      const at = sessionStorage.getItem("wizard_attached_text");
      if (at) setAttachedText(at);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(doneKey);
      setDone(raw ? JSON.parse(raw) : {});
    } catch {}
  }, [doneKey]);

  useEffect(() => {
    try { sessionStorage.setItem(doneKey, JSON.stringify(done)); } catch {}
  }, [doneKey, done]);

  /* -------- helpers -------- */
  const selectedPreset = useMemo(
    () => ROLE_PRESETS.find((r) => r.id === role) || null,
    [role]
  );

  const toggleDone = (day: number, idx: number) => {
    const key = `${day}:${idx}`;
    setDone((d) => ({ ...d, [key]: !d[key] }));
  };

  const chooseRole = (id: string) => {
    setRole(id);
    try { sessionStorage.setItem("current_role", id); } catch {}
  };

  const saveDs = (ds: DataSource, cfg: string) => {
    setDataSource(ds);
    setDsConfig(cfg);
    setDsValidated(null);
    try {
      sessionStorage.setItem(DS_KEY, ds);
      sessionStorage.setItem(DS_CFG_KEY, cfg);
    } catch {}
  };

  // импорт JSON/CSV задач
  const handleFile = async (f: File) => {
    const buf = await f.text();
    let merged: ImportedByRole | null = null;

    if (f.name.toLowerCase().endsWith(".csv")) {
      merged = mergeCSVToDays(parseCSV(buf));
    } else {
      try {
        const obj = JSON.parse(buf);
        if (isPlan(obj)) {
          merged = { default: obj.days };
        } else if (obj && typeof obj === "object") {
          const m: ImportedByRole = {};
          for (const k of Object.keys(obj)) {
            const v = (obj as any)[k];
            if (Array.isArray(v)) {
              m[norm(k)] = v
                .filter((d) => d && typeof d.day === "number")
                .map((d) => ({
                  day: Number(d.day),
                  focus: String(d.focus || ""),
                  tasks: Array.isArray(d.tasks) ? d.tasks.map(String) : [],
                }))
                .sort((a, b) => a.day - b.day);
            } else if (isPlan(v)) {
              m[norm(k)] = v.days.sort((a, b) => a.day - b.day);
            }
          }
          merged = m;
        }
      } catch {}
    }

    if (!merged || Object.keys(merged).length === 0) {
      setError("Не удалось распознать файл. Поддерживаются JSON (Plan или record по ролям) и CSV с колонками role,day,focus,task.");
      return;
    }

    setImported(merged);
    setError(null);
    try { sessionStorage.setItem(IMPORT_KEY, JSON.stringify(merged)); } catch {}
  };

  // загрузка ЛЮБЫХ файлов → сервер извлекает текст
  async function uploadAnyFiles(fs: FileList | null) {
    if (!fs || fs.length === 0) return;
    const fd = new FormData();
    Array.from(fs).forEach((f) => fd.append("files", f));
    try {
      const res = await fetch("/api/import/text", { method: "POST", body: fd });
      const j = await res.json();
      if (!res.ok || !j?.ok) throw new Error(j?.error || "upload_failed");
      setAttachedText(String(j.text || ""));
      const info = (j.files || []).map((f: any) => `${f.name} (${f.mime}, ${f.len} симв.)`).join("; ");
      setAttachInfo(info);
      try { sessionStorage.setItem("wizard_attached_text", String(j.text || "")); } catch {}
    } catch (e: any) {
      setError("Не удалось извлечь текст из файлов: " + (e?.message || e));
    }
  }

  const testDataSource = async () => {
    try {
      const res = await fetch("/api/datasource/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: dataSource, config: dsConfig }),
      });
      setDsValidated(res.ok);
    } catch {
      setDsValidated(true);
    }
  };

  /* -------- генерация плана -------- */
  const generate = async () => {
    if (!role) {
      setError("Сначала выберите роль.");
      return;
    }
    setLoading(true);
    setError(null);
    setPlan(null);

    const roleKey = norm(role);
    const importedForRole: Day[] = imported[roleKey] || imported["default"] || [];

    const dsSummary =
      dataSource === "mock"
        ? "источник: Session Mock"
        : `источник: ${dataSource}, проверка соединения: ${dsValidated === null ? "не проверялась" : dsValidated ? "ОК" : "ошибка"}`;

    const baseRes = await fetch("/api/ai/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        purpose: "plan",
        input:
          `Роль: ${selectedPreset?.title}. ` +
          `Первые задачи роли: ${(selectedPreset?.firstTasks || []).join("; ")}. ` +
          `Кастомизация пользователя: ${customRequest || "нет"}. ` +
          `Импортированные задачи (сводка): ${importedForRole.length ? importedForRole.map(d => `Д${d.day}:${d.focus || ""}(${(d.tasks||[]).length})`).slice(0,10).join(", ") : "нет"}. ` +
          `${dsSummary}. ` +
          (attachedText ? `\n\n[ПРИКРЕПЛЁННЫЕ_МАТЕРИАЛЫ]\n${attachedText.slice(0, 80_000)}` : "") +
          `\n\nЦель: быстрый, конкретный, измеримый план онбординга на 14 дней.`,
      }),
    });

    let basePlan: Plan | null = null;
    const ct = baseRes.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      const json = await baseRes.json();
      if (baseRes.ok && isPlan(json)) basePlan = json;
    } else {
      try {
        const text = await baseRes.text();
        const obj = JSON.parse(text);
        if (isPlan(obj)) basePlan = obj;
      } catch {}
    }

    if (!basePlan) {
      setLoading(false);
      setError("Не удалось получить базовый план от модели.");
      return;
    }

    if (importedForRole.length) {
      const custRes = await fetch("/api/ai/customize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPlan: basePlan,
          role: selectedPreset?.title,
          importedDays: importedForRole,
          request:
            "Слей импортированные дни/задачи с текущим планом. Сохрани структуру {title, assumptions[], days[]}. Без дублей.",
        }),
      });
      const custCt = custRes.headers.get("content-type") || "";
      if (custCt.includes("application/json")) {
        const j = await custRes.json();
        if (custRes.ok && isPlan(j)) basePlan = j;
      }
    }

    setPlan(basePlan);
    try {
      sessionStorage.setItem("current_role", role);
      sessionStorage.setItem("plan_title", basePlan.title || "");
      sessionStorage.setItem("progress", "0");
    } catch {}

    setLoading(false);
  };

  /* -------- фильтрация и выбор дней -------- */
  const visibleDays = useMemo(() => {
    const ds = plan?.days || [];
    const base = selectedDays.length > 0 ? ds.filter((d) => selectedDays.includes(d.day)) : ds;
    if (!filter.trim()) return base;
    const needle = filter.toLowerCase();
    return base.filter(
      (d) =>
        (d.focus || "").toLowerCase().includes(needle) ||
        (d.tasks || []).some((t) => t.toLowerCase().includes(needle))
    );
  }, [plan, filter, selectedDays]);

  const toggleDaySelected = (d: number) => {
    setSelectedDays((arr) => (arr.includes(d) ? arr.filter((x) => x !== d) : [...arr, d]));
  };

  /* ------------------------------ UI ------------------------------ */

  return (
    <main className="py-10">
      <h1 className="text-3xl font-bold mb-2">Мастер онбординга</h1>
      <p className="opacity-80 mb-6">
        1) выберите роль, 2) задайте пожелания, 3) подключите источник или загрузите файлы/план, 4) сгенерируйте план.
      </p>

      {/* Шаг 1 — роли */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Выбор роли</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ROLE_PRESETS.map((r) => (
            <motion.button
              key={r.id}
              onClick={() => chooseRole(r.id)}
              className={`text-left rounded-2xl border p-4 transition ${
                role === r.id ? "border-indigo-500 bg-white" : "border-black/10 bg-white/70 hover:bg-white"
              }`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="font-semibold">{r.title}</div>
              <div className="text-sm opacity-75">{r.summary}</div>
              {r.firstTasks?.length > 0 && (
                <ul className="mt-2 text-sm list-disc pl-5">
                  {r.firstTasks.slice(0, 3).map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              )}
            </motion.button>
          ))}
        </div>
      </section>

      {/* Шаг 2 — пожелания */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Что хотите улучшить</h2>
        <textarea
          className="w-full h-24 p-3 rounded-xl border border-black/10"
          placeholder="Например: акцент на перформанс-оптимизации фронтенда и настройке CI для e2e-тестов"
          value={customRequest}
          onChange={(e) => setCustomRequest(e.target.value)}
        />
      </section>

      {/* Шаг 3 — источник данных и импорт */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Источник данных</h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="glass p-4">
            <div className="text-sm mb-2 opacity-70">Выберите провайдера</div>
            <select
              value={dataSource}
              onChange={(e) => saveDs(e.target.value as DataSource, dsConfig)}
              className="w-full rounded-xl border border-black/10 p-2 bg-white"
            >
              <option value="mock">Session Mock (демо)</option>
              <option value="vercel_postgres">Vercel Postgres</option>
              <option value="supabase">Supabase / Postgres</option>
              <option value="planetscale">PlanetScale / MySQL</option>
              <option value="mongodb">MongoDB / Atlas</option>
            </select>

            {dataSource !== "mock" && (
              <>
                <div className="text-sm mt-3 mb-1 opacity-70">Строка подключения / JSON-конфиг</div>
                <textarea
                  value={dsConfig}
                  onChange={(e) => saveDs(dataSource, e.target.value)}
                  placeholder="Например: URL/ключи. В демо сохраняется и участвует в промпте."
                  className="w-full h-24 p-2 rounded-xl border border-black/10"
                />
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={testDataSource}
                    className="rounded-xl bg-indigo-600 text-white px-3 py-2 text-sm"
                  >
                    Проверить соединение
                  </button>
                  {dsValidated !== null && (
                    <span className={"text-sm " + (dsValidated ? "text-green-600" : "text-red-600")}>
                      {dsValidated ? "Соединение ок (демо)" : "Ошибка проверки"}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="glass p-4">
            <div className="text-sm mb-2 opacity-70">Импорт плана/задач (JSON/CSV)</div>
            <input
              type="file"
              accept=".json,.csv"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleFile(f);
              }}
            />
            <div className="text-xs mt-2 opacity-70">
              JSON: Plan или record по ролям. CSV: колонки <code>role,day,focus,task</code>.
            </div>

            <hr className="my-4 border-black/10" />

            <div className="text-sm mb-2 opacity-70">Загрузка любых файлов (DOCX, PDF, XLSX/CSV, TXT, MD, JSON…)</div>
            <input type="file" multiple onChange={(e) => uploadAnyFiles(e.target.files)} />
            {attachInfo && <div className="text-sm mt-2">Извлечено: <b>{attachInfo}</b></div>}
          </div>
        </div>
      </section>

      {/* Генерация */}
      <div className="flex gap-3 items-center mb-6">
        <button
          onClick={generate}
          disabled={loading}
          className="rounded-xl bg-indigo-600 text-white px-4 py-2 disabled:opacity-50"
        >
          {loading ? "Генерируем…" : "Сгенерировать план"}
        </button>
        {error && <div className="text-sm text-red-600">{error}</div>}
      </div>

      {/* Результат */}
      {plan && (
        <>
          <div className="glass p-4 mb-4">
            <div className="font-semibold">{plan.title}</div>
            {plan.assumptions?.length > 0 && (
              <ul className="mt-1 text-sm list-disc pl-5 opacity-80">
                {plan.assumptions.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            )}
          </div>

          {/* Фильтры широкой выдачи */}
          <div className="flex flex-wrap gap-3 items-center mb-4">
            <input
              placeholder="Поиск по задачам/фокусу…"
              className="rounded-xl border border-black/10 p-2"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            <div className="text-sm opacity-70">Выбор дней:</div>
            <div className="flex flex-wrap gap-2">
              {(plan.days || []).map((d) => (
                <button
                  key={d.day}
                  onClick={() => toggleDaySelected(d.day)}
                  className={`px-3 py-1 rounded-full text-sm border ${
                    selectedDays.includes(d.day)
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white/70 border-black/10"
                  }`}
                >
                  День {d.day}
                </button>
              ))}
              {selectedDays.length > 0 && (
                <button
                  onClick={() => setSelectedDays([])}
                  className="px-3 py-1 rounded-full text-sm border bg-white"
                >
                  Сбросить
                </button>
              )}
            </div>
          </div>

          {/* Широкий список задач */}
          <section className="grid sm:grid-cols-2 gap-6">
            <AnimatePresence>
              {visibleDays.map((d) => (
                <motion.div
                  key={d.day}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="glass p-5"
                >
                  <div className="text-sm opacity-70 mb-1">День {d.day}</div>
                  <div className="font-semibold mb-2">{d.focus}</div>
                  <ul className="text-sm space-y-2">
                    {d.tasks.map((t, idx) => {
                      const k = `${d.day}:${idx}`;
                      const checked = !!done[k];
                      return (
                        <li key={k} className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            className="mt-1"
                            checked={checked}
                            onChange={() => toggleDone(d.day, idx)}
                          />
                          <span className={checked ? "opacity-50 line-through" : ""}>{t}</span>
                        </li>
                      );
                    })}
                  </ul>
                </motion.div>
              ))}
            </AnimatePresence>
          </section>
        </>
      )}
    </main>
  );
}
