const express = require("express");
const router = express.Router();
const pool = require("../config/db");

router.post('/checkout', async (req, res) => {
  const { uid, payment_method } = req.body;
  try {
    // Get cart items
    const [cartItems] = await pool.query("SELECT * FROM cart WHERE uid=?", [uid]);
    if (cartItems.length === 0) return res.status(400).json({ message: "Cart is empty" });

    // Total amount
    let total = 0;
    cartItems.forEach(item => total += item.price * item.quantity);

    // Insert into orders
    const [orderResult] = await pool.query(
      "INSERT INTO orders (uid, total_amount, status) VALUES (?, ?, 'PENDING')",
      [uid, total]
    );
    const oid = orderResult.insertId;

    // Insert into order_items
    for (const item of cartItems) {
      await pool.query(
        "INSERT INTO order_items (oid, pid, size, quantity, price) VALUES (?, ?, ?, ?, ?)",
        [oid, item.pid, item.size, item.quantity, item.price]
      );
    }

    // Payment simulation
    await pool.query(
      "INSERT INTO payments (oid, amount, payment_method, payment_status) VALUES (?, ?, ?, 'SUCCESS')",
      [oid, total, payment_method]
    );

    // Clear cart
    await pool.query("DELETE FROM cart WHERE uid=?", [uid]);

    res.json({ message: 'Order placed successfully', orderId: oid });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Checkout failed' });
  }
});