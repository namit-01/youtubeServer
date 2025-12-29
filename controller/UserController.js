import uploadOnCloudinary from "../config/cloudinary.js";
import Channel from "../models/channel.model.js";
import User from "../models/user,model.js";
export const UserController = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    console.log(user);
    if (!user) {
      return res.status(400).json({ message: "User not find" });
    }
    console.log(user);
    return res.status(200).json({ user: user });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
export const createChannel = async (req, res) => {
  try {
    const { name, description, category } = req.body;
    if (!name || !description || !category) {
      return res
        .status(400)
        .json({ message: "Please provide the required Field" });
    }
    const userId = req.userId;
    const existingChannel = await Channel.findOne({ owner: userId });
    if (existingChannel) {
      return res.status(400).json({ message: "Channel already exits" });
    }
    const nameExists = await Channel.findOne({ name });
    if (nameExists) {
      return res
        .status(400)
        .json({ message: "Name of this channel already exist" });
    }
    let avatar;
    let bannerImage;
    if (req.files?.avatar) {
      avatar = await uploadOnCloudinary(req.files.avatar[0].buffer);
    }
    if (req.files?.banner) {
      bannerImage = await uploadOnCloudinary(req.files.banner[0].buffer);
    }
    const channel = new Channel({
      name,
      description,
      avatar,
      bannerImage,
      owner: userId,
      category,
    });
    await channel.save();

    await User.findByIdAndUpdate(userId, {
      channel: channel._id,
      username: name,
      photoUrl: avatar,
    });
    res.status(201).json(channel);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Internal server error while creating Channel" });
  }
};
export const getChannel = async (req, res) => {
  try {
    const userId = req.userId;
    const channel = await Channel.findOne({ owner: userId }).populate("owner");
    if (!channel) {
      return res.status(400).json({ message: "Channel not exits" });
    } else {
      return res.status(200).json({ channel });
    }
  } catch (err) {
    res.status(500).json({
      message: "Internal server error while getting the channel details",
    });
  }
};
export const updateChannel = async (req, res) => {
  try {
    const { name, description, category } = req.body;
    const userId = req.userId;

    const channel = await Channel.findOne({ owner: userId });
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    if (name && name !== channel.name) {
      const nameExists = await Channel.findOne({
        name,
        _id: { $ne: channel._id },
      });
      if (nameExists) {
        return res.status(400).json({ message: "Channel name already taken" });
      }
      channel.name = name;
    }

    if (description !== undefined) channel.description = description;
    if (category !== undefined) channel.category = category;

    if (req.files?.avatar) {
      channel.avatar = await uploadOnCloudinary(req.files.avatar[0].buffer);
    }

    if (req.files?.bannerImage) {
      channel.bannerImage = await uploadOnCloudinary(
        req.files.bannerImage[0].buffer
      );
    }

    await channel.save();

    const userUpdate = {};
    if (name) userUpdate.username = name;
    if (channel.avatar) userUpdate.photoUrl = channel.avatar;

    await User.findByIdAndUpdate(userId, userUpdate);

    return res.status(200).json(channel);
  } catch (err) {
    return res.status(500).json({
      message: "Error updating channel",
      error: err.message,
    });
  }
};
