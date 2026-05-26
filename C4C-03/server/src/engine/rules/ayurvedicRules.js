function ayurvedicRules(data) {
  let score = 0;
  const flags = [];

  const highWeight = {
    urinaryAbnormalities: {
      weight: 0.75,
      label: 'Urinary Abnormalities (Prameha)'
    },

    frequentThirst: {
      weight: 0.75,
      label: 'Frequent Thirst (Trishna)'
    },

    bodyHeat: {
      weight: 0.75,
      label: 'Excessive Body Heat (Daha)'
    }
  };

  const stdWeight = {
    digestiveIssues: {
      weight: 0.5,
      label: 'Digestive Irregularities (Agnimandya)'
    },

    fatigue: {
      weight: 0.5,
      label: 'Fatigue & Lethargy (Klama)'
    },

    sleepDisturbances: {
      weight: 0.5,
      label: 'Sleep Disturbances (Nidranasha)'
    },

    skinDryness: {
      weight: 0.5,
      label: 'Skin Dryness (Twak Raukshya)'
    }
  };

  const all = { ...highWeight, ...stdWeight };

  for (const [key, { weight, label }] of Object.entries(all)) {
    if (data[key]) {
      score += weight;
      flags.push(label);
    }
  }

  return { score, flags };
}

module.exports = ayurvedicRules;