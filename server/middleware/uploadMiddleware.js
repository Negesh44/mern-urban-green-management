const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure destination directories exist
const assetsUploadDir = path.join(__dirname, '..', 'uploads', 'assets');
const reportsUploadDir = path.join(__dirname, '..', 'uploads', 'reports');

[assetsUploadDir, reportsUploadDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Common file filter for image types
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

  if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Unsupported file format (${ext}). Only JPEG, JPG, PNG, and WEBP image formats are permitted.`
      ),
      false
    );
  }
};

// Storage for Assets
const assetStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, assetsUploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const sanitizedBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1e9)}`;
    cb(null, `${sanitizedBase}_${uniqueSuffix}${ext}`);
  },
});

// Storage for Citizen Reports
const reportStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, reportsUploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const sanitizedBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
    const uniqueSuffix = `report_${Date.now()}_${Math.round(Math.random() * 1e9)}`;
    cb(null, `${sanitizedBase}_${uniqueSuffix}${ext}`);
  },
});

const uploadAssets = multer({
  storage: assetStorage,
  limits: { fileSize: 10 * 1024 * 1024, files: 5 },
  fileFilter,
});

const uploadReport = multer({
  storage: reportStorage,
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter,
});

// Wrapper middleware for Asset images (array)
const uploadAssetImages = (req, res, next) => {
  const uploadHandler = uploadAssets.array('images', 5);
  uploadHandler(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          status: 'error',
          message: 'Uploaded file is too large. Maximum size limit is 10MB.',
        });
      }
      return res.status(400).json({ status: 'error', message: err.message });
    } else if (err) {
      return res.status(400).json({ status: 'error', message: err.message });
    }
    next();
  });
};

// Wrapper middleware for Citizen Report photo (single)
const uploadReportPhoto = (req, res, next) => {
  const uploadHandler = uploadReport.single('photo');
  uploadHandler(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          status: 'error',
          message: 'Uploaded photo is too large. Maximum size limit is 10MB.',
        });
      }
      return res.status(400).json({ status: 'error', message: err.message });
    } else if (err) {
      return res.status(400).json({ status: 'error', message: err.message });
    }
    next();
  });
};

module.exports = {
  uploadAssetImages,
  uploadReportPhoto,
};
