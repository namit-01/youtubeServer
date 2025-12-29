import uploadOnCloudinary from "../config/cloudinary.js";
import User from "../models/user,model.js";
import validator from "validator";
import bcrypt from "bcryptjs";
import genToken from "../config/token.js";
import axios from "axios";
import sendMail from "../config/sendMail.js";

export const signUp = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    console.log("FILE RECEIVED:", req.file);
    console.log("BODY:", req.body);

    // Validate fields
    if (!email || !username || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check existing user
    const existUser = await User.findOne({ email });
    if (existUser) {
      return res.status(400).json({ message: "User already exist" });
    }

    // Validate email
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Validate password
    if (password.length < 8) {
      return res.status(400).json({ message: "Enter strong password" });
    }

    // Upload photo if available
    let photoUrl = null;
    if (req.file) {
      photoUrl = await uploadOnCloudinary(req.file.buffer); // Should return secure_url
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      email,
      username,
      password: hashedPassword,
      photoUrl: photoUrl,
    });

    // Save user
    await newUser.save();

    // Generate token
    const token = genToken(newUser._id);

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // change to true in production with HTTPS
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Send response
    return res.status(201).json({
      message: "User created successfully",
      user: newUser,
    });
  } catch (error) {
    console.log("Signup error:", error);
    return res.status(500).json({
      message: "Internal Server Error While SignUp",
      error: error.message,
    });
  }
};

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
      secure: false, // true in production
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ message: "User logged in successfully" });
  } catch (err) {
    console.log("SignIn error:", err);
    return res.status(500).json({
      message: "Internal Server Error While SignIn",
      error: err.message,
    });
  }
};

export const signOut = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({ message: "SignOut successfully" });
  } catch (err) {
    console.log("SignOut error:", err);
    return res.status(500).json({
      message: "Internal Server Error While SignOut",
      error: err.message,
    });
  }
};
export const googleSiginUp = async (req, res) => {
  try {
    const { email, photoUrl, username } = req.body;
    let googlePhoto = photoUrl;
    if (photoUrl) {
      try {
        const response = await axios.get(photoUrl, {
          responseType: "arraybuffer",
        });
        googlePhoto = await uploadOnCloudinary(response.data);
      } catch (err) {
        console.log(err);
      }
    }
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        email,
        username,
        photoUrl: googlePhoto,
      });
      await user.save();
    } else {
      if (!user.photoUrl && photoUrl) {
        user.photoUrl = googlePhoto;
        await user.save();
      }
    }
    const token = genToken(user?._id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // true in production
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json({ message: `GoogleAuth error ${err}` });
  }
};
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    user.resetOtp = otp;
    user.otpExpiry = otpExpiry;
    user.isOtpVerified = false;
    await user.save();
    await sendMail(email, otp);
    return res.status(200).json({ message: "otp send successfully" });

    // 5 minutes from now
  } catch (err) {
    return res.status(500).json({ message: `Send OTP error ${err}` });
  }
};
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    if (!user.resetOtp) {
      return res.status(400).json({ message: "Otp is not provided" });
    }
    if (user.resetOtp != otp || user.otpExpiry < Date.now()) {
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
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    if (!user.isOtpVerified) {
      return res.status(400).json({ message: "Please verify the otp" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.isOtpVerified = false;
    await user.save();
    return res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
