import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRouter from "./route/authRoute.js";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();

const app = express();

// Middlewares
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

// Routes
app.use("/api/auth", authRouter);

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGODB);
    console.log("✅ MongoDB Connected Successfully");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error);
  }
};

start();
