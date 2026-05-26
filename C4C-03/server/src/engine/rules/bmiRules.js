// ICMR Indian-specific BMI cutoffs (lower than WHO)
function bmiRules(data) {
  const { bmi } = data;
  let score = 0;
  const flags = [];

  if (!bmi) return { score, flags };

  if (bmi >= 30) {
    score += 2;
    flags.push('Obese');
  } else if (bmi >= 25) {
    score += 1.5;
    flags.push('Overweight');
  } else if (bmi >= 23) {
    score += 1;
    flags.push('At-Risk BMI (Indian cutoff)');
  }

  return { score, flags };
}

module.exports = bmiRules;
