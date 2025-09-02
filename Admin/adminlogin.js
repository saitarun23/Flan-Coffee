const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require('multer');
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json());
const upload = multer({ storage: multer.memoryStorage() });

// simple request logger to help debug routing issues
app.use((req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.path);
  next();
});


app.use(express.static(__dirname));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "adminproducts.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "adminlogin.html"));
});

// DB connection
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

// Admin Login API
app.post("/admin/login", (req, res) => {
  const { username, password } = req.body;

  db.query(
    "SELECT * FROM flancoffee.admin WHERE admin_id = ? AND password = ?",
    [username, password],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "DB error" });
      }
      if (results.length > 0) {
        res.json({ success: true, message: "Login successful" });
      } else {
        res.json({ success: false, message: "Invalid credentials" });
      }
    }
  );
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
app.post("/products", upload.single('image'), (req, res) => {
  // Accept multipart/form-data with file field 'image' or JSON with image_url
  const { name, description, price, weight, quantity } = req.body;
  // store incoming image data (data URL) in `image` column
  let image = req.body.image || null;

  if (req.file && req.file.buffer) {
    // convert buffer to data URL and store in the `image` column
    image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
  }

  db.query(
    "INSERT INTO products (name, description, price, weight, quantity, image) VALUES (?,?,?,?,?,?)",
    [name, description, price, weight, quantity, image],
    (err, result) => {
      if (err) {
        console.error(err);
        // If the products table doesn't have image_url, fallback to inserting without it
        if (err.code === 'ER_BAD_FIELD_ERROR') {
          db.query(
            "INSERT INTO products (name, description, price, weight, quantity) VALUES (?,?,?,?,?)",
            [name, description, price, weight, quantity],
            (err2, result2) => {
              if (err2) {
                console.error('Fallback insert failed:', err2);
                return res.status(500).json({ message: 'DB error' });
              }
              return res.json({ message: '✅ Product added (no image column)', id: result2.insertId });
            }
          );
          return;
        }
        return res.status(500).json({ message: "DB error" });
      }
      res.json({ message: "✅ Product added", id: result.insertId });
    }
  );
});

// Update product
app.put("/products/:id", upload.single('image'), (req, res) => {
  const { id } = req.params;
  const { name, description, price, weight, quantity } = req.body;
  // use the `image` column (data URL) to match your table schema
  let image = req.body.image || null;

  if (req.file && req.file.buffer) {
    image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
  }

  db.query(
    "UPDATE products SET name=?, description=?, price=?, weight=?, quantity=?, image=? WHERE id=?",
    [name, description, price, weight, quantity, image, id],
    (err) => {
      if (err) {
        console.error(err);
        // fallback: if image column doesn't exist, try update without it
        if (err.code === 'ER_BAD_FIELD_ERROR') {
          db.query(
            "UPDATE products SET name=?, description=?, price=?, weight=?, quantity=? WHERE id=?",
            [name, description, price, weight, quantity, id],
            (err2) => {
              if (err2) {
                console.error('Fallback update failed:', err2);
                return res.status(500).json({ message: 'DB error' });
              }
              return res.json({ message: '✅ Product updated (no image column)' });
            }
          );
          return;
        }
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