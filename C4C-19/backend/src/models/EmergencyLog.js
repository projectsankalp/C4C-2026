const mongoose = require("mongoose");

const emergencyLogSchema = new mongoose.Schema(
  {

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    patientName: String,

    phone: String,

    emergencyType: {
      type: String,
      enum: [
        "Chest Pain",
        "Dizziness",
        "Breathing Difficulty",
        "High BP",
        "Other"
      ]
    },

    location: String,

    severity: {
      type: String,
      enum: [
        "LOW",
        "MEDIUM",
        "HIGH"
      ],
      default: "HIGH"
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Resolved"
      ],
      default: "Pending"
    }

  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "EmergencyLog",
  emergencyLogSchema
);