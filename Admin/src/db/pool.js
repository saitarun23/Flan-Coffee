const mysql = require('mysql2/promise');
const config = require('../config');
const logger = require('../logger');

// Basic sanity checks: ensure DB user and host are provided
if (!config.db.user || !config.db.database) {
	logger.error('Database configuration appears incomplete. Please copy .env.example to .env and set DB_USER, DB_PASSWORD, DB_NAME, DB_HOST.');
	throw new Error('Missing DB configuration (DB_USER/DB_PASSWORD/DB_NAME)');
}

let pool;
try {
	pool = mysql.createPool(config.db);
} catch (err) {
	logger.error('Failed to create DB pool: %o', err);
	throw err;
}

module.exports = pool;
