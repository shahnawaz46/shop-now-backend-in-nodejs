import { Router } from 'express';

// internal,
import {
  signup,
  signin,
  signout,
  userProfile,
  editUserProfileDetail,
  updateProfilePic,
} from '../../controller/user/user.controller.js';
import { verification } from '../../middleware/middleware.js';
import multerMiddleWare from '../../middleware/MulterMiddleWare.js';
import {
  validateRequest,
  isRequestValid,
} from '../../validation/validation.js';

const router = Router();

const upload = multerMiddleWare('profileImages');

router.post('/user/signup', validateRequest, isRequestValid, signup);
router.post('/user/signin', signin);
router.post('/user/signout', signout);

router.get('/user/profile', verification('_f_id'), userProfile);
router.patch(
  '/user/updateProfile',
  verification('_f_id'),
  editUserProfileDetail
);
router.patch('/user/updateProfilePic', verification('_f_id'), updateProfilePic);

export default router;
