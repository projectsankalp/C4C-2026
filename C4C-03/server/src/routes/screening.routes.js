const express = require('express');

const {
  createScreening,

  recordPHCTest,

  getScreenings,

  getStats,

  getVillageSummary,

  getWeeklyTrend
} = require('../controllers/screening.controller');

const {
  protect
} = require('../middleware/auth.middleware');

const {
  allowRoles
} = require('../middleware/role.middleware');

const router = express.Router();

// Protect all routes
router.use(protect);

// ── Screening Routes ─────────────────────────────────────
router.post(
  '/',
  createScreening
);

router.get(
  '/stats',
  getStats
);

router.get(
  '/village-summary',
  getVillageSummary
);

router.get(
  '/weekly',
  getWeeklyTrend
);

router.get(
  '/',
  getScreenings
);

// ── PHC Blood Glucose Test ──────────────────────────────
// Only PHC doctors can perform/update glucose test
router.patch(
  '/:id/phc-test',
  allowRoles('doctor'),
  recordPHCTest
);

module.exports = router;