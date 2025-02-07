import { Router } from 'express';

// internal,
import {
  signup,
  signin,
  signout,
  userProfile,
  editUserProfileDetail,
  updateProfilePic,
  otpVerification,
} from '../../controller/user/user.controller.js';
import { verification } from '../../middleware/middleware.js';
import {
  validateRequest,
  isRequestValid,
} from '../../validation/validation.js';
import upload from '../../middleware/multer.js';

const router = Router();

router.post('/user/signup', validateRequest, isRequestValid, signup);
router.post('/user/verify', otpVerification);
router.post('/user/signin', signin);
router.post('/user/signout', signout);

router.get('/user/profile', verification('_f_id'), userProfile);
router.patch(
  '/user/updateProfile',
  verification('_f_id'),
  editUserProfileDetail
);

router.patch(
  '/user/updateProfilePic',
  verification('_f_id'),
  upload.single('profilePicture'),
  updateProfilePic
);

router.get('/pinged', (req, res) => {
  return res.status(200).send('Pong');
});

export default router;
