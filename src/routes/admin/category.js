const express = require('express');

// components
const {
  createCategory,
  getCategory,
  deleteCategory,
  editCategory,
} = require('../../controller/admin/category');

const {
  verification,
  adminMiddleware,
} = require('../../middleware/middleware');

const router = express.Router();

router.post(
  '/category/create',
  verification('token'),
  adminMiddleware,
  createCategory
);

router.get('/category/get', getCategory);

router.post(
  '/category/delete',
  verification('token'),
  adminMiddleware,
  deleteCategory
);

router.post(
  '/category/edit',
  verification('token'),
  adminMiddleware,
  editCategory
);

module.exports = router;
