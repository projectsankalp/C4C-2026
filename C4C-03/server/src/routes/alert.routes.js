const express = require('express');
const { getAlerts, updateAlert } = require('../controllers/alert.controller');
const { protect } = require('../middleware/auth.middleware');
const router = express.Router();

router.use(protect);
router.get('/', getAlerts);
router.patch('/:id', updateAlert);

module.exports = router;
