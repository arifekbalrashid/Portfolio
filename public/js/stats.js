document.addEventListener("DOMContentLoaded", () => {
    const githubCard = document.getElementById("github-card");
    const leetcodeCard = document.getElementById("leetcode-card");

    const githubUsername = "arifekbalrashid";
    const leetcodeUsername = "arif18";


    // --- GitHub Stats ---
    async function fetchGitHubStats() {
        try {
            // 1. User Profile Data
            const res = await fetch(`https://api.github.com/users/${githubUsername}?t=${new Date().getTime()}`);
            if (!res.ok) throw new Error('GitHub API Error');
            const data = await res.json();

            // 2. Contribution Graph
            const chartUrl = `https://ghchart.rshah.org/00f3ff/${githubUsername}?t=${new Date().getTime()}`;
            
            // 3. Streak Stats
            const streakUrl = `https://github-readme-streak-stats.herokuapp.com/?user=${githubUsername}&theme=dark&hide_border=true&background=111111&ring=00f3ff&currStreakLabel=00f3ff&t=${new Date().getTime()}`;

            githubCard.innerHTML = `
                <div class="stat-header">
                    <i class="fab fa-github"></i>
                    <h3>GitHub</h3>
                </div>
                <div class="stat-details">
                    <div class="stat-item">
                        <span class="stat-number">${data.public_repos}</span>
                        <span class="stat-label">Repos</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${data.followers}</span>
                        <span class="stat-label">Followers</span>
                    </div>
                </div>
                <div class="contribution-graph">
                    <img src="${chartUrl}" alt="GitHub Contributions" style="width: 100%;">
                </div>
                 <div class="streak-stats">
                    <img src="${streakUrl}" alt="GitHub Streak" style="width: 100%;">
                </div>
                <a href="${data.html_url}" target="_blank" class="stat-link">View Profile</a>
            `;
        } catch (error) {
            console.error(error);
            githubCard.innerHTML = `<p style="color: var(--text-secondary)">Failed to load GitHub stats</p>`;
        }
    }

    // --- LeetCode Stats ---
    async function fetchLeetCodeStats() {
        try {
            // Use our backend proxy to avoid CORS issues
            const res = await fetch(`/api/analytics/leetcode/${leetcodeUsername}`);
            if (!res.ok) throw new Error('LeetCode API Error');
            const data = await res.json();

            if (data.status === 'error') throw new Error(data.message);

            // Calculate percentages for circles
            const total = data.totalSolved;
            const easyPct = (data.easySolved / data.totalEasy) * 100; // vs total available or vs solved? User usually wants difficulty breakdown.
            // Actually, let's show breakdown relative to total solved for visual balance, OR difficulty specific acceptance. 
            // Standard portfolio practice: "Easy", "Medium", "Hard" counts in circles.

            // We will use CSS variables for the gradient percentage
            // But wait, the previous logic was % of total solved. 
            // Let's do simple circles with fixed colors for visual appeal.

            leetcodeCard.innerHTML = `
                <div class="stat-header">
                    <i class="fas fa-code"></i>
                    <h3>LeetCode</h3>
                </div>
                <div class="stat-details">
                    <div class="stat-item">
                        <span class="stat-number">${data.totalSolved}</span>
                        <span class="stat-label">Solved</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${data.ranking}</span>
                        <span class="stat-label">Ranking</span>
                    </div>
                </div>
                
                <div class="leetcode-circles">
                    <div class="circle-progress" style="--color: #00b8a3; --percent: 100%;">
                        <div class="circle-inner">
                            <span class="circle-count" style="color: #00b8a3">${data.easySolved}</span>
                            <span class="circle-label">Easy</span>
                        </div>
                    </div>
                    <div class="circle-progress" style="--color: #ffc01e; --percent: 100%;">
                        <div class="circle-inner">
                            <span class="circle-count" style="color: #ffc01e">${data.mediumSolved}</span>
                            <span class="circle-label">Medium</span>
                        </div>
                    </div>
                     <div class="circle-progress" style="--color: #ff375f; --percent: 100%;">
                        <div class="circle-inner">
                            <span class="circle-count" style="color: #ff375f">${data.hardSolved}</span>
                            <span class="circle-label">Hard</span>
                        </div>
                    </div>
                </div>

                <div class="leetcode-calendar-container" id="leetcode-calendar">
                    <!-- Calendar Grid Generated Here -->
                    <p style="color: #8b949e; font-size: 0.8rem; margin-bottom: 0.5rem; width: 100%; text-align: left;">Submission Activity (Last Year)</p>
                    <div class="calendar-wrapper" id="calendar-wrapper"></div>
                </div>

                <a href="https://leetcode.com/u/${leetcodeUsername}/" target="_blank" class="stat-link" style="margin-top: 1.5rem;">View Profile</a>
            `;

            // Process Calendar Data
            const calendarData = data.submissionCalendar || {};
            const calendarWrapper = document.getElementById('calendar-wrapper');

            // Generate last 365 days
            const today = new Date();
            const oneYearAgo = new Date();
            oneYearAgo.setDate(today.getDate() - 365);

            let currentWeek = document.createElement('div');
            currentWeek.className = 'calendar-week';

            // Loop day by day
            for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
                // Ensure starting on correct day of week for alignment if needed, 
                // but simpler is just column flex. GitHub starts column on Sunday.
                // If simple grid, just add squares.

                const timestamp = Math.floor(d.getTime() / 1000); // API uses seconds
                // Need to match keys. API keys are string timestamps (start of day?)
                // Actually API keys are seconds. Let's match roughly by date string or check range.
                // Better approach: Convert key timestamps to dates, check match.
                // But efficient way: Normalize everything to YYYY-MM-DD string.

                const dateKey = d.toISOString().split('T')[0];
                let count = 0;

                // Find matching entry in calendarData (keys are unix seconds)
                // Since keys are specific timestamps, we need to sum up if multiple entries per day (unlikely for strict day bins)
                // or find the entry that falls in this day.
                // Optimization: Pre-process calendarData into YYYY-MM-DD map.

                // (Doing this map once)
                if (!window.leetcodeMap) {
                    window.leetcodeMap = {};
                    Object.keys(calendarData).forEach(ts => {
                        const date = new Date(parseInt(ts) * 1000);
                        const k = date.toISOString().split('T')[0];
                        window.leetcodeMap[k] = (window.leetcodeMap[k] || 0) + calendarData[ts];
                    });
                }

                count = window.leetcodeMap[dateKey] || 0;

                const dayElem = document.createElement('div');
                dayElem.className = 'calendar-day';
                dayElem.title = `${count} submissions on ${dateKey}`;

                // Color levels (Github style)
                if (count > 0) dayElem.classList.add('level-1');
                if (count >= 3) dayElem.classList.add('level-2');
                if (count >= 5) dayElem.classList.add('level-3');
                if (count >= 10) dayElem.classList.add('level-4');

                currentWeek.appendChild(dayElem);

                // If 7 days in week or last day, push week
                if (currentWeek.children.length === 7 || d.getDate() === today.getDate() && d.getMonth() === today.getMonth()) {
                    calendarWrapper.appendChild(currentWeek);
                    currentWeek = document.createElement('div');
                    currentWeek.className = 'calendar-week';
                }
            }
            if (currentWeek.children.length > 0) {
                calendarWrapper.appendChild(currentWeek);
            }

        } catch (error) {
            console.error(error);
            leetcodeCard.innerHTML = `<p style="color: var(--text-secondary)">Failed to load LeetCode stats</p>`;
        }
    }

    fetchGitHubStats();
    fetchLeetCodeStats();
});