function ageRules(data) {
  const { age } = data;
  let score = 0;
  const flags = [];

  if (age >= 60) {
    score += 2;
    flags.push('Senior Age Group');
  } else if (age >= 45) {
    score += 1;
    flags.push('High-Risk Age Group');
  } else if (age >= 35) {
    score += 0.5;
  }

  return { score, flags };
}

module.exports = ageRules;
