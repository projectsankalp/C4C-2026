const mongoose = require('mongoose');

/**
 * DiabetesClassification — stores the CHC/hospital-level Type 1 / Type 2
 * classification assessment for patients referred from the PHC.
 *
 * Classification follows WHO (2019) & ADA (2024) diagnostic criteria.
 */
const diabetesClassificationSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    screeningId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Screening',
      required: true,
    },
    referralId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Referral',
    },
    classifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // ── Additional lab values collected at CHC ──────────────────────────────
    labs: {
      fastingGlucose: Number,       // mg/dL  — ADA: ≥126 = diabetic
      postprandialGlucose: Number,  // mg/dL  — ADA: ≥200 = diabetic
      hba1c: Number,                // %      — ADA: ≥6.5% = diabetic
      // C-peptide: low → T1; normal/high → T2
      cPeptide: Number,             // ng/mL  — normal 0.5–2.0 ng/mL
      // Autoantibodies present → strongly suggests Type 1 (autoimmune)
      gad65Positive: { type: Boolean, default: false },   // anti-GAD65
      ia2Positive: { type: Boolean, default: false },     // anti-IA-2
      znt8Positive: { type: Boolean, default: false },    // anti-ZnT8
    },

    // ── Clinical indicators ─────────────────────────────────────────────────
    clinical: {
      ageAtOnset: Number,
      bmiAtClassification: Number,
      // Ketosis or DKA at presentation → strongly suggests Type 1
      ketosisAtPresentation: { type: Boolean, default: false },
      // Acanthosis nigricans (dark skin patches at neck/armpits) → T2 marker
      acanthosisNigricans: { type: Boolean, default: false },
      // Polycystic ovary syndrome → T2 risk factor
      pcosHistory: { type: Boolean, default: false },
      // Rapid weight loss before diagnosis → T1 marker
      rapidWeightLoss: { type: Boolean, default: false },
      // Insulin required from diagnosis → T1 marker
      insulinRequiredFromOnset: { type: Boolean, default: false },
      // Family history (first-degree relative with T2) → T2 marker
      familyHistoryT2: { type: Boolean, default: false },
    },

    // ── Final classification ────────────────────────────────────────────────
    // type1       : Autoimmune / absolute insulin deficiency
    // type2       : Insulin resistance / relative deficiency
    // gestational : Diagnosed during pregnancy
    // mody        : Maturity-Onset Diabetes of the Young (monogenic)
    // secondary   : Due to another condition (pancreatitis, steroids, etc.)
    // unclassified: Insufficient data for definitive classification
    diabetesType: {
      type: String,
      enum: ['type1', 'type2', 'gestational', 'mody', 'secondary', 'unclassified'],
      required: true,
    },

    // Confidence score (0–100) computed by the classification engine
    classificationConfidence: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    // Reasoning flags surfaced to the clinician
    classificationFlags: [{ type: String }],

    // ── Treatment plan ──────────────────────────────────────────────────────
    treatmentPlan: {
      medications: [{ type: String }],
      dietaryAdvice: [{ type: String }],
      lifestyleAdvice: [{ type: String }],
      monitoringSchedule: { type: String },
      followUpWeeks: { type: Number, default: 4 },
      referToSpecialist: { type: Boolean, default: false },
      specialistType: { type: String },   // e.g. 'Endocrinologist'
    },

    clinicalNotes: { type: String, default: '' },

    status: {
      type: String,
      enum: ['draft', 'confirmed'],
      default: 'confirmed',
    },
  },
  { timestamps: true }
);

// Ensure one classification per screening (can be updated, not duplicated)
diabetesClassificationSchema.index(
  { screeningId: 1 },
  { unique: true, sparse: true }
);

module.exports = mongoose.model('DiabetesClassification', diabetesClassificationSchema);
