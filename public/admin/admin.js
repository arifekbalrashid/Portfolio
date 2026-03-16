const API_URL = '/api';
let token = localStorage.getItem('admin_token');

// Init
document.addEventListener('DOMContentLoaded', () => {
    if (token) {
        showDashboard();
        loadProjects();
        loadMessages();
        loadProfile();
        loadSkills();
        loadStats();
    }
});

async function loadStats() {
    try {
        const res = await fetch(`${API_URL}/analytics/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (document.getElementById('total-visits')) {
            document.getElementById('total-visits').textContent = data.total_visits || 0;
        }
        if (document.getElementById('unique-visitors')) {
            document.getElementById('unique-visitors').textContent = data.unique_visitors || 0;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Tabs & Modals Event Listeners
document.getElementById('tab-projects-btn').addEventListener('click', () => switchTab('projects'));
document.getElementById('tab-messages-btn').addEventListener('click', () => switchTab('messages'));
document.getElementById('tab-profile-btn').addEventListener('click', () => switchTab('profile'));
document.getElementById('tab-skills-btn').addEventListener('click', () => switchTab('skills'));

document.getElementById('add-project-btn').addEventListener('click', () => {
    document.getElementById('project-form').reset();
    document.getElementById('project-id').value = '';
    document.getElementById('project-modal').classList.add('open');
});

document.getElementById('cancel-project-btn').addEventListener('click', () => {
    document.getElementById('project-modal').classList.remove('open');
});

document.getElementById('add-skill-btn').addEventListener('click', () => {
    document.getElementById('skill-form').reset();
    document.getElementById('skill-modal').classList.add('open');
});

document.getElementById('cancel-skill-btn').addEventListener('click', () => {
    document.getElementById('skill-modal').classList.remove('open');
});
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();

        if (res.ok) {
            token = data.token;
            localStorage.setItem('admin_token', token);
            showDashboard();
            loadProjects();
            loadMessages();
        } else {
            alert(data.message || 'Login failed');
        }
    } catch (err) {
        alert('Error connecting to server');
    }
});

// Logout
document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('admin_token');
    location.reload();
});

function showDashboard() {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('dashboard-section').style.display = 'block';
}

// Tabs
// Tabs & Modals Event Listeners (Already defined at top)
// Removing duplicates if any were remaining from previous edits

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));

    document.getElementById(`${tabName}-tab`).classList.add('active');
    document.getElementById(`tab-${tabName}-btn`).classList.add('active');
}

function closeModal() {
    document.getElementById('project-modal').classList.remove('open');
    document.getElementById('skill-modal').classList.remove('open');
}

// --- Projects CRUD ---
window.allProjects = [];

async function loadProjects() {
    try {
        const res = await fetch(`${API_URL}/projects`);
        const projects = await res.json();
        window.allProjects = projects; // Store globally

        const list = document.getElementById('projects-list');
        list.innerHTML = projects.map(p => `
            <div class="item-card">
                <div style="flex: 1; padding-right: 1rem;">
                    <h4>${p.title}</h4>
                    <small style="color: var(--text-secondary);">${p.description ? p.description.substring(0, 60) + '...' : ''}</small>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn-sm edit-btn" data-id="${p.id}">Edit</button>
                    <button class="btn-sm delete-btn" style="background: rgba(255, 0, 0, 0.2); color: #ff4444; border: 1px solid #ff4444;" data-id="${p.id}">Delete</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

// Event Delegation for Projects List
document.getElementById('projects-list').addEventListener('click', (e) => {
    if (e.target.classList.contains('edit-btn')) {
        const id = parseInt(e.target.getAttribute('data-id'));
        editProject(id);
    } else if (e.target.classList.contains('delete-btn')) {
        const id = parseInt(e.target.getAttribute('data-id'));
        deleteProject(id);
    }
});

window.editProject = (id) => {
    const project = window.allProjects.find(p => p.id === id);
    if (!project) return;

    document.getElementById('project-id').value = project.id;
    document.getElementById('p-title').value = project.title;
    document.getElementById('p-desc').value = project.description;
    document.getElementById('p-image').value = project.image_url;

    let stack = project.tech_stack;
    if (typeof stack === 'string') {
        try { stack = JSON.parse(stack); } catch (e) { }
    }
    document.getElementById('p-stack').value = Array.isArray(stack) ? stack.join(', ') : stack;

    document.getElementById('p-github').value = project.github_link;
    document.getElementById('p-live').value = project.live_link;
    document.getElementById('project-modal').classList.add('open');
};

document.getElementById('project-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('project-id').value;
    const projectData = {
        title: document.getElementById('p-title').value,
        description: document.getElementById('p-desc').value,
        image_url: document.getElementById('p-image').value,
        tech_stack: document.getElementById('p-stack').value.split(',').map(s => s.trim()),
        github_link: document.getElementById('p-github').value,
        live_link: document.getElementById('p-live').value
    };

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/projects/${id}` : `${API_URL}/projects`;

    try {
        const res = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Sends token
            },
            body: JSON.stringify(projectData)
        });

        if (res.ok) {
            closeModal();
            loadProjects();
        } else {
            if (res.status === 401 || res.status === 403) {
                alert('Session expired. Please login again.');
                localStorage.removeItem('admin_token');
                location.reload();
                return;
            }
            const data = await res.json();
            alert('Failed to save project: ' + (data.message || 'Unknown error'));
        }
    } catch (error) {
        alert('Error saving project');
    }
});

window.deleteProject = async (id) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
        const res = await fetch(`${API_URL}/projects/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) loadProjects();
        else alert('Failed to delete project');
    } catch (error) {
        alert('Error deleting project');
    }
};

// --- Messages ---

// Event Delegation for Messages List
document.getElementById('messages-list').addEventListener('click', async (e) => {
    if (e.target.closest('.reply-btn')) {
        const btn = e.target.closest('.reply-btn');
        const email = btn.getAttribute('data-email');

        try {
            await navigator.clipboard.writeText(email);
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => {
                btn.innerHTML = originalText;
                // Optional: Open mail client after copy
                window.location.href = `mailto:${email}`;
            }, 1000);
        } catch (err) {
            console.error('Failed to copy:', err);
            // Fallback
            window.location.href = `mailto:${email}`;
        }
    }
});

