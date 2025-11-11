export type Employee = { id: string; name: string; role: string; email: string; mentorId?: string };
export type Team = { id: string; name: string; kpis: { name: string; value: number; target: number }[]; members: string[] };
export type Company = { name: string; tagline: string; teams: Team[]; people: Record<string, Employee> };

export const demoCompany: Company = {
  name: "NovaRetail",
  tagline: "AI‑инвентаризация и омниканал",
  teams: [
    { id: "prd", name: "Product", kpis: [
      { name: "MAU", value: 12000, target: 20000 },
      { name: "Activation %", value: 42, target: 55 }
    ], members: ["u1","u2","u5"] },
    { id: "be", name: "Backend", kpis: [
      { name: "Lead time (дн.)", value: 4.2, target: 3.0 },
      { name: "Change fail %", value: 18, target: 10 }
    ], members: ["u3","u6","u7"] },
    { id: "sales", name: "Sales", kpis: [
      { name: "MRR, тыс ₽", value: 950, target: 1500 },
      { name: "Win rate %", value: 23, target: 30 }
    ], members: ["u4","u8"] }
  ],
  people: {
    u1: { id:"u1", name:"Алина Р.", role:"Product Manager", email:"alina@novaretail.demo", mentorId:"u2" },
    u2: { id:"u2", name:"Денис С.", role:"Head of Product", email:"denis@novaretail.demo" },
    u3: { id:"u3", name:"Игорь К.", role:"Backend Engineer", email:"igor@novaretail.demo", mentorId:"u6" },
    u4: { id:"u4", name:"Мария В.", role:"Sales Manager", email:"maria@novaretail.demo", mentorId:"u8" },
    u5: { id:"u5", name:"Юля Г.", role:"UX Researcher", email:"yulia@novaretail.demo" },
    u6: { id:"u6", name:"Тимур М.", role:"Tech Lead", email:"timur@novaretail.demo" },
    u7: { id:"u7", name:"Артём Д.", role:"SRE", email:"artem@novaretail.demo" },
    u8: { id:"u8", name:"Екатерина П.", role:"Head of Sales", email:"ekaterina@novaretail.demo" }
  }
};
