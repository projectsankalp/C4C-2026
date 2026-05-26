const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  role: { type: String, enum: ['asha', 'doctor', 'hospital'], required: true },
  email: { type: String, sparse: true, lowercase: true },
  ashaId: { type: String, sparse: true, uppercase: true },
  pin: { type: String },        // ASHA uses 4-digit PIN
  password: { type: String },   // doctor/hospital use password
  village: { type: String },
  phone: { type: String },
  district: { type: String, default: 'Dakshina Kannada' }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (this.pin && this.isModified('pin')) {
    this.pin = await bcrypt.hash(this.pin, 10);
  }
  if (this.password && this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.comparePin = function (pin) {
  return bcrypt.compare(pin, this.pin);
};
userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
