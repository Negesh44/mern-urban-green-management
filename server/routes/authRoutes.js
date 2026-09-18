const express = require('express');
const router = express.Router();
const { signup, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);

// Role-protected test route for verification
router.get('/admin-only', protect, authorize('admin'), (req, res) => {
  res.json({
    status: 'success',
    message: 'Authorized access to administrative green management operations',
    user: req.user,
  });
});

module.exports = router;
