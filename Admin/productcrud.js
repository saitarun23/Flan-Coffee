const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// serve static HTML/JS files from project folder
app.use(express.static(__dirname));
app.get("/", (req, res) => {
  // serve the admin products page
  res.sendFile(path.join(__dirname, "adminproducts.html"));
});

// --- DB connection ---
const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "saivarun",
  database: "flancoffee"
});

db.connect(err => {
  if (err) {
    console.error("❌ Database connection failed:", err);
  } else {
    console.log("✅ MySQL Connected to flancoffee DB!");
  }
});

// --- Products CRUD APIs ---

// Get all products
app.get("/products", (req, res) => {
  db.query("SELECT * FROM products", (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "DB error" });
    }
    res.json(results);
  });
});

// Add product
app.post("/products", (req, res) => {
  const { name, description, price, weight, quantity, image } = req.body;

  db.query(
    "INSERT INTO products (name, description, price, weight, quantity, image) VALUES (?,?,?,?,?,?)",
    [name, description, price, weight, quantity, image],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "DB error" });
      }
      res.json({ message: "✅ Product added", id: result.insertId });
    }
  );
});

// Update product
app.put("/products/:id", (req, res) => {
  const { id } = req.params;
  const { name, description, price, weight, quantity, image } = req.body;

  db.query(
    "UPDATE products SET name=?, description=?, price=?, weight=?, quantity=?, image=? WHERE id=?",
    [name, description, price, weight, quantity, image, id],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "DB error" });
      }
      res.json({ message: "✅ Product updated" });
    }
  );
});

// Delete product
app.delete("/products/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM products WHERE id=?", [id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "DB error" });
    }
    res.json({ message: "🗑️ Product deleted" });
  });
});

module.exports = app;
