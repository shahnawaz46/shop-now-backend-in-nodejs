const express = require('express')

// components
const { verification, userMiddleware } = require('../middleware/middleware')
const { addAddress, getAddress, editAddress } = require('../controller/AddressRoutingMethod')

const router = express.Router()

router.post('/user/addAddress', verification('user_token'), userMiddleware, addAddress)
router.post('/user/removeAddress', verification('user_token'), userMiddleware, editAddress)
router.get('/user/getAddress', verification('user_token'), userMiddleware, getAddress)

module.exports = router;