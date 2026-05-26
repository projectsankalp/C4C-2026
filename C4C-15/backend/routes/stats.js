const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const patientsRes = await pool.query('SELECT COUNT(*)::int AS count FROM patients');
    const patients = patientsRes.rows[0]?.count || 0;

    // Try to count visits/pending if tables exist; otherwise return 0
    let visits = 0;
    try {
      const v = await pool.query('SELECT COUNT(*)::int AS count FROM visits');
      visits = v.rows[0]?.count || 0;
    } catch (e) {
      visits = 0;
    }

    let pending = 0;
    try {
      const p = await pool.query('SELECT COUNT(*)::int AS count FROM pending_sync');
      pending = p.rows[0]?.count || 0;
    } catch (e) {
      pending = 0;
    }

    let highRisk = 0, hypertension = 0, diabetes = 0, critical = 0, controlled = 0;
    try {
      const sr = await pool.query(`
        SELECT
          COUNT(*) FILTER (WHERE overall_risk = 'High')::int AS high_risk,
          COUNT(*) FILTER (WHERE hypertension_risk IN ('High', 'Moderate'))::int AS hypertension,
          COUNT(*) FILTER (WHERE diabetes_risk IN ('High', 'Moderate'))::int AS diabetes,
          COUNT(*) FILTER (WHERE overall_risk = 'High')::int AS critical,
          COUNT(*) FILTER (WHERE overall_risk = 'Low')::int AS controlled
        FROM screenings
      `);
      highRisk = sr.rows[0]?.high_risk || 0;
      hypertension = sr.rows[0]?.hypertension || 0;
      diabetes = sr.rows[0]?.diabetes || 0;
      critical = sr.rows[0]?.critical || 0;
      controlled = sr.rows[0]?.controlled || 0;
    } catch (e) {
      // screenings table not ready yet
    }

    return res.json({
      patients,
      visits,
      pending,
      highRisk,
      hypertension,
      critical,
      diabetes,
      controlled,
    });
  } catch (err) {
    console.error('Stats error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
