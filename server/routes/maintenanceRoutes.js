const express = require('express');
const router = express.Router();
const {
  getMaintenanceByAsset,
  createMaintenanceLog,
} = require('../controllers/maintenanceController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All maintenance routes require authentication
router.use(protect);

// Authenticated Read
router.get('/:assetId', getMaintenanceByAsset);

// Admin-Only Write
router.post('/', authorize('admin'), createMaintenanceLog);

module.exports = router;
