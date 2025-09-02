const mysql = require('mysql2/promise');

const mySqlPool = mysql.createPool({
    host: 'localhost',
    user:  'root',
    password: 'saivarun',
    database: 'flancoffee'
});

module.exports = mySqlPool
