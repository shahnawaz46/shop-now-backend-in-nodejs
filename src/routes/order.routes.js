import { Router } from 'express';

// internal
import { verification, userMiddleware } from '../middleware/middleware.js';
import { addOrder, getOrder } from '../controller/order.controller.js';

const router = Router();

router.post(
  '/user/addOrder',
  verification('user_token'),
  userMiddleware,
  addOrder
);
router.post(
  '/user/getOrder',
  verification('user_token'),
  userMiddleware,
  getOrder
);

export default router;
