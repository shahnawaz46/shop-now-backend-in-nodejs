import { Router } from "express";

// internal
import {
  verification,
  userMiddleware,
} from "../../middleware/authMiddleware.js";
import {
  createOrder,
  generateInvoice,
  getOrder,
  paymentFailed,
  paymentVerification,
} from "../../controller/user/order.controller.js";

const router = Router();

router.get("/order", verification, userMiddleware, getOrder);
router.post("/order", verification, userMiddleware, createOrder);
router.post(
  "/order/payment-verification/:orderId",
  verification,
  userMiddleware,
  paymentVerification
);
router.post(
  "/order/payment-failed",
  verification,
  userMiddleware,
  paymentFailed
);
router.get(
  "/order/generate-invoice/:orderId",
  verification,
  userMiddleware,
  generateInvoice
);

export default router;
