const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  screeningId: { type: mongoose.Schema.Types.ObjectId, ref: 'Screening', required: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  referredToName: { type: String, required: true },
  referredToEmail: { type: String },
  reason: { type: String },
  status: { type: String, enum: ['sent', 'received', 'admitted'], default: 'sent' },
  emailSentAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Referral', referralSchema);
