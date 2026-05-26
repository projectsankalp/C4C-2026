import { SYMPTOM_CATALOG } from "@/lib/symptoms";
import type { SeverityTier } from "@/lib/types";

export interface DepartmentInfo {
  name: string;
  code: string;
  group: string;
}

const DEPT_BY_GROUP: Record<string, { name: string; code: string }> = {
  "Primary Indicators (Classic Triad)": { name: "Endocrinology", code: "ENDOCRINE" },
  "Neurological & Vision": { name: "Endocrinology", code: "ENDOCRINE" },
  "Systemic & Skin": { name: "Endocrinology", code: "ENDOCRINE" },
  "Acute & Emergency Warnings": { name: "Endocrinology", code: "ENDOCRINE" },
};

export const DEFAULT_DEPARTMENT: DepartmentInfo = {
  name: "Endocrinology",
  code: "ENDOCRINE",
  group: "Primary Indicators (Classic Triad)",
};

export const ALL_DEPARTMENTS: DepartmentInfo[] = SYMPTOM_CATALOG.map((g) => {
  const info = DEPT_BY_GROUP[g.group];
  return info ? { group: g.group, ...info } : DEFAULT_DEPARTMENT;
}).filter(
  (d, i, arr) => arr.findIndex((x) => x.code === d.code) === i,
);

export function recommendDepartment(symptoms: string[]): DepartmentInfo {
  if (!symptoms || symptoms.length === 0) return DEFAULT_DEPARTMENT;
  const lower = symptoms.map((s) => s.toLowerCase().trim());
  const counts = new Map<string, number>();
  for (const grp of SYMPTOM_CATALOG) {
    let n = 0;
    for (const item of grp.items) {
      const lc = item.toLowerCase();
      if (lower.some((s) => s.includes(lc) || lc.includes(s))) n++;
    }
    if (n > 0) counts.set(grp.group, n);
  }
  if (counts.size === 0) return DEFAULT_DEPARTMENT;
  let bestGroup = "";
  let bestCount = 0;
  for (const grp of SYMPTOM_CATALOG) {
    const c = counts.get(grp.group) ?? 0;
    if (c > bestCount) {
      bestCount = c;
      bestGroup = grp.group;
    }
  }
  const info = DEPT_BY_GROUP[bestGroup];
  return info ? { group: bestGroup, ...info } : DEFAULT_DEPARTMENT;
}

export function formatToken(code: string, position: number): string {
  return `OPD-${code}-${String(position).padStart(3, "0")}`;
}

export function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function urgencyTagline(severity: SeverityTier): string {
  switch (severity) {
    case "EMERGENCY":
      return "Bypass token order — escort to resuscitation immediately.";
    case "URGENT":
      return "Priority slot — call ahead, slot before walk-ins.";
    case "MODERATE":
      return "Same-day OPD slot recommended.";
    case "LOW":
      return "Standard OPD queue or self-care.";
    default:
      return "Standard OPD queue.";
  }
}
