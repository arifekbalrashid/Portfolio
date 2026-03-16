const fs = require('fs');
const path = require('path');
const db = require('../config/db');

async function setupDatabase() {
    try {
        const schemaPath = path.join(__dirname, '../models/schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        const queries = schema.split(';').filter(query => query.trim().length > 0);

        console.log('Starting Database Migration...');
        console.log('DB Host:', process.env.DB_HOST);
        console.log('DB User:', process.env.DB_USER);

        console.log('Reading schema query...');

        for (const query of queries) {
            await db.query(query);
            console.log('Executed:', query.substring(0, 50) + '...');
        }

        console.log('Database Setup Complete!');
        // process.exit(0);
    } catch (error) {
        console.error('Database Setup Failed:', error);
        throw error;
        // process.exit(1);
    }
}

if (require.main === module) {
    setupDatabase().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = setupDatabase;
