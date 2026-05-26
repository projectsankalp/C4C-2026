const express = require('express');
const pool = require('../db');
const requireAuth = require('../middleware/auth');
const { ensureMobileSchema, createMobileId } = require('../schema');

const router = express.Router();

const SCORE_FEATURES = [
  'age',
  'bmi',
  'family_history',
  'exercise',
  'sugary_food',
  'smoking',
  'thirst',
  'headaches',
  'sleep',
  'stress',
];

const DEFAULTS = {
  age: 35,
  bmi: 24.5,
  family_history: 0,
  exercise: 0,
  sugary_food: 0,
  smoking: 0,
  thirst: 0,
  headaches: 0,
  sleep: 7,
  stress: 0,
};

function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

function getRiskCategory(percentage) {
  if (percentage < 30) return 'Low';
  if (percentage < 70) return 'Moderate';
  return 'High';
}

function calculateScreening(data) {
  const values = {};
  for (const feature of SCORE_FEATURES) {
    values[feature] = Number(data[feature]);
    if (Number.isNaN(values[feature])) {
      values[feature] = DEFAULTS[feature];
    }
  }

  const dbScore =
    -4.2 +
    values.age * 0.028 +
    (values.bmi - 22) * 0.11 +
    values.family_history * 1.3 +
    values.sugary_food * 0.35 -
    values.exercise * 0.4 +
    values.thirst * 2.6;

  const htScore =
    -4.6 +
    values.age * 0.045 +
    (values.bmi - 22) * 0.13 +
    values.smoking * 0.95 +
    values.stress * 0.45 -
    (values.sleep - 7) * 0.25 +
    values.headaches * 2.1;

  let diabetesProbability = Math.round(sigmoid(dbScore) * 100);
  let hypertensionProbability = Math.round(sigmoid(htScore) * 100);

  diabetesProbability = Math.min(Math.max(diabetesProbability, 4), 97);
  hypertensionProbability = Math.min(Math.max(hypertensionProbability, 3), 96);

  const diabetesRisk = getRiskCategory(diabetesProbability);
  const hypertensionRisk = getRiskCategory(hypertensionProbability);
  const overallProbability = Math.max(diabetesProbability, hypertensionProbability);
  const overallRisk = getRiskCategory(overallProbability);

  const means = { age: 51.5, bmi: 27.2, family_history: 0.25, exercise: 1.8, sugary_food: 1.9, smoking: 0.3, thirst: 0.15, headaches: 0.2, sleep: 7.1, stress: 1.35 };
  const stds = { age: 19.6, bmi: 5.8, family_history: 0.43, exercise: 1.3, sugary_food: 1.2, smoking: 0.46, thirst: 0.35, headaches: 0.4, sleep: 1.2, stress: 0.98 };
  const importances = {
    diabetes: { age: 0.18, bmi: 0.25, family_history: 0.12, exercise: 0.08, sugary_food: 0.1, smoking: 0.02, thirst: 0.22, headaches: 0.01, sleep: 0.01, stress: 0.01 },
    hypertension: { age: 0.24, bmi: 0.22, family_history: 0.03, exercise: 0.04, sugary_food: 0.02, smoking: 0.11, thirst: 0.01, headaches: 0.2, sleep: 0.06, stress: 0.07 },
  };

  const dbFactors = [];
  const htFactors = [];

  SCORE_FEATURES.forEach((feature) => {
    const zScore = (values[feature] - means[feature]) / stds[feature];
    const diabetesDirection = feature === 'exercise' ? -1 : 1;
    const hypertensionDirection = feature === 'sleep' || feature === 'exercise' ? -1 : 1;

    dbFactors.push({ feature, impact: Number((zScore * importances.diabetes[feature] * diabetesDirection).toFixed(3)) });
    htFactors.push({ feature, impact: Number((zScore * importances.hypertension[feature] * hypertensionDirection).toFixed(3)) });
  });

  dbFactors.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));
  htFactors.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

  return {
    ...values,
    diabetesRisk,
    diabetesProbability,
    hypertensionRisk,
    hypertensionProbability,
    overallRisk,
    overallProbability,
    explainability: {
      diabetes_factors: dbFactors,
      hypertension_factors: htFactors,
    },
    riskReasons: [
      ...dbFactors.slice(0, 3).map((factor) => `${factor.feature}: ${factor.impact >= 0 ? '+' : ''}${factor.impact}`),
      ...htFactors.slice(0, 3).map((factor) => `${factor.feature}: ${factor.impact >= 0 ? '+' : ''}${factor.impact}`),
    ],
  };
}

router.get('/', requireAuth, async (_req, res) => {
  try {
    await ensureMobileSchema();

    const { rows } = await pool.query(
      `SELECT s.id, s.patient_id, p.full_name, p.address, p.dob, p.mobile, s.submitted_by,
              s.age, s.bmi, s.family_history, s.exercise, s.sugary_food, s.smoking, s.thirst, s.headaches, s.sleep, s.stress,
              s.answers, s.diabetes_risk, s.diabetes_probability, s.hypertension_risk, s.hypertension_probability,
              s.overall_risk, s.overall_probability, s.explainability, s.risk_reasons, s.status, s.created_at, s.updated_at
       FROM screenings s
       JOIN patients p ON p.id = s.patient_id
       ORDER BY s.created_at DESC`
    );

    return res.json(rows);
  } catch (err) {
    console.error('List screenings error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  const { patient_id, submitted_by, answers = {}, ...surveyFields } = req.body || {};

  if (!patient_id) {
    return res.status(400).json({ error: 'patient_id is required' });
  }

  try {
    await ensureMobileSchema();

    const patientCheck = await pool.query('SELECT id FROM patients WHERE id = $1 LIMIT 1', [patient_id]);
    if (patientCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const computed = calculateScreening(surveyFields);
    const id = createMobileId();

    const result = await pool.query(
      `INSERT INTO screenings (
        id, patient_id, submitted_by, age, bmi, family_history, exercise, sugary_food, smoking, thirst, headaches, sleep, stress,
        answers, diabetes_risk, diabetes_probability, hypertension_risk, hypertension_probability, overall_risk, overall_probability,
        explainability, risk_reasons, status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
        $14, $15, $16, $17, $18, $19, $20,
        $21, $22, 'NEW'
      )
      RETURNING *`,
      [
        id,
        patient_id,
        submitted_by || req.user?.username || '',
        computed.age,
        computed.bmi,
        computed.family_history,
        computed.exercise,
        computed.sugary_food,
        computed.smoking,
        computed.thirst,
        computed.headaches,
        computed.sleep,
        computed.stress,
        JSON.stringify(answers),
        computed.diabetesRisk,
        computed.diabetesProbability,
        computed.hypertensionRisk,
        computed.hypertensionProbability,
        computed.overallRisk,
        computed.overallProbability,
        JSON.stringify(computed.explainability),
        JSON.stringify(computed.riskReasons),
      ]
    );

    return res.status(201).json({
      ...result.rows[0],
      computed,
    });
  } catch (err) {
    console.error('Create screening error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;