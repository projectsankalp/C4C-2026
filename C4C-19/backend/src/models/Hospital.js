const mongoose = require("mongoose");

const hospitalSchema = new mongoose.Schema(
  {

    name: {
      type: String,
      required: true
    },

    type: {
      type: String,
      enum: ["government", "private", "testing"],
      required: true
    },

    address: String,

    latitude: Number,

    longitude: Number,

    contact: String,

    cost: {
      type: String,
      default: "Free"
    },

    available24x7: {
      type: Boolean,
      default: false
    }

  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Hospital", hospitalSchema);