import { Router } from 'express';
import { protect, requireRole } from '../middleware/auth.middleware.js';
import * as licenseController from '../controllers/license.controller.js';

const router = Router();

router.get('/', protect, licenseController.getLicenses);
router.get('/:id', protect, licenseController.getLicenseById);
router.patch('/:id/suspend', protect, requireRole('admin', 'developer'), licenseController.suspendLicense);
router.patch('/:id/revoke', protect, requireRole('admin'), licenseController.revokeLicense);
router.patch('/:id/reactivate', protect, requireRole('admin'), licenseController.reactivateLicense);

export default router;