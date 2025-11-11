export type DemoCompany = {
  name: string;
  mission: string;
  depts: { id: string; title: string; lead: string }[];
  metrics: { name: string; value: string }[];
  projects: { id: string; title: string; goal: string; ownerDept: string; status: "active"|"paused"|"done" }[];
  kb: { id: string; title: string; url: string }[];
};

export const DEMO_COMPANY: DemoCompany = {
  name: "Virae Lab",
  mission: "Создаём инструменты, ускоряющие адаптацию и вывод продукта на рынок.",
  depts: [
    { id: "eng", title: "Engineering", lead: "И. Романов" },
    { id: "prod", title: "Product", lead: "А. Михайлова" },
    { id: "mkt", title: "Marketing", lead: "К. Орлова" },
    { id: "sales", title: "Sales", lead: "Т. Жуков" },
    { id: "supp", title: "Support", lead: "Н. Белова" }
  ],
  metrics: [
    { name: "DAU", value: "12 400" },
    { name: "Activation rate", value: "34%" },
    { name: "Time‑to‑first‑value", value: "7 мин" }
  ],
  projects: [
    { id: "p1", title: "Onboarding Funnel v2", goal: "Ускорить TTFV на 20%", ownerDept: "prod", status: "active" },
    { id: "p2", title: "Dashboard Insights", goal: "Новый модуль аналитики", ownerDept: "eng", status: "active" },
    { id: "p3", title: "Retention CRM", goal: "Повысить CRMAU на 10%", ownerDept: "mkt", status: "paused" }
  ],
  kb: [
    { id: "k1", title: "Принципы продукта", url: "#" },
    { id: "k2", title: "Гайд по метрикам", url: "#" },
    { id: "k3", title: "Технические стандарты", url: "#" }
  ]
};
