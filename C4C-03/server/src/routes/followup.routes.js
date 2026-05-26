const express = require('express');
const { getFollowUps, completeFollowUp } = require('../controllers/followup.controller');
const { protect } = require('../middleware/auth.middleware');
const router = express.Router();

router.use(protect);
router.get('/', getFollowUps);
router.patch('/:id/complete', completeFollowUp);

module.exports = router;
