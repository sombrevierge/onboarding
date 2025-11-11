"use client";
import { useEffect, useState } from "react";
import { demoCompany } from "@/lib/demo";
import { motion, useAnimationControls } from "framer-motion";

function Counter({value}:{value:number}){
  const [v, setV] = useState(0);
  useEffect(()=>{
    const start = performance.now(); const dur = 900;
    const tick = (t:number)=>{
      const k = Math.min(1, (t-start)/dur);
      setV(Math.round(value*k));
      if (k<1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  },[value]);
  return <span>{v}</span>;
}

export default function Analytics(){
  const prd = demoCompany.teams[0];
  const be = demoCompany.teams[1];
  const sal = demoCompany.teams[2];
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-3xl font-bold mb-6">Аналитика (демо)</h1>
      <div className="grid sm:grid-cols-3 gap-6">
        {[{label:"MAU",v:prd.kpis[0].value},{label:"MRR тыс ₽",v:sal.kpis[0].value},{label:"Lead time",v:be.kpis[0].value}].map((k,i)=>(
          <motion.div key={i} initial={{opacity:0, y:8}} animate={{opacity:1,y:0}} className="glass p-5 text-center">
            <div className="opacity-70 text-sm">{k.label}</div>
            <div className="text-4xl font-extrabold mt-2"><Counter value={Math.round(k.v)} /></div>
          </motion.div>
        ))}
      </div>
    </main>
  );
}
