import { v2 as cloudinary } from "cloudinary";

const uploadOnCloudinary = async (fileBuffer) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  try {
    if (!fileBuffer) return null;

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ resource_type: "auto" }, (error, uploadResult) => {
          if (error) reject(error);
          else resolve(uploadResult);
        })
        .end(fileBuffer);
    });

    return result.secure_url;
  } catch (err) {
    console.log("Cloudinary upload error:", err);
    return null;
  }
};

export default uploadOnCloudinary;
