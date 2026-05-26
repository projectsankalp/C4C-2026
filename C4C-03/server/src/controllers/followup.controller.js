const FollowUp = require('../models/FollowUp.model');
const asyncHandler = require('../utils/asyncHandler');

const getFollowUps = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  const followups = await FollowUp.find(filter)
    .sort({ dueDate: 1 })
    .populate('patientId', 'name village age')
    .populate('screeningId', 'result');
  res.json(followups);
});

const completeFollowUp = asyncHandler(async (req, res) => {
  const followup = await FollowUp.findByIdAndUpdate(
    req.params.id,
    { status: 'done', completedAt: new Date(), completedBy: req.user.id },
    { new: true }
  );
  if (!followup) return res.status(404).json({ message: 'Follow-up not found' });
  res.json(followup);
});

module.exports = { getFollowUps, completeFollowUp };
