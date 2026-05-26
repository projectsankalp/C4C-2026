import { ALL_SYMPTOMS } from "./symptoms";

const SYNONYMS: Record<string, string[]> = {
  "frequent urination": [
    "polyuria",
    "peeing a lot",
    "urine output increased",
    "frequent urination",
    "frequent peeing",
    "peeing frequently",
    "peshab zyada",
    "baar baar peshab",
    "up at night to pee",
  ],
  "excessive thirst": [
    "polydipsia",
    "thirsty",
    "very thirsty",
    "drinking lots of water",
    "excessive thirst",
    "pyaas lag rahi",
    "gala sookh",
    "dry mouth",
  ],
  "increased hunger": [
    "polyphagia",
    "hungry",
    "very hungry",
    "always hungry",
    "increased hunger",
    "bhookh zyada",
    "increased appetite",
  ],
  "unexplained weight loss": [
    "losing weight",
    "unexplained weight loss",
    "weight loss",
    "wajan kam",
    "lost weight fast",
  ],
  "blurry vision": [
    "blurred vision",
    "blurry vision",
    "cant see clearly",
    "fuzzy vision",
    "dhundhla",
    "vision changes",
    "eyesight weak",
  ],
  dizziness: [
    "dizzy",
    "chakkar",
    "feeling dizzy",
    "head spinning",
    "lightheaded",
    "light headed",
    "ghoom raha",
  ],
  "tingling in hands or feet": [
    "tingling",
    "pins and needles",
    "tingling in hands",
    "tingling in feet",
    "foot tingling",
    "hand tingling",
    "jhanjhanahat",
    "pairo me jalan",
  ],
  "numbness in limbs": [
    "numbness",
    "numb feet",
    "numb hands",
    "sunn ho gaya",
    "limb numbness",
    "numbness in limbs",
  ],
  "severe headache": [
    "sir dard",
    "sar dard",
    "headache",
    "head hurts",
    "intense headache",
    "splitting headache",
    "head pain",
    "migraine",
  ],
  "extreme fatigue": [
    "thakaan",
    "tired",
    "exhausted",
    "no energy",
    "weakness",
    "extreme fatigue",
    "tiredness",
    "fatigue",
  ],
  "slow-healing sores": [
    "wounds not healing",
    "slow healing",
    "cuts not healing",
    "wound healing slow",
    "sores not healing",
    "slow-healing sores",
    "wound slow to heal",
  ],
  "frequent infections": [
    "yeast infection",
    "uti",
    "skin infections",
    "falling sick often",
    "frequent infections",
    "fungal infection",
  ],
  "dry or itchy skin": [
    "dry skin",
    "itchy skin",
    "khujli",
    "khaarish",
    "itching",
    "rash",
    "skin itching",
  ],
  "fruity breath odor": [
    "acetone breath",
    "fruity breath",
    "sweet breath",
    "dka breath",
    "breath smells sweet",
    "fruity breath odor",
  ],
  "shortness of breath": [
    "saans nahi aa rahi",
    "saans phulna",
    "saans chadhna",
    "out of breath",
    "breathless",
    "hard to breathe",
    "short of breath",
    "cant breathe",
    "can't breathe",
    "breathing difficulty",
    "difficulty breathing",
  ],
  "nausea or vomiting": [
    "nausea",
    "vomiting",
    "ulti",
    "feel sick",
    "throwing up",
    "vomited",
    "puking",
    "throwing up",
    "nausea or vomiting",
  ],
  confusion: [
    "confused",
    "not making sense",
    "disoriented",
    "confusion",
  ],
};

const SEVERITY_TOKENS = {
  acute: /\b(suddenly|all of a sudden|out of nowhere|just now|abhi|just started|started just)\b/i,
  severe: /\b(severe|intense|extreme|unbearable|10\/10|worst|tez)\b/i,
  worsening: /\b(getting worse|worsening|increasing|badh raha|spread)\b/i,
  bilateral: /\bboth (sides|arms|legs|hands)\b/i,
  rightSide: /\b(right side|right arm|right leg|right shoulder|daayan)\b/i,
  leftSide: /\b(left side|left arm|left leg|left shoulder|baayan)\b/i,
  postPrandial: /\b(after (eating|food|meal|lunch|dinner)|post.?meal|khaane ke baad)\b/i,
};

export interface ExtractionResult {
  symptoms: string[];
  modifiers: string[];
  spans: { token: string; symptom: string; start: number; end: number }[];
  raw_length: number;
}

export function extractSymptoms(rawText: string): ExtractionResult {
  const text = rawText.toLowerCase();
  const matched = new Set<string>();
  const spans: ExtractionResult["spans"] = [];

  for (const symptom of ALL_SYMPTOMS) {
    const idx = text.indexOf(symptom);
    if (idx >= 0) {
      matched.add(symptom);
      spans.push({ token: symptom, symptom, start: idx, end: idx + symptom.length });
      continue;
    }
    const variants = SYNONYMS[symptom] ?? [];
    for (const v of variants) {
      const i = text.indexOf(v.toLowerCase());
      if (i >= 0) {
        matched.add(symptom);
        spans.push({ token: v, symptom, start: i, end: i + v.length });
        break;
      }
    }
  }

  const modifiers: string[] = [];
  if (SEVERITY_TOKENS.acute.test(rawText)) modifiers.push("acute onset");
  if (SEVERITY_TOKENS.severe.test(rawText)) modifiers.push("severe");
  if (SEVERITY_TOKENS.worsening.test(rawText)) modifiers.push("worsening");
  if (SEVERITY_TOKENS.bilateral.test(rawText)) modifiers.push("bilateral");
  if (SEVERITY_TOKENS.rightSide.test(rawText)) modifiers.push("right-sided");
  if (SEVERITY_TOKENS.leftSide.test(rawText)) modifiers.push("left-sided");
  if (SEVERITY_TOKENS.postPrandial.test(rawText)) modifiers.push("post-prandial");

  return {
    symptoms: Array.from(matched),
    modifiers,
    spans: spans.sort((a, b) => a.start - b.start),
    raw_length: rawText.length,
  };
}
