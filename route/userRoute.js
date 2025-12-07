import express from "express";
import { UserController } from "../controller/UserController.js";
import Auth from "../middleware/isAuth.js";
const userRouter = express.Router();
userRouter.get("/getUser", Auth, UserController);
export default userRouter;
