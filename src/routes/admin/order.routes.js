import { Router } from 'express';
import {
  getAllOrders,
  getOrderById,
  getOrderGraph,
  getOrderStats,
  searchOrders,
  updateOrderStatus,
} from '../../controller/admin/order.controller.js';
import { verification } from '../../middleware/middleware.js';

const router = Router();

router.get('/orders', verification('_a_tn'), getAllOrders);
router.get('/order-stats', verification('_a_tn'), getOrderStats);
router.get('/order-graph', verification('_a_tn'), getOrderGraph);
router.get('/order-stats/:orderId', verification('_a_tn'), getOrderById);
router.patch('/order-status', verification('_a_tn'), updateOrderStatus);

// search products
router.get('/order/search', searchOrders);

export default router;
