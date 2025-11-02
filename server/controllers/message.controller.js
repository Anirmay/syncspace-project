import Message from '../models/Message.js';
import Workspace from '../models/Workspace.js';
import User from '../models/User.js'; // Need User model for DMs
import Notification from '../models/Notification.js';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Helper to configure Nodemailer (small copy to avoid circular imports)
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

// @desc    Get all messages for a specific workspace
// @route   GET /api/workspaces/:workspaceId/messages
// @access  Private (User must be member)
const getMessagesByWorkspace = async (req, res) => {
    const { workspaceId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
        return res.status(400).json({ message: 'Invalid Workspace ID.' });
    }

    try {
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found.' });
        }
        const isMember = workspace.members.some(member => member.user.equals(userId));
        if (!isMember) {
            return res.status(403).json({ message: 'Not authorized for this workspace.' });
        }

        const messages = await Message.find({ workspace: workspaceId, receiver: null }) // Ensure it's a workspace message
            .populate('sender', 'username _id')
            .sort({ createdAt: 1 });

        res.status(200).json(messages);

    } catch (error) {
        console.error('Error fetching workspace messages:', error);
        res.status(500).json({ message: 'Server error fetching workspace messages.' });
    }
};


// @desc    Create a new message in a workspace
// @route   POST ??? (Currently handled by createDirectMessage logic, might need separate route)
// @access  Private (User must be member)
const createWorkspaceMessage = async (req, res) => {
    // Note: The previous 'createMessage' was repurposed for DMs.
    // If you need workspace messages too, adjust routes/logic or keep separate.
    // This function assumes a route like POST /api/workspaces/:workspaceId/messages
    const { text } = req.body;
    // Accept workspaceId from either route params or request body (client may send in body)
    const workspaceId = req.params?.workspaceId || req.body?.workspaceId;
    const senderId = req.user._id;

    if (!text || !text.trim()) {
        return res.status(400).json({ message: 'Message text cannot be empty.' });
    }
    if (!workspaceId || !mongoose.Types.ObjectId.isValid(workspaceId)) {
        console.warn('createWorkspaceMessage missing/invalid workspaceId:', workspaceId);
        return res.status(400).json({ message: 'Invalid or missing Workspace ID.' });
    }
     try {
        const workspace = await Workspace.findById(workspaceId);
         if (!workspace) {
             return res.status(404).json({ message: 'Workspace not found.' });
         }
         const isMember = workspace.members.some(member => member.user.equals(senderId));
         if (!isMember) {
             return res.status(403).json({ message: 'Not authorized to send messages in this workspace.' });
         }

        const newMessage = new Message({
            text: text.trim(),
            sender: senderId,
            workspace: workspaceId,
            receiver: null // Explicitly null for workspace messages
        });
        const savedMessage = await newMessage.save();
        const populatedMessage = await Message.findById(savedMessage._id)
            .populate('sender', 'username _id');

        // TODO: Emit to workspace room via Socket.IO
        // req.io.to(workspaceId).emit('newMessage', populatedMessage);

        res.status(201).json(populatedMessage);

    } catch (error) {
        console.error('Error creating workspace message:', error);
        res.status(500).json({ message: 'Server error creating workspace message.' });
    }
};


// --- FUNCTIONS FOR DIRECT MESSAGES ---

// @desc    Get direct messages between current user and another user
// @route   GET /api/messages/direct/:userId
// @access  Private
const getDirectMessages = async (req, res) => {
    const otherUserId = req.params.userId;
    const currentUserId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
        return res.status(400).json({ message: 'Invalid User ID format.' });
    }

    try {
        // Find messages where sender/receiver pair matches either way AND workspace is null
        const messages = await Message.find({
            workspace: null, // Ensure it's a direct message
            $or: [
                { sender: currentUserId, receiver: otherUserId },
                { sender: otherUserId, receiver: currentUserId }
            ]
        })
        .populate('sender', 'username _id')
        .populate('receiver', 'username _id') // Populate receiver too
        .sort({ createdAt: 1 }); // Sort oldest first

        res.status(200).json(messages);

    } catch (error) {
        console.error('Error fetching direct messages:', error);
        res.status(500).json({ message: 'Server error fetching direct messages.' });
    }
};


