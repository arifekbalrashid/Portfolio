const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const auth = require('../middleware/auth');

// Public route to track visit
router.post('/track', analyticsController.trackVisit);

// Protected route to view stats
router.get('/stats', auth, analyticsController.getStats);

// Proxy route for LeetCode stats (Public)
router.get('/leetcode/:username', analyticsController.getLeetCodeStats);


module.exports = router;