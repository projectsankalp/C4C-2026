/**
 * src/utils/riskCalculator.js
 * Performs calculations for the Indian Diabetes Risk Score (IDRS),
 * blood pressure classifications, and combined health risk levels.
 */

/**
 * Calculates the Indian Diabetes Risk Score (IDRS)
 * @param {Object} answers - Object containing screening answers
 * @param {string} answers.ageGroup - 'under35', '35to49', '50plus'
 * @param {string} answers.gender - 'male', 'female'
 * @param {string} answers.waistSize - 'low', 'medium', 'high'
 * @param {string} answers.physicalActivity - 'vigorous', 'moderate', 'sedentary'
 * @param {string} answers.familyHistory - 'none', 'one_parent', 'both_parents'
 * @returns {number} The calculated IDRS score (0 - 100)
 */
export function calculateIDRS(answers) {
  let score = 0;

  // 1. Age
  if (answers.ageGroup === '35to49') {
    score += 20;
  } else if (answers.ageGroup === '50plus') {
    score += 30;
  }

  // 2. Waist circumference (depends on gender)
  if (answers.waistSize === 'medium') {
    score += 10;
  } else if (answers.waistSize === 'high') {
    score += 20;
  }

  // 3. Physical Activity
  if (answers.physicalActivity === 'moderate') {
    score += 10;
  } else if (answers.physicalActivity === 'sedentary') {
    score += 20;
  }

  // 4. Family History
  if (answers.familyHistory === 'one_parent') {
    score += 10;
  } else if (answers.familyHistory === 'both_parents') {
    score += 20;
  }

  return score;
}

/**
 * Classifies blood pressure reading
 * @param {number|string} systolic - Systolic BP value (mmHg)
 * @param {number|string} diastolic - Diastolic BP value (mmHg)
 * @returns {string} Classification: 'NORMAL', 'ELEVATED', 'STAGE_1', 'STAGE_2', 'CRISIS'
 */
export function classifyBP(systolic, diastolic) {
  if (!systolic || !diastolic) return 'UNKNOWN';
  
  const sys = parseInt(systolic, 10);
  const dia = parseInt(diastolic, 10);

  if (sys >= 180 || dia >= 120) {
    return 'CRISIS';
  }
  if (sys >= 140 || dia >= 90) {
    return 'STAGE_2';
  }
  if ((sys >= 130 && sys <= 139) || (dia >= 80 && dia <= 89)) {
    return 'STAGE_1';
  }
  if ((sys >= 120 && sys <= 129) && dia < 80) {
    return 'ELEVATED';
  }
  if (sys < 120 && dia < 80) {
    return 'NORMAL';
  }

  // Fallback for cases like systolic 125, diastolic 85 which maps to STAGE_1
  if (sys >= 130 || dia >= 80) {
    return 'STAGE_1';
  }
  return 'ELEVATED';
}

/**
 * Calculates combined health risk level
 * @param {number} idrsScore - IDRS score value
 * @param {string} bpClassification - BP classification result
 * @returns {string} Risk Color: 'GREEN', 'YELLOW', 'RED'
 */
export function calculateCombinedRisk(idrsScore, bpClassification) {
  if (bpClassification === 'CRISIS') {
    return 'RED';
  }
  
  if (idrsScore >= 60 || bpClassification === 'STAGE_2') {
    return 'RED';
  }
  
  if (idrsScore >= 30 || bpClassification === 'STAGE_1') {
    return 'YELLOW';
  }
  
  return 'GREEN';
}

/**
 * Text risk description helper
 * @param {string} riskColor - 'GREEN', 'YELLOW', 'RED'
 * @returns {string} Text description
 */
export function getRiskLabel(riskColor) {
  switch (riskColor) {
    case 'RED':
      return 'HIGH RISK — REFER NOW';
    case 'YELLOW':
      return 'MODERATE RISK';
    case 'GREEN':
    default:
      return 'LOW RISK';
  }
}
