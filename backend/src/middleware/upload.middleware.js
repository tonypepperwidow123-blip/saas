import multer from 'multer';

const storage = multer.memoryStorage();

const ALLOWED_MIMES = new Set([
  'application/zip',
  'application/x-zip',
  'application/x-zip-compressed',
  'application/octet-stream',  // Many browsers send ZIP as this
  'multipart/x-zip',
]);

const fileFilter = (req, file, cb) => {
  const mimeOk = ALLOWED_MIMES.has(file.mimetype);
  const extOk = file.originalname?.toLowerCase().endsWith('.zip');

  if (mimeOk || extOk) {
    cb(null, true);
  } else {
    cb(new Error(`Only ZIP files are allowed (received: ${file.mimetype})`), false);
  }
};

export const uploadPlugin = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max (increased from 10MB)
  },
});