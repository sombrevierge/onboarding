"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/", label: "Онбординг" },
  { href: "/wizard", label: "Мастер" },
  { href: "/tasks", label: "Задачи" },
  { href: "/kb", label: "База знаний" },
  { href: "/feedback", label: "AI-план" },
  { href: "/demo-company", label: "Демо-компания" },
  { href: "/roles", label: "Роли" },
  { href: "/assistant", label: "Ассистент" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-white/70 border-b border-black/10">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-4">
        <Link href="/" className="font-semibold">VIRAE Onboarding</Link>
        <nav className="ml-auto flex flex-wrap items-center gap-4 text-sm">
          {nav.map((n) => (
            <Link key={n.href} href={n.href}
              className={pathname === n.href ? "underline decoration-indigo-500" : "opacity-80 hover:opacity-100"}>
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
