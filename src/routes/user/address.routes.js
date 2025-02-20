import { Router } from 'express';

// internal
import { userMiddleware, verification } from '../../middleware/middleware.js';
import {
  addAddress,
  getAddress,
  updateAddress,
  deleteAddress,
} from '../../controller/user/address.controller.js';

const router = Router();

router.get('/address', verification('_f_id'), userMiddleware, getAddress);
router.post('/address', verification('_f_id'), userMiddleware, addAddress);
router.put('/address', verification('_f_id'), userMiddleware, updateAddress);
router.delete(
  '/address/:_id',
  verification('_f_id'),
  userMiddleware,
  deleteAddress
);
// router.get('/user/getAddress', getAddress)

export default router;
