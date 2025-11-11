import { DEMO_COMPANY } from "@/lib/demoCompany";

export default function DemoCompanyPage() {
  const c = DEMO_COMPANY;
  return (
    <main className="py-10">
      <h1 className="text-3xl font-bold mb-2">Демо‑компания</h1>
      <p className="opacity-80 mb-6">{c.name} — {c.mission}</p>
      <section className="grid md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-black/10 bg-white/70 p-4">
          <h2 className="font-semibold mb-2">Подразделения</h2>
          <ul className="text-sm space-y-1">
            {c.depts.map(d => <li key={d.id}><span className="font-medium">{d.title}</span> — {d.lead}</li>)}
          </ul>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white/70 p-4">
          <h2 className="font-semibold mb-2">Метрики</h2>
          <ul className="text-sm space-y-1">
            {c.metrics.map((m,i)=><li key={i}><span className="font-medium">{m.name}</span>: {m.value}</li>)}
          </ul>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white/70 p-4">
          <h2 className="font-semibold mb-2">Проекты</h2>
          <ul className="text-sm space-y-1">
            {c.projects.map(p=><li key={p.id}><span className="font-medium">{p.title}</span> — {p.goal} <span className="opacity-70">({p.status})</span></li>)}
          </ul>
        </div>
      </section>
      <section className="mt-6 rounded-2xl border border-black/10 bg-white/70 p-4">
        <h2 className="font-semibold mb-2">База знаний</h2>
        <ul className="text-sm space-y-1">
          {c.kb.map(k => <li key={k.id}><a href={k.url} className="underline">{k.title}</a></li>)}
        </ul>
      </section>
    </main>
  );
}
