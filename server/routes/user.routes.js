const express = require('express');
const { protect } = require('../middleware/auth.middleware.js');
const User = require('../models/User.js'); // We need the User model again

const router = express.Router();

// @route   GET /api/users/me
// @desc    Get current logged in user's profile
// @access  Private
router.get('/me', protect, async (req, res) => {
  // The 'protect' middleware already found the user and attached it to req.user
  if (req.user) {
    res.json({
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        createdAt: req.user.createdAt // Optionally send creation date
    });
  } else {
    // This case should ideally not happen if protect middleware works
    res.status(404).json({ message: 'User not found after authentication' });
  }
});

// Optional: Add a route for updating user profile later
// router.patch('/me', protect, ...)

module.exports = router;
