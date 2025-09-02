const db = require("../config/db");
const bcrypt = require("bcryptjs");

// Register user
const registerUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).send({ success: false, message: "All fields required" });
    }

    // Check if user exists
    const [existing] = await db.query("SELECT * FROM users WHERE username=?", [username]);
    if (existing.length > 0) {
      return res.status(400).send({ success: false, message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query("INSERT INTO users (username, password) VALUES (?, ?)", [
      username,
      hashedPassword,
    ]);

    res.status(201).send({ success: true, message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: "Error registering user", error });
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).send({ success: false, message: "All fields required" });
    }

    const [rows] = await db.query("SELECT * FROM users WHERE username=?", [username]);

    if (rows.length === 0) {
      return res.status(401).send({ success: false, message: "Invalid credentials" });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).send({ success: false, message: "Invalid credentials" });
    }

    res.status(200).send({ success: true, message: "Login successful", userId: user.uid });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: "Error logging in", error });
  }
};

module.exports = { registerUser, loginUser };
