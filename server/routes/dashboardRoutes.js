const express = require('express');
const router = express.Router();
const { getDashboardSummary } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All dashboard summary routes are restricted to Admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/summary', getDashboardSummary);

module.exports = router;
