"use client"
import { motion } from "framer-motion";

const KB = {
  product: [
    { id:"p1", title:"Принципы продукта VIRAE", summary:"Фокус на TTFV, прозрачность метрик, простота интерфейсов." },
    { id:"p2", title:"Метрики активации", summary:"A1–A3: визит → первый ценный шаг → повторение." },
    { id:"p3", title:"Процесс гипотез", summary:"Идея → оценка → дизайн → эксперименты → ретро." },
  ],
  engineering: [
    { id:"e1", title:"Стандарты кода", summary:"ESLint, Prettier, commitlint, ADR заметки." },
    { id:"e2", title:"CI/CD", summary:"PR-сборки, превью на Vercel, smoke e2e в CI." },
    { id:"e3", title:"Перфоманс", summary:"budgets: LCP ≤ 2.5s, CLS ≤ 0.1, TBT ≤ 200ms." },
  ],
  data: [
    { id:"d1", title:"Словарь метрик", summary:"DAU, MAU, ARPPU, Retention (D1/D7/D30), TTFV." },
    { id:"d2", title:"Схема событий", summary:"track: signup, first_value, task_done, share." },
    { id:"d3", title:"Доступы к данным", summary:"Роли: Analyst/Engineer, правила выгрузок." },
  ],
  people: [
    { id:"h1", title:"1:1 и обратная связь", summary:"Ритм: еженедельно, коротко, по чек-листу." },
    { id:"h2", title:"Онбординг-матрица", summary:"Роли → задачи → метрики → наставник." },
    { id:"h3", title:"Комм-правила", summary:"Асинхрон первым, синки — по повестке." },
  ],
};

export default function KBPage(){
  return (
    <main className="py-10">
      <h1 className="text-3xl font-bold mb-2">База знаний</h1>
      <p className="opacity-80 mb-6">Внутренние знания виртуальной компании VIRAE.</p>

      <div className="grid md:grid-cols-2 gap-6">
        {Object.entries(KB).map(([group, items], gi)=>(
          <motion.div key={group} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="glass p-5">
            <div className="font-semibold mb-2 capitalize">{group}</div>
            <ul className="text-sm space-y-2">
              {items.map((it:any)=>(
                <li key={it.id} className="p-3 rounded-xl border border-black/10 bg-white/60">
                  <div className="font-medium">{it.title}</div>
                  <div className="opacity-80">{it.summary}</div>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </main>
  );
}
