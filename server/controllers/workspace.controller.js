    import Workspace from '../models/Workspace.js';
    import mongoose from 'mongoose';

    // @desc    Create a new workspace
    // @route   POST /api/workspaces
    // @access  Private
    const createWorkspace = async (req, res) => {
        const { name } = req.body;
        const userId = req.user._id; // Get user ID from protect middleware

        if (!name) {
            return res.status(400).json({ message: 'Workspace name is required.' });
        }

        try {
            const workspace = new Workspace({
                name,
                owner: userId,
                // Owner is automatically added as admin member via pre-save hook in model
            });

            const createdWorkspace = await workspace.save();
            res.status(201).json(createdWorkspace);
        } catch (error) {
            console.error('Error creating workspace:', error);
            res.status(500).json({ message: 'Server error creating workspace.' });
        }
    };

    // @desc    Get workspaces for the logged-in user
    // @route   GET /api/workspaces
    // @access  Private
    const getMyWorkspaces = async (req, res) => {
        try {
            // Find workspaces where the user is listed as a member
            const workspaces = await Workspace.find({ 'members.user': req.user._id })
                                               .populate('owner', 'username email') // Optionally populate owner info
                                               .sort({ createdAt: -1 }); // Show newest first
            res.status(200).json(workspaces);
        } catch (error) {
            console.error('Error fetching workspaces:', error);
            res.status(500).json({ message: 'Server error fetching workspaces.' });
        }
    };

    // @desc    Get a single workspace by ID
    // @route   GET /api/workspaces/:id
    // @access  Private (User must be a member)
    const getWorkspaceById = async (req, res) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                 return res.status(400).json({ message: 'Invalid Workspace ID format.' });
            }

            const workspace = await Workspace.findById(req.params.id)
                                             .populate('owner', 'username email')
                                             .populate('members.user', 'username email'); // Populate member details

            if (!workspace) {
                return res.status(404).json({ message: 'Workspace not found.' });
            }

            // Authorization check: Ensure the requesting user is a member of the workspace
            const isMember = workspace.members.some(member => member.user._id.equals(req.user._id));
            if (!isMember) {
                return res.status(403).json({ message: 'Not authorized to access this workspace.' });
            }

            res.status(200).json(workspace);
        } catch (error) {
            console.error('Error fetching workspace by ID:', error);
            // Handle CastError specifically if ID format is valid but not found during population/query
             if (error.name === 'CastError') {
                 return res.status(404).json({ message: 'Workspace not found.' });
             }
            res.status(500).json({ message: 'Server error fetching workspace.' });
        }
    };


    export { createWorkspace, getMyWorkspaces, getWorkspaceById };
    
