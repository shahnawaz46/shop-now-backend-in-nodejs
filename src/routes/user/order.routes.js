import { Router } from 'express';

// internal
import { verification, userMiddleware } from '../../middleware/middleware.js';
import { addOrder, getOrder } from '../../controller/user/order.controller.js';

const router = Router();

router.post('/user/addOrder', verification('_f_id'), userMiddleware, addOrder);
router.get('/user/getOrder', verification('_f_id'), userMiddleware, getOrder);

export default router;
