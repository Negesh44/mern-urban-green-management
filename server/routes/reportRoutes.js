const express = require('express');
const router = express.Router();
const {
  createReport,
  getReports,
  updateReportStatus,
  convertReportToMaintenance,
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { uploadReportPhoto } = require('../middleware/uploadMiddleware');

// All report endpoints require authentication
router.use(protect);

// Citizen & Admin read / Citizen create
router.post('/', uploadReportPhoto, createReport);
router.get('/', getReports);

// Admin-only triage and conversion
router.put('/:id', authorize('admin'), updateReportStatus);
router.post('/:id/convert', authorize('admin'), convertReportToMaintenance);

module.exports = router;
