const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const config = require('./config');
const security = require('./middleware/security');
const cookieParser = require('cookie-parser');
const htmlAuth = require('./middleware/htmlAuth');
const logger = require('./logger');

const productsRouter = require('./routes/products');
const authRouter = require('./routes/auth');

const app = express();

// middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
security(app);
app.use(cookieParser());

// simple request logger
app.use((req, res, next) => {
  logger.info('%s %s', req.method, req.path);
  next();
});

// protect HTML pages (except login) - run before static so .html files are intercepted
app.use(htmlAuth);

// static frontend
app.use(express.static(path.join(__dirname, '..', 'public')));

// API
app.use('/api/products', productsRouter);
app.use('/api/admin', authRouter);

// root should redirect to login page
app.get('/', (req, res) => res.redirect('/adminlogin.html'));

// fallback to index for other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'adminproducts.html'));
});

module.exports = app;
