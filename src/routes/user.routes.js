import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"; // Assuming you have a multer setup for file uploads

const router = Router();

router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 }, // For user avatar
    { name: "coverImage", maxCount: 1 } // For cover image
  ]),
  
  registerUser);

export default router;
