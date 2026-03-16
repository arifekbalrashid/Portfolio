const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: {
        rejectUnauthorized: false
    }
});

// Promisify for Node.js async/await
const promisePool = pool.promise();

// Test Connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed:', err.code);
        console.warn('Running in offline mode (API outcomes may vary).');
    } else {
        console.log('Successfully connected to MySQL Database');
        connection.release();
    }
});

module.exports = promisePool;
