const mongoose = require("mongoose");

const healthRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    diabetesRisk: String,

    hypertensionRisk: String,

    answers: Object
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("HealthRecord", healthRecordSchema);