function familyHistoryRules(data) {
  const { familyDiabetes, familyBP } = data;
  let score = 0;
  const flags = [];

  if (familyDiabetes) {
    score += 2;
    flags.push('Family History - Diabetes');
  }
  if (familyBP) {
    score += 1;
    flags.push('Family History - Hypertension');
  }

  return { score, flags };
}

module.exports = familyHistoryRules;
