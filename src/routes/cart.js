const express = require("express");

// components
const { verification, userMiddleware } = require("../middleware/middleware");
const { addToCart, getCartItem, removeCartItem } = require("../controller/cart");

const router = express.Router()


router.post('/user/cartItem/add', verification('_f_id'), userMiddleware, addToCart)
router.get('/user/cartItem/get', verification('_f_id'), userMiddleware, getCartItem)
router.delete('/user/cartItem/remove', verification('_f_id'), userMiddleware, removeCartItem)

module.exports = router;