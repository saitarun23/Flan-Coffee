
const express = require("express");
const Razorpay = require("razorpay");
const pool = require("../config/db");
const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// 1. Create Razorpay Order
router.post("/create-order", async (req, res) => {
  const { amount, oid } = req.body;

  try {
    const options = {
      amount: amount * 100, // Amount in paise
      currency: "INR",
      receipt: `order_rcptid_${oid}`
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    console.error("Error creating Razorpay order:", err);
    res.status(500).json({ error: "Razorpay order creation failed" });
  }
});

// 2. Verify & Save Payment
router.post("/verify", async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, oid, amount, method } = req.body;

  try {
    // Verify signature
    const crypto = require("crypto");
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest("hex");

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ error: "Payment verification failed" });
    }

    // Save payment in DB
    await pool.query(
      "INSERT INTO payments (oid, amount, payment_method, transaction_id, payment_status) VALUES (?, ?, ?, ?, ?)",
      [oid, amount, method, razorpay_payment_id, "SUCCESS"]
    );

    await pool.query("UPDATE orders SET status = 'PAID' WHERE oid = ?", [oid]);

    res.json({ message: "Payment successful" });
  } catch (err) {
    console.error("Payment verification failed:", err);
    res.status(500).json({ error: "Payment verification failed" });
  }
});

module.exports = router;