document.addEventListener('DOMContentLoaded', () => {
    // 1. Dynamic Project Rendering (from API)
    const projectsContainer = document.getElementById('projects-container');

    // --- Dynamic Profile & Skills ---
    async function fetchProfile() {
        try {
            const res = await fetch('/api/profile');
            if (!res.ok) return; // Silent fail, keep static
            const profile = await res.json();

            // Hero Section
            if (profile.role) document.querySelector('.role').textContent = profile.role;
            if (profile.bio) document.querySelector('.hero-content .description').textContent = profile.bio;


            // Social Links (Footer & Contact)
            const linkedinLinks = document.querySelectorAll('a[href*="linkedin.com"]');
            const githubLinks = document.querySelectorAll('a[href*="github.com"]');
            const emailLinks = document.querySelectorAll('a[href^="mailto:"]');

            if (profile.linkedin_link) linkedinLinks.forEach(el => el.href = profile.linkedin_link);
            if (profile.github_link) githubLinks.forEach(el => el.href = profile.github_link);
            if (profile.email) emailLinks.forEach(el => el.href = `mailto:${profile.email}`);

            if (profile.twitter_link) {
                document.querySelectorAll('.twitter-icon').forEach(el => {
                    el.href = profile.twitter_link;
                    el.style.display = 'inline-flex';
                });
                const twitterContainer = document.querySelector('.twitter-link-container');
                if (twitterContainer) {
                    twitterContainer.style.display = 'flex';
                    const link = twitterContainer.querySelector('a');
                    link.href = profile.twitter_link;
                    link.textContent = 'Twitter / X';
                }
            }

            if (profile.resume_url) {
                const resumeBtn = document.querySelector('.resume-btn');
                if (resumeBtn) {
                    resumeBtn.href = profile.resume_url;
                    resumeBtn.style.display = 'inline-block';
                }
            }

        } catch (e) { console.error('Error fetching profile:', e); }
    }

    async function fetchSkills() {
        try {
            const res = await fetch('/api/skills');
            if (!res.ok) return;
            const skills = await res.json();

            if (skills.length === 0) return;

            const skillsGrid = document.querySelector('.skills-grid');
            skillsGrid.innerHTML = '';

            // Group by category
            const categories = {};
            skills.forEach(skill => {
                if (!categories[skill.category]) categories[skill.category] = [];
                categories[skill.category].push(skill);
            });

            // Render
            for (const [category, items] of Object.entries(categories)) {
                const categoryDiv = document.createElement('div');
                categoryDiv.className = 'skill-category';
                categoryDiv.innerHTML = `
                    <h3>${category}</h3>
                    <div class="skill-tags">
                        ${items.map(s => `<span>${s.name}</span>`).join('')}
                    </div>
                `;
                skillsGrid.appendChild(categoryDiv);
            }
        } catch (e) { console.error('Error fetching skills:', e); }
    }

    fetchProfile();
    fetchSkills();
    trackVisit();

    async function trackVisit() {
        try {
            // Simple fire-and-forget
            await fetch('/api/analytics/track', { method: 'POST' });
        } catch (e) {
            console.error('Tracking error:', e);
        }
    }

    async function fetchProjects() {
        if (!projectsContainer) return;

        try {
            const res = await fetch('/api/projects');
            const projects = await res.json();

            if (projects.length > 0) {
                renderProjects(projects);
            } else if (window.projectData) {
                // Fallback to static data if DB is empty/fails
                renderProjects(window.projectData);
            }
        } catch (e) {
            console.error('API Error:', e);
            if (window.projectData) renderProjects(window.projectData);
        }
    }

    function renderProjects(projects) {
        projectsContainer.innerHTML = '';
        projects.forEach(project => {
            const card = document.createElement('div');
            card.className = 'project-card fade-in';

            // Parse tech stack if it's a string (from DB) or use as is
            let stack = project.tech_stack;
            if (typeof stack === 'string') {
                try { stack = JSON.parse(stack); } catch (e) { stack = [stack]; }
            }
            // For older static data format
            if (!stack && project.stack) stack = project.stack;

            const stackHtml = Array.isArray(stack) ? stack.map(tech => `<span>${tech}</span>`).join('') : '';

            card.innerHTML = `
                <div class="project-content">
                    <h3 class="project-title">${project.title}</h3>
                    <p class="project-desc">${project.description}</p>
                    <div class="project-tech">${stackHtml}</div>
                    <div class="project-links">
                        <a href="${project.github_link || project.github}" target="_blank" title="View Code">
                            <i class="fab fa-github"></i>
                        </a>
                        ${(project.live_link || project.live) && (project.live_link !== '#' && project.live !== '#')
                            ? `<a href="${project.live_link || project.live}" target="_blank" title="Live Demo">
                                <i class="fas fa-external-link-alt"></i>
                            </a>`
                            : ''}
                    </div>
                </div>
            `;
            projectsContainer.appendChild(card);

            // Re-bind 3D tilt
            bindTiltEffect(card);
        });

        // Re-observe for scroll animation
        document.querySelectorAll('.project-card').forEach(el => {
            el.classList.add('hidden-scroll');
            if (typeof observer !== 'undefined') observer.observe(el);
        });
    }

    fetchProjects();

    // 2. Scroll Animations (Intersection Observer)
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Animate once
            }
        });
    }, observerOptions);

    // Observe sections, project cards, and timeline items
    document.querySelectorAll('.section, .project-card, .timeline-item').forEach(el => {
        el.classList.add('hidden-scroll');
        observer.observe(el);
    });

    // Add CSS for these classes dynamically if not in CSS
    const style = document.createElement('style');
    style.innerHTML = `
        .hidden-scroll {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        .visible {
            opacity: 1;
            transform: translateY(0);
        }
    `;
    document.head.appendChild(style);


    // 3. Glitch Text Effect (Simple Random Character Swap on Hover)
    const glitchTexts = document.querySelectorAll('.glitch-text');
    const chars = '!@#$%^&*()_+-=[]{}|;:,.<>?/';

    glitchTexts.forEach(text => {
        const original = text.getAttribute('data-text');

        text.addEventListener('mouseover', () => {
            let iterations = 0;
            const interval = setInterval(() => {
                text.innerText = text.innerText.split('')
                    .map((letter, index) => {
                        if (index < iterations) {
                            return original[index];
                        }
                        return chars[Math.floor(Math.random() * 26)];
                    })
                    .join('');

                if (iterations >= original.length) clearInterval(interval);
                iterations += 1 / 3;
            }, 30);
        });
    });

    // 4. Mobile Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('toggle');
        });
    }

    // 5. Custom Cursor Glow Follow
    const cursorGlow = document.querySelector('.cursor-glow');
    if (cursorGlow) {
        document.addEventListener('mousemove', (e) => {
            cursorGlow.style.left = e.clientX + 'px';
            cursorGlow.style.top = e.clientY + 'px';
        });
    }

    // 6. Contact Form Submission (API)
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());

            formStatus.innerHTML = "Sending...";

            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (response.ok) {
                    formStatus.innerHTML = "Thanks! Message sent.";
                    formStatus.style.color = 'var(--accent-color)';
                    contactForm.reset();
                } else {
                    formStatus.innerHTML = result.message || "Error sending message";
                    formStatus.style.color = 'red';
                }
            } catch (error) {
                formStatus.innerHTML = "Server error. Please try again.";
                formStatus.style.color = 'red';
            }
        });
    }

    // 7. 3D Tilt Effect for Project Cards
    // 7. 3D Tilt Effect Utility
    function bindTiltEffect(card) {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Calculate rotation (max +/- 10 degrees)
            const xRotation = -1 * ((y - rect.height / 2) / rect.height * 20);
            const yRotation = (x - rect.width / 2) / rect.width * 20;

            // Apply transformation
            card.style.transform = `perspective(1000px) rotateX(${xRotation}deg) rotateY(${yRotation}deg) scale(1.05)`;
        });

        card.addEventListener('mouseleave', () => {
            // Reset transformation
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
    }
});
