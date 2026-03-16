const db = require('../config/db');

// Get All Projects
exports.getAllProjects = async (req, res) => {
    try {
        const [projects] = await db.query('SELECT * FROM projects ORDER BY display_order ASC, created_at DESC');
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create Project
exports.createProject = async (req, res) => {
    const { title, description, image_url, tech_stack, github_link, live_link } = req.body;
    try {
        const stackJson = JSON.stringify(tech_stack);
        const [result] = await db.query(
            'INSERT INTO projects (title, description, image_url, tech_stack, github_link, live_link) VALUES (?, ?, ?, ?, ?, ?)',
            [title, description, image_url, stackJson, github_link, live_link]
        );
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update Project
exports.updateProject = async (req, res) => {
    const { id } = req.params;
    const { title, description, image_url, tech_stack, github_link, live_link } = req.body;
    try {
        const stackJson = JSON.stringify(tech_stack);
        await db.query(
            'UPDATE projects SET title=?, description=?, image_url=?, tech_stack=?, github_link=?, live_link=? WHERE id=?',
            [title, description, image_url, stackJson, github_link, live_link, id]
        );
        res.json({ message: 'Project updated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete Project
exports.deleteProject = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM projects WHERE id = ?', [id]);
        res.json({ message: 'Project deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
