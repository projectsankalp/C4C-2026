const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const asyncHandler = require('../utils/asyncHandler');

const signToken = (user) => jwt.sign(
  { id: user._id, role: user.role, name: user.name },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN }
);

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { ashaId, pin, email, password, role } = req.body;

  let user;

  if (role === 'asha') {
    if (!ashaId || !pin) return res.status(400).json({ message: 'ASHA ID and PIN required' });
    user = await User.findOne({ ashaId: ashaId.toUpperCase(), role: 'asha' });
    if (!user || !(await user.comparePin(pin))) {
      return res.status(401).json({ message: 'Invalid ASHA ID or PIN' });
    }
  } else {
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
    user = await User.findOne({ email: email.toLowerCase(), role });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
  }

  const token = signToken(user);
  res.json({
    token,
    user: { id: user._id, name: user.name, role: user.role, village: user.village, ashaId: user.ashaId }
  });
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password -pin');
  res.json(user);
});

module.exports = { login, getMe };
