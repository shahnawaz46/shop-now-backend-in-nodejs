import { Router } from 'express';

// internal
import { verification } from '../../middleware/middleware.js';
import {
  getAllProducts,
  getFilteredProducts,
  getSingleProductById,
  writeProductReview,
  topRatingProducts,
  getTopTrendingProducts,
  updateTopTrendingProduct,
  getTopSellingProducts,
  getNewestProducts,
  getSingleProductByIdDuringCheckout,
} from '../../controller/user/product.controller.js';

const router = Router();

// getting all products for user bases on slug/targetAudience
// slug mean -> men or women
router.get('/product/all/:slug', getAllProducts);

// getting filtered products inside query
router.get('/product/filtered', getFilteredProducts);

// getting single product by id
router.get('/product/single/:productId', getSingleProductById);

// getting single product by id during checkout/buy
router.get(
  '/product/single/checkout/:productId',
  getSingleProductByIdDuringCheckout
);

// top trending products
router.post('/product/top-trending', updateTopTrendingProduct);
router.get('/product/top-trending', getTopTrendingProducts);

// getting top rated products for homepage
router.get('/product/top-rated', topRatingProducts);

// getting top selling products
router.get('/product/top-selling', getTopSellingProducts);

// getting newest products
router.get('/product/newest', getNewestProducts);

router.post('/product/write_review', verification('_f_id'), writeProductReview);

export default router;
