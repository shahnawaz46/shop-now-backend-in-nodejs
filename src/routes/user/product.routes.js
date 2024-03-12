import { Router } from 'express';

// internal
import { verification } from '../../middleware/middleware.js';
import {
  getAllProducts,
  getFilteredProducts,
  getSingleProductById,
  getFeaturedProducts,
  writeProductReview,
  topRatingProducts,
  getTopTrendingProducts,
  updateTopTrendingProduct,
  // getAllProductByPrice,
} from '../../controller/user/product.controller.js';

const router = Router();

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

router.post('/product/write_review', verification('_f_id'), writeProductReview);

export default router;
