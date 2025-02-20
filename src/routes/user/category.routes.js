import { Router } from 'express';

// internal
import {
  getCategory,
  searchCategory,
} from '../../controller/user/category.controller.js';

const router = Router();

router.get('/category/all/:slug', getCategory);

router.get('/category/search', searchCategory);

export default router;
