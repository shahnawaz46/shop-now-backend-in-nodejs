import { Router } from "express";

// internal
import {
  userMiddleware,
  verification,
} from "../../middleware/authMiddleware.js";
import {
  addAddress,
  getAddress,
  updateAddress,
  deleteAddress,
} from "../../controller/user/address.controller.js";

const router = Router();

router.get("/address", verification, userMiddleware, getAddress);
router.post("/address", verification, userMiddleware, addAddress);
router.put("/address", verification, userMiddleware, updateAddress);
router.delete("/address/:_id", verification, userMiddleware, deleteAddress);
// router.get('/user/getAddress', getAddress)

export default router;