async function loadMessages() {
    try {
        const res = await fetch(`${API_URL}/contact`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!res.ok) {
            if (res.status === 401) {
                localStorage.removeItem('admin_token');
                location.reload();
                return;
            }
            throw new Error('Failed to fetch messages');
        }

        const messages = await res.json();
        const list = document.getElementById('messages-list');

        if (messages.length === 0) {
            list.innerHTML = '<p style="color: var(--text-secondary); text-align: center;">No messages yet.</p>';
            return;
        }

        list.innerHTML = messages.map(msg => `
            <div class="item-card" style="flex-direction: column; align-items: flex-start;">
                <div style="display: flex; justify-content: space-between; width: 100%; margin-bottom: 0.5rem;">
                    <h4 style="color: var(--accent-color);">${msg.name} <span style="font-size: 0.8rem; color: var(--text-secondary);">(${msg.email})</span></h4>
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <span style="font-size: 0.8rem; color: var(--text-secondary);">${new Date(msg.created_at).toLocaleDateString()}</span>
                        <button class="btn-sm reply-btn" data-email="${msg.email}" style="background: rgba(0, 243, 255, 0.1); border: 1px solid var(--accent-color); color: var(--accent-color);">
                            <i class="fas fa-reply"></i> Reply
                        </button>
                    </div>
                </div>
                <p style="color: var(--text-primary); font-size: 0.95rem; line-height: 1.5;">${msg.content}</p>
            </div>
        `).join('');

    } catch (e) {
        console.error('Error loading messages:', e);
        document.getElementById('messages-list').innerHTML = '<p style="color: red;">Error loading messages.</p>';
    }
}

