import { Router } from 'express';

// internal
import { verification, adminMiddleware } from '../middleware/middleware.js';
import {
  addProduct,
  showProducts,
  deleteProduct,
  editProduct,
  getAllProductBySlug,
  getSingleProductById,
  getFeaturedProducts,
  writeProductReview,
  topRatingProducts,
} from '../controller/product.controller.js';
import multerMiddleWare from '../middleware/MulterMiddleWare.js';

const router = Router();

const upload = multerMiddleWare('productImages');

router.post(
  '/product/add',
  verification('token'),
  adminMiddleware,
  upload.array('productPictures'),
  addProduct
);

// getting products for admin
router.get('/product/get', showProducts);

// delete product for admin
router.post(
  '/product/delete',
  verification('token'),
  adminMiddleware,
  deleteProduct
);

// edit product for admin
router.post(
  '/product/edit',
  verification('token'),
  adminMiddleware,
  editProduct
);

// getting all products for user bases on slug
// slug mean -> men or women
router.get('/product/:slug', getAllProductBySlug);

// getting single product by id
router.get('/product/single/:productId', getSingleProductById);

router.post('/product/featured-product', getFeaturedProducts);

// getting top rating products for homepage
router.get('/product/top/rating', topRatingProducts);

router.post(
  '/product/write_review',
  verification('user_token'),
  writeProductReview
);

module.exports = router;
