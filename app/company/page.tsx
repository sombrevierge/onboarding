"use client";
import { demoCompany } from "@/lib/demo";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CompanyPage(){
  const c = demoCompany;
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <motion.h1 initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="text-4xl font-bold mb-3">
        {c.name}
      </motion.h1>
      <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.1}} className="opacity-80 mb-6">
        {c.tagline}
      </motion.p>
      <div className="flex gap-3 mb-8">
        <Link href="/company/people"><Button>Люди</Button></Link>
        <Link href="/company/analytics"><Button variant="outline">Аналитика</Button></Link>
      </div>
      <div className="grid sm:grid-cols-3 gap-6">
        {c.teams.map((t,i)=> (
          <motion.div key={t.id} initial={{opacity:0, y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}} className="glass p-5">
            <h3 className="font-semibold mb-1">{t.name}</h3>
            <ul className="text-sm opacity-80">
              {t.kpis.map((k,idx)=> (
                <li key={idx} className="my-2">
                  <div className="flex justify-between"><span>{k.name}</span><span>{k.value} / {k.target}</span></div>
                  <div className="h-2 bg-black/10 rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{width: `${Math.min(100, (k.value/k.target)*100)}%`}}/>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </main>
  );
}
