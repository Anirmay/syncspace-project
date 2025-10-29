import Workspace from '../models/Workspace.js';
import User from '../models/User.js'; // Needed for email invites
import mongoose from 'mongoose';
import nodemailer from 'nodemailer'; // Needed for email invites
import dotenv from 'dotenv'; // Needed for email invites

dotenv.config(); // Load environment variables

// @desc    Create a new workspace
// @route   POST /api/workspaces
// @access  Private
const createWorkspace = async (req, res) => {
    const { name, description, membersToInvite } = req.body;
    const userId = req.user._id; // Get user ID from protect middleware

    if (!name) {
        return res.status(400).json({ message: 'Workspace name is required.' });
    }

    try {
        // --- 1. Create the Workspace Document ---
        const workspace = new Workspace({
            name,
            description: description || '',
            owner: userId,
            // Owner is automatically added as admin member via pre-save hook
        });

        // --- 2. Add Invited Members (if any) ---
        const validMemberIds = [];
        if (membersToInvite && Array.isArray(membersToInvite) && membersToInvite.length > 0) {
            membersToInvite.forEach(id => {
                if (mongoose.Types.ObjectId.isValid(id) && !workspace.members.some(m => m.user.equals(id))) {
                    workspace.members.push({ user: id, role: 'Member' });
                    validMemberIds.push(id);
                } else {
                    console.warn(`Invalid or duplicate member ID skipped: ${id}`);
                }
            });
        }

        // --- 3. Save the Workspace ---
        const createdWorkspace = await workspace.save();

        // --- 4. Send Invitation Emails (Asynchronous) ---
        if (validMemberIds.length > 0) {
            const invitedUsers = await User.find({ '_id': { $in: validMemberIds } }).select('email username');

            if (invitedUsers.length > 0) {
                const transporter = nodemailer.createTransport({
                    host: process.env.EMAIL_HOST,
                    port: parseInt(process.env.EMAIL_PORT || '465', 10),
                    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS,
                    },
                });

                 const inviter = await User.findById(userId).select('username');
                 const inviterName = inviter ? inviter.username : 'Someone';

                invitedUsers.forEach(user => {
                    const mailOptions = {
                        from: `"SyncSpace Invites" <${process.env.EMAIL_USER}>`,
                        to: user.email,
                        subject: `You're invited to join the '${createdWorkspace.name}' workspace on SyncSpace!`,
                        text: `Hi ${user.username},\n\n${inviterName} has invited you to collaborate in the workspace "${createdWorkspace.name}" on SyncSpace.\n\nJoin now by logging in or signing up!\n\nThanks,\nThe SyncSpace Team`,
                        html: `<p>Hi ${user.username},</p><p><strong>${inviterName}</strong> has invited you to collaborate in the workspace "<strong>${createdWorkspace.name}</strong>" on SyncSpace.</p><p>Join now by logging in or signing up!</p><br><p>Thanks,</p><p>The SyncSpace Team</p>`,
                    };

                    transporter.sendMail(mailOptions).then(info => {
                        console.log(`Invitation email sent to ${user.email}. Message ID: ${info.messageId}`);
                    }).catch(err => {
                        console.error(`Error sending invitation email to ${user.email}:`, err);
                    });
                });
            } else {
                 console.warn("Could not find user details for invited IDs:", validMemberIds);
            }
        }

        // --- 5. Send Response ---
        res.status(201).json(createdWorkspace);

    } catch (error) {
        console.error('Error creating workspace:', error);
        res.status(500).json({ message: 'Server error creating workspace.' });
    }
};



// @desc    Get workspaces for the logged-in user
// @route   GET /api/workspaces/my
// @access  Private
const getMyWorkspaces = async (req, res) => {
    try {
        const workspaces = await Workspace.find({ 'members.user': req.user._id })
                                        .populate('owner', 'username email') // Populate owner details
                                        .populate('members.user', 'username email') // Populate member details
                                        .sort({ status: 1, createdAt: -1 }); // Sort active first, then by date
        res.status(200).json(workspaces);
    } catch (error) {
        console.error('Error fetching workspaces:', error);
        res.status(500).json({ message: 'Server error fetching workspaces.' });
    }
};

// @desc    Get a single workspace by ID
// @route   GET /api/workspaces/:workspaceId
// @access  Private (User must be a member)
const getWorkspaceById = async (req, res) => {
    // --- FIX: Use workspaceId ---
    const { workspaceId } = req.params;
    // --- END FIX ---

    try {
        // --- FIX: Use workspaceId ---
        if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
             return res.status(400).json({ message: 'Invalid Workspace ID format.' });
        }
        // --- END FIX ---

        // --- FIX: Use workspaceId ---
        const workspace = await Workspace.findById(workspaceId)
                                     .populate('owner', 'username email _id') // Ensure ID is populated
                                     .populate('members.user', 'username email _id'); // Ensure ID is populated
        // --- END FIX ---

        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found.' });
        }

        // Authorization check: Ensure the requesting user is a member
        const isMember = workspace.members.some(member => member.user._id.equals(req.user._id));
        if (!isMember) {
            // Check if owner is trying to access (should be included in members via pre-save hook)
             if (!workspace.owner._id.equals(req.user._id)) {
                return res.status(403).json({ message: 'Not authorized to access this workspace.' });
             }
        }

        res.status(200).json(workspace);
    } catch (error) {
        console.error('Error fetching workspace by ID:', error);
         if (error.name === 'CastError') {
             return res.status(400).json({ message: 'Invalid Workspace ID format.' }); // Return 400 for CastError too
         }
        res.status(500).json({ message: 'Server error fetching workspace.' });
    }
};


// @desc    Update workspace status (active/archived)
// @route   PATCH /api/workspaces/:workspaceId/status
// @access  Private (User must be member)
const updateWorkspaceStatus = async (req, res) => {
    const { status } = req.body;
    // --- FIX: Use workspaceId ---
    const { workspaceId } = req.params;
    // --- END FIX ---
    const userId = req.user._id;

    if (!status || !['active', 'archived'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status provided. Must be "active" or "archived".' });
    }
    // --- FIX: Use workspaceId ---
    if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
        return res.status(400).json({ message: 'Invalid Workspace ID format.' });
    }
    // --- END FIX ---

    try {
        // --- FIX: Use workspaceId ---
        const workspace = await Workspace.findById(workspaceId);
        // --- END FIX ---

        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found.' });
        }

        // Authorization: Ensure user is a member (or maybe only owner/admin?)
        const isMember = workspace.members.some(member => member.user.equals(userId));
        if (!isMember) {
            return res.status(403).json({ message: 'Not authorized to modify this workspace.' });
        }

        workspace.status = status;
        const updatedWorkspace = await workspace.save();
        
        // Populate owner details before sending back for consistency
        await updatedWorkspace.populate('owner', 'username email');
        await updatedWorkspace.populate('members.user', 'username email');

        res.status(200).json(updatedWorkspace);

    } catch (error) {
        console.error('Error updating workspace status:', error);
         if (error.name === 'CastError') {
             return res.status(400).json({ message: 'Invalid Workspace ID format.' });
         }
        res.status(500).json({ message: 'Server error updating workspace status.' });
    }
};


// Update exports
export { createWorkspace, getMyWorkspaces, getWorkspaceById, updateWorkspaceStatus };
