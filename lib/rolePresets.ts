export type RolePreset = { id: string; title: string; summary: string; firstTasks: string[] };

export const ROLE_PRESETS: RolePreset[] = [
  { id: "pm", title: "Product Manager", summary: "Стратегия, гипотезы, метрики, приоритизация.", firstTasks: ["Синк с руководителем", "KPI 30/60/90", "Карта метрик"] },
  { id: "pa", title: "Product Analyst", summary: "Аналитика, дашборды, эксперименты.", firstTasks: ["Подключение к БД", "Список дашбордов", "Метрики активации"] },
  { id: "frontend", title: "Frontend Developer", summary: "Интерфейсы, дизайн‑система, перформанс.", firstTasks: ["Настройка окружения", "Сборка UI‑кита", "Первый PR"] },
  { id: "backend", title: "Backend Engineer", summary: "Сервисы, API, БД, мониторинг.", firstTasks: ["Доступы к репам", "Запуск локально", "Сервис healthcheck"] },
  { id: "fullstack", title: "Full‑stack Engineer", summary: "End‑to‑end задачи, web+api.", firstTasks: ["Синхрон окружений", "Фича end‑to‑end", "Интеграционные тесты"] },
  { id: "devops", title: "DevOps / SRE", summary: "CI/CD, инфраструктура, наблюдаемость.", firstTasks: ["Аудит пайплайна", "Секреты/vars", "Дашборды SLO"] },
  { id: "qa", title: "QA Engineer", summary: "Тест‑планы, регресс, автотесты.", firstTasks: ["Смок‑тест", "Матрица устройств", "Первые автотесты"] },
  { id: "uxui", title: "UX/UI Designer", summary: "Дизайн‑система, прототипы, пайпы.", firstTasks: ["Доступ к Figma", "Дизайн‑токены", "Пилотный прототип"] },
  { id: "motion", title: "Motion Designer", summary: "Анимации и микровзаимодействия.", firstTasks: ["Референсы motion", "Сетка анимаций", "Пилот клип"] },
  { id: "ml", title: "ML Engineer", summary: "Пайплайны, инференс, валидация.", firstTasks: ["Стенд инференса", "Датасеты", "Бейзлайн"] },
  { id: "ds", title: "Data Scientist", summary: "Ресёрч моделей, прототипирование.", firstTasks: ["Выбор задачи", "Baseline", "Метрики качества"] },
  { id: "da", title: "Data Analyst", summary: "SQL, визуализация, инсайты.", firstTasks: ["Подключение к warehouse", "Список дашбордов", "Ревью метрик"] },
  { id: "perf", title: "Performance Marketing", summary: "Воронки, креативы, атрибуция.", firstTasks: ["Сегменты A/B", "Карта креативов", "Запуск"] },
  { id: "crm", title: "CRM/Retention", summary: "Сегментация, кампании, ретеншн.", firstTasks: ["Сегменты LTV", "Календарь рассылок", "Триггеры"] },
  { id: "aso", title: "ASO/SEO", summary: "Оптимизация стора/поиска.", firstTasks: ["Семантика", "ТЗ на правки", "Мониторинг позиций"] },
  { id: "smm", title: "SMM / Content", summary: "Контент‑план, комьюнити.", firstTasks: ["Контент‑план 2 недели", "Тональность", "Рубрикатор"] },
  { id: "support", title: "Customer Support", summary: "Качество ответов, SLA.", firstTasks: ["Скрипты", "Макросы", "Эскалация"] },
  { id: "sales", title: "Sales Manager", summary: "Лиды, скрипты, сделки.", firstTasks: ["ICP профили", "Скрипт звонка", "CRM‑воронка"] },
  { id: "am", title: "Account Manager", summary: "Коммуникация c клиентами.", firstTasks: ["Сегментация портфеля", "KPI клиентов", "План QBR"] },
  { id: "researcher", title: "UX Researcher", summary: "План исследований, JTBD, интервью.", firstTasks: ["Скрипт интервью", "Рекрутинг", "Репозиторий инсайтов"] }
];
