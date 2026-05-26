const DiabetesClassification = require('../models/DiabetesClassification.model');
const Screening = require('../models/Screening.model');
const asyncHandler = require('../utils/asyncHandler');

// ─────────────────────────────────────────────────────────────────────────────
// AUTO-CLASSIFICATION ENGINE
// Based on WHO (2019) & ADA Standards of Care (2024)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns { diabetesType, confidence, flags, treatmentPlan }
 * given the clinical and lab inputs from the CHC assessment form.
 */
function classifyDiabetes({ labs = {}, clinical = {} }) {
  let t1Score = 0;
  let t2Score = 0;
  const flags = [];

  // ── Autoantibody markers (strong T1 indicators) ───────────────────────────
  if (labs.gad65Positive) { t1Score += 30; flags.push('GAD65 antibody positive (T1 marker)'); }
  if (labs.ia2Positive)   { t1Score += 25; flags.push('IA-2 antibody positive (T1 marker)'); }
  if (labs.znt8Positive)  { t1Score += 20; flags.push('ZnT8 antibody positive (T1 marker)'); }

  // ── C-peptide (low → T1; normal/high → T2) ───────────────────────────────
  if (labs.cPeptide !== undefined && labs.cPeptide !== null) {
    if (labs.cPeptide < 0.3) {
      t1Score += 25;
      flags.push(`Very low C-peptide (${labs.cPeptide} ng/mL) — absolute insulin deficiency`);
    } else if (labs.cPeptide < 0.6) {
      t1Score += 10;
      flags.push(`Low C-peptide (${labs.cPeptide} ng/mL) — relative insulin deficiency`);
    } else if (labs.cPeptide > 2.0) {
      t2Score += 15;
      flags.push(`High C-peptide (${labs.cPeptide} ng/mL) — insulin resistance pattern`);
    }
  }

  // ── HbA1c confirmation ────────────────────────────────────────────────────
  if (labs.hba1c >= 10) {
    flags.push(`HbA1c ${labs.hba1c}% — severely uncontrolled diabetes`);
    t1Score += 5; // T1 often presents with very high HbA1c
  } else if (labs.hba1c >= 6.5) {
    flags.push(`HbA1c ${labs.hba1c}% — confirms diabetes diagnosis (ADA criteria)`);
  }

  // ── Clinical indicators ───────────────────────────────────────────────────
  if (clinical.ketosisAtPresentation) {
    t1Score += 20;
    flags.push('Ketosis/DKA at presentation (strong T1 marker)');
  }

  if (clinical.insulinRequiredFromOnset) {
    t1Score += 15;
    flags.push('Insulin required from onset (T1 marker)');
  }

  if (clinical.rapidWeightLoss) {
    t1Score += 10;
    flags.push('Rapid unexplained weight loss (T1 marker)');
  }

  if (clinical.acanthosisNigricans) {
    t2Score += 20;
    flags.push('Acanthosis nigricans present (insulin resistance / T2 marker)');
  }

  if (clinical.familyHistoryT2) {
    t2Score += 15;
    flags.push('First-degree family history of Type 2 diabetes');
  }

  if (clinical.pcosHistory) {
    t2Score += 10;
    flags.push('PCOS history (insulin resistance association)');
  }

  // ── Age heuristic ─────────────────────────────────────────────────────────
  const age = clinical.ageAtOnset;
  if (age !== undefined) {
    if (age < 30) { t1Score += 10; flags.push(`Age at onset: ${age} years (younger onset favours T1)`); }
    else if (age >= 45) { t2Score += 10; flags.push(`Age at onset: ${age} years (older onset favours T2)`); }
  }

  // ── BMI heuristic ─────────────────────────────────────────────────────────
  const bmi = clinical.bmiAtClassification;
  if (bmi !== undefined) {
    if (bmi < 20)  { t1Score += 5; flags.push(`Low BMI (${bmi}) — lean body habitus (T1 association)`); }
    else if (bmi >= 25) { t2Score += 10; flags.push(`BMI ${bmi} — overweight/obese (T2 association)`); }
  }

  // ── Decide classification ─────────────────────────────────────────────────
  const total = t1Score + t2Score || 1;
  let diabetesType;
  let confidence;

  if (t1Score >= 50) {
    diabetesType = 'type1';
    confidence = Math.min(Math.round((t1Score / total) * 100), 98);
  } else if (t2Score >= 40) {
    diabetesType = 'type2';
    confidence = Math.min(Math.round((t2Score / total) * 100), 98);
  } else if (t1Score > t2Score) {
    diabetesType = 'type1';
    confidence = Math.min(Math.round((t1Score / total) * 100), 75);
  } else if (t2Score > t1Score) {
    diabetesType = 'type2';
    confidence = Math.min(Math.round((t2Score / total) * 100), 75);
  } else {
    diabetesType = 'unclassified';
    confidence = 40;
  }

  // Override: if pregnancy flag present
  if (clinical.currentlyPregnant) {
    diabetesType = 'gestational';
    confidence = 90;
    flags.push('Currently pregnant — classified as Gestational Diabetes');
  }

  const treatmentPlan = buildTreatmentPlan(diabetesType, labs, clinical);

  return { diabetesType, confidence, flags, treatmentPlan };
}

