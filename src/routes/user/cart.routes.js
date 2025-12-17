import { Router } from "express";

// internal
import {
  verification,
  userMiddleware,
} from "../../middleware/authMiddleware.js";
import {
  addToCart,
  getCartItem,
  mergeCartItems,
  removeCartItem,
} from "../../controller/user/cart.controller.js";

const router = Router();

router.post("/cart", verification, userMiddleware, addToCart);
router.get("/cart", verification, userMiddleware, getCartItem);
router.delete("/cart", verification, userMiddleware, removeCartItem);
router.post("/cart/merge", verification, userMiddleware, mergeCartItems);

export default router;
