// src/middlewares/upload.ts
import multer from 'multer';

const storage = multer.memoryStorage();

const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = [
    "image/jpeg", 
    "image/png", 
    "image/gif", 
    "application/pdf",
    "application/zip",
    "application/x-rar-compressed",
    "application/vnd.rar"
  ];
  if (allowedMimes.includes(file.mimetype)) cb(null, true);
  else cb(new Error("فرمت فایل نادرست می‌باشد. فقط عکس و PDF مجاز است."));
};

export default multer({
  storage,
  fileFilter,
  limits: { fileSize: 70 * 1024 * 1024 }, // 70MB limit
});
