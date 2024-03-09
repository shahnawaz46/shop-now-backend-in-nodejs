import { Router } from 'express';

// internal
import { getCategory } from '../../controller/user/category.controller.js';

const router = Router();

router.get('/category/:slug', getCategory);

export default router;
