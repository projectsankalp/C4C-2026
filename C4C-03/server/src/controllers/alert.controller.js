const Alert = require('../models/Alert.model');
const asyncHandler = require('../utils/asyncHandler');

const getAlerts = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  const alerts = await Alert.find(filter)
    .sort({ createdAt: -1 })
    .populate('patientId', 'name age gender village phone')
    .populate('screeningId', 'vitals result');
  res.json(alerts);
});

const updateAlert = asyncHandler(async (req, res) => {
  const { status, doctorNote } = req.body;
  const alert = await Alert.findByIdAndUpdate(
    req.params.id,
    { status, doctorNote },
    { new: true }
  );
  if (!alert) return res.status(404).json({ message: 'Alert not found' });
  res.json(alert);
});

module.exports = { getAlerts, updateAlert };
