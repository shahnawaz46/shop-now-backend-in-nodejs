import { Router } from 'express';

// internal
import { verification, userMiddleware } from '../../middleware/middleware.js';
import {
  createOrder,
  generateInvoice,
  getOrder,
  paymentFailed,
  paymentVerification,
} from '../../controller/user/order.controller.js';

const router = Router();

router.get('/order', verification('_f_id'), userMiddleware, getOrder);
router.post('/order', verification('_f_id'), userMiddleware, createOrder);
router.post(
  '/order/payment-verification/:orderId',
  verification('_f_id'),
  userMiddleware,
  paymentVerification
);
router.post(
  '/order/payment-failed',
  verification('_f_id'),
  userMiddleware,
  paymentFailed
);
router.get(
  '/order/generate-invoice/:orderId',
  verification('_f_id'),
  userMiddleware,
  generateInvoice
);

export default router;
