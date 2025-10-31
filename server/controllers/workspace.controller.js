import Workspace from '../models/Workspace.js';
import User from '../models/User.js'; // Needed for email invites
import Invitation from '../models/Invitation.js';
import Notification from '../models/Notification.js';
import Board from '../models/Board.js'; // --- ADDED: Needed for cascade delete
import Task from '../models/Task.js';   // --- ADDED: Needed for cascade delete
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

        // --- 2. Collect Invited Members (if any) ---
        // Note: Do NOT add invited users directly to workspace.members here. We should
        // create Invitation documents instead so users must accept before being added.
        const validMemberIds = [];
        if (membersToInvite && Array.isArray(membersToInvite) && membersToInvite.length > 0) {
            membersToInvite.forEach(id => {
                if (mongoose.Types.ObjectId.isValid(id) && !validMemberIds.includes(id)) {
                    validMemberIds.push(id);
                } else {
                    console.warn(`Invalid or duplicate invited ID skipped: ${id}`);
                }
            });
        }

        // --- 3. Save the Workspace ---
        const createdWorkspace = await workspace.save();

        // --- 4. Create Invitation documents for invited users and send emails ---
        if (validMemberIds.length > 0) {
            const invitedUsers = await User.find({ '_id': { $in: validMemberIds } }).select('email username');
            if (invitedUsers.length > 0) {
                const transporter = nodemailer.createTransport({
                    host: process.env.EMAIL_HOST,
                    port: parseInt(process.env.EMAIL_PORT || '465', 10),
                    secure: process.env.EMAIL_SECURE === 'true',
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS,
                    },
                });

                const inviter = await User.findById(userId).select('username email');
                const inviterName = inviter ? inviter.username : 'Someone';

                // Create invitations for each invited user (if not already pending)
                for (const user of invitedUsers) {
                    try {
                        // Avoid duplicate pending invites
                        const existing = await Invitation.findOne({ workspace: createdWorkspace._id, inviteeEmail: user.email.toLowerCase(), status: 'pending' });
                        if (existing) continue;

                        const newInvite = new Invitation({
                            workspace: createdWorkspace._id,
                            inviter: userId,
                            inviteeEmail: user.email.toLowerCase(),
                            inviteeUser: user._id,
                            status: 'pending'
                        });
                        await newInvite.save();

                        // Send email (fire and forget)
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
                    } catch (invErr) {
                        console.error('Error creating invitation for user', user._id, invErr);
                    }
                }
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

        // Robust authorization check: ensure the requesting user is a member or the owner
        const reqUserIdStr = req.user._id.toString();
        const isMember = workspace.members.some(member => {
            const mId = member.user?._id ? member.user._id.toString() : (member.user ? member.user.toString() : null);
            return mId === reqUserIdStr;
        });
        if (!isMember) {
            const ownerIdStr = workspace.owner?._id ? workspace.owner._id.toString() : (workspace.owner ? workspace.owner.toString() : null);
            if (ownerIdStr !== reqUserIdStr) {
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
        const isMember = workspace.members.some(member => {
            const mId = member.user?._id ? member.user._id.toString() : (member.user ? member.user.toString() : null);
            return mId === userId.toString();
        });
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
const getManagedWorkspaces = async (req, res) => {
    try {
        const userId = req.user._id;

        // Find workspaces where the user is the owner OR is a member with the 'Admin' role
        const workspaces = await Workspace.find({
            $or: [
                { owner: userId },
                { members: { $elemMatch: { user: userId, role: 'Admin' } } }
            ]
        })
        .populate('owner', 'username') // Populate owner username
        .sort({ createdAt: -1 });

        res.status(200).json(workspaces);
    } catch (error) {
        console.error('Error fetching managed workspaces:', error);
        res.status(500).json({ message: 'Server error fetching managed workspaces.' });
    }
};
const deleteWorkspace = async (req, res) => {
    const { workspaceId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
        return res.status(400).json({ message: 'Invalid Workspace ID format.' });
    }

    try {
        const workspace = await Workspace.findById(workspaceId);

        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found.' });
        }

        // --- AUTHORIZATION: Only the owner can delete ---
        if (!workspace.owner.equals(userId)) {
            return res.status(403).json({ message: 'Not authorized. Only the workspace owner can delete.' });
        }

        // --- CASCADE DELETE ---

        // 1. Find all boards in this workspace
        const boards = await Board.find({ workspace: workspaceId });
        const boardIds = boards.map(board => board._id);

        // 2. Delete all tasks associated with those boards
        if (boardIds.length > 0) {
            await Task.deleteMany({ board: { $in: boardIds } });
            console.log(`Deleted tasks for ${boardIds.length} boards.`);
        }

        // 3. Delete all boards in this workspace
        await Board.deleteMany({ workspace: workspaceId });
        console.log(`Deleted ${boardIds.length} boards.`);

        // 4. Delete the workspace itself
        await Workspace.findByIdAndDelete(workspaceId);

        res.status(200).json({ message: 'Workspace and all associated boards/tasks deleted successfully.' });

    } catch (error) {
        console.error('Error deleting workspace:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid Workspace ID format.' });
        }
        res.status(500).json({ message: 'Server error deleting workspace.' });
    }
};
// --- END NEW FUNCTION ---

