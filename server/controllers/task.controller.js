import Task from '../models/Task.js';
import Board from '../models/Board.js'; // Need Board to update task arrays
import Workspace from '../models/Workspace.js'; // To check membership
import mongoose from 'mongoose';

// @desc    Create a new task in a specific column
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
    // Get IDs from body now
    const { title, description, assignedTo, boardId, columnId, workspaceId, startDate } = req.body;
    const userId = req.user._id;

    if (!title) {
        return res.status(400).json({ message: 'Task title is required.' });
    }
    // Validate IDs from body
    if (!boardId || !columnId || !workspaceId ||
        !mongoose.Types.ObjectId.isValid(boardId) ||
        !mongoose.Types.ObjectId.isValid(columnId) ||
        !mongoose.Types.ObjectId.isValid(workspaceId)
    ) {
        return res.status(400).json({ message: 'Invalid Board, Column, or Workspace ID format provided.' });
    }

    try {
        // --- Authorization Check (Simplified: Check workspace membership) ---
        // You might want a more granular check depending on your roles/permissions
        const workspace = await Workspace.findById(workspaceId).select('members');
        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found.' });
        }
        const isMember = workspace.members.some(member => member.user.equals(userId));
         if (!isMember) {
            return res.status(403).json({ message: 'Not authorized for this workspace.' });
         }
         // --- End Auth Check ---


        // Find the board and the specific column
        const board = await Board.findById(boardId);
        if (!board) {
            return res.status(404).json({ message: 'Board not found.' });
        }
        // Ensure the board belongs to the specified workspace (optional but good practice)
        if (!board.workspace.equals(workspaceId)) {
            return res.status(400).json({ message: 'Board does not belong to the specified workspace.' });
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
            column: columnId,
            workspace: workspaceId, // Store workspace ID on the task as well
            status: 'todo', // Default status for new tasks
            startDate: startDate || new Date()
        });

        const createdTask = await newTask.save();

        // Add the task's ID to the BEGINNING of the column's tasks array
        column.tasks.unshift(createdTask._id); // Use unshift to add to top
        await board.save(); // Save the parent board document

        // Populate the assignedTo field before sending
        const populatedTask = await Task.findById(createdTask._id)
            .populate('assignedTo', 'username email');

        res.status(201).json(populatedTask); // Send back the populated task

    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ message: 'Server error creating task.' });
    }
};


// @desc    Get all tasks for a specific board
// @route   GET /api/workspaces/:workspaceId/boards/:boardId/tasks
// @access  Private
// NOTE: This route seems specific to the nested structure, keep it if used elsewhere,
// but the main task fetching might happen via workspace now.
const getTasksByBoard = async (req, res) => {
    // ... (keep existing getTasksByBoard logic if needed) ...
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


// @desc    Move a task to a new column and/or position
// @route   PATCH /api/tasks/:taskId/move
// @access  Private
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
        const task = await Task.findById(taskId).populate({
            path: 'board', // Populate board...
             select: 'workspace', // ... only need workspace ID from board ...
            populate: { path: 'workspace', select: 'members' } // ... then populate members from workspace
        });

        if (!task) {
            return res.status(404).json({ message: 'Task not found.' });
        }
        if (!task.board || !task.board.workspace) {
            return res.status(404).json({ message: 'Board or Workspace associated with task not found.' });
        }

        const isMember = task.board.workspace.members.some(member => member.user.equals(userId));
        if (!isMember) {
            return res.status(403).json({ message: 'Not authorized for this workspace.' });
        }

        const board = await Board.findById(task.board._id); // Fetch the full board separately now
        if (!board) {
            return res.status(404).json({ message: 'Board not found.' });
        }

        // --- Update Logic ---
        task.column = newColumnId;
        // Update task status based on column name
        const destColForStatus = board.columns.id(newColumnId);
        let newStatus = task.status; // Default to current status
        if (destColForStatus) {
            const colName = destColForStatus.name.toLowerCase();
            if (colName.includes('to do')) newStatus = 'todo';
            else if (colName.includes('in progress')) newStatus = 'inprogress';
            else if (colName.includes('done')) {
                newStatus = 'done';
                if (task.status !== 'done') { // Only set endDate if it wasn't already done
                   task.endDate = new Date(); 
                }
            }
        }
        task.status = newStatus; // Apply the determined status
        await task.save();

        // Remove task ID from the source column's tasks array
        const sourceCol = board.columns.id(sourceColumnId);
        if (sourceCol) {
            sourceCol.tasks.pull(taskId); // Mongoose pull method to remove item
        }

        // Add task ID to the destination column's tasks array at the correct index
        const destCol = board.columns.id(newColumnId);
        if (destCol) {
            // Ensure task isn't already there (shouldn't happen with pull above, but good safeguard)
            if (!destCol.tasks.includes(taskId)) {
               const finalIndex = Math.min(newIndex, destCol.tasks.length);
               destCol.tasks.splice(finalIndex, 0, taskId);
            }
        } else {
            // This case should ideally not happen if validation passed, but handle defensively
            console.error(`Destination column ${newColumnId} not found on board ${board._id} during move.`);
            // Don't save board if destCol is invalid, but task column ID was already updated.
            // Consider reverting task.column here or adding more robust transaction logic.
            // For now, just return an error.
            return res.status(404).json({ message: 'Destination column not found on board.' });
        }

        await board.save();
        
        // Repopulate task to send back
        const populatedTask = await Task.findById(task._id).populate('assignedTo', 'username email');

        res.status(200).json({ message: 'Task moved successfully', task: populatedTask }); // Send back updated task

    } catch (error) {
        console.error('Error moving task:', error);
        res.status(500).json({ message: 'Server error moving task.' });
    }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:taskId
