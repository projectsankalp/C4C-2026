const Referral = require('../models/Referral.model');
const Patient = require('../models/Patient.model');
const Screening = require('../models/Screening.model');
const User = require('../models/User.model');
const Alert = require('../models/Alert.model');
const { sendReferralNotice } = require('../services/emailService');
const asyncHandler = require('../utils/asyncHandler');

const createReferral = asyncHandler(async (req, res) => {
  const { patientId, screeningId, referredToName, referredToEmail, reason } = req.body;

  const referral = await Referral.create({
    patientId,
    screeningId,
    referredBy: req.user.id,
    referredToName,
    referredToEmail,
    reason,
  });

  // Update alert status to actioned
  await Alert.updateOne({ screeningId }, { status: 'actioned' });

  // Send email to hospital
  try {
    const [patient, screening, doctor] = await Promise.all([
      Patient.findById(patientId),
      Screening.findById(screeningId),
      User.findById(req.user.id).select('name'),
    ]);
    await sendReferralNotice(patient, screening, doctor, referral);
    await Referral.findByIdAndUpdate(referral._id, { emailSentAt: new Date() });
  } catch (err) {
    console.error('Referral email failed:', err.message);
  }

  res.status(201).json(referral);
});

const getReferrals = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.patientId) filter.patientId = req.query.patientId;

  const referrals = await Referral.find(filter)
    .sort({ createdAt: -1 })
    .populate('patientId', 'name age gender village phone')
    // FIX: include phcTest in populate so hospital can see blood glucose results
    .populate('screeningId', 'vitals result phcTest')
    .populate('referredBy', 'name');

  res.json(referrals);
});

const updateReferral = asyncHandler(async (req, res) => {
  const referral = await Referral.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!referral) return res.status(404).json({ message: 'Referral not found' });
  res.json(referral);
});

module.exports = { createReferral, getReferrals, updateReferral };
