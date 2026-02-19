const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Auth routes are working' });
});

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/verify-mobile', authController.verifyMobile);
router.post('/resend-verification', authController.resendVerificationCode);
router.post('/forgot-password', authController.requestPasswordReset);
router.post('/verify-reset-code', authController.verifyPasswordResetCode);
router.post('/reset-password', authController.resetPassword);
router.get('/me', authController.verifyToken, authController.getCurrentUser);

module.exports = router;
