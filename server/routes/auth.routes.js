import express from 'express';
import { register, login, forgotPassword, resetPassword, logout } from '../controllers/auth.controller.js'; // Import functions

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);        // Handle forgot password
router.patch('/reset-password/:token', resetPassword); // Reset route
router.post('/logout', logout);

export default router;
