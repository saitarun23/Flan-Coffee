const express = require("express");
const colors = require("colors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const mySqlPool = require("./config/db");
const path = require("path");
const cors = require("cors"); 
const productsRoute = require("./routes/products");

// config
dotenv.config();

const app = express();
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));
app.use(cors());
app.use(express.json());


//get all products
app.use("/products", productsRoute);

// Mount cart routes
app.use(require("./routes/cartRoutes"));

// Place order
app.post("/orders/place", (req, res) => {
  const { uid, cartItems, total_amount } = req.body;

  // Insert into orders
  const sql = "INSERT INTO orders (uid, total_amount, status) VALUES (?, ?, 'PENDING')";
  db.query(sql, [uid, total_amount], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    const oid = result.insertId;
    // Insert order_items
    if (cartItems && cartItems.length > 0) {
      const items = cartItems.map(item => [oid, item.pid, item.quantity, item.price]);
      db.query(
        "INSERT INTO order_items (oid, pid, quantity, price) VALUES ?",
        [items],
        (err2) => {
          if (err2) return res.status(500).json({ error: err2 });
          res.json({ message: "Order placed", oid });
        }
      );
    } else {
      res.json({ message: "Order placed", oid });
    }
  });
});

// Create Razorpay order
app.post("/payments/create", async (req, res) => {
  const { oid, amount } = req.body;
  try {
    const options = {
      amount: amount * 100, // in paise
      currency: "INR",
      receipt: `order_rcptid_${oid}`,
    };
    const order = await razorpay.orders.create(options);
    res.json({ orderId: order.id });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

// Payment verification webhook
app.post("/payments/verify", (req, res) => {
  const { oid, transaction_id, payment_method, status, amount } = req.body;
  const sql = "INSERT INTO payments (oid, amount, payment_status, payment_method, transaction_id) VALUES (?, ?, ?, ?, ?)";
  db.query(sql, [oid, amount, status, payment_method, transaction_id], (err) => {
    if (err) return res.status(500).json({ error: err });
    // Update order status
    db.query("UPDATE orders SET status=? WHERE oid=?", [status === "Success" ? "CONFIRMED" : "FAILED", oid]);
    res.json({ message: "Payment recorded" });
  });
});

app.listen(4000, () => console.log("User server running on http://localhost:4000"));

// routes
app.use("/api/v1/user", require("./routes/userRoutes"));

// Serve user.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "user.html"));
});

const PORT = process.env.USER_PORT || 4000;

mySqlPool
  .query("SELECT 1")
  .then(() => {
    console.log("MySQL connected".bgCyan.white);
    app.listen(PORT, () => {
      console.log(`User Server running on port ${PORT}`.bgMagenta.white);
    });
  })
  .catch((error) => {
    console.log(error);
  });
