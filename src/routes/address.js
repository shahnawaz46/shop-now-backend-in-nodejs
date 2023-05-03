const express = require('express')

// components
const { verification, userMiddleware } = require('../middleware/middleware')
const { addAddress, getAddress, updateAddress, deleteAddress } = require('../controller/address')

const router = express.Router()

router.get('/user/getAddress', verification('_f_id'), userMiddleware, getAddress)
router.post('/user/addAddress', verification('_f_id'), userMiddleware, addAddress)
router.patch('/user/updateAddress', verification('_f_id'), userMiddleware, updateAddress)
router.delete('/user/deleteAddress/:_id', verification('_f_id'), userMiddleware, deleteAddress)
// router.get('/user/getAddress', getAddress)

module.exports = router;