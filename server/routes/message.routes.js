import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
// Make sure both functions are imported correctly
import { createDirectMessage, getDirectMessages, getMessagesByWorkspace, createWorkspaceMessage } from '../controllers/message.controller.js';

const router = express.Router();

// Route for creating a new direct message
router.post('/direct', protect, createDirectMessage); // POST /api/messages/direct

// --- THIS IS THE ROUTE THAT WAS LIKELY MISSING OR MISCONFIGURED ---
// Route for getting messages between current user and another user
// It uses :userId as the parameter
router.get('/direct/:userId', protect, getDirectMessages); // GET /api/messages/direct/:userId
// Workspace messages
router.get('/workspace/:workspaceId', protect, getMessagesByWorkspace); // GET /api/messages/workspace/:workspaceId
router.post('/workspace', protect, createWorkspaceMessage); // POST /api/messages/workspace with { workspaceId, text }
// --- END FIX ---

export default router;

