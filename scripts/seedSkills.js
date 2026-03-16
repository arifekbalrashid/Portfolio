require('dotenv').config();
const db = require('../config/db');

const initialSkills = [
    { name: "C++", category: "Programming", icon_class: "fas fa-code", level: 85 },
    { name: "Python", category: "Programming", icon_class: "fab fa-python", level: 80 },

    { name: "PyTorch", category: "AI / ML", icon_class: "fas fa-brain", level: 75 },
    { name: "LangChain", category: "AI / ML", icon_class: "fas fa-link", level: 80 },
    { name: "LangGraph", category: "AI / ML", icon_class: "fas fa-project-diagram", level: 75 },

    { name: "REST APIs", category: "Backend", icon_class: "fas fa-exchange-alt", level: 85 },
    { name: "JWT Authentication", category: "Backend", icon_class: "fas fa-key", level: 80 },

    { name: "MySQL", category: "Database", icon_class: "fas fa-database", level: 80 },
    { name: "MongoDB", category: "Database", icon_class: "fas fa-leaf", level: 70 },

    { name: "Data Structures & Algorithms", category: "Core CS", icon_class: "fas fa-project-diagram", level: 85 },

    { name: "Git", category: "Tools", icon_class: "fab fa-git-alt", level: 85 },
    { name: "Docker", category: "Tools", icon_class: "fab fa-docker", level: 70 }
];


async function seedSkills() {
    try {
        for (const skill of initialSkills) {
            const [rows] = await db.query('SELECT * FROM skills WHERE name = ?', [skill.name]);
            if (rows.length > 0) continue;

            await db.query(`
                INSERT INTO skills (name, category, icon_class, level)
                VALUES (?, ?, ?, ?)
            `, [skill.name, skill.category, skill.icon_class, skill.level]);
            console.log(`Inserted skill: ${skill.name}`);
        }
        console.log('Skills seeding complete.');
        // process.exit(0);
    } catch (error) {
        console.error('Error seeding skills:', error);
        throw error;
        // process.exit(1);
    }
}

if (require.main === module) {
    seedSkills().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = seedSkills;
