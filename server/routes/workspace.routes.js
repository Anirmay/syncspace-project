import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
    createWorkspace,
    getMyWorkspaces,
    getWorkspaceById,
    updateWorkspaceStatus,
    deleteWorkspace, // --- ADDED: Import the new delete function
    getManagedWorkspaces,
    getWorkspaceMembers,
    removeMemberFromWorkspace
} from '../controllers/workspace.controller.js';
import boardRoutes from './board.routes.js'; // Import board routes
import { getMessagesByWorkspace } from '../controllers/message.controller.js';

const router = express.Router();

// --- Define specific routes FIRST ---
router.get('/my', protect, getMyWorkspaces);
router.get('/managed', protect, getManagedWorkspaces);
router.post('/', protect, createWorkspace);

// --- Define parameterized routes AFTER specific ones ---
router.get('/:workspaceId', protect, getWorkspaceById);
router.patch('/:workspaceId/status', protect, updateWorkspaceStatus);
router.delete('/:workspaceId', protect, deleteWorkspace);
router.get('/:workspaceId/messages', protect, getMessagesByWorkspace);
router.get('/:workspaceId/members', protect, getWorkspaceMembers);

// --- NEW ROUTE for removing a member ---
router.delete('/:workspaceId/members/:memberUserId', protect, removeMemberFromWorkspace);
// --- END NEW ROUTE ---

// --- Mount board routes ---
router.use('/:workspaceId/boards', boardRoutes);


export default router;
