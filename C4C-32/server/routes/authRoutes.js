const express = require('express');
const router = express.Router();

const { signup, login, getProfile, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// Protected routes
router.get('/profile', protect, getProfile);
router.patch('/profile', protect, updateProfile);

module.exports = router;
