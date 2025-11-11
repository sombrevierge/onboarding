import { ROLE_PRESETS } from "@/lib/rolePresets";

export default function RolesPage() {
  return (
    <main className="py-10">
      <h1 className="text-3xl font-bold mb-2">Роли</h1>
      <p className="opacity-80 mb-6">Расширенный список ролей и стартовые задачи.</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {ROLE_PRESETS.map(r => (
          <div key={r.id} className="rounded-2xl border border-black/10 bg-white/70 p-4">
            <div className="font-semibold">{r.title}</div>
            <div className="text-sm opacity-80 mb-2">{r.summary}</div>
            <ul className="text-sm list-disc pl-5 space-y-1">
              {r.firstTasks.map((t,i)=><li key={i}>{t}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </main>
  );
}
