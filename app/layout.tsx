// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import dynamic from "next/dynamic";
import SiteHeader from "@/components/SiteHeader";

const manrope = Manrope({
  subsets: ["cyrillic", "latin"],
  weight: ["400","500","600","700","800"],
  display: "swap",
  variable: "--font-manrope",
});

const AssistantWidget = dynamic(() => import("@/components/assistant/AssistantWidget"), { ssr: false });

export const metadata: Metadata = {
  title: "VIRAE Onboarding Demo",
  description: "Онбординг, AI-план, ассистент, демо-компания",
  // (опционально) уберёт варнинг metadataBase
  metadataBase: new URL("http://localhost:3000"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={manrope.variable}>
      <body className="font-sans bg-gradient-to-b from-indigo-50 to-purple-50 text-gray-900 min-h-screen">
        <SiteHeader />
        <div className="mx-auto max-w-6xl px-4">{children}</div>
        <AssistantWidget role={null} progress={0} planTitle={null} />
      </body>
    </html>
  );
}
