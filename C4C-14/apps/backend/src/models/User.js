const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },
  email: { type: String, sparse: true },
  name: { type: String },
  role: { type: String, enum: ['user', 'asha_worker', 'gp'], default: 'user' },
  language: { type: String, enum: ['en', 'kn'], default: 'en' },
  steps: { type: Number, default: 6420 },
  activeMins: { type: Number, default: 45 },
  sleepHours: { type: Number, default: 7 },
  sleepMins: { type: Number, default: 20 },
  heartRate: { type: Number, default: 72 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);
