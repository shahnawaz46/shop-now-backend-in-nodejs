import { Router } from 'express';

// internal
import {
  signin,
  // signup,
  signout,
} from '../../controller/admin/admin.controller.js';

const router = Router();

// router.post('/admin/signup', signup)
router.post('/admin/signin', signin);
router.post('/admin/signout', signout);

export default router;
