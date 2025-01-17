import { Router } from 'express';

// internal
import {
  signin,
  signout,
  signup,
  updatePassword,
  userProfile,
} from '../../controller/admin/admin.controller.js';
import { verification } from '../../middleware/middleware.js';
import {
  isRequestValid,
  validateRequest,
} from '../../validation/AdminValidation.js';

const router = Router();

router.post('/signin', signin);
router.post('/signup', validateRequest, isRequestValid, signup);
router.post('/signout', signout);
router.get('/profile', verification('_a_tn'), userProfile);
// router.get('/update-password', updatePassword);

export default router;
