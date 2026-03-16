require('dotenv').config();
const db = require('../config/db');

const initialProfile = {
    bio: "Caffeine and Code",
    role: "AI/ML Engineer",
    resume_url: "https://drive.google.com/file/d/1_TVslmNmxqUwtzUs7YBrBoA8icFEB_lU/view?usp=drive_link",
    github_link: "https://github.com/arifekbalrashid",
    linkedin_link: "https://www.linkedin.com/in/mdarifekbalrashid",
    email: "arifekbalrashid786@gmail.com"
};

async function seedProfile() {
    try {
        const [rows] = await db.query('SELECT * FROM profile LIMIT 1');
        if (rows.length > 0) {
            console.log('Profile already exists. Skipping seed.');
            // process.exit(0);
            return;
        }

        await db.query(`
            INSERT INTO profile (bio, role, resume_url, github_link, linkedin_link, twitter_link, email)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [initialProfile.bio, initialProfile.role, initialProfile.resume_url, initialProfile.github_link, initialProfile.linkedin_link, initialProfile.twitter_link, initialProfile.email]);

        console.log('Profile seeded successfully.');
        // process.exit(0);
    } catch (error) {
        console.error('Error seeding profile:', error);
        throw error;
        // process.exit(1);
    }
}

if (require.main === module) {
    seedProfile().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = seedProfile;
