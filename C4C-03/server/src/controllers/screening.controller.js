const Screening = require('../models/Screening.model');
const Patient = require('../models/Patient.model');
const Alert = require('../models/Alert.model');
const FollowUp = require('../models/FollowUp.model');
const User = require('../models/User.model');

const { calculateRisk } = require('../engine/riskEngine');

const generateFollowUpDate = require('../utils/generateFollowUpDate');

const { sendHighRiskAlert } = require('../services/emailService');

const asyncHandler = require('../utils/asyncHandler');

// ── Ayurvedic recommendations per glucose outcome ─────────────────────
/**
 * PHC blood glucose Ayurvedic recommendations
 *
 * Sources:
 * - NHP India: https://www.nhp.gov.in/Madhumeha-(Diabetes-mellitus)_mtl
 * - CCRAS/AYUSH NPCDCS Integration Guidelines (2018)
 * - NCBI NBK33787: Ayurvedic Interventions for Diabetes Mellitus
 * - PMC6145966: Therapeutic Role of Yoga in Type 2 Diabetes
 * - Charaka Samhita Nidanasthana 4/47 (Prameha Purvarupa)
 */
const AYURVEDIC_RECS = {
  normal: [
    'Blood glucose is within normal range — maintain your current lifestyle',
    'Preventive diet per CCRAS: include amla (Indian gooseberry), garlic, and guava regularly — these are listed in CCRAS preventive food recommendations',
    'Avoid Nidana (causative factors) of Prameha: sedentary lifestyle (Asya Sukha), excessive sweet and oily foods, and daytime sleeping (Divasvapna) — Charaka Samhita Nidanasthana 4',
    'Yoga: Paschimottanasana, Mandukasana, and Vajrasana — shown to compress the pancreatic region and support insulin regulation (PMC6145966); practise 30 minutes daily',
    'Pranayama: Anuloma Viloma (alternate nostril breathing) 10–15 minutes daily — improves autonomic balance and metabolic function',
    'Routine screening every 6 months recommended by NHP'
  ],

  prediabetic: [
    'Blood glucose indicates pre-diabetes (Purvarupa of Madhumeha) — immediate lifestyle intervention required',
    'Nidana Parivarjana (remove causes): strictly avoid all sweets, white rice, maida, processed foods, and cold beverages — these aggravate Kapha and worsen Prameha',
    'CCRAS-recommended herbs with clinical evidence (NCBI NBK33787): fenugreek seeds (Methi / Trigonella foenum-graecum) — soak 1 tablespoon overnight, drink the water each morning; shown to significantly improve glycaemic status',
    'Karela (bitter gourd / Momordica charantia) — include in meals at least 3 times per week; evidence of glucose-lowering effect in multiple studies',
    'Jamun (Eugenia jambolana) — fruit and seeds; seed powder (1 teaspoon with water) has traditional and some clinical support for blood sugar regulation',
    'Diet: replace white rice with millets — ragi (finger millet), jowar (sorghum), bajra (pearl millet); these are Trinadhanya, specifically recommended for Prameha in Ayurvedic texts',
    'Vyayama (exercise) — brisk walking 45–60 minutes daily; Charaka Samhita identifies physical inactivity as the primary cause of Prameha',
    'Yoga asanas per PMC6145966: Paschimottanasana (seated forward bend), Ardhamatsyendrasana (seated spinal twist), Mandukasana (frog pose) — these stimulate pancreatic function',
    'Pranayama: Kapalbhati (bellows breathing) and Anuloma Viloma — 15–20 minutes daily; research shows improvement in fasting blood sugar',
    'Repeat blood glucose test in 1 month; refer to PHC doctor if no improvement'
  ],

  diabetic: [
    'Blood glucose confirms diabetes (Madhumeha) — refer to CHC immediately for Type 1 / Type 2 classification and treatment plan',
    'Allopathic medication is essential — Ayurvedic herbs are supportive only and must not replace prescribed treatment',
    'Nidana Parivarjana: completely avoid all sugar, white rice, maida, processed foods, alcohol, and tobacco',
    'Diet: switch entirely to millets (ragi, jowar, bajra) — classified as Trinadhanya in Ayurveda and recommended by CCRAS for Madhumeha management',
    'CCRAS/AYUSH-approved herbs with strongest clinical evidence (NCBI NBK33787): Gymnema sylvestre (Gurmar / Meshashringi) — shown to increase serum insulin levels; Coccinia indica (Tindora / Bimbi) — RCT evidence for glucose-lowering; fenugreek (Methi) — consistent evidence across studies',
    'Vijayasar (Pterocarpus marsupium) — ICMR open trial showed significant reduction in FBS, PPBS, and HbA1c; CCRAS recommends 2–4g bark powder daily under physician guidance',
    'Strict blood glucose monitoring — twice daily (fasting and post-meal)',
    'Yoga per PMC6145966: Paschimottanasana, Halasana, Dhanurasana, Ardhamatsyendrasana — under guidance of a qualified yoga therapist; do NOT attempt if blood sugar is above 300 mg/dL without medical clearance',
    'Pranayama: Kapalbhati, Anuloma Viloma, Bhramari — 20–30 minutes daily under guidance',
    'Meditation 20 minutes daily — chronic stress raises cortisol, which worsens insulin resistance',
    'Consult CHC doctor for long-term medication, HbA1c monitoring, and complication screening'
  ]
};

