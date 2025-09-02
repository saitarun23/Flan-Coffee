const express = require('express');
const pool = require('../db/pool');
const logger = require('../logger');
const jwt = require('jsonwebtoken');
const config = require('../config');
const bcrypt = require('bcryptjs');

const router = express.Router();

// POST /api/admin/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const [rows] = await pool.query('SELECT admin_id, password FROM admin WHERE admin_id = ?', [username]);
    if (rows.length === 0) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const admin = rows[0];
    // Support both bcrypt-hashed passwords and legacy plaintext.
    let match = false;
    try {
      match = await bcrypt.compare(password, admin.password);
    } catch (e) {
      // bcrypt compare may throw if admin.password isn't a bcrypt hash; fallback to direct compare
      match = admin.password === password;
    }
    if (!match) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    // If password stored in DB is plaintext, replace it with a bcrypt hash (migration)
    if (!admin.password.startsWith('$2')) {
      try {
        const hash = await bcrypt.hash(password, 10);
        await pool.query('UPDATE admin SET password = ? WHERE admin_id = ?', [hash, admin.admin_id]);
        logger.info('Migrated admin %s password to bcrypt hash', admin.admin_id);
      } catch (e) {
        logger.warn('Failed to migrate admin password to hash: %o', e);
      }
    }

    const token = jwt.sign({ admin_id: admin.admin_id }, config.jwtSecret, { expiresIn: '6h' });
    // set httpOnly secure cookie (secure should be true on HTTPS)
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    return res.json({ success: true });
  } catch (err) {
    logger.error('POST /admin/login error: %o', err);
    res.status(500).json({ success: false, message: 'DB error' });
  }
});

module.exports = router;
