import express from 'express';
// --- UPDATED Import ---
import { getUserProfile, deleteUserProfile, getAllUsers } from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// --- NEW: Route to get all users ---
// GET /api/users (handles fetching list for invites)
router.get('/', protect, getAllUsers);
// --- END NEW ---

// Routes for the current user profile (/api/users/me)
router.route('/me')
    .get(protect, getUserProfile)   // GET /api/users/me
    .delete(protect, deleteUserProfile); // DELETE /api/users/me

// You could add routes for specific users later if needed, e.g., GET /api/users/:id

export default router;