function buildTreatmentPlan(diabetesType, labs, clinical) {
  const plans = {
    type1: {
      medications: [
        'Basal-bolus insulin regimen (e.g. Glargine + Lispro)',
        'Refer to endocrinologist for insulin dose titration',
        'Consider continuous glucose monitoring (CGM)',
      ],
      dietaryAdvice: [
        'Carbohydrate counting at every meal',
        'Consistent meal timing to match insulin peaks',
        'Avoid sugary beverages and processed carbohydrates',
        'Include high-fibre foods: millets, vegetables, legumes',
      ],
      lifestyleAdvice: [
        'Regular moderate exercise — but monitor glucose before and after',
        'Carry fast-acting glucose at all times (glucagon kit)',
        'Medic-Alert ID recommended',
        'Stress management and adequate sleep',
      ],
      monitoringSchedule: 'Blood glucose monitoring 4×/day (fasting, pre-meal, post-meal, bedtime). HbA1c every 3 months.',
      followUpWeeks: 2,
      referToSpecialist: true,
      specialistType: 'Endocrinologist',
    },
    type2: {
      medications: [
        'Metformin 500 mg twice daily (if eGFR ≥30 mL/min) — titrate to 1000 mg twice daily',
        'If HbA1c ≥9%: consider early combination therapy (Metformin + Sulfonylurea)',
        'Review cardiovascular risk — consider SGLT2 inhibitor or GLP-1 RA if CVD present',
      ],
      dietaryAdvice: [
        'Replace white rice and refined carbs with millets (ragi, jowar, bajra)',
        'Low glycaemic index diet: lentils, legumes, non-starchy vegetables',
        'Limit portion size; 3 main meals + 2 small snacks',
        'Ayurvedic dietary support: bitter gourd, fenugreek seeds, jamun',
      ],
      lifestyleAdvice: [
        'Brisk walking 45–60 minutes daily — most important intervention for T2',
        'Target weight loss of 5–7% body weight if overweight',
        'Yoga therapy: Surya Namaskar, Kapalbhati, Anulom Vilom',
        'Stress reduction: meditation 20 minutes daily',
        'Smoking cessation and alcohol restriction',
      ],
      monitoringSchedule: 'Fasting and post-meal glucose daily. HbA1c every 3 months initially, then 6-monthly when stable.',
      followUpWeeks: 4,
      referToSpecialist: false,
      specialistType: '',
    },
    gestational: {
      medications: [
        'Insulin therapy if glucose targets not met within 1–2 weeks of diet',
        'Metformin or glyburide: second-line only if insulin not feasible',
        'No oral hypoglycaemics in first trimester',
      ],
      dietaryAdvice: [
        'Moderate carbohydrate restriction (35–45% of calories)',
        'Small frequent meals (3 main + 2–3 snacks)',
        'Avoid sugary drinks and refined carbohydrates',
        'Adequate folate, iron, and calcium intake',
      ],
      lifestyleAdvice: [
        'Moderate walking 30 minutes after each meal',
        'Avoid strenuous exercise after first trimester',
        'Regular foetal monitoring',
      ],
      monitoringSchedule: 'Fasting and 1-hour post-meal glucose daily. Foetal growth scan every 4 weeks.',
      followUpWeeks: 2,
      referToSpecialist: true,
      specialistType: 'Obstetrician + Endocrinologist',
    },
    unclassified: {
      medications: [
        'Insulin as initial therapy pending further classification',
        'Arrange C-peptide and autoantibody panel tests',
      ],
      dietaryAdvice: [
        'Low glycaemic index diet while classification is pending',
        'Avoid all added sugars and refined carbohydrates',
      ],
      lifestyleAdvice: [
        'Daily moderate exercise (30–45 minutes walking)',
        'Detailed follow-up within 2 weeks for further workup',
      ],
      monitoringSchedule: 'Blood glucose 4×/day. Repeat HbA1c and C-peptide in 4 weeks.',
      followUpWeeks: 2,
      referToSpecialist: true,
      specialistType: 'Endocrinologist',
    },
  };

  return plans[diabetesType] || plans['unclassified'];
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTROLLER METHODS
// ─────────────────────────────────────────────────────────────────────────────

// POST /api/diabetes
const createClassification = asyncHandler(async (req, res) => {
  const {
    patientId,
    screeningId,
    referralId,
    labs,
    clinical,
    diabetesType: manualType,
    clinicalNotes,
    status,
  } = req.body;

  // Run auto-classification engine
  const { diabetesType, confidence, flags, treatmentPlan } = classifyDiabetes({
    labs,
    clinical,
  });

  // Doctor may override the auto-classification
  const finalType = manualType || diabetesType;

  // Check for existing classification and update instead of duplicate
  const existing = await DiabetesClassification.findOne({ screeningId });

  let classification;
  if (existing) {
    classification = await DiabetesClassification.findByIdAndUpdate(
      existing._id,
      {
        patientId,
        screeningId,
        referralId,
        classifiedBy: req.user.id,
        labs,
        clinical,
        diabetesType: finalType,
        classificationConfidence: confidence,
        classificationFlags: flags,
        treatmentPlan,
        clinicalNotes: clinicalNotes || '',
        status: status || 'confirmed',
      },
      { new: true }
    )
      .populate('patientId', 'name age gender village')
      .populate('classifiedBy', 'name');
  } else {
    classification = await DiabetesClassification.create({
      patientId,
      screeningId,
      referralId,
      classifiedBy: req.user.id,
      labs,
      clinical,
      diabetesType: finalType,
      classificationConfidence: confidence,
      classificationFlags: flags,
      treatmentPlan,
      clinicalNotes: clinicalNotes || '',
      status: status || 'confirmed',
    });

    classification = await DiabetesClassification.findById(classification._id)
      .populate('patientId', 'name age gender village')
      .populate('classifiedBy', 'name');
  }

  res.status(201).json({ classification, suggested: { diabetesType, confidence, flags } });
});

// GET /api/diabetes/suggest — real-time suggestion (no DB write)
const suggestClassification = asyncHandler(async (req, res) => {
  const { labs = {}, clinical = {} } = req.body;
  const result = classifyDiabetes({ labs, clinical });
  res.json(result);
});

// GET /api/diabetes/patient/:patientId
const getByPatient = asyncHandler(async (req, res) => {
  const classifications = await DiabetesClassification.find({
    patientId: req.params.patientId,
  })
    .sort({ createdAt: -1 })
    .populate('classifiedBy', 'name')
    .populate('screeningId', 'vitals phcTest result');
  res.json(classifications);
});

// GET /api/diabetes/screening/:screeningId
const getByScreening = asyncHandler(async (req, res) => {
  const classification = await DiabetesClassification.findOne({
    screeningId: req.params.screeningId,
  })
    .populate('classifiedBy', 'name')
    .populate('patientId', 'name age gender village');
  res.json(classification || null);
});

// GET /api/diabetes — all (hospital dashboard)
const getAllClassifications = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.diabetesType) filter.diabetesType = req.query.diabetesType;

  const classifications = await DiabetesClassification.find(filter)
    .sort({ createdAt: -1 })
    .populate('patientId', 'name age gender village')
    .populate('classifiedBy', 'name');
  res.json(classifications);
});

// PATCH /api/diabetes/:id
const updateClassification = asyncHandler(async (req, res) => {
  const classification = await DiabetesClassification.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  ).populate('classifiedBy', 'name');
  if (!classification) return res.status(404).json({ message: 'Classification not found' });
  res.json(classification);
});

module.exports = {
  createClassification,
  suggestClassification,
  getByPatient,
  getByScreening,
  getAllClassifications,
  updateClassification,
};
