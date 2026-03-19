const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();


const setupDatabase = require('./scripts/setupDb');
const createAdmin = require('./scripts/createAdmin');
const seedProfile = require('./scripts/seedProfile');
const seedSkills = require('./scripts/seedSkills');
const seedProjects = require('./scripts/seedProjects');

const app = express();
const PORT = process.env.PORT || 3000;

const compression = require('compression');
app.use(compression());
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: '7d'
}));

// Middleware
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                connectSrc: ["'self'", "https://api.github.com", "https://leetcode-stats-api.herokuapp.com"],
                imgSrc: ["'self'", "data:", "https://ghchart.rshah.org", "https://*.githubusercontent.com", "https://avatars.githubusercontent.com", "https://github-readme-streak-stats.herokuapp.com"],
                scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // unsafe-inline mainly for development convenience
                styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
                fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            },
        },
    })
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Static Files (Frontend)
app.use(express.static(path.join(__dirname, 'public')));

// Routes
const projectRoutes = require('./routes/projectRoutes');
const authRoutes = require('./routes/authRoutes');
const messageRoutes = require('./routes/messageRoutes');
const profileRoutes = require('./routes/profileRoutes');
const skillRoutes = require('./routes/skillRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

// API Routes
app.use('/api/projects', projectRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/contact', messageRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Portfolio Backend is running' });
});

// Fallback to index.html for SPA routing (if needed later)
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


(async () => {
    try {
        console.log('Running database setup and seeding...');
        if (process.env.NODE_ENV !== "production") {
            console.log('Running database setup...');
            await setupDatabase();
            await createAdmin();
            await seedProfile();
            await seedSkills();
            await seedProjects();
        }
        console.log('Database initialized successfully.');
    } catch (error) {
        console.error('Failed to initialize database:', error);
    }

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
})();
