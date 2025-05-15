import { Router } from "express";

// internal,
import {
  signup,
  signin,
  signout,
  userProfile,
  editUserProfileDetail,
  updateProfilePic,
  otpVerification,
} from "../../controller/user/user.controller.js";
import { verification } from "../../middleware/middleware.js";
import {
  validateRequest,
  isRequestValid,
} from "../../validation/validation.js";
import upload from "../../middleware/multer.js";

const router = Router();

router.post("/signup", validateRequest, isRequestValid, signup);
router.post("/verify", otpVerification);
router.post("/signin", signin);
router.post("/signout", signout);

router.get("/profile", verification("_f_id"), userProfile);
router.patch("/profile", verification("_f_id"), editUserProfileDetail);

router.patch(
  "/profile-pic",
  verification("_f_id"),
  upload.single("profilePicture"),
  updateProfilePic
);

router.get("/authenticated", verification("_f_id"), (req, res) =>
  res.status(200).json({ msg: "authenticated" })
);

router.get("/pinged", (req, res) => {
  return res.status(200).send("Pong");
});

export default router;
