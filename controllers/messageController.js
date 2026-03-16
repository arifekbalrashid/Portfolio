const db = require('../config/db');

// Create Message (Public)
exports.createMessage = async (req, res) => {
    const { name, email, message } = req.body;
    try {
        await db.query(
            'INSERT INTO messages (name, email, content) VALUES (?, ?, ?)',
            [name, email, message]
        );
        res.status(201).json({ message: 'Message sent successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get All Messages (Admin only)
exports.getAllMessages = async (req, res) => {
    try {
        const [messages] = await db.query('SELECT * FROM messages ORDER BY created_at DESC');
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
