import { Router } from "express";
import {
  otpVerification,
  refreshToken,
  signin,
  signout,
  signup,
} from "../../controller/user/auth.controller.js";
import {
  validateRequest,
  isRequestValid,
} from "../../validation/validation.js";

const router = Router();

router.post("/signup", validateRequest, isRequestValid, signup);
router.post("/verify", otpVerification);
router.post("/signin", signin);
router.post("/signout", signout);
router.get("/refresh", refreshToken);

export default router;
