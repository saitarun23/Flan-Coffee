
const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// Update quantity of a cart item
router.put('/cart/:cart_id', async (req, res) => {
  try {
    const { quantity } = req.body;
    await pool.query('UPDATE cart SET quantity=? WHERE cart_id=?', [quantity, req.params.cart_id]);
    res.json({ message: 'Cart item updated' });
  } catch (err) {
    res.status(500).json({ message: 'Update failed' });
  }
});

// Add item to cart
router.post('/cart', async (req, res) => {
  try {
    console.log('Add to cart request body:', req.body);
    const { uid, pid, size, quantity, price } = req.body;
    
    // ✅ Check required fields
    if (!uid || !pid || !quantity || !price) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    await pool.query('INSERT INTO cart (uid, pid, size, quantity, price) VALUES (?, ?, ?, ?, ?)', [uid, pid, size, quantity, price]);
    res.json({ success: true, message: 'Added to cart successfully' });
  } catch (err) {
    console.error('Add to cart error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get cart items for user
router.get('/cart/:uid', async (req, res) => {
  try {
    const uid = req.params.uid;
    const [rows] = await pool.query(
      "SELECT c.cart_id, c.size, c.quantity, c.price, p.name, p.image FROM cart c JOIN products p ON c.pid=p.pid WHERE c.uid=?",
      [uid]
    );
    // Convert image BLOB to base64 string for frontend display
    const cartItems = rows.map(item => {
      if (item.image) {
        item.image = `data:image/jpeg;base64,${Buffer.from(item.image).toString("base64")}`;
      }
      return item;
    });
    res.json(cartItems);
  } catch (err) {
    res.status(500).json({ message: 'Cart fetch failed' });
  }
});

// Remove item from cart
router.delete('/cart/:cart_id', async (req, res) => {
  try {
    await pool.query("DELETE FROM cart WHERE cart_id=?", [req.params.cart_id]);
    res.json({ message: 'Removed from cart' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed' });
  }
});

module.exports = router;