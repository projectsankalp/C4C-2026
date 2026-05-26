const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {

    name: {
      type: String,
      required: true
    },

    specialization: String,

    hospitalName: String,

    phone: String,

    email: String,

    available: {
      type: Boolean,
      default: true
    },

    experience: Number,

    languages: [String]

  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "Doctor",
  doctorSchema
);