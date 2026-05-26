export interface SymptomGroup {
  group: string;
  items: string[];
}

export const SYMPTOM_CATALOG: SymptomGroup[] = [
  {
    group: "Primary Indicators (Classic Triad)",
    items: [
      "frequent urination",
      "excessive thirst",
      "increased hunger",
      "unexplained weight loss",
    ],
  },
  {
    group: "Neurological & Vision",
    items: [
      "blurry vision",
      "dizziness",
      "tingling in hands or feet",
      "numbness in limbs",
      "severe headache",
    ],
  },
  {
    group: "Systemic & Skin",
    items: [
      "extreme fatigue",
      "slow-healing sores",
      "frequent infections",
      "dry or itchy skin",
    ],
  },
  {
    group: "Acute & Emergency Warnings",
    items: [
      "fruity breath odor",
      "shortness of breath",
      "nausea or vomiting",
      "confusion",
    ],
  },
];

export const ALL_SYMPTOMS = SYMPTOM_CATALOG.flatMap((g) => g.items);
