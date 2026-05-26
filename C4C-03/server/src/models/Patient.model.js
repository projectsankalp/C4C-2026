const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  village: { type: String, required: true },
  phone: { type: String },
  aadhaar: { type: String },
  ashaId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  district: { type: String, default: 'Dakshina Kannada' }
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);
