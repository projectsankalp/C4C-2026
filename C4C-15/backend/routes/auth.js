const express = require('express');
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const requireAuth = require('../middleware/auth');

const router = express.Router();

if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not set in .env');
  process.exit(1);
}

router.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'Missing username or password' });

  try {
    const { rows } = await pool.query(
      'SELECT id, username, email, name, password_hash, status FROM admin_panel.users WHERE username = $1 OR email = $1 LIMIT 1',
      [username]
    );
    if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const user = rows[0];

    if (user.status && user.status !== 'ACTIVE') {
      return res.status(401).json({ error: 'Account is inactive or restricted' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { userId: user.id, username: user.username || user.email },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.json({
      token,
      username: user.name || user.username || user.email,
    });
  } catch (err) {
    console.error('Login error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT u.id, u.name, u.username, u.email, u.role, u.village, u.status,
              p.name AS phc_name
       FROM admin_panel.users u
       LEFT JOIN admin_panel.phcs p ON p.id = u.phc_id
       WHERE u.id = $1
       LIMIT 1`,
      [req.user.userId]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    return res.json(rows[0]);
  } catch (err) {
    console.error('Me error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;