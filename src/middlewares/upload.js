import multer from "multer";
import path from "path";
import fs from "fs";
import env from "../config/env.js";

const uploadDirectory = path.resolve(process.cwd(), env.UPLOAD_DIR, "farms");

// Ensure directory exists
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `farm-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, and WebP images are allowed."), false);
  }
};

export const photoUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024, // MB to bytes
  },
});
