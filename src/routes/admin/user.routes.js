import { Router } from 'express';

// internal
import { verification } from '../../middleware/middleware.js';
import {
  getAllUsers,
  getUserStats,
  searchUsers,
} from '../../controller/admin/user.controller.js';

const router = Router();

router.get('/all-users', verification('_a_tn'), getAllUsers);
router.get('/user-stats', verification('_a_tn'), getUserStats);

// search users
router.get('/user/search', searchUsers);

export default router;
