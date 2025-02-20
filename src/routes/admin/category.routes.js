import { Router } from 'express';

// internal
import {
  createCategory,
  getCategory,
  deleteCategory,
  editCategory,
} from '../../controller/admin/category.controller.js';

import { verification, adminMiddleware } from '../../middleware/middleware.js';

const router = Router();

router.post(
  '/category',
  verification('token'),
  adminMiddleware,
  createCategory
);

router.get('/category', verification('_a_tn'), getCategory);

router.post(
  '/category',
  verification('token'),
  adminMiddleware,
  deleteCategory
);

router.post('/category', verification('token'), adminMiddleware, editCategory);

export default router;
