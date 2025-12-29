import jwt from "jsonwebtoken";
import User from "../models/user,model.js";

const Auth = async (req, res, next) => {
  try {
    const token = req.cookies.token; // correct
    if (!token) {
      return res.status(401).json({ message: "User should be logged in" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(payload.userId);
    console.log("Authenticated user:", user);
    if (!user) {
      return res.status(404).json({ message: "User does not exist" });
    }

    req.userId = user; // you can use req.user in your controllers
    next();
  } catch (err) {
    console.log("Auth error:", err);
    return res
      .status(401)
      .json({ message: "Invalid token", error: err.message });
  }
};

export default Auth;
