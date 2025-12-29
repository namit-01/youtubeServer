import mongoose from "mongoose";
const ChannelSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    default: "",
  },
  category: {
    type: String,
    required: true,
  },
  bannerImage: {
    type: String,
    default: "",
  },
  avatar: {
    type: String,
    default: "",
  },
  subscibers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  video: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
    },
  ],
  shorts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Short",
    },
  ],
  playlists: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Playlists",
    },
  ],
  communityPosts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
});
const Channel = mongoose.model("Channel", ChannelSchema);
export default Channel;
