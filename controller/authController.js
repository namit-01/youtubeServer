import uploadOnCloudinary from "../config/cloudinary.js";
import User from "../models/user,model.js";
import validator from "validator";
import bcrypt from "bcryptjs";
import genToken from "../config/token.js";
import axios from "axios";
import sendMail from "../config/sendMail.js";

// ================= SIGN UP =================
export const signUp = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existUser = await User.findOne({ email });
    if (existUser) {
      return res.status(400).json({ message: "User already exist" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Enter strong password" });
    }

    let photoUrl = null;
    if (req.file) {
      photoUrl = await uploadOnCloudinary(req.file.buffer);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      username,
      password: hashedPassword,
      photoUrl,
    });

    await newUser.save();

    const token = genToken(newUser._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      message: "User created successfully",
      user: newUser,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error While SignUp",
      error: error.message,
    });
  }
};

// ================= SIGN IN =================
export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide correct credentials" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Password incorrect" });
    }

    const token = genToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "User logged in successfully",
      user,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal Server Error While SignIn",
      error: err.message,
    });
  }
};

// ================= SIGN OUT =================
export const signOut = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    return res.status(200).json({ message: "SignOut successfully" });
  } catch (err) {
    return res.status(500).json({
      message: "Internal Server Error While SignOut",
      error: err.message,
    });
  }
};

// ================= GOOGLE SIGN IN =================
export const googleSiginUp = async (req, res) => {
  try {
    const { email, photoUrl, username } = req.body;
    let googlePhoto = photoUrl;

    if (photoUrl) {
      const response = await axios.get(photoUrl, {
        responseType: "arraybuffer",
      });
      googlePhoto = await uploadOnCloudinary(response.data);
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        email,
        username,
        photoUrl: googlePhoto,
      });
      await user.save();
    }

    const token = genToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json({ message: `GoogleAuth error ${err}` });
  }
};

// ================= OTP =================
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOtp = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000;
    user.isOtpVerified = false;

    await user.save();
    await sendMail(email, otp);

    return res.status(200).json({ message: "otp send successfully" });
  } catch (err) {
    return res.status(500).json({ message: `Send OTP error ${err}` });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.resetOtp !== otp || user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "Invalid otp" });
    }

    user.isOtpVerified = true;
    user.resetOtp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    return res.status(200).json({ message: "Otp verified successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !user.isOtpVerified) {
      return res.status(400).json({ message: "Otp not verified" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.isOtpVerified = false;
    await user.save();

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
