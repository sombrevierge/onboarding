"use client";
import { demoCompany } from "@/lib/demo";
import { motion } from "framer-motion";

export default function People(){
  const list = Object.values(demoCompany.people);
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-3xl font-bold mb-6">Сотрудники</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {list.map((p,i)=> (
          <motion.div key={p.id} initial={{opacity:0, y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.03}} className="glass p-5">
            <div className="font-semibold">{p.name}</div>
            <div className="text-sm opacity-80">{p.role}</div>
            <div className="text-sm opacity-70">{p.email}</div>
            {p.mentorId && <div className="mt-2 text-xs opacity-70">Ментор: {demoCompany.people[p.mentorId].name}</div>}
          </motion.div>
        ))}
      </div>
    </main>
  );
}
