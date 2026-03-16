require('dotenv').config();
const db = require('../config/db');

const initialProjects = [
{
    title: "Image Captioning Model",
    description: "Deep learning based Image Captioning system using CNN + LSTM architecture with attention mechanism.",
    image_url: "assets/images/image.png",
    tech_stack: JSON.stringify(["PyTorch","Python","CNN","LSTM","Gradio","HuggingFace"]),
    github_link: "https://github.com/arifekbalrashid/Image-Captioning-Model",
    live_link: ""
},
{
    title: "Graph-Based RAG System",
    description: "An advanced Retrieval-Augmented Generation (RAG) system that builds a knowledge graph from documents and retrieves relevant context for LLM responses. Uses vector search, graph traversal, and semantic retrieval for improved accuracy.",
    image_url: "assets/images/rag.png",
    tech_stack: JSON.stringify([
        "Python",
        "FastAPI",
        "LangChain",
        "LangGraph",
        "FAISS",
        "LLM",
        "NetworkX"
    ]),
    github_link: "https://github.com/arifekbalrashid/RAG_chatbot",
    live_link: ""
},
{
    title: "Real-Time Collaborative Notes",
    description: "A real-time collaborative document editing system using WebSockets and FastAPI backend.",
    image_url: "assets/images/notes.png",
    tech_stack: JSON.stringify(["FastAPI","React","WebSockets","MySQL"]),
    github_link: "https://github.com/arifekbalrashid/Collaborative-notes",
    live_link: ""
}
];

async function seedProjects() {
    console.log('Using DB Host:', process.env.DB_HOST);
    try {
        for (const project of initialProjects) {
            // Check if exists
            const [rows] = await db.query('SELECT * FROM projects WHERE title = ?', [project.title]);
            if (rows.length > 0) {
                console.log(`Skipping: ${project.title} (Already exists)`);
                continue;
            }

            // Insert
            await db.query(`
                INSERT INTO projects (title, description, image_url, tech_stack, github_link, live_link)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [project.title, project.description, project.image_url, project.tech_stack, project.github_link, project.live_link]);

            console.log(`Inserted: ${project.title}`);
        }
        console.log('Project seeding complete.');
        // process.exit(0);
    } catch (error) {
        console.error('Error seeding projects:', error);
        throw error;
        // process.exit(1);
    }
}

if (require.main === module) {
    seedProjects().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = seedProjects;
