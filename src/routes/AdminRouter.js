const express = require("express");;


// components
const { signin, signup, signout } = require("../controller/AdminRoutingMethods");


const router = express.Router()

// router.post('/admin/signup', signup)
router.post('/admin/signin', signin)
router.post('/admin/signout', signout)

module.exports = router;