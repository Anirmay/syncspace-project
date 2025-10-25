import express from 'express';
// Ensure correct path to middleware and controller files, including .js extension
import { protect } from '../middleware/auth.middleware.js';
import { createBoard, getBoardById, getBoardsByWorkspace } from '../controllers/board.controller.js';
import { createTask, getTasksByBoard } from '../controllers/task.controller.js';

// IMPORTANT: mergeParams allows accessing :workspaceId from the parent router (workspace.routes.js)
const router = express.Router({ mergeParams: true });

// Routes relative to /api/workspaces/:workspaceId/boards

// Create a board & Get all boards for the workspace
// Middleware is applied here individually or inherited via workspace.routes.js if needed
router.route('/')
    .post(protect, createBoard)        // POST /api/workspaces/:workspaceId/boards
    .get(protect, getBoardsByWorkspace); // GET /api/workspaces/:workspaceId/boards

// Get a specific board
router.route('/:boardId')
    .get(protect, getBoardById);        // GET /api/workspaces/:workspaceId/boards/:boardId

// --- Task Routes Nested Under Boards ---

// Get all tasks for a specific board
router.route('/:boardId/tasks')
    .get(protect, getTasksByBoard); // GET /api/workspaces/:workspaceId/boards/:boardId/tasks

// Post a new task to a specific column on a specific board
router.route('/:boardId/columns/:columnId/tasks')
    .post(protect, createTask); // POST /api/workspaces/:workspaceId/boards/:boardId/columns/:columnId/tasks

// Ensure this is the last line and uses 'default'
export default router;

