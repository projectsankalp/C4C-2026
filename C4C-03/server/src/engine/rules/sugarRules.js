// ADA Blood Glucose Thresholds (Random Blood Sugar)
function sugarRules(data) {
  const { bloodSugar } = data;
  let score = 0;
  const flags = [];

  if (!bloodSugar) return { score, flags };

  if (bloodSugar >= 200) {
    score += 5;
    flags.push('Diabetic Range');
  } else if (bloodSugar >= 140) {
    score += 3;
    flags.push('Pre-Diabetic Range');
  } else if (bloodSugar >= 100) {
    score += 1;
    flags.push('Impaired Fasting Glucose');
  }

  return { score, flags };
}

module.exports = sugarRules;
