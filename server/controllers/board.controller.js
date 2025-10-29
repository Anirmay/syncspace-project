import Board from '../models/Board.js';
import Workspace from '../models/Workspace.js'; // Needed for authorization check
import mongoose from 'mongoose';

// @desc    Create a new board within a workspace
// @route   POST /api/workspaces/:workspaceId/boards
// @access  Private (User must be a member of the workspace)
const createBoard = async (req, res) => {
    const { title } = req.body;
    const { workspaceId } = req.params; // From mergeParams
    const userId = req.user._id;

    if (!title) {
        return res.status(400).json({ message: 'Board title is required.' });
    }
    if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
        return res.status(400).json({ message: 'Invalid Workspace ID.' });
    }

    try {
        // 1. Check for workspace and authorization
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found.' });
        }
        const isMember = workspace.members.some(member => member.user.equals(userId));
        if (!isMember) {
            return res.status(403).json({ message: 'Not authorized for this workspace.' });
        }

        // 2. Create the new board WITH default columns
        const newBoard = new Board({
            title,
            workspace: workspaceId,
            // --- THIS IS THE FIX ---
            columns: [
                { name: 'To Do', tasks: [] },
                { name: 'In Progress', tasks: [] },
                { name: 'Done', tasks: [] }
            ]
        });

        const savedBoard = await newBoard.save();

        workspace.boards.push(savedBoard._id);
        await workspace.save();

        // 4. Return the complete board object (with columns)
        // We send the board directly, just like your createTask controller
        res.status(201).json(savedBoard);
    } catch (error) {
        console.error('Error creating board:', error);
        res.status(500).json({ message: 'Server error creating board.' });
    }
};

// @desc    Get all boards for a specific workspace
// @route   GET /api/workspaces/:workspaceId/boards
// @access  Private (User must be a member of the workspace)
// --- RENAMED function ---
const getBoardsByWorkspace = async (req, res) => {
    const { workspaceId } = req.params;
    const userId = req.user._id;

    try {
        // Check for workspace and auth
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found.' });
        }
        const isMember = workspace.members.some(member => member.user.equals(userId));
        if (!isMember) {
            return res.status(403).json({ message: 'Not authorized for this workspace.' });
        }

        // Find boards
        const boards = await Board.find({ workspace: workspaceId });
        res.status(200).json(boards);

    } catch (error) {
        console.error('Error fetching boards:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};


// --- NEW FUNCTION ---
// @desc    Get a single board by its ID
// @route   GET /api/workspaces/:workspaceId/boards/:boardId
// @access  Private (User must be member of the workspace it belongs to)
const getBoardById = async (req, res) => {
    const { boardId, workspaceId } = req.params; // Get both IDs from route
    const userId = req.user._id;

     if (!mongoose.Types.ObjectId.isValid(boardId) || !mongoose.Types.ObjectId.isValid(workspaceId)) {
        return res.status(400).json({ message: 'Invalid Board or Workspace ID format.' });
    }

    try {
        const board = await Board.findById(boardId)
                                 .populate({
                                     path: 'workspace', // Populate the workspace
                                     select: 'members name owner' // Select specific fields needed for auth check
                                 });
                                 // We don't populate columns/tasks here; client can fetch tasks separately

        if (!board) {
            return res.status(404).json({ message: 'Board not found.' });
        }
        // Double-check workspace ID matches the route
        if (!board.workspace || !board.workspace._id.equals(workspaceId)) {
             console.warn(`Board ${boardId} workspace mismatch or not populated. Route WID: ${workspaceId}`);
             return res.status(404).json({ message: 'Board not found in the specified workspace.' });
        }

        // Authorization check: User must be a member of the board's workspace
        const isMember = board.workspace.members.some(member => member.user.equals(userId));
        if (!isMember) {
            return res.status(403).json({ message: 'Not authorized to access this board.' });
        }

        // Return the board (without workspace populated if not needed, or select fields)
        // Let's return the full board object as fetched for now
        res.status(200).json(board);

    } catch (error) {
        console.error(`Error fetching board by ID (${boardId}):`, error);
         if (error.name === 'CastError') {
             return res.status(404).json({ message: 'Board or Workspace ID format is invalid.' });
         }
        res.status(500).json({ message: 'Server error fetching board.' });
    }
};
// --- END NEW FUNCTION ---


// Make sure all required functions are exported
export { createBoard, getBoardsByWorkspace, getBoardById };

