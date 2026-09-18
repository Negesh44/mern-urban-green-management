const express = require('express');
const router = express.Router();
const {
  getAllAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
} = require('../controllers/assetController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { uploadAssetImages } = require('../middleware/uploadMiddleware');

// All asset routes require authentication
router.use(protect);

// Public / Authenticated Read Routes
router.get('/', getAllAssets);
router.get('/:id', getAssetById);

// Admin-Only Write Routes
router.post('/', authorize('admin'), uploadAssetImages, createAsset);
router.put('/:id', authorize('admin'), uploadAssetImages, updateAsset);
router.delete('/:id', authorize('admin'), deleteAsset);

module.exports = router;
