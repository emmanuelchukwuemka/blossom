require('dotenv').config();

console.log('Environment Variables:');
console.log('DBNAME:', process.env.DBNAME);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('HOST:', process.env.HOST);
console.log('DB_USER:', process.env.DB_USER);

// Test database connection
const mysql = require('mysql2');

try {
    const db = mysql.createConnection({
        host: process.env.HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DBNAME,
    });
    
    console.log('Successfully created database connection object.');
    
    // Try to execute a simple query
    db.query('SHOW TABLES', (err, results) => {
        if (err) {
            console.error('Error querying database:', err.message);
        } else {
            console.log('Connected to database and found tables:', results.length);
            console.log('Sample tables:', results.slice(0, 10)); // Show first 10 tables
        }
        db.end();
    });
} catch (error) {
    console.error('Error creating connection:', error.message);
}