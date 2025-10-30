import Invitation from '../models/Invitation.js';
import Workspace from '../models/Workspace.js'; // Need to check user permissions
import User from '../models/User.js'; // Need to find user by email
import mongoose from 'mongoose';
import nodemailer from 'nodemailer'; // For sending emails
import dotenv from 'dotenv';

dotenv.config();

// Helper to configure Nodemailer
const setupTransporter = () => {
     return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || '465', 10),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
};

// @desc    Get pending invitations for the logged-in user (for "Join Requests" tab)
// @route   GET /api/invitations/pending
// @access  Private
const getPendingInvitations = async (req, res) => {
    try {
        const userEmail = req.user.email; // Get email from protected route
        if (!userEmail) {
             return res.status(400).json({ message: 'User email not found.' });
        }

       const pendingInvites = await Invitation.find({
            inviteeEmail: userEmail,
            status: 'pending'
        })
       .populate({
           path: 'workspace',
           // Include description so the client can display the project details
           select: 'name owner description',
           populate: { path: 'owner', select: 'username' }
       })
        .populate('inviter', 'username')
        .sort({ createdAt: -1 });

        res.status(200).json(pendingInvites);

    } catch (error) {
        console.error('Error fetching pending invitations:', error);
        res.status(500).json({ message: 'Server error fetching pending invitations.' });
    }
};

// --- NEW FUNCTION ---
// @desc    Get all invitations for a specific workspace (for "Send Requests" > "Request Status")
// @route   GET /api/invitations/workspace/:workspaceId
// @access  Private (Admin/Owner of workspace)
const getInvitationsForWorkspace = async (req, res) => {
    const { workspaceId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
        return res.status(400).json({ message: 'Invalid Workspace ID.' });
    }

    try {
        // 1. Check permissions
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) return res.status(404).json({ message: 'Workspace not found.' });
        
        // Robust check: members.user may be ObjectId or populated object; compare strings
        const isOwnerOrAdmin = (workspace.owner && workspace.owner.toString() === userId.toString()) ||
            workspace.members.some(m => {
                const memberUserId = m.user?._id ? m.user._id.toString() : (m.user ? m.user.toString() : null);
                return memberUserId === userId.toString() && m.role === 'Admin';
            });
        
        if (!isOwnerOrAdmin) {
             return res.status(403).json({ message: 'Not authorized to manage invitations for this workspace.' });
        }
        
        // 2. Fetch invitations
        const invitations = await Invitation.find({ workspace: workspaceId })
            .populate('inviteeUser', 'username') // Populate user if they've accepted
            .populate('inviter', 'username')
            .sort({ createdAt: -1 });

        res.status(200).json(invitations);

    } catch (error) {
        console.error('Error fetching workspace invitations:', error);
        res.status(500).json({ message: 'Server error fetching workspace invitations.' });
    }
};

// --- NEW FUNCTION ---
// @desc    Send a new invitation
// @route   POST /api/invitations
// @access  Private (Admin/Owner of workspace)
const sendInvitation = async (req, res) => {
    const { inviteeEmail, workspaceId } = req.body;
    const inviterId = req.user._id;

    if (!inviteeEmail || !workspaceId) {
        return res.status(400).json({ message: 'Email and workspace ID are required.' });
    }
    if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
        return res.status(400).json({ message: 'Invalid Workspace ID.' });
    }

    try {
        // 1. Find workspace and check permissions
        const workspace = await Workspace.findById(workspaceId).populate('owner', 'username');
        if (!workspace) return res.status(404).json({ message: 'Workspace not found.' });

        // Robust ownership/admin check (handle populated member.user)
        const workspaceOwnerId = workspace.owner?._id ? workspace.owner._id.toString() : (workspace.owner ? workspace.owner.toString() : null);
        const isOwnerOrAdmin = (workspaceOwnerId === inviterId.toString()) ||
            workspace.members.some(m => {
                const memberUserId = m.user?._id ? m.user._id.toString() : (m.user ? m.user.toString() : null);
                return memberUserId === inviterId.toString() && m.role === 'Admin';
            });
        
        if (!isOwnerOrAdmin) {
             return res.status(403).json({ message: 'Not authorized to send invitations.' });
        }

        // 2. Check if user is already a member
        const invitee = await User.findOne({ email: inviteeEmail });
        if (invitee) {
             const isAlreadyMember = workspace.members.some(m => m.user.equals(invitee._id));
             if (isAlreadyMember) {
                 return res.status(400).json({ message: 'User is already a member of this workspace.' });
             }
        }
        
        // 3. Check for existing pending invite
        const existingPendingInvite = await Invitation.findOne({
            workspace: workspaceId,
            inviteeEmail: inviteeEmail,
            status: 'pending'
        });
        if (existingPendingInvite) {
            return res.status(400).json({ message: 'An invitation is already pending for this email.' });
        }

        // 4. Create new invitation
        const newInvite = new Invitation({
            workspace: workspaceId,
            inviter: inviterId,
            inviteeEmail: inviteeEmail.toLowerCase(),
            inviteeUser: invitee?._id || null, // Link user if they exist
            status: 'pending'
        });
        await newInvite.save();
        
        // 5. Send email (fire and forget)
        const transporter = setupTransporter();
        const inviterName = req.user.username || workspace.owner.username;
        const mailOptions = {
            from: `"SyncSpace Invites" <${process.env.EMAIL_USER}>`,
            to: inviteeEmail,
            subject: `You're invited to join the '${workspace.name}' workspace!`,
            html: `<p>Hi,</p><p><strong>${inviterName}</strong> has invited you to collaborate in the workspace "<strong>${workspace.name}</strong>".</p><p>Please log in or sign up on SyncSpace with this email to accept the invitation.</p><p>Thanks,<br>The SyncSpace Team</p>`
        };
        
        transporter.sendMail(mailOptions).catch(err => {
             console.error(`Error sending email to ${inviteeEmail}:`, err); // Log error but don't fail request
        });

        // 6. Send response
        const populatedInvite = await Invitation.findById(newInvite._id).populate('inviter', 'username');
        res.status(201).json(populatedInvite);

    } catch (error) {
        console.error('Error sending invitation:', error);
        res.status(500).json({ message: 'Server error sending invitation.' });
    }
};

