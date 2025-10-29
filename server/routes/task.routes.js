import express from 'express';
import { protect } from '../middleware/auth.middleware.js';

// Import ALL necessary controller functions
import {
    createTask, // <-- IMPORT createTask
    moveTask,
    deleteTask,
    updateTaskDetails 
} from '../controllers/task.controller.js';

const router = express.Router();

// --- ADD THIS ROUTE FOR CREATING TASKS ---
// Maps to POST /api/tasks (assuming this router is mounted at /api/tasks in server.js)
router.post('/', protect, createTask); 
// --- END NEW ROUTE ---

router.patch('/:taskId/move', protect, moveTask);
router.delete('/:taskId', protect, deleteTask);
router.patch('/:taskId', protect, updateTaskDetails); // Handles general updates

export default router;
