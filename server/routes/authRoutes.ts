import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { isAuthenticated as isSessionAuthenticated } from '../localAuth';
import { rateLimit } from '../middleware/auth';

const router = Router();

// Strict rate limiting for sensitive auth endpoints (prevent brute force)
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  keyGenerator: (req) => req.ip || 'unknown',
});

const generalRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 attempts per hour
  keyGenerator: (req) => req.ip || 'unknown',
});

// Public routes with rate limiting
router.post('/register', generalRateLimit, AuthController.register);
router.post('/login', authRateLimit, AuthController.login);
router.post('/verify-2fa', authRateLimit, AuthController.verify2FACode);
router.post('/request-password-reset', generalRateLimit, AuthController.requestPasswordReset);
router.post('/forgot-password', generalRateLimit, AuthController.requestPasswordReset); // Alias for frontend compatibility
router.post('/reset-password', generalRateLimit, AuthController.resetPassword);
router.post('/resend-verification', generalRateLimit, AuthController.resendVerification);

// Protected routes (session-based)
router.get('/me', isSessionAuthenticated as any, AuthController.getCurrentUser);
router.get('/user', isSessionAuthenticated as any, AuthController.getCurrentUser);
router.post('/logout', isSessionAuthenticated as any, AuthController.logout);
router.get('/devices', isSessionAuthenticated as any, AuthController.getUserDevices);
router.delete('/devices/:deviceId', isSessionAuthenticated as any, AuthController.revokeDevice);

export default router;