// --- NEW FUNCTION ---
// @desc    Resend a pending invitation
// @route   POST /api/invitations/resend/:inviteId
// @access  Private (Admin/Owner of workspace)
const resendInvitation = async (req, res) => {
    const { inviteId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(inviteId)) {
        return res.status(400).json({ message: 'Invalid Invitation ID.' });
    }
    
    try {
        const invitation = await Invitation.findById(inviteId).populate('workspace', 'name owner members');
        if (!invitation) return res.status(404).json({ message: 'Invitation not found.' });
        // Allow resending for pending or previously rejected invitations.
        if (!['pending', 'rejected'].includes(invitation.status)) {
            return res.status(400).json({ message: 'Only pending or rejected invitations can be resent.' });
        }

        // 1. Check permissions
        const workspace = invitation.workspace;
        const isOwnerOrAdmin = (workspace.owner && workspace.owner.toString() === userId.toString()) ||
            workspace.members.some(m => {
                const memberUserId = m.user?._id ? m.user._id.toString() : (m.user ? m.user.toString() : null);
                return memberUserId === userId.toString() && m.role === 'Admin';
            });
        if (!isOwnerOrAdmin) {
             return res.status(403).json({ message: 'Not authorized to resend this invitation.' });
        }
        
        // If the invitation was rejected, flip it back to pending and update inviter
        if (invitation.status === 'rejected') {
            invitation.status = 'pending';
            invitation.inviter = userId;
            await invitation.save();
        }

        // 2. Send email again (fire and forget)
        const transporter = setupTransporter();
        const inviterName = req.user.username || 'A manager';
        const mailOptions = {
            from: `"SyncSpace Invites" <${process.env.EMAIL_USER}>`,
            to: invitation.inviteeEmail,
            subject: `[Reminder] You're invited to join '${workspace.name}'!`,
            html: `<p>Hi,</p><p>This is a reminder that <strong>${inviterName}</strong> invited you to collaborate in "<strong>${workspace.name}</strong>".</p><p>Please log in or sign up on SyncSpace with this email to accept the invitation.</p><p>Thanks,<br>The SyncSpace Team</p>`
        };
        
       await transporter.sendMail(mailOptions).catch(err => {
           console.error(`Error resending email to ${invitation.inviteeEmail}:`, err);
       });

       // Return the updated invitation (populate inviter info) so client can refresh UI
       const populated = await Invitation.findById(invitation._id).populate('inviter', 'username email').populate('inviteeUser', 'username email');

       res.status(200).json({ message: 'Invitation resent successfully.', invitation: populated });

    } catch (error) {
         console.error('Error resending invitation:', error);
        res.status(500).json({ message: 'Server error resending invitation.' });
    }
};


// @desc    Get a single invitation by ID
// @route   GET /api/invitations/:inviteId
// @access  Private (invitee, inviter, or workspace owner/admin)
const getInvitationById = async (req, res) => {
    const { inviteId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(inviteId)) {
        return res.status(400).json({ message: 'Invalid Invitation ID.' });
    }

    try {
        const invitation = await Invitation.findById(inviteId)
            .populate({ path: 'workspace', select: 'name owner members description' })
            .populate('inviter', 'username email')
            .populate('inviteeUser', 'username email');

        if (!invitation) return res.status(404).json({ message: 'Invitation not found.' });

        // Allow invitee (by email or user id), inviter, or workspace owner/admin to view
        const workspace = invitation.workspace;
        const inviteeEmail = invitation.inviteeEmail?.toLowerCase();
        const isInviteeByEmail = req.user.email && req.user.email.toLowerCase() === inviteeEmail;
        const isInviteeById = invitation.inviteeUser && invitation.inviteeUser._id && invitation.inviteeUser._id.toString() === userId.toString();
        const isInviter = invitation.inviter && invitation.inviter._id && invitation.inviter._id.toString() === userId.toString();

        const isOwnerOrAdmin = (workspace.owner && workspace.owner.toString() === userId.toString()) ||
            workspace.members.some(m => {
                const memberUserId = m.user?._id ? m.user._id.toString() : (m.user ? m.user.toString() : null);
                return memberUserId === userId.toString() && m.role === 'Admin';
            });

        if (!(isInviteeByEmail || isInviteeById || isInviter || isOwnerOrAdmin)) {
            return res.status(403).json({ message: 'Not authorized to view this invitation.' });
        }

        res.status(200).json(invitation);

    } catch (error) {
        console.error('Error fetching invitation by id:', error);
        res.status(500).json({ message: 'Server error fetching invitation.' });
    }
};


