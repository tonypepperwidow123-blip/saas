import { Router } from 'express';
import { protect, requireRole } from '../middleware/auth.middleware.js';
import { validate, validateQuery } from '../middleware/validate.middleware.js';
import { uploadPlugin } from '../middleware/upload.middleware.js';
import { CreatePluginSchema, UpdatePluginSchema, UploadVersionSchema, PaginationSchema } from '../validators/index.js';
import * as pluginController from '../controllers/plugin.controller.js';

const router = Router();

// ─── Public routes ─────────────────────────────────────────────────────────
// validateQuery reads from req.query (correct for GET), not req.body
router.get('/', validateQuery(PaginationSchema), pluginController.getPlugins);

// ─── Protected developer routes (MUST be before /:id) ──────────────────────
// /me/list must come before /:id or Express captures 'me' as the :id param
router.get('/me/list', protect, requireRole('developer'), validateQuery(PaginationSchema), pluginController.getMyPlugins);
router.post('/', protect, requireRole('developer'), validate(CreatePluginSchema), pluginController.createPlugin);
router.put('/:id', protect, requireRole('developer'), validate(UpdatePluginSchema), pluginController.updatePlugin);
router.delete('/:id', protect, requireRole('developer'), pluginController.deletePlugin);
router.post('/:id/versions', protect, requireRole('developer'), uploadPlugin.single('zip'), validate(UploadVersionSchema), pluginController.uploadVersion);
router.get('/:id/versions', protect, requireRole('developer'), pluginController.getVersions);

// ─── Parameterised public route LAST ───────────────────────────────────────
router.get('/:id', pluginController.getPluginById);

export default router;