import multer from "multer";
import path from "path";
import { AppError } from "./errorHandler";

// Memory storage for Cloudinary upload
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new AppError("Only image files are allowed (jpeg, jpg, png, gif, webp)", 400));
  }
};

// Multer config
export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter,
});
