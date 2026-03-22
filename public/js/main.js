document.addEventListener('DOMContentLoaded', () => {

    const projectsContainer = document.getElementById('projects-container');

    // =========================
    // 1. INTERSECTION OBSERVER (FIXED POSITION)
    // =========================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // =========================
    // 2. PROFILE
    // =========================
    async function fetchProfile() {
        try {
            const res = await fetch('/api/profile');
            if (!res.ok) return;

            const profile = await res.json();

            if (profile.role) document.querySelector('.role').textContent = profile.role;
            if (profile.bio) document.querySelector('.hero-content .description').textContent = profile.bio;

            const linkedinLinks = document.querySelectorAll('.contact-info a[href*="linkedin.com"], .social-links a[href*="linkedin.com"]');
            const githubLinks = document.querySelectorAll('.contact-info a[href*="github.com"], .social-links a[href*="github.com"]');
            const emailLinks = document.querySelectorAll('.contact-info a[href^="mailto:"], .social-links a[href^="mailto:"]');

            if (profile.linkedin_link) linkedinLinks.forEach(el => el.href = profile.linkedin_link);
            if (profile.github_link) githubLinks.forEach(el => el.href = profile.github_link);
            if (profile.email) emailLinks.forEach(el => el.href = `mailto:${profile.email}`);

            if (profile.resume_url) {
                const resumeBtn = document.querySelector('.resume-btn');
                if (resumeBtn) {
                    resumeBtn.href = profile.resume_url;
                    resumeBtn.style.display = 'inline-block';
                }
            }

        } catch (e) {
            console.error('Profile error:', e);
        }
    }

    // =========================
    // 3. SKILLS
    // =========================
    async function fetchSkills() {
        try {
            const res = await fetch('/api/skills');
            if (!res.ok) return;

            const skills = await res.json();
            if (skills.length === 0) return;

            const skillsGrid = document.querySelector('.skills-grid');
            if (!skillsGrid) return;

            skillsGrid.innerHTML = '';

            const categories = {};
            skills.forEach(skill => {
                if (!categories[skill.category]) categories[skill.category] = [];
                categories[skill.category].push(skill);
            });

            for (const [category, items] of Object.entries(categories)) {
                const div = document.createElement('div');
                div.className = 'skill-category';

                div.innerHTML = `
                    <h3>${category}</h3>
                    <div class="skill-tags">
                        ${items.map(s => `<span>${s.name}</span>`).join('')}
                    </div>
                `;

                skillsGrid.appendChild(div);
            }

        } catch (e) {
            console.error('Skills error:', e);
        }
    }

    // =========================
    // 4. PROJECTS (FIXED + CACHE)
    // =========================
    async function fetchProjects() {
        if (!projectsContainer) return;

        const CACHE_KEY = "projects_cache";
        const CACHE_TIME = 1000 * 60 * 5; // 5 min

        const cached = JSON.parse(localStorage.getItem(CACHE_KEY));

        if (cached && Date.now() - cached.timestamp < CACHE_TIME) {
            renderProjects(cached.data);
            return;
        }

        try {
            const res = await fetch('/api/projects');
            const projects = await res.json();

            console.log("Projects from API:", projects);

            if (projects.length > 0) {
                localStorage.setItem(CACHE_KEY, JSON.stringify({
                    data: projects,
                    timestamp: Date.now()
                }));
                renderProjects(projects);
            }

        } catch (e) {
            console.error('Projects error:', e);
        }
    }
    const formatUrl = (url) => {
        if (!url) return "#";

        url = url.trim();

        // remove accidental leading slash
        if (url.startsWith("/")) url = url.slice(1);

        // add https if missing
        if (!url.startsWith("http")) {
            url = "https://" + url;
        }

        return url;
    };

    function renderProjects(projects) {
        projectsContainer.innerHTML = '';

        projects.forEach(project => {
            const card = document.createElement('div');
            card.className = 'project-card fade-in';

            let stack = [];

            try {
                stack = typeof project.tech_stack === "string"
                    ? JSON.parse(project.tech_stack)
                    : project.tech_stack || project.stack || [];
            } catch {
                stack = [];
            }

            const stackHtml = Array.isArray(stack)
                ? stack.map(tech => `<span>${tech}</span>`).join('')
                : '';
            const githubUrl = project.github_link;
            const liveUrl = project.live_link;
            card.innerHTML = `
                <div class="project-content">
                    <h3 class="project-title">${project.title}</h3>
                    <p class="project-desc">${project.description}</p>
                    <div class="project-tech">${stackHtml}</div>
                    <div class="project-links">

                        ${githubUrl ? `
                            <a href="${formatUrl(githubUrl)}" 
                            target="_blank" 
                            rel="noopener noreferrer">
                                <i class="fab fa-github"></i>
                            </a>
                        ` : ''}

                        ${liveUrl && liveUrl !== '#' ? `
                            <a href="${formatUrl(liveUrl)}" 
                            target="_blank" 
                            rel="noopener noreferrer">
                                <i class="fas fa-external-link-alt"></i>
                            </a>
                        ` : ''}

                    </div>
                </div>
            `;

            projectsContainer.appendChild(card);

            // apply observer safely
            card.classList.add('hidden-scroll');
            observer.observe(card);

            bindTiltEffect(card);
        });
    }

    // =========================
    // 5. TRACK VISIT 
    // =========================
    function trackVisit() {
        try {
            navigator.sendBeacon('/api/analytics/track');
        } catch (e) {
            console.error('Tracking error:', e);
        }
    }

    setTimeout(trackVisit, 1500);

    // =========================
    // 6. CURSOR EFFECT
    // =========================
    const cursorGlow = document.querySelector('.cursor-glow');
    if (cursorGlow) {
        document.addEventListener('mousemove', (e) => {
            cursorGlow.style.left = e.clientX + 'px';
            cursorGlow.style.top = e.clientY + 'px';
        });
    }

    // =========================
    // 7. MOBILE MENU
    // =========================
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('toggle');
        });
    }

    // =========================
    // 8. 3D TILT EFFECT
    // =========================
    function bindTiltEffect(card) {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const xRot = -((y - rect.height / 2) / rect.height * 20);
            const yRot = (x - rect.width / 2) / rect.width * 20;

            card.style.transform = `perspective(1000px) rotateX(${xRot}deg) rotateY(${yRot}deg) scale(1.05)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
    }

    // =========================
    // INIT
    // =========================
    fetchProfile();
    fetchSkills();
    fetchProjects();

});