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

router.get('/user/profile', verification("user_token"), userProfile)
router.post('/user/updateDetail', verification("user_token"), editUserProfileDetail)
router.post('/user/updateProfilePic', verification("user_token"), upload.single("profilePicture"), updateProfilePic)

module.exports = router;