// @desc    Respond to an invitation (accept or reject)
// @route   PATCH /api/invitations/:inviteId/respond
// @access  Private (only invitee can respond)
const respondToInvitation = async (req, res) => {
    const { inviteId } = req.params;
    const { action } = req.body; // 'accept' or 'reject'
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(inviteId)) {
        return res.status(400).json({ message: 'Invalid Invitation ID.' });
    }
    if (!action || !['accept', 'reject'].includes(action)) {
        return res.status(400).json({ message: 'Invalid action. Must be "accept" or "reject".' });
    }

    try {
        const invitation = await Invitation.findById(inviteId).populate('workspace', 'name owner members');
        if (!invitation) return res.status(404).json({ message: 'Invitation not found.' });
        if (invitation.status !== 'pending') return res.status(400).json({ message: 'Invitation is no longer pending.' });

        // Only the invitee (by email or linked user) may respond
        const inviteeEmail = invitation.inviteeEmail?.toLowerCase();
        const isInviteeByEmail = req.user.email && req.user.email.toLowerCase() === inviteeEmail;
        const isInviteeById = invitation.inviteeUser && invitation.inviteeUser.toString() === userId.toString();
        if (!(isInviteeByEmail || isInviteeById)) {
            return res.status(403).json({ message: 'Not authorized to respond to this invitation.' });
        }

        const workspace = await Workspace.findById(invitation.workspace._id);
        if (!workspace) return res.status(404).json({ message: 'Workspace not found.' });

        if (action === 'accept') {
            // Determine the user to add: prefer req.user._id
            let userToAddId = userId;

            // Ensure the user exists in DB (should since authenticated)
            const userRecord = await User.findById(userToAddId);
            if (!userRecord) return res.status(400).json({ message: 'User record not found for accepting invitation.' });

            // Check if already a member
            const alreadyMember = workspace.members.some(m => {
                const memberUserId = m.user?._id ? m.user._id.toString() : (m.user ? m.user.toString() : null);
                return memberUserId === userToAddId.toString();
            });
            if (!alreadyMember) {
                workspace.members.push({ user: userToAddId, role: 'Member' });
                await workspace.save();
            }

            // Update invitation
            invitation.status = 'accepted';
            invitation.inviteeUser = userToAddId;
            await invitation.save();

            // Notify inviter via email
            try {
                const transporter = setupTransporter();
                const mailOptions = {
                    from: `"SyncSpace Notifications" <${process.env.EMAIL_USER}>`,
                    to: invitation.inviter ? invitation.inviter.email || process.env.EMAIL_USER : process.env.EMAIL_USER,
                    subject: `Invitation accepted for '${workspace.name}'`,
                    html: `<p>The invitation sent to <strong>${invitation.inviteeEmail}</strong> has been accepted and they are now a member of "${workspace.name}".</p>`
                };
                transporter.sendMail(mailOptions).catch(err => console.error('Error sending accept notification:', err));
            } catch (err) {
                console.error('Error preparing accept notification:', err);
            }

            return res.status(200).json({ message: 'Invitation accepted.', invitation });
        }

        // action === 'reject'
        invitation.status = 'rejected';
        await invitation.save();

        // Notify inviter via email about rejection
        try {
            const transporter = setupTransporter();
            const mailOptions = {
                from: `"SyncSpace Notifications" <${process.env.EMAIL_USER}>`,
                to: invitation.inviter ? invitation.inviter.email || process.env.EMAIL_USER : process.env.EMAIL_USER,
                subject: `Invitation rejected for '${workspace.name}'`,
                html: `<p>The invitation sent to <strong>${invitation.inviteeEmail}</strong> has been rejected.</p>`
            };
            transporter.sendMail(mailOptions).catch(err => console.error('Error sending reject notification:', err));
        } catch (err) {
            console.error('Error preparing reject notification:', err);
        }

        res.status(200).json({ message: 'Invitation rejected.', invitation });

    } catch (error) {
        console.error('Error responding to invitation:', error);
        res.status(500).json({ message: 'Server error responding to invitation.' });
    }
};

export {
    getPendingInvitations,
    getInvitationsForWorkspace,
    sendInvitation,
    resendInvitation,
    getInvitationById,
    respondToInvitation
};

