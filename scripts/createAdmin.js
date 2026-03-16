const bcrypt = require('bcryptjs');
const db = require('../config/db');

async function createAdmin() {
    const username = process.env.ADMIN_USERNAME || 'Arif';
    const password = process.env.ADMIN_PASSWORD;

    if (!password) {
        console.warn('ADMIN_PASSWORD not set in .env. Skipping admin creation to prevent insecurity.');
        return;
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);

        if (rows.length > 0) {
            console.log('Admin user exists. Updating password from environment variable...');
            await db.query('UPDATE users SET password_hash = ? WHERE username = ?', [hashedPassword, username]);
            return;
        }

        await db.query('INSERT INTO users (username, password_hash) VALUES (?, ?)', [username, hashedPassword]);
        console.log(`Admin user created.\nUsername: ${username}\nPassword: ${password}`);
        // process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error);
        throw error;
        // process.exit(1);
    }
}

if (require.main === module) {
    createAdmin().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = createAdmin;
