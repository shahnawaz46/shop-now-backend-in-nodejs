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

router.post(
  '/user/createOrder',
  verification('_f_id'),
  userMiddleware,
  createOrder
);
router.post(
  '/user/paymentVerification/:orderId',
  verification('_f_id'),
  userMiddleware,
  paymentVerification
);
router.post(
  '/user/paymentFailed',
  verification('_f_id'),
  userMiddleware,
  paymentFailed
);
router.get('/user/getOrder', verification('_f_id'), userMiddleware, getOrder);
router.get(
  '/generate-invoice/:orderId',
  verification('_f_id'),
  userMiddleware,
  generateInvoice
);

export default router;
