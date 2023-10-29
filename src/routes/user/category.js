const express = require('express');

// components
const { getCategory } = require('../../controller/user/category');

const router = express.Router();

router.get('/category/:slug', getCategory);

module.exports = router;
