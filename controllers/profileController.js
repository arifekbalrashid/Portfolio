const db = require('../config/db');

exports.getProfile = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM profile LIMIT 1');
        if (rows.length === 0) return res.status(404).json({ message: 'Profile not found' });
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateProfile = async (req, res) => {
    const { bio, role, resume_url, github_link, linkedin_link, twitter_link, email } = req.body;
    try {
        const [rows] = await db.query('SELECT id FROM profile LIMIT 1');

        if (rows.length === 0) {
            // Create if not exists (should have been seeded though)
            await db.query(`
                INSERT INTO profile (bio, role, resume_url, github_link, linkedin_link, twitter_link, email)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [bio, role, resume_url, github_link, linkedin_link, twitter_link, email]);
        } else {
            // Update
            await db.query(`
                UPDATE profile 
                SET bio = ?, role = ?, resume_url = ?, github_link = ?, linkedin_link = ?, twitter_link = ?, email = ?
                WHERE id = ?
            `, [bio, role, resume_url, github_link, linkedin_link, twitter_link, email, rows[0].id]);
        }
        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