// @desc    Create a new direct message
// @route   POST /api/messages/direct
// @access  Private
const createDirectMessage = async (req, res) => {
    const { text, receiver: receiverId } = req.body;
    const senderId = req.user._id;

    if (!text || !text.trim()) {
        return res.status(400).json({ message: 'Message text cannot be empty.' });
    }
    if (!receiverId || !mongoose.Types.ObjectId.isValid(receiverId)) {
        return res.status(400).json({ message: 'Invalid or missing Receiver ID.' });
    }
    // Prevent sending message to self
    if (senderId.equals(receiverId)) {
         return res.status(400).json({ message: 'Cannot send message to yourself.' });
    }

    try {
        // Optional: Check if receiver user exists
        const receiverExists = await User.findById(receiverId);
        if (!receiverExists) {
            return res.status(404).json({ message: 'Receiver user not found.' });
        }

        // Create and save the message
        const newMessage = new Message({
            text: text.trim(),
            sender: senderId,
            receiver: receiverId, // Set receiver field
            workspace: null // Mark as not a workspace message
        });

        const savedMessage = await newMessage.save();

        // Populate sender and receiver info
        const populatedMessage = await Message.findById(savedMessage._id)
            .populate('sender', 'username _id')
            .populate('receiver', 'username _id');

        // Create an in-app notification for the receiver so the UI can show unread counts
        try {
            const notif = new Notification({
                user: receiverId,
                actor: senderId,
                type: 'direct_message',
                message: `${req.user.username || 'Someone'} sent you a message: ${String(text).slice(0, 120)}`,
                link: `/chat/${senderId}`
            });
            await notif.save();
            console.log('Notification created for direct message', { to: receiverId.toString(), notifId: notif._id.toString() });
        } catch (notifErr) {
            console.error('Error creating notification for DM:', notifErr);
        }

        // If email notifications are enabled, attempt to send an email (kept optional)
        if (process.env.DM_NOTIFICATIONS_ENABLED === 'true') {
            try {
                const receiver = await User.findById(receiverId).select('email emailNotifications username');
                if (receiver && receiver.email && receiver.emailNotifications !== false) {
                    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.EMAIL_HOST) {
                        console.warn('Email configuration missing in environment; skipping sending DM email.');
                    } else {
                        const transporter = setupTransporter();
                        const mail = {
                            from: `"SyncSpace Notifications" <${process.env.EMAIL_USER}>`,
                            to: receiver.email,
                            subject: `${req.user.username || 'Someone'} sent you a message on SyncSpace`,
                            text: `${req.user.username || 'Someone'} sent you a message:\n\n${text}\n\nOpen the conversation: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/chat/${senderId}`
                        };
                        transporter.sendMail(mail)
                            .then(info => console.log('DM email sent:', info && info.messageId ? info.messageId : info))
                            .catch(err => console.error('Error sending DM email:', err));
                    }
                } else {
                    console.log('Receiver has no email or has disabled email notifications; skipping email.');
                }
            } catch (emailErr) {
                console.error('Error preparing DM email:', emailErr);
            }
        }

        // TODO: Add Socket.IO emit here to broadcast the message *specifically* to sender and receiver user IDs/sockets
        // Example: req.io.to(senderId.toString()).to(receiverId.toString()).emit('newDirectMessage', populatedMessage);

        res.status(201).json(populatedMessage);

    } catch (error) {
        console.error('Error creating direct message:', error);
        res.status(500).json({ message: 'Server error creating direct message.' });
    }
};

// --- Make sure ALL functions are exported ---
export {
    getMessagesByWorkspace,
    createWorkspaceMessage, // Renamed from createMessage
    getDirectMessages,
    createDirectMessage
};

