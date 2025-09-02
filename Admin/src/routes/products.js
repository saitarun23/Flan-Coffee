const express = require('express');
const multer = require('multer');
const pool = require('../db/pool');
const logger = require('../logger');

const router = express.Router();
const apiAuth = require('../middleware/authApi');

// protect all product APIs
router.use(apiAuth);
const upload = multer({ storage: multer.memoryStorage() });

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, description, price, weight, quantity, image AS image_url FROM products');
    res.json(rows);
  } catch (err) {
    logger.error('GET /products error: %o', err);
    res.status(500).json({ message: 'DB error' });
  }
});

// POST /api/products
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, description, price = 0, weight = null, quantity = 0 } = req.body;
    let image = req.body.image || null;
    if (req.file && req.file.buffer) {
      image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }
    const [result] = await pool.query(
      'INSERT INTO products (name, description, price, weight, quantity, image) VALUES (?,?,?,?,?,?)',
      [name, description, price, weight, quantity, image]
    );
    res.json({ message: 'Product added', id: result.insertId });
  } catch (err) {
    logger.error('POST /products error: %o', err);
    if (err.code === 'ER_BAD_FIELD_ERROR') {
      // attempt fallback without image column
      try {
        const { name, description, price = 0, weight = null, quantity = 0 } = req.body;
        const [result2] = await pool.query(
          'INSERT INTO products (name, description, price, weight, quantity) VALUES (?,?,?,?,?)',
          [name, description, price, weight, quantity]
        );
        return res.json({ message: 'Product added (no image column)', id: result2.insertId });
      } catch (e) {
        logger.error('Fallback insert failed: %o', e);
        return res.status(500).json({ message: 'DB error' });
      }
    }
    res.status(500).json({ message: 'DB error' });
  }
});

// PUT /api/products/:id
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price = 0, weight = null, quantity = 0 } = req.body;
    let image = req.body.image || null;
    if (req.file && req.file.buffer) {
      image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }
    await pool.query('UPDATE products SET name=?, description=?, price=?, weight=?, quantity=?, image=? WHERE id=?',
      [name, description, price, weight, quantity, image, id]
    );
    res.json({ message: 'Product updated' });
  } catch (err) {
    logger.error('PUT /products/:id error: %o', err);
    if (err.code === 'ER_BAD_FIELD_ERROR') {
      try {
        const { id } = req.params;
        const { name, description, price = 0, weight = null, quantity = 0 } = req.body;
        await pool.query('UPDATE products SET name=?, description=?, price=?, weight=?, quantity=? WHERE id=?',
          [name, description, price, weight, quantity, id]
        );
        return res.json({ message: 'Product updated (no image column)' });
      } catch (e) {
        logger.error('Fallback update failed: %o', e);
        return res.status(500).json({ message: 'DB error' });
      }
    }
    res.status(500).json({ message: 'DB error' });
  }
});

// DELETE /api/products/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM products WHERE id=?', [id]);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    logger.error('DELETE /products/:id error: %o', err);
    res.status(500).json({ message: 'DB error' });
  }
});

module.exports = router;
