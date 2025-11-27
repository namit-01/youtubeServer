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
  },
  { timestamps: true }
);
const User = mongoose.model("User", UserSchema);
export default User;
