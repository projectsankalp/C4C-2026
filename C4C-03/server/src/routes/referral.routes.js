const express = require('express');
const { createReferral, getReferrals, updateReferral } = require('../controllers/referral.controller');
const { protect } = require('../middleware/auth.middleware');
const router = express.Router();

router.use(protect);
router.post('/', createReferral);
router.get('/', getReferrals);
router.patch('/:id', updateReferral);

module.exports = router;
