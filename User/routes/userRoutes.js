const express = require("express");
const { registerUser, loginUser } = require("../controller/userController");

const router = express.Router();

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

module.exports = router;
