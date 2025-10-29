import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
    createWorkspace,
    getMyWorkspaces,
    getWorkspaceById,
    updateWorkspaceStatus // Assuming you still need this
    // Add other necessary controller imports if missing
} from '../controllers/workspace.controller.js';
import boardRoutes from './board.routes.js'; // Import board routes
import { getMessagesByWorkspace } from '../controllers/message.controller.js';

const router = express.Router();

// --- Define specific routes FIRST ---

// GET /api/workspaces/my - Get user's specific workspaces
router.get('/my', protect, getMyWorkspaces);

// POST /api/workspaces - Create a new workspace
router.post('/', protect, createWorkspace);

// --- Define parameterized routes AFTER specific ones ---

// GET /api/workspaces/:workspaceId - Get specific workspace details
router.get('/:workspaceId', protect, getWorkspaceById);

// PATCH /api/workspaces/:workspaceId/status - Update workspace status
router.patch('/:workspaceId/status', protect, updateWorkspaceStatus);

// GET /api/workspaces/:workspaceId/messages - Get messages for a specific workspace
router.get('/:workspaceId/messages', protect, getMessagesByWorkspace);


// --- Mount board routes (These are also under a parameter, so they are fine here) ---
// Any route starting with /api/workspaces/:workspaceId/boards will use boardRoutes
router.use('/:workspaceId/boards', boardRoutes);


export default router;

