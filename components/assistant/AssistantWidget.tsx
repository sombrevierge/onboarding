"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

type Message = { role: "user" | "assistant"; content: string; ts: number };

function useSessionChat(key = "assistant_chat_history") {
  const [messages, setMessages] = useState<Message[]>([]);
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(key);
      if (raw) setMessages(JSON.parse(raw));
    } catch {}
  }, [key]);
  useEffect(() => {
    try {
      sessionStorage.setItem(key, JSON.stringify(messages.slice(-100)));
    } catch {}
  }, [key, messages]);
  return { messages, setMessages };
}

export default function AssistantWidget({
  role,
  progress,
  planTitle,
  floating = true, // по умолчанию плавающая кнопка включена
  pngSrc = "/assistant.png", // если используешь PNG-аватар
}: {
  role: string | null;
  progress: number | null;
  planTitle?: string | null;
  floating?: boolean;          // ← НОВОЕ
  pngSrc?: string;             // опционально, если нужно переопределить путь к png
}) {
  const [open, setOpen] = useState(false);
  const { messages, setMessages } = useSessionChat();
  const [pending, setPending] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  async function ask(question: string) {
    setPending(true);
    try {
      const res = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: question, role, progress, planTitle })
      });
      const ct = res.headers.get("content-type") || "";
      let answer = "";
      if (ct.includes("application/json")) {
        const j = await res.json();
        answer = j?.answer || "";
      } else {
        answer = await res.text();
      }
      setMessages((m) => [
        ...m,
        { role: "user", content: question, ts: Date.now() },
        { role: "assistant", content: answer || "—", ts: Date.now() }
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Ошибка запроса к ассистенту.", ts: Date.now() }
      ]);
    } finally {
      setPending(false);
    }
  }

  async function send() {
    const t = inputRef.current?.value?.trim();
    if (!t) return;
    inputRef.current!.value = "";
    await ask(t);
  }

  return (
    <>
      {/* FAB-контейнер: PNG накладывается слева на кнопку */}
      <div className="fixed bottom-6 right-6 z-40 h-28 w-40 pointer-events-none">
        {/* свечение сзади */}
        <motion.div
          className="absolute -bottom-2 right-0 h-24 w-24 rounded-full blur-2xl pointer-events-none"
          style={{
            background:
              "radial-gradient(60% 60% at 50% 50%, rgba(99,102,241,.55), rgba(147,51,234,.35))"
          }}
          initial={{ opacity: 0.55, scale: 0.95 }}
          animate={{ opacity: [0.45, 0.9, 0.45], scale: [0.95, 1.07, 0.95] }}
          transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut" }}
        />

        {/* сама кнопка (вправо-вниз) */}
        {floating && (
        <motion.button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-transparent"
          initial={{ scale: 0.95, opacity: 0.9 }}
          animate={{ scale: [0.95, 1.02, 0.98, 1], opacity: 1, y: [0, -2, 0, 2, 0], x: [0, 1, 0, -1, 0] }}
          transition={{ repeat: Infinity, duration: 6 }}
          aria-label="Открыть AI-ассистента"
        >
          {/* PNG с прозрачным фоном, свечение */}
          <span className="absolute inset-0 -z-10 blur-2xl rounded-full bg-indigo-400/40" />
          {/* сам PNG */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pngSrc}
            alt="Assistant"
            className="h-14 w-14 select-none pointer-events-none"
            draggable={false}
          />
        </motion.button>
      )}

        {/* PNG ассистента — поверх и слегка левее кнопки */}
        {/* PNG ассистента — увеличенный, прозрачный, без белого квадрата */}
<motion.div
  className="absolute bottom-2 right-12 h-32 w-32 pointer-events-auto cursor-pointer select-none"
  onClick={() => setOpen(true)}
  initial={{ opacity: 0.95, scale: 1, x: 0, y: 0 }}
  animate={{
    opacity: 1,
    scale: [1, 1.07, 1, 1.05, 1],
    x: [0, -8, 0, 8, 0],
    y: [0, -5, 0, 5, 0]
  }}
  transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
>
  <Image
    src="/assistant.png"
    alt="AI-ассистент"
    fill
    priority
    sizes="128px"
    className="
      object-contain 
      bg-transparent 
      pointer-events-none 
      drop-shadow-[0_15px_30px_rgba(99,102,241,0.55)]
    "
  />
</motion.div>

      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              className="absolute right-6 bottom-24 w-[420px] max-w-[95vw] rounded-2xl bg-white shadow-2xl border border-black/10 overflow-hidden"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-black/10">
                <div className="font-semibold">AI-ассистент онбординга</div>
                <div className="text-xs opacity-70">
                  Роль: {role || "—"} · Прогресс: {progress ?? 0}%
                </div>
              </div>

              <div className="h-72 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                  <div className="text-sm opacity-70">История пуста. Задайте первый вопрос.</div>
                )}
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={"text-sm leading-relaxed " + (m.role === "user" ? "text-right" : "")}
                  >
                    <div
                      className={
                        "inline-block px-3 py-2 rounded-2xl " +
                        (m.role === "user" ? "bg-indigo-100 text-indigo-900" : "bg-gray-100")
                      }
                    >
                      {m.content}
                    </div>
                  </div>
                ))}
                {pending && <div className="text-sm text-gray-500">Ассистент печатает…</div>}
              </div>

              <div className="p-3 border-t border-black/10 flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  rows={2}
                  placeholder="Спросите про этапы плана, доступы, метрики…"
                  className="flex-1 resize-none rounded-xl border border-black/10 p-2 focus:outline-none"
                />
                <button
                  onClick={send}
                  disabled={pending}
                  className="rounded-xl bg-indigo-600 text-white px-3 py-2 text-sm disabled:opacity-60"
                >
                  Отправить
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
