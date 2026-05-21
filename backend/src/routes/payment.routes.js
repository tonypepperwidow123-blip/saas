import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { CreateOrderSchema, VerifyPaymentSchema, PaginationSchema } from '../validators/index.js';
import * as paymentController from '../controllers/payment.controller.js';

const router = Router();

router.post('/create-order', protect, validate(CreateOrderSchema), paymentController.createOrder);
router.post('/verify', protect, validate(VerifyPaymentSchema), paymentController.verifyPayment);
router.get('/orders', protect, validate(PaginationSchema), paymentController.getOrders);
router.post('/download', protect, paymentController.downloadPlugin);
router.post('/plan-upgrade', protect, paymentController.createPlanUpgradeOrder);
router.post('/plan-verify', protect, paymentController.verifyPlanUpgrade);

export default router;