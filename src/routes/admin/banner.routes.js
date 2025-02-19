import { Router } from 'express';

// internal
import { verification, adminMiddleware } from '../../middleware/middleware.js';

import upload from '../../middleware/multer.js';
import {
  addBanner,
  deleteBanner,
  getBanner,
  updateBannerVisibility,
} from '../../controller/admin/banner.controller.js';

const router = Router();

router.post(
  '/banner',
  verification('_a_tn'),
  adminMiddleware,
  upload.single('bannerImage'),
  addBanner
);
router.get('/banner', verification('_a_tn'), adminMiddleware, getBanner);
router.delete('/banner', verification('_a_tn'), adminMiddleware, deleteBanner);
router.patch(
  '/banner',
  verification('_a_tn'),
  adminMiddleware,
  updateBannerVisibility
);

// router.post(
//   '/banner/editBanner',
//   verification('token'),
//   adminMiddleware,
//   editBanner
// );

export default router;
