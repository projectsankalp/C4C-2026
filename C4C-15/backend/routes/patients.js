const express = require('express');
const pool = require('../db');
const requireAuth = require('../middleware/auth');
const { ensureMobileSchema, createMobileId } = require('../schema');

const router = express.Router();

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

router.get('/', requireAuth, async (_req, res) => {
  try {
    await ensureMobileSchema();

    const { rows } = await pool.query(
      `SELECT p.id, p.full_name, p.address, p.dob, p.mobile, p.created_at,
              ls.overall_risk
       FROM patients p
       LEFT JOIN LATERAL (
         SELECT overall_risk FROM screenings WHERE patient_id = p.id ORDER BY created_at DESC LIMIT 1
       ) ls ON true
       ORDER BY p.created_at DESC`
    );

    return res.json(rows);
  } catch (err) {
    console.error('List patients error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  if (!UUID_REGEX.test(req.params.id)) {
    return res.status(400).json({ error: 'Invalid patient ID — please scan a valid QR code' });
  }

  try {
    await ensureMobileSchema();

    const { rows } = await pool.query(
      `SELECT id, full_name, address, dob, mobile, created_at
       FROM patients
       WHERE id = $1
       LIMIT 1`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    return res.json(rows[0]);
  } catch (err) {
    console.error('Get patient error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  const { name, address, dob, mobile } = req.body || {};
  const normalizedAddress = typeof address === 'string' ? address.trim() : '';

  if (!name || !dob || !mobile) {
    return res.status(400).json({ error: 'Name, date of birth, and mobile are required' });
  }

  if (!/^[6-9]\d{9}$/.test(mobile)) {
    return res.status(400).json({ error: 'Enter a valid 10-digit Indian mobile number' });
  }

  try {
    await ensureMobileSchema();

    let rows = [];

    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const id = createMobileId();
        const result = await pool.query(
          `INSERT INTO patients (id, full_name, address, dob, mobile)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id, full_name, address, dob, mobile, created_at`,
          [id, name, normalizedAddress, dob, mobile]
        );
        rows = result.rows;
        break;
      } catch (err) {
        if (err.code !== '23505' || attempt === 1) {
          throw err;
        }
      }
    }

    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Create patient error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;