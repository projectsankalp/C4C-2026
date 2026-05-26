const express = require('express');
const router  = express.Router();
const { chatWithGemini } = require('../controllers/geminiChatController');

// POST /api/gemini/chat — public, no auth needed
router.post('/chat', chatWithGemini);

module.exports = router;