// @access  Private
const deleteTask = async (req, res) => {
    // ... (keep existing deleteTask logic) ...
     const { taskId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
        return res.status(400).json({ message: 'Invalid Task ID.' });
    }

    try {
        const task = await Task.findById(taskId).populate({
            path: 'board', // Populate board...
            select: 'workspace', // ... only need workspace ID from board ...
            populate: { path: 'workspace', select: 'members' } // ... then populate members from workspace
        });


        if (!task) {
            return res.status(404).json({ message: 'Task not found.' });
        }

        // Authorization check
        const isMember = task.board?.workspace?.members.some(m => m.user.equals(userId));
        if (!isMember) {
            return res.status(403).json({ message: 'Not authorized.' });
        }

        // Remove task from its column
        const board = await Board.findById(task.board._id); // Fetch full board
        if (board) {
            const column = board.columns.id(task.column);
            if (column) {
                column.tasks.pull(taskId);
                await board.save();
            }
        } else {
             console.warn(`Board ${task.board._id} not found when deleting task ${taskId}. Skipping board update.`);
        }


        // Delete the task
        await Task.findByIdAndDelete(taskId); // Use findByIdAndDelete

        res.status(200).json({ message: 'Task deleted successfully.' });

    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

// @desc    Update task details (title, description)
// @route   PATCH /api/tasks/:taskId
// @access  Private
const updateTaskDetails = async (req, res) => {
    const { taskId } = req.params;
    const { title, description } = req.body; // Only handle title/desc for now
    const userId = req.user._id;

    if (title !== undefined && typeof title === 'string' && !title.trim()) {
        return res.status(400).json({ message: 'Task title cannot be empty.' });
    }
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
        return res.status(400).json({ message: 'Invalid Task ID format.' });
    }

    try {
        const task = await Task.findById(taskId).populate({
             path: 'board', // Populate board...
             select: 'workspace', // ... only need workspace ID from board ...
             populate: { path: 'workspace', select: 'members' } // ... then populate members from workspace
        });

        if (!task) {
            return res.status(404).json({ message: 'Task not found.' });
        }

        const isMember = task.board?.workspace?.members.some(m => m.user.equals(userId));
        if (!isMember) {
            return res.status(403).json({ message: 'Not authorized.' });
        }

        // --- Update task fields ---
        let needsBoardUpdate = false;
        let originalColumnId = task.column; // Keep track if it changes
        let newColumnId = null;

        if (title !== undefined) {
            task.title = title.trim();
        }
        if (description !== undefined) {
            task.description = description; // Allow empty string
        }

        // --- NEW LOGIC: Move to "In Progress" if edited while "To Do" ---
        if ((title !== undefined || description !== undefined) && task.status === 'todo') {
             // Find the "In Progress" column on the task's board
             const board = await Board.findById(task.board._id);
             if (board) {
                 const inProgressColumn = board.columns.find(col => col.name.toLowerCase().includes('in progress'));
                 if (inProgressColumn && !task.column.equals(inProgressColumn._id)) {
                     console.log(`Task ${taskId} was 'todo', moving to 'In Progress' column ${inProgressColumn._id}`);
                     newColumnId = inProgressColumn._id; // Mark for board update
                     task.column = inProgressColumn._id;
                     task.status = 'inprogress';
                     needsBoardUpdate = true;
                 } else if (inProgressColumn) {
                      // Already in the correct column, just update status
                      task.status = 'inprogress';
                 } else {
                     console.warn(`Could not find 'In Progress' column on board ${board._id} to move task ${taskId}.`);
                     // Decide fallback: Keep in 'todo' or set status to 'inprogress' anyway?
                     task.status = 'inprogress'; // Let's set status even if column not found
                 }
             } else {
                  console.warn(`Board ${task.board._id} not found when trying to move task ${taskId} to In Progress.`);
                  task.status = 'inprogress'; // Update status anyway
             }
        }
        // --- END NEW LOGIC ---

        const updatedTask = await task.save();

        // --- Update Board Column Arrays IF task moved ---
        if (needsBoardUpdate && newColumnId && !originalColumnId.equals(newColumnId)) {
            const boardToUpdate = await Board.findById(task.board._id);
            if (boardToUpdate) {
                const sourceCol = boardToUpdate.columns.id(originalColumnId);
                const destCol = boardToUpdate.columns.id(newColumnId);
                
                if (sourceCol) {
                    sourceCol.tasks.pull(taskId);
                }
                if (destCol && !destCol.tasks.includes(taskId)) { // Add only if not already present
                    // Add to beginning of 'In Progress'
                    destCol.tasks.unshift(taskId); 
                }
                
                // Save board only if columns were found and modified
                if (sourceCol || destCol) {
                   await boardToUpdate.save();
                   console.log(`Updated board ${boardToUpdate._id} column arrays for task ${taskId} move.`);
                }
            } else {
                 console.error(`Board ${task.board._id} not found for column array update after task edit.`);
            }
        }
        // --- End Board Update Logic ---

        // Repopulate before sending back
        const populatedTask = await Task.findById(updatedTask._id)
            .populate('assignedTo', 'username email');

        res.status(200).json(populatedTask);

    } catch (error) {
        console.error('Error updating task details:', error);
        res.status(500).json({ message: 'Server error updating task.' });
    }
};


// Make sure all functions are exported
export {
    createTask,
    getTasksByBoard,
    moveTask,
    deleteTask,
    updateTaskDetails
};

