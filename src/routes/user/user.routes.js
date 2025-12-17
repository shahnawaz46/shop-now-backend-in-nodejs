import { Router } from "express";

// internal,
import {
  userProfile,
  editUserProfileDetail,
  updateProfilePic,
} from "../../controller/user/user.controller.js";
import { verification } from "../../middleware/authMiddleware.js";
import upload from "../../middleware/multer.js";

const router = Router();

router.get("/profile", verification, userProfile);
router.patch("/profile", verification, editUserProfileDetail);

router.patch(
  "/profile-pic",
  verification,
  upload.single("profilePicture"),
  updateProfilePic
);

router.get("/pinged", (req, res) => {
  return res.status(200).send("Pong");
});

export default router;
