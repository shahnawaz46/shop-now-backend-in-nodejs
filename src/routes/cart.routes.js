import { Router } from 'express';

// internal
import { verification, userMiddleware } from '../middleware/middleware.js';
import {
  addToCart,
  getCartItem,
  removeCartItem,
} from '../controller/cart.controller.js';

const router = Router();

router.post(
  '/user/cartItem/add',
  verification('_f_id'),
  userMiddleware,
  addToCart
);
router.get(
  '/user/cartItem/get',
  verification('_f_id'),
  userMiddleware,
  getCartItem
);
router.delete(
  '/user/cartItem/remove',
  verification('_f_id'),
  userMiddleware,
  removeCartItem
);

export default router;
