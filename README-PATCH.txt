PATCH: расширения UX/UI, ассистент, кастомизация и роли.

Добавляет:
- components/assistant/AssistantWidget.tsx — виджет ассистента (floating)
- app/assistant/page.tsx — отдельная страница ассистента
- app/api/ai/assistant/route.ts — API ассистента
- app/api/ai/customize/route.ts — API кастомизации плана
- lib/rolePresets.ts — расширенный список ролей (~20)
- lib/planAdapter.ts — слияние кастомизации плана

Интеграция в layout (пример):
import dynamic from "next/dynamic";
const AssistantWidget = dynamic(() => import("@/components/assistant/AssistantWidget"), { ssr: false });

// В app/layout.tsx, внутри <body> перед {children}
<AssistantWidget role={null} progress={0} planTitle={null} />

Зависимости: те же, что и в проекте (framer-motion уже используется).
