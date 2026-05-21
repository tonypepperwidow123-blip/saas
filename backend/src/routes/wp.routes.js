import { Router } from 'express';
import { wpApiLimiter } from '../middleware/rateLimit.middleware.js';
import { validate, validateQuery } from '../middleware/validate.middleware.js';
import { CheckUpdateSchema, LicenseActivationSchema, LicenseDeactivationSchema } from '../validators/index.js';
import * as wpController from '../controllers/wp.controller.js';

const router = Router();

// These are public API endpoints (called by WordPress plugins)
// They use rate limiting and token validation instead of JWT
router.get('/check-update', wpApiLimiter, validateQuery(CheckUpdateSchema), wpController.checkUpdate);
router.get('/download', wpApiLimiter, wpController.downloadPlugin);
router.post('/activate', wpApiLimiter, validate(LicenseActivationSchema), wpController.activate);
router.post('/deactivate', wpApiLimiter, validate(LicenseDeactivationSchema), wpController.deactivate);
router.get('/validate-license', wpApiLimiter, wpController.validateLicense);

export default router;
