const express = require("express");
const multer = require("multer");
const db = require("../config/db");
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

// Upload multiple images for a product
router.post("/:pid/images", upload.array("images", 10), async (req, res) => {
  const { pid } = req.params;
  const images = req.files;
  if (!images || images.length === 0) {
    return res.status(400).json({ message: "No images uploaded" });
  }
  try {
    for (const img of images) {
      await db.query("INSERT INTO product_images (pid, image) VALUES (?, ?)", [pid, img.buffer]);
    }
    res.json({ message: "Images uploaded successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all images for a product
router.get("/:pid/images", async (req, res) => {
  const { pid } = req.params;
  try {
    const [images] = await db.query("SELECT img_id, image FROM product_images WHERE pid=?", [pid]);
    const imgData = images.map(img => ({
      img_id: img.img_id,
      image: img.image.toString("base64")
    }));
    res.json(imgData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

// --- Additional CRUD for product_images ---

// List all product images (optionally filter by pid)
router.get("/images", async (req, res) => {
  const { pid } = req.query;
  try {
    let query = "SELECT img_id, pid, image FROM product_images";
    let params = [];
    if (pid) {
      query += " WHERE pid=?";
      params.push(pid);
    }
    const [images] = await db.query(query, params);
    const imgData = images.map(img => ({
      img_id: img.img_id,
      pid: img.pid,
      image: img.image.toString("base64")
    }));
    res.json(imgData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single product image by img_id
router.get("/images/:img_id", async (req, res) => {
  const { img_id } = req.params;
  try {
    const [rows] = await db.query("SELECT img_id, pid, image FROM product_images WHERE img_id=?", [img_id]);
    if (rows.length === 0) return res.status(404).json({ message: "Image not found" });
    const img = rows[0];
    res.json({
      img_id: img.img_id,
      pid: img.pid,
      image: img.image.toString("base64")
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a product image (replace image file)
router.put("/images/:img_id", upload.single("image"), async (req, res) => {
  const { img_id } = req.params;
  const image = req.file;
  if (!image) return res.status(400).json({ message: "No image uploaded" });
  try {
    await db.query("UPDATE product_images SET image=? WHERE img_id=?", [image.buffer, img_id]);
    res.json({ message: "Image updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a product image
router.delete("/images/:img_id", async (req, res) => {
  const { img_id } = req.params;
  try {
    await db.query("DELETE FROM product_images WHERE img_id=?", [img_id]);
    res.json({ message: "Image deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
