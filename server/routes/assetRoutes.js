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

// Public Read Routes (Accessible to Citizens, Admins, and Public Visitors)
router.get('/', getAllAssets);
router.get('/:id', getAssetById);

// Protected Admin Write Routes
router.use(protect);
router.post('/', authorize('admin'), uploadAssetImages, createAsset);
router.put('/:id', authorize('admin'), uploadAssetImages, updateAsset);
router.delete('/:id', authorize('admin'), deleteAsset);

module.exports = router;
