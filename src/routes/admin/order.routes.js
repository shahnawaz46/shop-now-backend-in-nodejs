import { Router } from 'express';
import {
  getAllOrders,
  getOrderById,
  getOrderStats,
  searchOrders,
  updateOrderDeliveryStatus,
} from '../../controller/admin/order.controller.js';
import { verification } from '../../middleware/middleware.js';

const router = Router();

router.get('/orders', verification('_a_tn'), getAllOrders);
router.get('/order-stats', verification('_a_tn'), getOrderStats);
router.get('/order-stats/:orderId', verification('_a_tn'), getOrderById);
router.patch(
  '/order-delivery-status',
  verification('_a_tn'),
  updateOrderDeliveryStatus
);

// search products
router.get('/order/search', searchOrders);

export default router;
