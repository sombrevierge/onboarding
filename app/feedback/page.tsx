"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

type Plan = { title:string; assumptions:string[]; days:{day:number;focus:string;tasks:string[]}[] };

function isPlan(x:any): x is Plan {
  return x && typeof x.title==="string" && Array.isArray(x.assumptions) && Array.isArray(x.days);
}

export default function Feedback() {
  const [value, setValue] = useState("Хочу быстро включиться в работу и выполнить первую задачу по продукту");
  const [raw, setRaw] = useState<string | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"plan"|"raw">("plan");
  const [error, setError] = useState<string | null>(null);

  const send = async () => {
    setLoading(true); setPlan(null); setRaw(null); setError(null); setTab("plan");
    try {
      const r = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purpose:"plan", input: value })
      });
      const ct = r.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        const json = await r.json();
        if (!r.ok) {
          setError(json?.detail || json?.error || "Ошибка генерации");
        } else if (isPlan(json)) {
          setPlan(json);
        } else {
          setRaw(JSON.stringify(json, null, 2));
          setTab("raw");
          setError("Ответ не соответствует схеме плана, показываю сырой JSON.");
        }
        setLoading(false);
        return;
      }
      const text = await r.text();
      setRaw(text);
      try {
        const objText = text.trim().startsWith("{") ? text : (text.match(/\{[\s\S]*\}$/)?.[0] ?? "{}");
        const parsed = JSON.parse(objText);
        if (isPlan(parsed)) setPlan(parsed);
      } catch {}
      setLoading(false);
    } catch (e:any) {
      setError(String(e?.message || e));
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-3xl font-bold mb-4">AI-план / обратная связь</h1>
      <textarea className="w-full h-28 p-4 rounded-xl border border-black/10" value={value} onChange={e=>setValue(e.target.value)} />
      <div className="mt-4 flex items-center gap-3">
        <Button onClick={send} disabled={loading}>{loading ? "Генерируем…" : "Сгенерировать"}</Button>
        <div className="ml-auto flex gap-2 text-sm"><button className={tab==="plan"?"underline":""} onClick={()=>setTab("plan")}>План</button><span>·</span><button className={tab==="raw"?"underline":""} onClick={()=>setTab("raw")}>Сырой поток</button></div>
      </div>
      {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
      {tab==="plan" && (
        <section className="mt-6">
          {plan ? (
            <div className="space-y-6">
              <div className="glass p-5">
                <h2 className="text-xl font-semibold">{plan.title}</h2>
                {plan.assumptions?.length>0 && <ul className="mt-2 list-disc pl-5 text-sm opacity-80">{plan.assumptions.map((a,i)=>(<li key={i}>{a}</li>))}</ul>}
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                {plan.days?.map((d,i)=>(
                  <motion.div key={i} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="glass p-5">
                    <div className="text-sm opacity-70">День {d.day}</div>
                    <div className="font-semibold mb-2">{d.focus}</div>
                    <ul className="list-disc pl-5 text-sm space-y-1">{d.tasks.map((t,idx)=>(<li key={idx}>{t}</li>))}</ul>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : <div className="mt-6 glass p-5 opacity-80">Нажмите «Сгенерировать», чтобы видеть структурированный план.</div>}
        </section>
      )}
      {tab==="raw" && <pre className="mt-6 whitespace-pre-wrap glass p-4 text-sm">{raw || "Потока пока нет."}</pre>}
    </main>
  );
}
