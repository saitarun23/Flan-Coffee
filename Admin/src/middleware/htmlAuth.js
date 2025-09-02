const jwt = require('jsonwebtoken');
const config = require('../config');

// Middleware to protect access to .html files (except login page)
module.exports = function (req, res, next) {
  try {
    const url = req.path || '';
    // Only enforce for requests that target .html files
    if (!url.endsWith('.html')) return next();

    // allow login page always
    if (url === '/adminlogin.html' || url === '/favicon.ico') return next();

    const token = req.cookies && req.cookies.token;
    if (!token) return res.redirect('/adminlogin.html');

    jwt.verify(token, config.jwtSecret, (err, decoded) => {
      if (err) return res.redirect('/adminlogin.html');
      // attach decoded user if needed
      req.user = decoded;
      next();
    });
  } catch (err) {
    return res.redirect('/adminlogin.html');
  }
};
