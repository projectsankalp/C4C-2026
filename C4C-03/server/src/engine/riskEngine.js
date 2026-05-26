const bpRules = require('./rules/bpRules');
const sugarRules = require('./rules/sugarRules');
const bmiRules = require('./rules/bmiRules');
const ageRules = require('./rules/ageRules');
const familyHistoryRules = require('./rules/familyHistoryRules');
const lifestyleRules = require('./rules/lifestyleRules');
const symptomRules = require('./rules/symptomRules');
const pregnancyRules = require('./rules/pregnancyRules');
const ayurvedicRules = require('./rules/ayurvedicRules');

const enRec = require('./recommendations/en');
const hiRec = require('./recommendations/hi');
const knRec = require('./recommendations/kn');

const MAX_SCORE = 20;

function getRecommendations(riskLevel, flags, recMap) {
  const base = recMap[riskLevel]?.default || [];

  const extra = [];

  flags.forEach(flag => {
    if (recMap[riskLevel]?.[flag]) {
      extra.push(...recMap[riskLevel][flag]);
    }
  });

  return [...new Set([...base, ...extra])];
}

function calculateRisk(input) {
  const vitals = input.vitals || {};
  const symptoms = input.symptoms || {};
  const riskFactors = input.riskFactors || {};
  const pregnancy = input.pregnancy || {};
  const ayurvedic = input.ayurvedic || {};

  let totalScore = 0;
  let allFlags = [];

  const ruleSets = [
    bpRules({
      systolic: vitals.systolic,
      diastolic: vitals.diastolic
    }),

    sugarRules({
      bloodSugar: vitals.bloodSugar
    }),

    bmiRules({
      bmi: vitals.bmi
    }),

    ageRules({
      age: input.age
    }),

    familyHistoryRules({
      familyDiabetes: riskFactors.familyDiabetes,
      familyBP: riskFactors.familyBP
    }),

    lifestyleRules({
      smoking: riskFactors.smoking,
      alcohol: riskFactors.alcohol,
      exercise: riskFactors.exercise,
      stress: riskFactors.stress
    }),

    symptomRules(symptoms),

    pregnancyRules({
      isPregnant: pregnancy.isPregnant,
      gestationalHistory: pregnancy.gestationalHistory
    }),

    ayurvedicRules(ayurvedic)
  ];

  ruleSets.forEach(result => {
    totalScore += result.score;
    allFlags = allFlags.concat(result.flags);
  });

  totalScore = Math.min(
    Math.round(totalScore * 10) / 10,
    MAX_SCORE
  );

  let riskLevel;

  if (totalScore >= 10) {
    riskLevel = 'HIGH';
  } else if (totalScore >= 6) {
    riskLevel = 'MEDIUM';
  } else {
    riskLevel = 'LOW';
  }

  return {
    riskLevel,
    score: totalScore,
    maxScore: MAX_SCORE,

    flags: allFlags,

    recommendations: {
      en: getRecommendations(riskLevel, allFlags, enRec),

      hi: getRecommendations(riskLevel, allFlags, hiRec),

      kn: getRecommendations(riskLevel, allFlags, knRec)
    }
  };
}

module.exports = { calculateRisk };