// --- NEW FUNCTION ---
// @desc    Get members of a specific workspace
// @route   GET /api/workspaces/:workspaceId/members
// @access  Private (User must be member)
const getWorkspaceMembers = async (req, res) => {
    const { workspaceId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
        return res.status(400).json({ message: 'Invalid Workspace ID format.' });
    }

    try {
        const workspace = await Workspace.findById(workspaceId)
                                     .populate('members.user', 'username email _id'); // Populate member details

        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found.' });
        }

        // Authorization check: Ensure the requesting user is a member
        const isMember = workspace.members.some(member => member.user._id.equals(userId));
         if (!isMember && !workspace.owner.equals(userId)) { // Allow owner even if not explicitly in members list (should be though)
             return res.status(403).json({ message: 'Not authorized to access this workspace members.' });
         }

        res.status(200).json(workspace.members); // Return only the members array

    } catch (error) {
        console.error('Error fetching workspace members:', error);
         if (error.name === 'CastError') {
             return res.status(400).json({ message: 'Invalid Workspace ID format.' });
         }
        res.status(500).json({ message: 'Server error fetching members.' });
    }
};
// --- END NEW FUNCTION ---

const removeMemberFromWorkspace = async (req, res) => {
    const { workspaceId, memberUserId } = req.params;
    const currentUserId = req.user._id; // The user making the request

    if (!mongoose.Types.ObjectId.isValid(workspaceId) || !mongoose.Types.ObjectId.isValid(memberUserId)) {
        return res.status(400).json({ message: 'Invalid Workspace or User ID format.' });
    }

    try {
        const workspace = await Workspace.findById(workspaceId);

        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found.' });
        }

        // --- AUTHORIZATION: Allow owner or Admin members to remove non-owner members ---
        const ownerIdStr = workspace.owner?._id ? workspace.owner._id.toString() : (workspace.owner ? workspace.owner.toString() : null);
        const isOwner = ownerIdStr === currentUserId.toString();
        const isAdminMember = workspace.members.some(m => {
            const memberUserId = m.user?._id ? m.user._id.toString() : (m.user ? m.user.toString() : null);
            return memberUserId === currentUserId.toString() && m.role === 'Admin';
        });
        if (!isOwner && !isAdminMember) {
            return res.status(403).json({ message: 'Not authorized. Only the workspace owner or an Admin may remove members.' });
        }
        
        // --- LOGIC: Prevent owner from removing themselves ---
        const ownerIsMember = (workspace.owner?._id ? workspace.owner._id.toString() : (workspace.owner ? workspace.owner.toString() : null)) === memberUserId.toString();
        if (ownerIsMember) {
            return res.status(400).json({ message: 'Cannot remove the workspace owner.' });
        }

        // Check if the user is actually a member
        const memberIndex = workspace.members.findIndex(member => {
            const mId = member.user?._id ? member.user._id.toString() : (member.user ? member.user.toString() : null);
            return mId === memberUserId.toString();
        });

        if (memberIndex === -1) {
            return res.status(404).json({ message: 'Member not found in this workspace.' });
        }

        // Remove the member from the array
        workspace.members.splice(memberIndex, 1);
        
        await workspace.save();

        // Also remove any existing invitations for this user to keep Invitation Status consistent
        try {
            const userRecord = await User.findById(memberUserId).select('email');
            const email = userRecord?.email?.toLowerCase() || null;
            const deleteQuery = {
                workspace: workspaceId,
                $or: []
            };
            if (memberUserId) deleteQuery.$or.push({ inviteeUser: memberUserId });
            if (email) deleteQuery.$or.push({ inviteeEmail: email });
            if (deleteQuery.$or.length > 0) {
                await Invitation.deleteMany(deleteQuery);
            }
            // Create an in-app notification for the removed user to inform them
            try {
                if (memberUserId) {
                    // Find removed user's id/email for message and admin name
                    const removedUser = await User.findById(memberUserId).select('username email');
                    const removedUsername = removedUser?.username || removedUser?.email || 'A user';
                    // Fetch admin name (actor) if not present on req.user
                    let adminName = req.user?.username;
                    try {
                        if (!adminName) {
                            const adminRec = await User.findById(currentUserId).select('username email');
                            adminName = adminRec?.username || adminRec?.email || 'A manager';
                        }
                    } catch (e) {
                        console.warn('Could not fetch admin user for notification name:', e);
                        adminName = adminName || 'A manager';
                    }

                    const notifPayload = {
                        user: memberUserId,
                        actor: currentUserId,
                        type: 'removed_from_workspace',
                        message: `You were removed from the workspace \"${workspace.name}\" by ${adminName}.`,
                        link: `/`, // landing link; user no longer has access to workspace
                    };
                    if (removedUser?.email) notifPayload.inviteeEmail = removedUser.email.toLowerCase();

                    console.log('Creating removal notification with payload:', notifPayload);
                    const notif = await Notification.create(notifPayload);
                    console.log('Notification created (removed_from_workspace):', { id: notif._id.toString(), user: notif.user, inviteeEmail: notif.inviteeEmail });
                }
            } catch (notifErr) {
                console.error('Error creating removal notification for user:', notifErr);
            }
        } catch (invDelErr) {
            console.error('Error deleting related invitations after member removal:', invDelErr);
        }

        res.status(200).json({ message: 'Member removed successfully.' });

    } catch (error) {
        console.error('Error removing member:', error);
        res.status(500).json({ message: 'Server error removing member.' });
    }
};



// Update exports
export {
    createWorkspace,
    getMyWorkspaces,
    getWorkspaceById,
    updateWorkspaceStatus,
    deleteWorkspace, // --- ADDED: Export the new function
    getManagedWorkspaces,
    getWorkspaceMembers,
    removeMemberFromWorkspace
};