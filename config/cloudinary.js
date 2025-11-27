import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const uploadOnCloudinary = async (filePath) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  try {
    if (!filePath) return null;

    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });

    // Delete local file safely
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return result.secure_url;
  } catch (err) {
    console.log("Cloudinary upload error:", err);

    // Delete local file if exists, avoid crash
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return null; // return null instead of throwing
  }
};

export default uploadOnCloudinary;
