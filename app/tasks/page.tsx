"use client";
import { useEffect, useMemo, useState } from "react";
import { ROLE_PRESETS } from "@/lib/rolePresets";
import { motion } from "framer-motion";

type Day = { day: number; focus: string; tasks: string[] };

export default function TasksPage() {
  const [roleId, setRoleId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const r = sessionStorage.getItem("current_role");
      if (r) setRoleId(r);
    } catch {}
  }, []);

  const role = useMemo(
    () => ROLE_PRESETS.find((r) => r.id === roleId) || ROLE_PRESETS[0],
    [roleId]
  );

  const wideTasks = useMemo(() => buildTasksForRole(role), [role]);

  return (
    <main className="py-10">
      <h1 className="text-3xl font-bold mb-2">Задачи под роль</h1>
      <div className="opacity-80 mb-4">
        Текущая роль: <span className="font-medium">{role.title}</span>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {wideTasks.map((d, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-5"
          >
            <div className="text-sm opacity-70">День {d.day}</div>
            <div className="font-semibold mb-2">{d.focus}</div>
            <ul className="text-sm list-disc pl-5 space-y-1">
              {d.tasks.map((t, idx) => (
                <li key={idx}>{t}</li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </main>
  );
}

/* ========== ЛОГИКА ПОСТРОЕНИЯ ПЛАНА ========== */

function norm(s: string) {
  return s.toLowerCase().replace(/[^a-zа-я0-9]+/gi, "");
}

function groupByRole(role: { id: string; title: string }) {
  const id = norm(role.id);
  const ttl = norm(role.title);

  if (/(product|pm|owner|manager)/.test(id + ttl)) return "pm";
  if (/(backend|server|go|java|node|python|rust)/.test(id + ttl)) return "backend";
  if (/(frontend|react|vue|next|svelte)/.test(id + ttl)) return "frontend";
  if (/(fullstack|full-stack)/.test(id + ttl)) return "fullstack";
  if (/(ios|swift)/.test(id + ttl)) return "mobile_ios";
  if (/(android|kotlin)/.test(id + ttl)) return "mobile_android";
  if (/(qa|test|quality)/.test(id + ttl)) return "qa";
  if (/(devops|sre|platform|infra)/.test(id + ttl)) return "devops";
  if (/(dataanalyst|analyst|bi)/.test(id + ttl)) return "data_analyst";
  if (/(dataengineer|etl|dwh|warehouse)/.test(id + ttl)) return "data_engineer";
  if (/(ml|ai|ds|mlops)/.test(id + ttl)) return "ml_engineer";
  if (/(designer|ux|ui|productdesign)/.test(id + ttl)) return "designer";
  if (/(sales|account|bd|bizdev)/.test(id + ttl)) return "sales";
  if (/(support|cs|customer|success|helpdesk)/.test(id + ttl)) return "support";
  if (/(hr|people|recruit)/.test(id + ttl)) return "hr";
  if (/(marketing|growth|content|seo|ppc)/.test(id + ttl)) return "marketing";
  if (/(security|secops|appsec)/.test(id + ttl)) return "security";
  if (/(finance|fin|accounting)/.test(id + ttl)) return "finance";
  if (/(legal|law)/.test(id + ttl)) return "legal";
  return "generic";
}

function buildTasksForRole(role: { id: string; title: string; firstTasks?: string[] }): Day[] {
  const g = groupByRole(role);

  // База для всех ролей
  const mk = (day: number, focus: string, tasks: string[]): Day => ({ day, focus, tasks });
  const base: Day[] = [
    mk(1, "Контекст и доступы", [
      ...(role.firstTasks || ["Онбординг-созвон на 30 минут", "Сбор доступов в системы"]),
      "Синк с ментором и план на неделю",
      "Идентифицировать риски/блокеры",
    ]),
    mk(2, "Инфраструктура и данные", [
      "Проверка окружения/учёток",
      "Карта артефактов и источников",
      "Назначить метрику результата первой недели",
    ]),
    mk(3, "Быстрый результат", ["Мини-задача с ценностью", "PR/ревью", "Деплой в тест/песочницу"]),
    mk(4, "Документация", ["ADR/PRD кратко", "Чек-лист запуска", "Обновить KB по итогам"]),
    mk(5, "Коммуникации", ["Согласования", "План спринта", "Слоты релиза"]),
    mk(6, "Мониторинг", ["Дашборд сигналов", "Алерты", "Первые метрики"]),
    mk(7, "Ретро 1", ["Короткое ретро", "Список блокеров", "План второй недели"]),
    mk(8, "Гипотезы/улучшения", ["2–3 гипотезы", "Оценка/приоритизация", "Выбор одной"]),
    mk(9, "Проработка решения", ["Декомпозиция", "Критерии качества", "Тест-план"]),
    mk(10, "Запуск", ["Подготовка релиза", "Комм-план", "Каталоги задач/release notes"]),
    mk(11, "Аналитика", ["Сбор данных", "Сравнение с бенчмарком", "Отчёт 1 страница"]),
    mk(12, "Оптимизации", ["Перфоманс/затраты", "Быстрые фиксы", "Документ изменений"]),
    mk(13, "Ретро 2", ["Общий обзор", "Риски/возможности", "Синк с руководителем"]),
    mk(14, "План на месяц", ["Roadmap v1", "KPI/OKR черновик", "Коммитмент"]),
  ];

  // Специализации по группам — переопределяют ключевые дни
  const spec: Record<string, Partial<Record<number, Day>>> = {
    pm: {
      2: mk(2, "Продуктовый контекст", [
        "Карта JTBD/персон",
        "Формализация North Star Metric и вспомогательных метрик",
        "Карта флоу активации",
      ]),
      3: mk(3, "Быстрый результат (PM)", [
        "Гипотеза на активацию/усиление CVR",
        "Согласование с дизайном/инженерами",
        "Запуск мини-эксперимента A/B",
      ]),
      9: mk(9, "Проработка фичи", ["PRD v1", "Скоуп/критерии качества", "План релиза"]),
    },
    backend: {
      2: mk(2, "Среда и сервисы", ["On-call/observability", "Подключение к БД/кэшу", "Локальный запуск сервисов"]),
      3: mk(3, "Quick Win (Backend)", ["Мелкий баг/эндпоинт", "Тесты", "CI проверка"]),
      6: mk(6, "Надёжность", ["Трассировка/метрики", "Лимиты/алерты", "Ошибки SLO"]),
    },
    frontend: {
      2: mk(2, "Фронтовая среда", ["Storybook/дизайн-система", "Линтеры/пресеты", "Фича-флаги"]),
      3: mk(3, "Quick Win (FE)", ["UI-фикс/микрофича", "Е2Е снапшот", "Превью на Vercel"]),
      6: mk(6, "Перфоманс", ["LCP/TBT бюджет", "Оптимизация бандла", "Динамический импорт"]),
    },
    fullstack: {
      2: mk(2, "Стек FS", ["Сборка FE/BE", "Связки API→UI", "Фича-флаги"]),
      3: mk(3, "Quick Win (FS)", ["Малогабаритная фича сквозная", "Тесты FE/BE", "Превью"]),
    },
    mobile_ios: {
      2: mk(2, "Среда iOS", ["Xcode/схемы", "CI билд", "Crash/логирование"]),
      3: mk(3, "Quick Win (iOS)", ["Маленький экран/фикc", "Snapshot-тест", "TestFlight alpha"]),
    },
    mobile_android: {
      2: mk(2, "Среда Android", ["Gradle/модули", "CI билд", "Crashlytics"]),
      3: mk(3, "Quick Win (Android)", ["Маленький экран/фикc", "UI-тест", "Internal beta"]),
    },
    qa: {
      2: mk(2, "Тест-процессы", ["Карта критических флоу", "Набор смоук-тестов", "Интеграция в CI"]),
      3: mk(3, "Quick Win (QA)", ["Автотест на крит. флоу", "Отчет о дефектах", "Настройка алертов"]),
    },
    devops: {
      2: mk(2, "Инфраструктура", ["Кластера/сегменты", "Мониторинг/логирование", "Политики доступов"]),
      3: mk(3, "Quick Win (DevOps)", ["Оптимизация пайплайна", "Кэш/слои", "Снижение времени билда"]),
      6: mk(6, "Надёжность/SLO", ["SLO/SLI", "Алерты инцидентов", "План реагирования"]),
    },
    data_analyst: {
      2: mk(2, "Данные/словарь", ["Слои данных", "Качество/пропуски", "Метрика недели"]),
      3: mk(3, "Quick Win (DA)", ["Дашборд активации", "Срезы/сегменты", "Короткие инсайты"]),
    },
    data_engineer: {
      2: mk(2, "Пайплайны/ETL", ["Схема DWH", "Контроль качества", "Слоты загрузок"]),
      3: mk(3, "Quick Win (DE)", ["Малая витрина", "Тесты пайплайна", "Каталог схем"]),
    },
    ml_engineer: {
      2: mk(2, "ML контур", ["Датасеты/версии", "Feature Store", "Онлайн/оффлайн метрики"]),
      3: mk(3, "Quick Win (ML)", ["Базовая модель/бенчмарк", "Валидация", "Сервис инференса"]),
    },
    designer: {
      2: mk(2, "Дизайн-процессы", ["Гайдлайны/дизайн-система", "Исследования/персоны", "Сетка токенов"]),
      3: mk(3, "Quick Win (Design)", ["Микроулучшение экрана", "Прототип", "Юзабилити-тест 3–5 интервью"]),
    },
    sales: {
      2: mk(2, "Материалы/скрипты", ["ICP/персоны", "Скрипт discovery", "CRM карточки"]),
      3: mk(3, "Quick Win (Sales)", ["10 касаний", "2 демо-встречи", "Ретро по возражениям"]),
    },
    support: {
      2: mk(2, "База ответов", ["Темы и макросы", "SLA/приоритеты", "Эскалация"]),
      3: mk(3, "Quick Win (Support)", ["10 тикетов с CSAT", "Шаблоны улучшены", "Сводка повторяющихся проблем"]),
    },
    hr: {
      2: mk(2, "HR-процессы", ["Онбординг-матрица", "Слоты 1:1", "Пульс-опрос"]),
      3: mk(3, "Quick Win (HR)", ["Запуск пульса", "Сбор фидбека", "Чек-листы роли"]),
    },
    marketing: {
      2: mk(2, "Маркетинг база", ["Каналы/UTM", "Контент-план", "Ленд/оффер"]),
      3: mk(3, "Quick Win (MKT)", ["MVP кампании", "Аналитика UTM", "Креативы A/B"]),
    },
    security: {
      2: mk(2, "Политики/риски", ["Политики доступа", "Threat model", "Журнал аудита"]),
      3: mk(3, "Quick Win (Sec)", ["Быстрые закрытия высоких рисков", "Проверка секретов", "Внедрить SAST"]),
    },
    finance: {
      2: mk(2, "Фин. контуры", ["План-факт", "Кост-драйверы", "Правила бюджетов"]),
      3: mk(3, "Quick Win (Fin)", ["Мини-отчёт P&L", "Снижение расходов 1%", "Автоматизация выгрузки"]),
    },
    legal: {
      2: mk(2, "Правовая база", ["Типовые договоры", "Политики/Privacy", "Риски и исключения"]),
      3: mk(3, "Quick Win (Legal)", ["Шаблон под продукт", "Согласование с командами", "Чек-лист комплаенса"]),
    },
    generic: {},
  };

  // Применяем переопределения по дням
  const override = spec[g] || {};
  const result = base.map((d) => override[d.day] ?? d);

  // Мелкая персонализация Day1 по первым задачам из роли
  if (role.firstTasks?.length) {
    result[0] = {
      ...result[0],
      tasks: Array.from(new Set([...role.firstTasks, ...result[0].tasks])).slice(0, 6),
    };
  }

  return result;
}
