const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {

    name: String,

    phone: {
      type: String,
      required: true,
      unique: true
    },

    age: Number,

    gender: String,

    height: Number,

    weight: Number,

    language: {
      type: String,
      default: "English"
    },

    bpChecked: {
      type: Boolean,
      default: false
    },

    bpValue: String,

    familyHistory: {
      type: Boolean,
      default: false
    },

    internetStatus: {
      type: String,
      default: "Online"
    },

    syncStatus: {
      type: String,
      default: "Synced"
    },

    notificationsEnabled: {
      type: Boolean,
      default: true
    }

  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "User",
  userSchema
);