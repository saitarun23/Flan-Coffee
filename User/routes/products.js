// routes/products.js
const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// GET all products
router.get("/", async (req, res) => {
  try {
      let query = "SELECT * FROM products";
      let params = [];
      if (req.query.latest) {
        query += " ORDER BY pid DESC LIMIT ?";
        params.push(parseInt(req.query.latest));
      }
      const [rows] = await pool.query(query, params);

    const products = rows.map(p => {
      if (p.image) {
        // Convert BLOB to base64 string for frontend display
        p.image = `data:image/jpeg;base64,${Buffer.from(p.image).toString("base64")}`;
      }
      return p;
    });

    res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).send("Error fetching products");
  }
});

// GET single product by PID
router.get("/:pid", async (req, res) => {
  try {
    // Get main product info
    const [rows] = await pool.query(
      "SELECT * FROM products WHERE pid = ?",
      [req.params.pid]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    const product = rows[0];

    // Ensure main image is base64 string
    if (product.image && Buffer.isBuffer(product.image)) {
      product.image = product.image.toString('base64');
    }

    // Get all images for this product (assuming a product_images table with pid, image columns)
    const [imgRows] = await pool.query(
      "SELECT image FROM product_images WHERE pid = ?",
      [req.params.pid]
    );
    product.images = imgRows.map(img => ({
      image: Buffer.isBuffer(img.image) ? img.image.toString('base64') : img.image
    }));

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add to cart (user-specific)
router.post("/cart", async (req, res) => {
  try {
    console.log('Add to cart request body:', req.body);
    const { pid, quantity, size, price, uid } = req.body;
    await pool.query(
      "INSERT INTO cart (pid, quantity, size, price, uid) VALUES (?, ?, ?, ?, ?)",
      [pid, quantity, size, price, uid]
    );
    res.json({ success: true, message: "Added to cart!" });
  } catch (err) {
    console.error('Add to cart error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET all cart items for a user
router.get("/cart/:uid", async (req, res) => {
  try {
    const uid = req.params.uid;
    const [rows] = await pool.query(
      `
      SELECT c.*, p.name, p.image
      FROM cart c
      JOIN products p ON c.pid = p.pid
      WHERE c.uid = ?
    `,
      [uid]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// POST payment (dummy implementation)
router.post("/payment", async (req, res) => {
  try {
    // In a real app, integrate with a payment gateway here
    // For now, just clear the cart and return success
    await pool.query("DELETE FROM cart");
    res.json({
      success: true,
      message: "Payment successful! Your order is placed.",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Place an order and process payment
router.post("/place-order", async (req, res) => {
  const { uid, payment_method } = req.body; // Get user ID and payment method from request
  try {
    // Get cart items for the user
    const [cartItems] = await pool.query(
      "SELECT c.*, p.name, p.image FROM cart c JOIN products p ON c.pid = p.pid WHERE c.uid = ?",
      [uid]
    );
    if (cartItems.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    // Calculate total amount
    let total = 0;
    cartItems.forEach((item) => {
      total += item.price * item.quantity;
    });

    // Create order
    const [orderResult] = await pool.query(
      "INSERT INTO orders (uid, total_amount) VALUES (?, ?)",
      [uid, total]
    );
    const oid = orderResult.insertId;

    // Add order items
    for (const item of cartItems) {
      await pool.query(
        "INSERT INTO order_items (oid, pid, quantity, price) VALUES (?, ?, ?, ?)",
        [oid, item.pid, item.quantity, item.price]
      );
    }

    // Add payment record
    await pool.query(
      "INSERT INTO payments (oid, amount, payment_method) VALUES (?, ?, ?)",
      [oid, total, payment_method]
    );

    // Clear cart
    await pool.query("DELETE FROM cart WHERE uid = ?", [uid]);

    res.json({
      success: true,
      message: "Order placed and payment successful!",
      order_id: oid,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET latest 4 products
  router.get("/latest", async (req, res) => {
    try {
      const [rows] = await mySqlPool.query(
        "SELECT * FROM products ORDER BY pid DESC LIMIT 4"
      );
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: "Error fetching latest products" });
    }
  });

module.exports = router;
