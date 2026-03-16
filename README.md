# Dark Futuristic Developer Portfolio

A high-performance, responsive portfolio website featuring a dark-themed UI, dynamic content management, and real-time developer statistics.

![Project Status](https://img.shields.io/badge/status-live-brightgreen)
![Tech Stack](https://img.shields.io/badge/stack-Node.js%20%7C%20Express%20%7C%20MySQL-blue)

## Key Features

### Frontend
*   **Futuristic UI**: Dark mode aesthetic with neon accents, glassmorphism breakdown, and smooth scroll animations.
*   **Responsive Design**: Fully optimized for mobile, tablet, and desktop.
*   **Dynamic Data**: Projects, skills, and bio are fetched from the backend API.
*   **Live Stats Integration**:
    *   **GitHub**: Contributions graph and streak stats.
    *   **LeetCode**: Solved problem counts and circular progress charts.

### 🛠️ Backend (Admin Panel)
*   **Secure Dashboard**: Protected route (`/admin`) with JWT authentication.
*   **Project Management**: CRUD operations (Create, Read, Update, Delete) for portfolio projects.
*   **Skills Management**: Add or remove skills with categories and icons.
*   **Profile Control**: Update bio, resume link, and social media URLs dynamically.
*   **Visitor Analytics**: Track total page views and unique visitors.
*   **Messages**: View contact form submissions directly in the admin panel.

## Tech Stack

*   **Frontend**: HTML5, CSS3 (Custom Properties), Vanilla JavaScript.
*   **Backend**: Node.js, Express.js.
*   **Database**: MySQL (Production: Aiven Cloud).
*   **Security**: `bcryptjs` (hashing), `jsonwebtoken` (auth), `helmet` (headers).
*   **Hosting**: Render (Web Service) + Aiven (MySQL Database).

## 🚀 Setup & Installation

### Prerequisites
*   Node.js (v18+)
*   MySQL Server (Local or Cloud)

### 1. Clone the Repository
```bash
git clone https://github.com/arifekbalrashid/portfolio.git
cd portfolio
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:
```ini
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=portfolio_db
JWT_SECRET=your_super_secret_key
# NODE_ENV=production (Only for deployment)
```

### 4. Database Setup
Run the setup scripts to create tables and the default admin user:
```bash
# Create Tables
npm run setup:db

# Create Default Admin User
npm run seed:admin
```

### 5. Run Locally
```bash
# Development Mode (with nodemon)
npm run dev

# Production Mode
npm start
```
Visit `http://localhost:3000` to view the site.
Visit `http://localhost:3000/admin` to log in.

## ☁️ Deployment (Render + Aiven)

This project is configured for seamless deployment on **Render**.

1.  **Database**: Create a MySQL service on **Aiven** (Free Tier).
2.  **Web Service**: Connect repository to **Render** (Free Tier).
3.  **Environment Variables**: Add `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_PORT`, `DB_NAME`, and `JWT_SECRET` in Render dashboard.
4.  **Auto-Setup**: The `start` script is configured to automatically run database migrations (`setup:db`) on every deployment, ensuring schema consistency.

## 🛡️ Admin Access
The default admin credentials (if using `seed:admin`) are logged in the console during setup.
*   **Path**: `/admin`
*   **Note**: Change your password immediately after first login or update `scripts/createAdmin.js` before seeding.

## 📄 License
MIT License. Feel free to use this template for your own portfolio!
