const mongoose = require('mongoose');

const DailyMetricSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  steps: { type: Number, default: 0 },
  activeMins: { type: Number, default: 0 },
  sleepHours: { type: Number, default: 0 },
  sleepMins: { type: Number, default: 0 },
  heartRate: { type: Number },
  createdAt: { type: Date, default: Date.now },
});

DailyMetricSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('DailyMetric', DailyMetricSchema);
