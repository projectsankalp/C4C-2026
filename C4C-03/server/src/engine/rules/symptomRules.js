function symptomRules(data) {
  const { urination, thirst, vision, headache, fatigue, numbness } = data;
  let score = 0;
  const flags = [];

  const symptoms = { urination, thirst, vision, headache, fatigue, numbness };
  const symptomNames = {
    urination: 'Frequent Urination',
    thirst: 'Excessive Thirst',
    vision: 'Blurred Vision',
    headache: 'Headache/Dizziness',
    fatigue: 'Fatigue',
    numbness: 'Numbness in Extremities'
  };

  for (const [key, value] of Object.entries(symptoms)) {
    if (value) {
      score += 0.5;
      flags.push(symptomNames[key]);
    }
  }

  return { score, flags };
}

module.exports = symptomRules;
