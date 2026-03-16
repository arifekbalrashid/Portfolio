const db = require('../config/db');


exports.trackVisit = async (req, res) => {
    try {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'] || 'Unknown';

        // Simple check to avoid counting same IP multiple times within a short period is out of scope for "simple" but could be added.
        // For now, we log every hit.

        await db.query('INSERT INTO visits (ip_address, user_agent) VALUES (?, ?)', [ip, userAgent]);
        res.status(200).json({ message: 'Visit tracked' });
    } catch (error) {
        console.error('Error tracking visit:', error);
        res.status(500).json({ message: 'Error tracking visit' });
    }
};

exports.getStats = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT COUNT(*) as total_visits FROM visits');
        const [uniqueRows] = await db.query('SELECT COUNT(DISTINCT ip_address) as unique_visitors FROM visits');

        res.json({
            total_visits: rows[0].total_visits,
            unique_visitors: uniqueRows[0].unique_visitors // Approximate
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getLeetCodeStats = async (req, res) => {
    try {
        const { username } = req.params;

        const query = `
            query getUserProfile($username: String!) {
                matchedUser(username: $username) {
                    submissionCalendar
                    submitStats {
                        acSubmissionNum {
                            difficulty
                            count
                        }
                    }
                    profile {
                        ranking
                    }
                }
            }
        `;

        const response = await fetch('https://leetcode.com/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Referer': 'https://leetcode.com',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            body: JSON.stringify({
                query,
                variables: { username }
            })
        });

        if (!response.ok) {
            return res.status(response.status).json({ message: 'Failed to fetch from LeetCode API' });
        }

        const data = await response.json();

        if (data.errors) {
            return res.status(404).json({ message: 'User not found or API error', errors: data.errors });
        }

        const user = data.data.matchedUser;
        const stats = user.submitStats.acSubmissionNum;

        // Transform data to match frontend expectation
        const result = {
            status: 'success',
            totalSolved: stats.find(s => s.difficulty === 'All')?.count || 0,
            easySolved: stats.find(s => s.difficulty === 'Easy')?.count || 0,
            mediumSolved: stats.find(s => s.difficulty === 'Medium')?.count || 0,
            hardSolved: stats.find(s => s.difficulty === 'Hard')?.count || 0,
            ranking: user.profile?.ranking || 0,
            submissionCalendar: JSON.parse(user.submissionCalendar || '{}')
        };

        res.json(result);

    } catch (error) {
        console.error('LeetCode Proxy Error:', error);
        res.status(500).json({ message: 'Error fetching LeetCode stats' });
    }
};