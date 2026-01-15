const mysql = require('mysql2');

const db = mysql.createConnection({
    host: process.env.DB_HOST || process.env.HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME || process.env.DBNAME,
})

module.exports = db;