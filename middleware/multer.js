import multer from "multer";

const storage = multer.memoryStorage(); // ✔ No disk, safe on Render

const upload = multer({ storage });

export default upload;
