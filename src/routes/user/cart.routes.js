import { Router } from 'express';

// internal
import { verification, userMiddleware } from '../../middleware/middleware.js';
import {
  addToCart,
  getCartItem,
  removeCartItem,
} from '../../controller/user/cart.controller.js';

const router = Router();

router.post('/cart', verification('_f_id'), userMiddleware, addToCart);
router.get('/cart', verification('_f_id'), userMiddleware, getCartItem);
router.delete('/cart', verification('_f_id'), userMiddleware, removeCartItem);

export default router;
