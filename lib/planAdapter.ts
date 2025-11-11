export type Plan = { title: string; assumptions: string[]; days: { day: number; focus: string; tasks: string[] }[] };

export function mergeCustomization(base: Plan, custom: Plan): Plan {
  const byDay: Record<number, any> = {};
  for (const d of base.days) byDay[d.day] = d;
  for (const d of (custom?.days || [])) byDay[d.day] = d;
  const days = Object.values(byDay).sort((a:any,b:any)=> (a.day||0)-(b.day||0));
  return {
    title: custom?.title || base.title,
    assumptions: (custom?.assumptions?.length ? custom.assumptions : base.assumptions) || [],
    days
  };
}
