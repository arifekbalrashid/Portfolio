const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const auth = require('../middleware/auth');

router.post('/', messageController.createMessage);
router.get('/', auth, messageController.getAllMessages);

module.exports = router;
