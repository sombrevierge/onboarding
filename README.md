# Онбординг — демо (RU)

Vercel-ready Next.js (App Router, TS, Tailwind, Framer Motion). Данные хранятся в сессии браузера/куки (демо). OpenRouter поддержан через серверную обёртку с потоковым выводом.

## Требования
- Node 20.15.1
- pnpm 9.x (или npm 10)

## Установка
```bash
pnpm i
cp .env.example .env.local   # при необходимости добавьте OPENROUTER_API_KEY
pnpm dev
```

## Главные страницы
- `/` — главная (референс-хиро + карточки)
- `/wizard` — выбор роли/БД, Framer Motion
- `/tasks` — план задач по роли
- `/kb` — база знаний
- `/feedback` — генерация AI-плана (SSE)

## Деплой на Vercel
- Build: `pnpm build`
- Edge runtime используется для `/api/ai/generate`


## Новые возможности
- **Логи OpenRouter**: `/logs`, автообновление раз в 2 сек, статус, длительность, байты, предпросмотр стрима.
- **Демо-компания**: `/company`, `/company/people`, `/company/analytics` с анимациями и прогресс-барами.
- **Motion-улучшения**: плавные hover/stagger, фоновые подсветки, шапка-навигация.
