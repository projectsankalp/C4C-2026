const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    patientName: {
      type: String,
      required: true
    },

    phone: {
      type: String,
      required: true
    },

    doctorName: {
      type: String,
      default: "General Physician"
    },

    hospitalName: {
      type: String,
      default: "Arogya PHC"
    },

    appointmentDate: String,

    appointmentTime: String,

    status: {
      type: String,
      enum: [
        "Scheduled",
        "Completed",
        "Cancelled"
      ],
      default: "Scheduled"
    },

    notes: String

  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "Appointment",
  appointmentSchema
);