const express = require("express");


// components
const { signup,
    signin,
    signout,
    userProfile,
    updateProfilePic,
    editUserProfileDetail } = require("../controller/user");
const { verification } = require("../middleware/middleware");
const multerMiddleWare = require("../middleware/MulterMiddleWare");
const { validateRequest, isRequestValid } = require("../validation/validation");


const router = express.Router()

const upload = multerMiddleWare("profileImages")

router.post('/user/signup', validateRequest, isRequestValid, signup)
router.post('/user/signin', signin)
router.post('/user/signout', signout)

router.get('/user/profile', verification("_f_id"), userProfile)
router.patch('/user/updateProfile', verification("_f_id"), editUserProfileDetail)
router.patch('/user/updateProfilePic', verification("_f_id"), updateProfilePic)

module.exports = router;