"use client";
import AssistantWidget from "@/components/assistant/AssistantWidget";
import { useEffect, useState } from "react";

export default function AssistantPage() {
  const [role, setRole] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [planTitle, setPlanTitle] = useState<string | null>(null);

  useEffect(() => {
    try {
      setRole(sessionStorage.getItem("current_role"));
      setPlanTitle(sessionStorage.getItem("plan_title"));
      const p = sessionStorage.getItem("progress");
      setProgress(p ? Number(p) : 0);
    } catch {}
  }, []);

  return (
    <main className="py-10">
      <h1 className="text-3xl font-bold mb-2">AI-ассистент</h1>
      <p className="opacity-80 mb-4">Полноэкранный чат. История — до обновления браузера.</p>
      <div className="relative">
        {/* floating=false — отключаем FAB, показываем только сам UI */}
        <AssistantWidget role={role} progress={progress} planTitle={planTitle} floating={false} />
      </div>
    </main>
  );
}
