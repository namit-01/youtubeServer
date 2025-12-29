import express from "express";
import {
  createChannel,
  getChannel,
  updateChannel,
  UserController,
} from "../controller/UserController.js";
import Auth from "../middleware/isAuth.js";
import upload from "../middleware/multer.js";
const userRouter = express.Router();
userRouter.get("/getUser", Auth, UserController);
userRouter.post(
  "/create-channel",
  Auth,
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "bannerImage", maxCount: 1 },
  ]),
  createChannel
);
userRouter.get("/getchannel", Auth, getChannel);
userRouter.post(
  "/update-channel",
  Auth,
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "bannerImage", maxCount: 1 },
  ]),
  updateChannel
);
export default userRouter;
