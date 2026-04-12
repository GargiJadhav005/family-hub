const { Router } = require('express');
const { login, getMe, refreshToken, resetPassword } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

const router = Router();

router.post('/login', login);
router.post('/reset-password', resetPassword);
router.get('/me', authMiddleware, getMe);
router.post('/refresh', authMiddleware, refreshToken);

module.exports = router;
