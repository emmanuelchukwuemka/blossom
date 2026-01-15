const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration without specifying database name initially
const dbConfig = {
    host: process.env.HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT || 3306,
};

async function createDatabaseAndRunMigrations() {
    let connection;
    
    try {
        console.log('Connecting to MySQL server...');
        connection = await mysql.createConnection({
            host: process.env.HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            port: process.env.DB_PORT || 3306
        });
        console.log('✓ Connected to MySQL server successfully!');
        
        // Create the database if it doesn't exist
        console.log(`Creating database ${process.env.DBNAME} if it doesn't exist...`);
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DBNAME}\`;`);
        console.log(`✓ Database ${process.env.DBNAME} is ready!`);
        
        // Switch to the database
        await connection.changeUser({ database: process.env.DBNAME });
        console.log(`✓ Switched to database ${process.env.DBNAME}`);
        
        // Now run the migrations
        console.log('\nStarting database migrations...');
        
        // Read migration files
        const fs = require('fs');
        const path = require('path');
        const migrationsDir = './migrations';
        const migrationFiles = fs.readdirSync(migrationsDir).filter(file => file.endsWith('.sql'));

        console.log(`Found ${migrationFiles.length} migration files:`);
        migrationFiles.forEach((file, index) => {
            console.log(`${index + 1}. ${file}`);
        });

        for (const file of migrationFiles) {
            console.log(`\nExecuting migration: ${file}`);
            
            const filePath = path.join(migrationsDir, file);
            const sql = fs.readFileSync(filePath, 'utf8');
            
            try {
                await connection.query(sql);
                console.log(`✓ Successfully executed ${file}`);
            } catch (error) {
                console.error(`✗ Error executing ${file}:`, error.message);
                // Continue with other migrations even if one fails
            }
        }
        
        console.log('\nDatabase setup completed successfully!');
        
    } catch (error) {
        console.error('Database setup failed:', error);
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

createDatabaseAndRunMigrations().catch(err => {
    console.error('Database setup process failed:', err);
    process.exit(1);
});