// --- Profile Management ---
async function loadProfile() {
    try {
        const res = await fetch(`${API_URL}/profile`);
        if (!res.ok) return;
        const profile = await res.json();

        document.getElementById('prof-role').value = profile.role || '';
        document.getElementById('prof-email').value = profile.email || '';
        document.getElementById('prof-bio').value = profile.bio || '';
        document.getElementById('prof-resume').value = profile.resume_url || '';
        document.getElementById('prof-github').value = profile.github_link || '';
        document.getElementById('prof-linkedin').value = profile.linkedin_link || '';
        document.getElementById('prof-twitter').value = profile.twitter_link || '';
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

document.getElementById('profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const profileData = {
        role: document.getElementById('prof-role').value,
        email: document.getElementById('prof-email').value,
        bio: document.getElementById('prof-bio').value,
        resume_url: document.getElementById('prof-resume').value,
        github_link: document.getElementById('prof-github').value,
        linkedin_link: document.getElementById('prof-linkedin').value,
        twitter_link: document.getElementById('prof-twitter').value
    };

    try {
        const res = await fetch(`${API_URL}/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(profileData)
        });

        if (res.ok) alert('Profile updated successfully!');
        else {
            if (res.status === 401 || res.status === 403) {
                alert('Session expired. Please login again.');
                localStorage.removeItem('admin_token');
                location.reload();
                return;
            }
            alert('Failed to update profile');
        }
    } catch (error) {
        alert('Error updating profile');
    }
});

// --- Skills Management ---
async function loadSkills() {
    try {
        const res = await fetch(`${API_URL}/skills`);
        const skills = await res.json();

        const list = document.getElementById('skills-list');
        list.innerHTML = skills.map(s => `
            <div class="item-card" style="flex-direction: column; align-items: center; text-align: center; gap: 0.5rem;">
                <div style="font-size: 2rem; color: var(--accent-color);">
                    <i class="${s.icon_class}"></i>
                </div>
                <h4>${s.name}</h4>
                <small style="color: var(--text-secondary);">${s.category}</small>
                <div style="width: 100%; background: rgba(255,255,255,0.1); height: 4px; border-radius: 2px; margin: 0.5rem 0;">
                    <div style="width: ${s.level}%; background: var(--accent-color); height: 100%; border-radius: 2px;"></div>
                </div>
                <button class="btn-sm delete-skill-btn" style="color: #ff4444; border: 1px solid #ff4444; margin-top: 0.5rem;" data-id="${s.id}">Delete</button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading skills:', error);
    }
}

// Event Delegation for Skills List
document.getElementById('skills-list').addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-skill-btn')) {
        const id = parseInt(e.target.getAttribute('data-id'));
        deleteSkill(id);
    }
});

document.getElementById('skill-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const skillData = {
        name: document.getElementById('skill-name').value,
        category: document.getElementById('skill-category').value,
        icon_class: document.getElementById('skill-icon').value,
        level: document.getElementById('skill-level').value
    };

    try {
        const res = await fetch(`${API_URL}/skills`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(skillData)
        });

        if (res.ok) {
            closeModal();
            document.getElementById('skill-form').reset();
            loadSkills();
        } else {
            if (res.status === 401 || res.status === 403) {
                alert('Session expired. Please login again.');
                localStorage.removeItem('admin_token');
                location.reload();
                return;
            }
            alert('Failed to add skill');
        }
    } catch (error) {
        alert('Error adding skill');
    }
});

window.deleteSkill = async (id) => {
    if (!confirm('Delete this skill?')) return;
    try {
        const res = await fetch(`${API_URL}/skills/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) loadSkills();
        else alert('Failed to delete skill');
    } catch (error) {
        alert('Error deleting skill');
    }
};

