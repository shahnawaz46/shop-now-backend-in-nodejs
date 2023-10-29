const express = require('express');

// components
const { verification } = require('../../middleware/middleware');
const {
  getAllProducts,
  getFilteredProducts,
  getSingleProductById,
  getFeaturedProducts,
  writeProductReview,
  topRatingProducts,
  getTopTrendingProducts,
  updateTopTrendingProduct,
  // getAllProductByPrice,
} = require('../../controller/user/product');

const router = express.Router();

// getting all products for user bases on slug/targetAudience
// slug mean -> men or women
router.get('/product/all/:slug', getAllProducts);

router.get('/product/filtered', getFilteredProducts);

// getting single product by id
router.get('/product/single/:productId', getSingleProductById);

// router.post('/product/featured-product', getFeaturedProducts);
router.post('/product/top-trending', updateTopTrendingProduct);
router.get('/product/top-trending', getTopTrendingProducts);

// getting top rated products for homepage
router.get('/product/top-rated', topRatingProducts);

router.post(
  '/product/write_review',
  verification('user_token'),
  writeProductReview
);

module.exports = router;
