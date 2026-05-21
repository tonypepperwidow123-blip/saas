import { Router } from 'express';
import { protect, requireRole } from '../middleware/auth.middleware.js';
import { validate, validateQuery } from '../middleware/validate.middleware.js';
import { RejectPluginSchema, PaginationSchema } from '../validators/index.js';
import * as adminController from '../controllers/admin.controller.js';

const router = Router();

// User routes - specific routes first, then parameterized
router.get('/users', protect, requireRole('admin'), adminController.getUsers);
router.put('/users/password', protect, requireRole('admin'), adminController.updateUserPassword);
router.post('/users', protect, requireRole('admin'), adminController.createUser);

// Parameterized user routes last
router.patch('/users/:id', protect, requireRole('admin'), adminController.updateUser);
router.patch('/users/:id/suspend', protect, requireRole('admin'), adminController.suspendUser);
router.patch('/users/:id/reinstate', protect, requireRole('admin'), adminController.reinstateUser);
router.delete('/users/:id', protect, requireRole('admin'), adminController.deleteUser);

router.get('/stats', protect, requireRole('admin'), adminController.getStats);
router.get('/plugins', protect, requireRole('admin'), validate(PaginationSchema), adminController.getPlugins);
router.get('/plugins/pending', protect, requireRole('admin'), adminController.getPendingPlugins);
router.patch('/plugins/:id/approve', protect, requireRole('admin'), adminController.approvePlugin);
router.patch('/plugins/:id/reject', protect, requireRole('admin'), validate(RejectPluginSchema), adminController.rejectPlugin);
router.patch('/plugins/:id/suspend', protect, requireRole('admin'), adminController.suspendPlugin);
router.get('/orders', protect, requireRole('admin'), validate(PaginationSchema), adminController.getOrders);

export default router;