// POST /api/screenings
const createScreening = asyncHandler(async (req, res) => {
  const {
    patientId,
    vitals,
    symptoms,
    riskFactors,
    pregnancy,
    ayurvedic
  } = req.body;

  const patient = await Patient.findById(patientId);

  if (!patient) {
    return res.status(404).json({
      message: 'Patient not found'
    });
  }

  // Auto-calculate BMI
  if (vitals.weight && vitals.height) {
    const hm = vitals.height / 100;

    vitals.bmi =
      Math.round((vitals.weight / (hm * hm)) * 10) / 10;
  }

  // Run rule engine
  const result = calculateRisk({
    age: patient.age,

    vitals,

    symptoms,

    riskFactors,

    pregnancy,

    ayurvedic
  });

  // Save screening
  const screening = await Screening.create({
    patientId,

    ashaId: req.user.id,

    vitals,

    symptoms,

    riskFactors,

    pregnancy,

    ayurvedic: ayurvedic || {},

    result
  });

  // Create follow-up record
  await FollowUp.create({
    patientId,

    screeningId: screening._id,

    dueDate: generateFollowUpDate(result.riskLevel)
  });

  // HIGH RISK ALERT
  if (result.riskLevel === 'HIGH') {
    const alert = await Alert.create({
      patientId,

      screeningId: screening._id,

      riskLevel: 'HIGH'
    });

    const asha = await User.findById(req.user.id)
      .select('name phone');

    try {
      await sendHighRiskAlert(
        patient,
        screening,
        asha
      );

      await Alert.findByIdAndUpdate(alert._id, {
        emailSentAt: new Date()
      });
    } catch (err) {
      console.error(
        'Email alert failed:',
        err.message
      );
    }
  }

  res.status(201).json({
    screening,
    result
  });
});

// PATCH /api/screenings/:id/phc-test
const recordPHCTest = asyncHandler(async (req, res) => {
  const {
    bloodGlucose,
    testType,
    notes
  } = req.body;

  const screeningId = req.params.id;

  if (
    !bloodGlucose ||
    isNaN(Number(bloodGlucose))
  ) {
    return res.status(400).json({
      message:
        'A valid blood glucose value is required'
    });
  }

  const value = Number(bloodGlucose);

  const type = testType || 'fasting';

  // ADA diagnostic thresholds
  let glucoseResult;

  if (type === 'fasting') {
    if (value < 100) {
      glucoseResult = 'normal';
    } else if (value < 126) {
      glucoseResult = 'prediabetic';
    } else {
      glucoseResult = 'diabetic';
    }
  } else {
    // random or postprandial
    if (value < 140) {
      glucoseResult = 'normal';
    } else if (value < 200) {
      glucoseResult = 'prediabetic';
    } else {
      glucoseResult = 'diabetic';
    }
  }

  const outcome =
    glucoseResult === 'normal'
      ? 'manage_at_phc'
      : 'refer_to_chc';

  const ayurvedicRecommendations =
    AYURVEDIC_RECS[glucoseResult];

  const screening =
    await Screening.findByIdAndUpdate(
      screeningId,
      {
        $set: {
          phcTest: {
            bloodGlucose: value,

            testType: type,

            glucoseResult,

            testedBy: req.user.id,

            testedAt: new Date(),

            notes: notes || '',

            outcome,

            ayurvedicRecommendations
          }
        }
      },
      {
        new: true
      }
    ).populate(
      'patientId',
      'name age gender village phone'
    );

  if (!screening) {
    return res.status(404).json({
      message: 'Screening not found'
    });
  }

  res.json({
    screening,

    glucoseResult,

    outcome,

    ayurvedicRecommendations
  });
});

