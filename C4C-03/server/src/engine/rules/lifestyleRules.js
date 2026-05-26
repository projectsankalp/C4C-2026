function lifestyleRules(data) {
  const { smoking, alcohol, exercise, stress } = data;
  let score = 0;
  const flags = [];

  if (smoking === 'yes') {
    score += 1.5;
    flags.push('Active Smoker');
  } else if (smoking === 'ex') {
    score += 0.5;
    flags.push('Ex-Smoker');
  }

  if (alcohol) {
    score += 1;
    flags.push('Alcohol Use');
  }

  if (exercise === 'none') {
    score += 1.5;
    flags.push('Sedentary Lifestyle');
  } else if (exercise === 'moderate') {
    score += 0;
  }

  if (stress === 'high') {
    score += 1;
    flags.push('High Stress');
  }

  return { score, flags };
}

module.exports = lifestyleRules;
