const express = require('express');
const { createPatient, getPatients, getPatient } = require('../controllers/patient.controller');
const { protect } = require('../middleware/auth.middleware');
const router = express.Router();

router.use(protect);
router.post('/', createPatient);
router.get('/', getPatients);
router.get('/:id', getPatient);

module.exports = router;
