// routes/products.js
const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// GET all products
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM products");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
