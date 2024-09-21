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
  '/category/create',
  verification('token'),
  adminMiddleware,
  createCategory
);

router.get('/category', getCategory);

router.post(
  '/category/delete',
  verification('token'),
  adminMiddleware,
  deleteCategory
);

router.post(
  '/category/edit',
  verification('token'),
  adminMiddleware,
  editCategory
);

export default router;
