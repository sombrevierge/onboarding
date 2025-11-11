В проект внесены изменения:
- Укреплена интеграция с OpenRouter (lib/openrouter.ts)
- Исправлен клиент генерации плана (app/feedback/page.tsx)
- Добавлен виджет AI-ассистента + страница /assistant
- Добавлены API: /api/ai/assistant и /api/ai/customize
- Добавлены расширенные роли (lib/rolePresets.ts) и адаптер плана (lib/planAdapter.ts)

Подключение виджета глобально (при необходимости):
  import dynamic from "next/dynamic";
  const AssistantWidget = dynamic(() => import("@/components/assistant/AssistantWidget"), { ssr:false });
  // в app/layout.tsx, внутри <body>:
  // <AssistantWidget role={null} progress={0} planTitle={null} />

Проверка:
  pnpm dev
  /feedback — генерация плана
  /assistant — чат с ассистентом
