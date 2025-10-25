import Task from '../models/Task.js';
import Board from '../models/Board.js'; // Need Board to update task arrays
import Workspace from '../models/Workspace.js'; // To check membership
import mongoose from 'mongoose';

// @desc    Create a new task in a specific column
// @route   POST /api/boards/:boardId/columns/:columnId/tasks
// @access  Private (User must be member of workspace)
const createTask = async (req, res) => {
    const { title, description, assignedTo } = req.body;
    const { boardId, columnId } = req.params;
    const userId = req.user._id;

    if (!title) {
        return res.status(400).json({ message: 'Task title is required.' });
    }
    if (!mongoose.Types.ObjectId.isValid(boardId) || !mongoose.Types.ObjectId.isValid(columnId)) {
        return res.status(400).json({ message: 'Invalid Board or Column ID format.' });
    }

    try {
        // Find the board and check if the column exists and if the user is authorized
        const board = await Board.findById(boardId).populate({
             path: 'workspace',
             select: 'members' // Select only members field from workspace
        });

        if (!board) {
            return res.status(404).json({ message: 'Board not found.' });
        }

        // Authorization check: User must be a member of the workspace
        const isMember = board.workspace.members.some(member => member.user.equals(userId));
        if (!isMember) {
            return res.status(403).json({ message: 'Not authorized for this workspace.' });
        }

        const column = board.columns.id(columnId); // Find subdocument by ID
        if (!column) {
            return res.status(404).json({ message: 'Column not found on this board.' });
        }

        // Create the new task
        const newTask = new Task({
            title,
            description,
            assignedTo: assignedTo || null, // Allow null assignment
            board: boardId,
            column: columnId, // Assign column ID
        });

        const createdTask = await newTask.save();

        // Add the task's ID to the corresponding column's tasks array
        column.tasks.push(createdTask._id);
        await board.save(); // Save the parent board document

        res.status(201).json(createdTask);

    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ message: 'Server error creating task.' });
    }
};


// @desc    Get all tasks for a specific board
// @route   GET /api/boards/:boardId/tasks
// @access  Private (User must be member of workspace)
const getTasksByBoard = async (req, res) => {
    const { boardId } = req.params;
    const userId = req.user._id;

     if (!mongoose.Types.ObjectId.isValid(boardId)) {
        return res.status(400).json({ message: 'Invalid Board ID format.' });
    }

    try {
         // Find the board first to check authorization
        const board = await Board.findById(boardId).populate({
             path: 'workspace',
             select: 'members'
        });

         if (!board) {
            return res.status(404).json({ message: 'Board not found.' });
        }

         // Authorization check
        const isMember = board.workspace.members.some(member => member.user.equals(userId));
        if (!isMember) {
            return res.status(403).json({ message: 'Not authorized for this workspace.' });
        }

        // Find all tasks associated with this board
        const tasks = await Task.find({ board: boardId })
                                .populate('assignedTo', 'username email') // Populate assignee details
                                .sort({ createdAt: 1 }); // Or sort as needed

        res.status(200).json(tasks);

    } catch (error) {
        console.error('Error fetching tasks by board:', error);
        res.status(500).json({ message: 'Server error fetching tasks.' });
    }
};


// --- NEW: Move Task Function ---
// @desc    Move a task to a new column and/or position
// @route   PATCH /api/tasks/:taskId/move
// @access  Private (User must be member of workspace)
const moveTask = async (req, res) => {
    const { taskId } = req.params;
    const { newColumnId, newIndex, sourceColumnId } = req.body; // Get data from frontend
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(taskId) || !mongoose.Types.ObjectId.isValid(newColumnId) || !mongoose.Types.ObjectId.isValid(sourceColumnId)) {
        return res.status(400).json({ message: 'Invalid Task or Column ID format.' });
    }
    if (typeof newIndex !== 'number' || newIndex < 0) {
         return res.status(400).json({ message: 'Invalid new index provided.' });
    }

    try {
        // --- Authorization and Validation ---
        // 1. Find the task to get its board and workspace
        const task = await Task.findById(taskId).populate({
            path: 'board',
            populate: { path: 'workspace', select: 'members' } // Populate workspace members via board
        });

        if (!task) {
            return res.status(404).json({ message: 'Task not found.' });
        }
        if (!task.board || !task.board.workspace) {
             return res.status(404).json({ message: 'Board or Workspace associated with task not found.' });
        }

        // 2. Check if user is a member of the workspace
        const isMember = task.board.workspace.members.some(member => member.user.equals(userId));
        if (!isMember) {
            return res.status(403).json({ message: 'Not authorized for this workspace.' });
        }

        // 3. Find the board document containing the columns
        const board = await Board.findById(task.board._id);
        if (!board) {
            return res.status(404).json({ message: 'Board not found.' });
        }

        // --- Update Logic ---
        // 4. Update the task's column field
        task.column = newColumnId;
        await task.save();

        // 5. Update the columns' task arrays within the Board document
        // Remove task ID from the source column's tasks array
        const sourceCol = board.columns.id(sourceColumnId);
        if (sourceCol) {
            sourceCol.tasks.pull(taskId); // Mongoose pull method to remove item
        } else {
             console.warn(`Source column ${sourceColumnId} not found during move operation.`);
             // Decide if this should be an error or just a warning
        }


        // Add task ID to the destination column's tasks array at the correct index
        const destCol = board.columns.id(newColumnId);
        if (destCol) {
            // Ensure index is within bounds
            const finalIndex = Math.min(newIndex, destCol.tasks.length);
             // Use $position with $each for inserting at specific index
            destCol.tasks.splice(finalIndex, 0, taskId);
            // Mongoose $push with $position is another way:
            // destCol.tasks.push({ $each: [taskId], $position: finalIndex });
        } else {
             console.error(`Destination column ${newColumnId} not found during move operation.`);
             // This is likely a critical error, maybe revert task.column update?
             return res.status(404).json({ message: 'Destination column not found.' });
        }

        // 6. Save the updated board document
        await board.save();

        res.status(200).json({ message: 'Task moved successfully', task }); // Send back updated task

    } catch (error) {
        console.error('Error moving task:', error);
        res.status(500).json({ message: 'Server error moving task.' });
    }
};


// Don't forget to export the new function
export { createTask, getTasksByBoard, moveTask };



