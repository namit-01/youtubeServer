import express from "express";
import upload from "../middleware/multer.js";
import {
  googleSiginUp,
  resetPassword,
  sendOtp,
  signIn,
  signOut,
  signUp,
  verifyOtp,
} from "../controller/authController.js";
const authRouter = express.Router();
authRouter.post("/signUp", upload.single("photoUrl"), signUp);
authRouter.post("/signIn", signIn);
authRouter.get("/signOut", signOut);
authRouter.post("/google-auth", googleSiginUp);
authRouter.post("/sendotp", sendOtp);
authRouter.post("/verifyotp", verifyOtp);
authRouter.post("/resetpassword", resetPassword);
export default authRouter;
