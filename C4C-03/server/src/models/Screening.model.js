const mongoose = require('mongoose');

const screeningSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true
    },

    ashaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    vitals: {
      systolic: Number,

      diastolic: Number,

      // kept for backward compatibility — optional now
      bloodSugar: Number,

      weight: Number,

      height: Number,

      bmi: Number,

      waist: Number
    },

    symptoms: {
      urination: Boolean,

      thirst: Boolean,

      vision: Boolean,

      headache: Boolean,

      fatigue: Boolean,

      numbness: Boolean
    },

    riskFactors: {
      familyDiabetes: Boolean,

      familyBP: Boolean,

      smoking: String, // 'yes' | 'no' | 'ex'

      alcohol: Boolean,

      exercise: String, // 'none' | 'moderate' | 'active'

      stress: String // 'low' | 'medium' | 'high'
    },

    ayurvedic: {
      bodyHeat: {
        type: Boolean,
        default: false
      },

      digestiveIssues: {
        type: Boolean,
        default: false
      },

      fatigue: {
        type: Boolean,
        default: false
      },

      sleepDisturbances: {
        type: Boolean,
        default: false
      },

      frequentThirst: {
        type: Boolean,
        default: false
      },

      skinDryness: {
        type: Boolean,
        default: false
      },

      urinaryAbnormalities: {
        type: Boolean,
        default: false
      }
    },

    pregnancy: {
      isPregnant: Boolean,

      gestationalHistory: Boolean
    },

    result: {
      riskLevel: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH']
      },

      score: Number,

      maxScore: {
        type: Number,
        default: 20
      },

      flags: [String],

      recommendations: mongoose.Schema.Types.Mixed
      // OR keep multilingual format below if preferred:
      // recommendations: {
      //   en: [String],
      //   hi: [String],
      //   kn: [String]
      // }
    },

    // ── PHC-level blood glucose test ─────────────────────────────
    phcTest: {
      bloodGlucose: {
        type: Number
      },

      testType: {
        type: String,
        enum: ['fasting', 'random', 'postprandial'],
        default: 'fasting'
      },

      glucoseResult: {
        type: String,
        enum: ['normal', 'prediabetic', 'diabetic']
      },

      testedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },

      testedAt: {
        type: Date
      },

      notes: {
        type: String,
        default: ''
      },

      outcome: {
        type: String,
        enum: ['manage_at_phc', 'refer_to_chc']
      },

      ayurvedicRecommendations: [
        {
          type: String
        }
      ]
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  'Screening',
  screeningSchema
);