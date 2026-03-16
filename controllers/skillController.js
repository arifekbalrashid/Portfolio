const db = require('../config/db');

exports.getAllSkills = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM skills ORDER BY level DESC');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.createSkill = async (req, res) => {
    const { name, category, icon_class, level } = req.body;
    try {
        await db.query('INSERT INTO skills (name, category, icon_class, level) VALUES (?, ?, ?, ?)',
            [name, category, icon_class, level]);
        res.status(201).json({ message: 'Skill created' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteSkill = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM skills WHERE id = ?', [id]);
        res.json({ message: 'Skill deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
