import { Router } from 'express';

// internal
import { verification, adminMiddleware } from '../../middleware/middleware.js';
import multerMiddleWare from '../../middleware/MulterMiddleWare.js';
import {
  addBanner,
  getBanner,
  deleteBanner,
  editBanner,
} from '../../controller/banner.controller.js';

const router = Router();

const upload = multerMiddleWare('BannerImages');

router.post(
  '/banner/addBanner',
  verification('token'),
  adminMiddleware,
  upload.fields([
    { name: 'computerBannerImage', maxCount: 1 },
    { name: 'mobileBannerImage', maxCount: 1 },
  ]),
  addBanner
);

router.get('/banner/getBanner', getBanner);
router.post(
  '/banner/deleteBanner',
  verification('token'),
  adminMiddleware,
  deleteBanner
);
router.post(
  '/banner/editBanner',
  verification('token'),
  adminMiddleware,
  editBanner
);

export default router;
