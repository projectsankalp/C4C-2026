export type SanitationLevel = "none" | "low" | "moderate" | "high";

export interface SanitationRisk {
  flagged: boolean;
  level: SanitationLevel;
  score: number;
  hints: string[];
}

const STRONG = [
  "diarrhea",
  "diarrhoea",
  "watery stool",
  "rice water stool",
  "bloody stool",
  "mucus stool",
  "dysentery",
  "vomiting",
  "jaundice",
  "yellow eyes",
  "yellow skin",
  "dehydration",
];

const MODERATE = [
  "fever",
  "high fever",
  "abdominal pain",
  "abdominal cramps",
  "stomach pain",
  "stomach cramps",
  "dark urine",
  "nausea",
  "weakness",
  "loss of appetite",
  "headache",
];

function matches(symptom: string, keywords: string[]): boolean {
  const s = symptom.toLowerCase();
  return keywords.some((k) => s.includes(k));
}

function inferHints(symptoms: string[]): string[] {
  const set = new Set(symptoms.map((s) => s.toLowerCase()));
  const has = (...ks: string[]) =>
    ks.every((k) => Array.from(set).some((s) => s.includes(k)));
  const hints: string[] = [];

  if (has("diarr") && (has("dehydr") || has("rice water") || has("vomit"))) {
    hints.push(
      "Symptom cluster fits acute watery diarrhoea (cholera / gastroenteritis pattern). Ask about household water source.",
    );
  }
  if (has("fever") && (has("abdominal") || has("stomach")) && has("headache")) {
    hints.push(
      "Fits typhoid pattern. Ask about street-food / unboiled water exposure in the last 1–3 weeks.",
    );
  }
  if (has("jaundice") || (has("yellow") && has("dark urine"))) {
    hints.push(
      "Possible viral hepatitis (A/E) — faecal-oral transmission. Ask about contaminated water or food.",
    );
  }
  if (has("blood") && (has("stool") || has("dysentery"))) {
    hints.push(
      "Possible bacillary dysentery. Reinforce handwashing and safe drinking water for the household.",
    );
  }
  return hints;
}

export function assessSanitationRisk(symptoms: string[]): SanitationRisk {
  if (!symptoms || symptoms.length === 0) {
    return { flagged: false, level: "none", score: 0, hints: [] };
  }

  let score = 0;
  for (const s of symptoms) {
    if (matches(s, STRONG)) score += 2;
    else if (matches(s, MODERATE)) score += 1;
  }

  let level: SanitationLevel = "none";
  if (score >= 5) level = "high";
  else if (score >= 3) level = "moderate";
  else if (score >= 2) level = "low";

  const flagged = level !== "none";
  const hints = flagged ? inferHints(symptoms) : [];

  return { flagged, level, score, hints };
}
