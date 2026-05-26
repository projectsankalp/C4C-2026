const mongoose = require('mongoose');

const followUpSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  screeningId: { type: mongoose.Schema.Types.ObjectId, ref: 'Screening', required: true },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'done', 'overdue'], default: 'pending' },
  completedAt: Date,
  completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('FollowUp', followUpSchema);
