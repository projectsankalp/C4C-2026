/**
 * GraamSehat ASHA Worker App - Clinical Risk Calculator
 * Path: /src/utils/riskCalculator.js
 * Contains scoring rules for IDRS (Indian Diabetes Risk Score), BP classifications,
 * combined risk assessment (Green/Yellow/Red), and advice notes mapping.
 */

import { RISK_ADVICE } from "./constants";

/**
 * Calculates IDRS Score based on screening answers
 * @param {object} answers - Object containing age, waist, physicalActivity, familyHistory
 * @param {string} gender - 'male' or 'female'
 * @returns {number} IDRS score (0 to 100)
 */
export function calculateIDRS(answers, gender) {
  let score = 0;

  // 1. Age
  // Options: '<35', '35-49', '>=50'
  if (answers.ageGroup === "35-49") {
    score += 20;
  } else if (answers.ageGroup === ">=50") {
    score += 30;
  }

  // 2. Waist
  // Options: 'under_80', '80-89', '90_or_more' for men
  // Options: 'under_75', '75-84', '85_or_more' for women
  const waist = answers.waistGroup;
  if (gender === "male" || gender === "Male") {
    if (waist === "80-89") score += 10;
    else if (waist === ">=90") score += 20;
  } else {
    // female / other default
    if (waist === "75-84") score += 10;
    else if (waist === ">=85") score += 20;
  }

  // 3. Physical Activity
  // Options: 'vigorous' (Very active), 'moderate' (Somewhat active), 'sedentary' (Not active)
  if (answers.physicalActivity === "moderate") {
    score += 10;
  } else if (answers.physicalActivity === "sedentary") {
    score += 20;
  }

  // 4. Family History
  // Options: 'none', 'one_parent', 'both_parents'
  if (answers.familyHistory === "one_parent") {
    score += 10;
  } else if (answers.familyHistory === "both_parents") {
    score += 20;
  }

  return score;
}

/**
 * Maps IDRS Score to level text
 * @param {number} score - IDRS Score (0-100)
 * @returns {string} LOW / MODERATE / HIGH / VERY HIGH
 */
export function getIDRSLevel(score) {
  if (score < 30) return "LOW";
  if (score < 50) return "MODERATE";
  if (score < 60) return "HIGH";
  return "VERY HIGH";
}

/**
 * Classifies Blood Pressure readings
 * @param {number|string} systolic - Upper number
 * @param {number|string} diastolic - Lower number
 * @returns {string} NORMAL / ELEVATED / STAGE_1 / STAGE_2 / CRISIS / NOT_AVAILABLE
 */
export function classifyBP(systolic, diastolic) {
  if (systolic === undefined || diastolic === undefined || systolic === null || diastolic === null || systolic === "" || diastolic === "") {
    return "NOT_AVAILABLE";
  }

  const sys = parseInt(systolic, 10);
  const dia = parseInt(diastolic, 10);

  if (isNaN(sys) || isNaN(dia)) {
    return "NOT_AVAILABLE";
  }

  // Highest category wins
  if (sys >= 180 || dia >= 120) {
    return "CRISIS";
  }
  if (sys >= 140 || dia >= 90) {
    return "STAGE_2";
  }
  if (sys >= 130 || dia >= 80) {
    return "STAGE_1";
  }
  if (sys >= 120 && dia < 80) {
    return "ELEVATED";
  }
  if (sys < 120 && dia < 80) {
    return "NORMAL";
  }
  
  // Fallback for cases like sys=115, dia=85 (diastolic drives Stage 1, handled by sys >= 130 || dia >= 80)
  // Or sys=125, dia=78 (systolic drives Elevated, handled by sys >= 120 && dia < 80)
  // Let's return NORMAL if both are low, otherwise ELEVATED
  return sys >= 120 || dia >= 80 ? "ELEVATED" : "NORMAL";
}

/**
 * Calculates Combined Risk (overallRisk: GREEN / YELLOW / RED)
 * @param {number} idrsScore - IDRS score
 * @param {string} bpClassification - BP classification code
 * @param {string} [glucoseClassification] - Glucose classification code
 * @returns {string} GREEN / YELLOW / RED
 */
export function calculateOverallRisk(idrsScore, bpClassification, glucoseClassification) {
  // If CRISIS BP or DIABETIC glucose -> RED (emergency)
  if (bpClassification === "CRISIS" || glucoseClassification === "DIABETIC") {
    return "RED";
  }
  
  // If IDRS >= 60 OR STAGE_2 BP -> RED
  if (idrsScore >= 60 || bpClassification === "STAGE_2") {
    return "RED";
  }
  
  // If IDRS >= 30 OR STAGE_1 BP OR PREDIABETIC glucose -> YELLOW
  if (idrsScore >= 30 || bpClassification === "STAGE_1" || glucoseClassification === "PREDIABETIC") {
    return "YELLOW";
  }
  
  // Else -> GREEN
  return "GREEN";
}

/**
 * Retrieves advice information based on risk level and language
 * @param {string} riskLevel - GREEN / YELLOW / RED
 * @param {string} lang - language key (en, kn, hi, ta, te)
 * @returns {object} Advice object containing title, explanation, actions, nextCheckup, phcNeeded, phcText
 */
export function getRiskAdvice(riskLevel, lang = "en") {
  const level = riskLevel ? riskLevel.toUpperCase() : "GREEN";
  const language = RISK_ADVICE[level] && RISK_ADVICE[level][lang] ? lang : "en";
  return RISK_ADVICE[level][language];
}
