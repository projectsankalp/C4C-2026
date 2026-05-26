const express = require('express');
const {
  createClassification,
  suggestClassification,
  getByPatient,
  getByScreening,
  getAllClassifications,
  updateClassification,
} = require('../controllers/diabetes.controller');
const { protect } = require('../middleware/auth.middleware');
const { allowRoles } = require('../middleware/role.middleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET all classifications (hospital/doctor dashboard)
router.get(
  '/',
  allowRoles('hospital', 'doctor'),
  getAllClassifications
);

// POST real-time auto-suggest (no DB write) — called on form change
router.post(
  '/suggest',
  allowRoles('hospital', 'doctor'),
  suggestClassification
);

// POST create/update classification
router.post(
  '/',
  allowRoles('hospital', 'doctor'),
  createClassification
);

// GET by patient
router.get(
  '/patient/:patientId',
  getByPatient
);

// GET by screening
router.get(
  '/screening/:screeningId',
  getByScreening
);

// PATCH update
router.patch(
  '/:id',
  allowRoles('hospital', 'doctor'),
  updateClassification
);

module.exports = router;
