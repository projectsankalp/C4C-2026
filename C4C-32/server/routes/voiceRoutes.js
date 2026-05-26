const express = require('express');
const router  = express.Router();
const { parseVoiceCommand } = require('../controllers/voiceController');

// Public — no auth needed for voice parsing
router.post('/parse', parseVoiceCommand);

module.exports = router;
