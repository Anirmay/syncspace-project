import express from 'express';
// Ensure correct path to middleware and controller files, including .js extension
import { protect } from '../middleware/auth.middleware.js';
import {
    createWorkspace,
    getMyWorkspaces,
    getWorkspaceById
} from '../controllers/workspace.controller.js';
// This import now correctly matches the default export from board.routes.js
import boardRoutes from './board.routes.js';

const router = express.Router();

// Apply protect middleware to all workspace routes FIRST
router.use(protect);

// Basic workspace routes
router.route('/')
    .post(createWorkspace)   // POST /api/workspaces
    .get(getMyWorkspaces);    // GET /api/workspaces

router.route('/:id') // Changed :workspaceId to :id to match controller potentially
    .get(getWorkspaceById); // GET /api/workspaces/:id

// --- Nest Board Routes ---
// Any request starting with /api/workspaces/:workspaceId/boards will be handled by boardRoutes
// The :workspaceId will be available in boardRoutes controllers via req.params
router.use('/:workspaceId/boards', boardRoutes); // Use :workspaceId here for nesting

// Ensure this is the last line and uses 'default'
export default router;

