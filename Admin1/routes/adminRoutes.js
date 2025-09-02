const express = require('express');
const { loginController } = require('../controller/adminController');

//router object
const router = express.Router();

// login
router.post('/login', loginController);

module.exports = router;
