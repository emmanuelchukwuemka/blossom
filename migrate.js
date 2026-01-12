const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

// Create a new database connection
const dbConfig = {
    host: process.env.HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DBNAME,
    port: process.env.DB_PORT || 3306,
    multipleStatements: true,
    connectTimeout: 60000, // 60 seconds
    acquireTimeout: 60000,
    timeout: 60000
};

// Read all SQL migration files from the migrations directory
const migrationsDir = './migrations';
const migrationFiles = fs.readdirSync(migrationsDir).filter(file => file.endsWith('.sql'));

console.log(`Found ${migrationFiles.length} migration files:`);
migrationFiles.forEach((file, index) => {
    console.log(`${index + 1}. ${file}`);
});

// Execute migrations
async function runMigrations() {
    let connection;
    
    try {
        console.log('\nConnecting to database...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✓ Connected to database successfully!\n');
        
        console.log('Starting database migrations...\n');
        
        for (const file of migrationFiles) {
            console.log(`Executing migration: ${file}`);
            
            const filePath = path.join(migrationsDir, file);
            const sql = fs.readFileSync(filePath, 'utf8');
            
            try {
                const [results] = await connection.execute(sql);
                console.log(`✓ Successfully executed ${file}`);
            } catch (error) {
                console.error(`✗ Error executing ${file}:`, error.message);
                // Continue with other migrations even if one fails
            }
        }
        
        console.log('\nMigration process completed!');
    } catch (error) {
        console.error('Migration process failed:', error);
    } finally {
        if (connection) {
            try {
                await connection.end();
                console.log('✓ Database connection closed');
            } catch (err) {
                console.warn('Warning: Could not close database connection:', err.message);
            }
        }
        process.exit(0);
    }
}

// Run migrations
runMigrations().catch(err => {
    console.error('Migration process failed:', err);
    process.exit(1);
});