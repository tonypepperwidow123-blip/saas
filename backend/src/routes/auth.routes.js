import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { authLimiter } from '../middleware/rateLimit.middleware.js';
import { RegisterSchema, LoginSchema, ForgotPasswordSchema } from '../validators/index.js';
import * as authController from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', authLimiter, validate(RegisterSchema), authController.register);
router.post('/login', authLimiter, validate(LoginSchema), authController.login);
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.me);
router.post('/refresh', authController.refreshToken);
router.post('/forgot-password', authLimiter, validate(ForgotPasswordSchema), authController.forgotPassword);

export default router;