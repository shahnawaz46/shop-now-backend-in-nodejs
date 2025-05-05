import { Router } from 'express';

// internal
import { verification, adminMiddleware } from '../../middleware/middleware.js';
import {
  addProduct,
  getAllProducts,
  deleteProduct,
  editProduct,
  getSingleProductById,
  searchProducts,
  productSalesDetails,
} from '../../controller/admin/product.controller.js';
import upload from '../../middleware/multer.js';

const router = Router();

// getting products for admin
router.get('/all-products', verification('_a_tn'), getAllProducts);
router.get(
  '/product-sales-details',
  verification('_a_tn'),
  productSalesDetails
);

router.post(
  '/product',
  verification('_a_tn'),
  adminMiddleware,
  upload.array('productPictures'),
  addProduct
);

// delete product for admin
router.delete(
  '/product',
  verification('_a_tn'),
  adminMiddleware,
  deleteProduct
);

// edit product for admin
router.patch(
  '/product',
  verification('_a_tn'),
  adminMiddleware,
  upload.array('productPictures'),
  editProduct
);

// getting single product by id
router.get('/product/single/:productId', getSingleProductById);

// search products
router.get('/product/search', searchProducts);

export default router;
