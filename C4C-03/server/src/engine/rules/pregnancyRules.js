function pregnancyRules(data) {
  const { isPregnant, gestationalHistory } = data;
  let score = 0;
  const flags = [];

  if (gestationalHistory) {
    score += 2;
    flags.push('Gestational Diabetes History');
  }
  if (isPregnant) {
    flags.push('Currently Pregnant - Monitor Closely');
  }

  return { score, flags };
}

module.exports = pregnancyRules;
