const express = require('express');
const router = express.Router();
const {
  createReport,
  getReports,
  updateReportStatus,
  convertReportToMaintenance,
} = require('../controllers/reportController');
const { protect, optionalProtect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { uploadReportPhoto } = require('../middleware/uploadMiddleware');

// Public & Citizen hazard reporting (works authenticated or as guest)
router.post('/', optionalProtect, uploadReportPhoto, createReport);
router.get('/', optionalProtect, getReports);

// Admin-only triage and conversion (requires admin token)
router.put('/:id', protect, authorize('admin'), updateReportStatus);
router.post('/:id/convert', protect, authorize('admin'), convertReportToMaintenance);

module.exports = router;
