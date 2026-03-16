const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const auth = require('../middleware/auth');

// Public route to view profile
router.get('/', profileController.getProfile);

// Protected route to update profile
router.put('/', auth, profileController.updateProfile);

module.exports = router;
