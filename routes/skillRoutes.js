const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skillController');
const auth = require('../middleware/auth');

router.get('/', skillController.getAllSkills);
router.post('/', auth, skillController.createSkill);
router.delete('/:id', auth, skillController.deleteSkill);

module.exports = router;
