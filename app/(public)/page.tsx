"use client";
import Appear from "@/components/Motion/Appear";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { motion } from "framer-motion";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <main className="gradient-hero">
      <section className="mx-auto max-w-6xl px-6 pt-20 pb-16">
        <Appear>
          <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
              <div className="text-sm opacity-70">Демо онбординг</div>
              <div className="flex items-center gap-3">
                <Link href="/wizard">
                  <Button
                    size="md"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
                  >
                    Начать
                  </Button>
                </Link>
              </div>
            </div>

            <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight">
              Путешествие в команду. <br /> Персональный онбординг.
            </h1>

            <p className="max-w-2xl text-lg opacity-80">
              Выберите роль и источник данных, получите план на 14 дней, задачи,
              обучение и 1:1. Все данные хранятся в сессии браузера.
            </p>

            <div className="flex gap-4">
              <Link href="/wizard">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
                  Приступить
                </Button>
              </Link>
            </div>
          </div>
        </Appear>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24 grid sm:grid-cols-3 gap-6">
        <motion.div whileHover={{ y: -2, scale: 1.01 }} className="glass p-6">
          <h3 className="font-semibold mb-2">Ветвление по роли</h3>
          <p className="opacity-80">PM, Backend, Sales — разные планы и задачи.</p>
        </motion.div>
        <motion.div whileHover={{ y: -2, scale: 1.01 }} className="glass p-6">
          <h3 className="font-semibold mb-2">Motion UX</h3>
          <p className="opacity-80">Плавные переходы, hover-эффекты, layout-анимации.</p>
        </motion.div>
        <motion.div whileHover={{ y: -2, scale: 1.01 }} className="glass p-6">
          <h3 className="font-semibold mb-2">OpenRouter</h3>
          <p className="opacity-80">Анкеты и адаптивные планы. В демо — фоллбек.</p>
        </motion.div>
      </section>
    </main>
  );
}
