import { Router } from 'express';

// internal
import { verification } from '../../middleware/middleware.js';
import {
  deleteUser,
  getAllUsers,
  getUserGrowthGraph,
  getUserStats,
  searchUsers,
} from '../../controller/admin/user.controller.js';

const router = Router();

router.get('/all-users', verification('_a_tn'), getAllUsers);
router.get('/user-stats', verification('_a_tn'), getUserStats);
router.get('/user-graph', verification('_a_tn'), getUserGrowthGraph);

// search users
router.get('/user/search', searchUsers);
// router.delete('/user/delete/:id', deleteUser);

export default router;
