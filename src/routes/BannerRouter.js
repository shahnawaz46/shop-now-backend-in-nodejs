const express = require('express');

const router = express.Router();

// components
const { verification, adminMiddleware } = require('../middleware/middleware');
const multerMiddleWare = require('../middleware/MulterMiddleWare');
const { addBanner, getBanner, deleteBanner, editBanner } = require('../controller/BannerRoutingMethods');

const upload = multerMiddleWare("BannerImages")

router.post('/banner/addBanner', verification("token"), adminMiddleware, upload.fields([
    { name: 'computerBannerImage', maxCount: 1 },
    { name: 'mobileBannerImage', maxCount: 1 }
]), addBanner)

router.get('/banner/getBanner', getBanner)
router.post('/banner/deleteBanner', verification("token"), adminMiddleware, deleteBanner)
router.post('/banner/editBanner', verification("token"), adminMiddleware, editBanner)

module.exports = router;