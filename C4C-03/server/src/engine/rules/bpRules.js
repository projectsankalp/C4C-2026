// WHO Blood Pressure Thresholds
function bpRules(data) {
  const { systolic, diastolic } = data;
  let score = 0;
  const flags = [];

  if (systolic >= 180 || diastolic >= 120) {
    score += 5;
    flags.push('Hypertensive Crisis');
  } else if (systolic >= 140 || diastolic >= 90) {
    score += 3;
    flags.push('Stage 2 Hypertension');
  } else if (systolic >= 130 || diastolic >= 80) {
    score += 2;
    flags.push('Stage 1 Hypertension');
  } else if (systolic >= 120) {
    score += 1;
    flags.push('Elevated BP');
  }

  return { score, flags };
}

module.exports = bpRules;
