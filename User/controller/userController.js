const db = require("../config/db");
const bcrypt = require("bcryptjs");

// Register user
const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).send({ success: false, message: "All fields required" });
    }

    // Check if user exists
    const [existing] = await db.query("SELECT * FROM users WHERE email=?", [email]);
    if (existing.length > 0) {
      return res.status(400).send({ success: false, message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query("INSERT INTO users (username, email, password) VALUES (?, ?, ?)", [
      username,
      email,
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
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send({ success: false, message: "All fields required" });
    }

    const [rows] = await db.query("SELECT * FROM users WHERE email=?", [email]);

    if (rows.length === 0) {
      return res.status(401).send({ success: false, message: "Invalid credentials" });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).send({ success: false, message: "Invalid credentials" });
    }

    // Check for 'username' or 'name' property, with a fallback to the email prefix.
    const username = user.username || user.name || user.email.split('@')[0];

    res.status(200).send({ success: true, message: "Login successful", user: user });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: "Error logging in", error });
  }
};

module.exports = { registerUser, loginUser };
