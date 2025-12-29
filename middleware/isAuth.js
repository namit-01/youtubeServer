import jwt from "jsonwebtoken";
import User from "../models/user,model.js";

const Auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ message: "User should be logged in" });

    const token = authHeader.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(payload.userId);
    if (!user) return res.status(404).json({ message: "User does not exist" });

    req.user = user;
    next();
  } catch (err) {
    console.log("Auth error:", err);
    return res
      .status(401)
      .json({ message: "Invalid token", error: err.message });
  }
};

export default Auth;
