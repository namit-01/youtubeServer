import mongoose from "mongoose";
const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    photoUrl: {
      type: String,
      default: "",
    },
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
    },
    resetOtp: { type: String },
    otpExpiry: { type: Date },
    isOtpVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);
const User = mongoose.model("User", UserSchema);
export default User;
