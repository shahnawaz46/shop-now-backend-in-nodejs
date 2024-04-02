import { Router } from 'express';

// internal
import {
  getCategory,
  searchCategory,
} from '../../controller/user/category.controller.js';

const router = Router();

router.get('/category/:slug', getCategory);

router.get('/search/category', searchCategory);

export default router;
