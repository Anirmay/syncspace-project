const express = require('express');
const { register, login, forgotPassword, resetPassword } = require('../controllers/auth.controller.js'); // <-- Import new functions

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);        // <-- NEW ROUTE
router.patch('/reset-password/:token', resetPassword); // <-- NEW ROUTE (use PATCH for update)

module.exports = router;
