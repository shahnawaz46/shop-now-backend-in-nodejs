import { Router } from 'express';

// internal
import { verification, adminMiddleware } from '../../middleware/middleware.js';
import {
  addProduct,
  getAllProducts,
  deleteProduct,
  editProduct,
  getSingleProductById,
} from '../../controller/admin/product.controller.js';
import multerMiddleWare from '../../middleware/MulterMiddleWare.js';
import upload from '../../middleware/multer.js';

const router = Router();

// const upload = multerMiddleWare('productImages');

router.post(
  '/product/add',
  verification('token'),
  adminMiddleware,
  // upload.array('productPictures'),
  upload.array('productPictures'),
  addProduct
);

// getting products for admin
router.get('/all-product', getAllProducts);

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

// getting single product by id
router.get('/product/single/:productId', getSingleProductById);

export default router;
