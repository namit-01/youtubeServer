import express from "express";
import upload from "../middleware/multer.js";
import { signIn, signOut, signUp } from "../controller/authController.js";
const authRouter = express.Router();
authRouter.post("/signUp", upload.single("photoUrl"), signUp);
authRouter.post("/signIn", signIn);
authRouter.get("/signOut", signOut);
export default authRouter;
