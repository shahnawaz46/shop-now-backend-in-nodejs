import { Router } from 'express';

// internal
import { getBanner } from '../../controller/user/banner.controller.js';

const router = Router();

router.get('/banner', getBanner);

export default router;
