const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  screeningId: { type: mongoose.Schema.Types.ObjectId, ref: 'Screening', required: true },
  riskLevel: { type: String, default: 'HIGH' },
  status: { type: String, enum: ['pending', 'acknowledged', 'actioned'], default: 'pending' },
  doctorNote: { type: String, default: '' },
  emailSentAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Alert', alertSchema);
