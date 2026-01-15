const mysql = require('mysql2');

const db = mysql.createConnection({
    host: process.env.DB_HOST || process.env.MYSQL_HOST || process.env.HOST,
    user: process.env.DB_USER || process.env.MYSQL_USER,
    password: process.env.DB_PASS || process.env.MYSQL_PASSWORD,
    database: process.env.DB_NAME || process.env.MYSQL_DATABASE || process.env.DBNAME,
    port: process.env.DB_PORT || 3306,
})

module.exports = db;