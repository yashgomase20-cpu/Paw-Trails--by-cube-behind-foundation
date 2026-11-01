const express = require('express');
const router = express.Router();
const { login, getMe, updatePassword } = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');

router.post('/login', login);
router.get('/me', requireAuth, getMe);
router.put('/password', requireAuth, updatePassword);

module.exports = router;
