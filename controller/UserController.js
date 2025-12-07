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
