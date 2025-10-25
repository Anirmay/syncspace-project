import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { moveTask } from '../controllers/task.controller.js'; // Import only moveTask here

const router = express.Router();

// Route for moving a task
router.patch('/:taskId/move', protect, moveTask); // PATCH /api/tasks/:taskId/move

// We can add other task-specific routes here later (e.g., update details, delete)

export default router;

