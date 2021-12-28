const express = require("express");

// components
const { verification, userMiddleware } = require("../middleware/middleware");
const { addToCart, getCartItem, removeCartItem } = require("../controller/CartRoutingMethods");

const router = express.Router()


router.post('/user/product/add_to_cart', verification('user_token'), userMiddleware, addToCart)
router.get('/user/carItem/get', verification('user_token'), userMiddleware, getCartItem)
router.post('/user/carItem/remove', verification('user_token'), userMiddleware, removeCartItem)

module.exports = router;