const express = require('express')
const router = express.Router()

const { verification, userMiddleware } = require('../middleware/middleware')
const { addOrder, getOrder } = require('../controller/order')

router.post('/user/addOrder', verification('user_token'), userMiddleware, addOrder)
router.post('/user/getOrder', verification('user_token'), userMiddleware, getOrder)

module.exports = router;