// GET /api/screenings?patientId=xxx
const getScreenings = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.patientId) {
    filter.patientId = req.query.patientId;
  }

  if (req.user.role === 'asha') {
    filter.ashaId = req.user.id;
  }

  const screenings = await Screening.find(filter)
    .sort({ createdAt: -1 })
    .populate(
      'patientId',
      'name village age gender'
    );

  res.json(screenings);
});

// GET /api/screenings/stats
const getStats = asyncHandler(async (req, res) => {
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const [
    todayCount,
    highRisk,
    mediumRisk,
    lowRisk,
    pendingAlerts,
    pendingFollowups
  ] = await Promise.all([
    Screening.countDocuments({
      createdAt: { $gte: today }
    }),

    Screening.countDocuments({
      'result.riskLevel': 'HIGH'
    }),

    Screening.countDocuments({
      'result.riskLevel': 'MEDIUM'
    }),

    Screening.countDocuments({
      'result.riskLevel': 'LOW'
    }),

    Alert.countDocuments({
      status: 'pending'
    }),

    FollowUp.countDocuments({
      status: {
        $in: ['pending', 'overdue']
      },

      dueDate: {
        $lte: new Date()
      }
    })
  ]);

  res.json({
    todayCount,

    highRisk,

    mediumRisk,

    lowRisk,

    pendingAlerts,

    pendingFollowups
  });
});

// GET /api/screenings/village-summary
const getVillageSummary = asyncHandler(async (req, res) => {
  const summary = await Screening.aggregate([
    {
      $lookup: {
        from: 'patients',

        localField: 'patientId',

        foreignField: '_id',

        as: 'patient'
      }
    },

    {
      $unwind: '$patient'
    },

    {
      $group: {
        _id: '$patient.village',

        total: {
          $sum: 1
        },

        high: {
          $sum: {
            $cond: [
              {
                $eq: [
                  '$result.riskLevel',
                  'HIGH'
                ]
              },
              1,
              0
            ]
          }
        },

        medium: {
          $sum: {
            $cond: [
              {
                $eq: [
                  '$result.riskLevel',
                  'MEDIUM'
                ]
              },
              1,
              0
            ]
          }
        },

        low: {
          $sum: {
            $cond: [
              {
                $eq: [
                  '$result.riskLevel',
                  'LOW'
                ]
              },
              1,
              0
            ]
          }
        }
      }
    },

    {
      $sort: {
        high: -1
      }
    }
  ]);

  res.json(summary);
});

// GET /api/screenings/weekly
const getWeeklyTrend = asyncHandler(async (req, res) => {
  const sevenDaysAgo = new Date();

  sevenDaysAgo.setDate(
    sevenDaysAgo.getDate() - 7
  );

  const data = await Screening.aggregate([
    {
      $match: {
        createdAt: {
          $gte: sevenDaysAgo
        }
      }
    },

    {
      $group: {
        _id: {
          $dateToString: {
            format: '%Y-%m-%d',

            date: '$createdAt'
          }
        },

        count: {
          $sum: 1
        }
      }
    },

    {
      $sort: {
        _id: 1
      }
    }
  ]);

  res.json(data);
});

module.exports = {
  createScreening,

  recordPHCTest,

  getScreenings,

  getStats,

  getVillageSummary,

  getWeeklyTrend
};