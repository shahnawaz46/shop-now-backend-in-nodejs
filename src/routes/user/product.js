const express = require('express');

// components
const { verification } = require('../../middleware/middleware');
const {
  getAllProductBySlug,
  getSingleProductById,
  getFeaturedProducts,
  writeProductReview,
  topRatingProducts,
  getTopTrendingProducts,
  updateTopTrendingProduct,
} = require('../../controller/user/product');

const router = express.Router();

// getting all products for user bases on slug
// slug mean -> men or women
router.get('/product/:slug', getAllProductBySlug);

// getting single product by id
router.get('/product/single/:productId', getSingleProductById);

// router.post('/product/featured-product', getFeaturedProducts);
router.post('/product/top/trending', updateTopTrendingProduct);
router.get('/product/top/trending', getTopTrendingProducts);

// getting top rating products for homepage
router.get('/product/top/rating', topRatingProducts);

router.post(
  '/product/write_review',
  verification('user_token'),
  writeProductReview
);

module.exports = router;
