import User from '../models/User.js'; // Adjust path if needed
import mongoose from 'mongoose'; // Import mongoose if not already
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

// --- Get User Profile (Existing) ---
const getUserProfile = async (req, res) => {
    // req.user is added by the 'protect' middleware
    // Return only necessary fields, exclude password implicitly if using select('-password')
    // Or explicitly select fields:
    try {
        // Find user by ID attached by middleware, select specific fields
    const user = await User.findById(req.user._id).select('username email createdAt name about emailNotifications webNotifications'); // Include editable profile fields
        if (user) {
            res.json(user); // Send selected user data
        } else {
            // This case should ideally not happen if protect middleware works correctly
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Server error fetching profile' });
    }
};


// --- Delete User Profile (Existing) ---
const deleteUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id); // Get user ID from middleware

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Perform the deletion using the ID from the authenticated user
        await User.deleteOne({ _id: req.user._id }); // Use deleteOne with the correct ID

        res.status(200).json({ message: 'User account deleted successfully' });

    } catch (error) {
        console.error('Error deleting user profile:', error);
        res.status(500).json({ message: 'Server error deleting account' });
    }
};

// --- NEW: Get All Users (for Invites) ---
// @desc    Get all users (excluding current user) for inviting
// @route   GET /api/users
// @access  Private
const getAllUsers = async (req, res) => {
    try {
        // Find all users EXCEPT the currently logged-in user (_id comes from protect middleware)
        // Select only the fields needed for display (id, username, email)
        const users = await User.find({ _id: { $ne: req.user._id } }) // $ne means "not equal"
                                .select('_id username email') // Select ID, username, and email
                                .sort({ username: 1 }); // Sort alphabetically by username

        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching all users:', error);
        res.status(500).json({ message: 'Server error fetching users.' });
    }
};

// Ensure all three functions are exported
// --- NEW: Update user profile (PATCH /api/users/me) ---
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });
    const { name, username, about, email, currentPassword, newPassword, emailNotifications, webNotifications } = req.body;
        // Basic profile fields
        if (typeof name !== 'undefined') user.name = name;
        if (typeof username !== 'undefined') user.username = username;
        if (typeof about !== 'undefined') user.about = about;

        // Email change: require currentPassword for security when changing email
        if (typeof email !== 'undefined' && email !== user.email) {
            if (!currentPassword) {
                return res.status(400).json({ message: 'Current password is required to change email.' });
            }
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Current password is incorrect.' });
            }

            // Create a confirmation token and save pendingEmail fields instead of switching immediately
            const emailToken = crypto.randomBytes(32).toString('hex');
            user.emailChangeToken = crypto.createHash('sha256').update(emailToken).digest('hex');
            user.emailChangeExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
            user.pendingEmail = email;

            await user.save();

            // Send confirmation email to the new address with the unhashed token in the link
            try {
                const transporter = nodemailer.createTransport({
                    host: process.env.EMAIL_HOST,
                    port: parseInt(process.env.EMAIL_PORT || '587', 10),
                    secure: process.env.EMAIL_SECURE === 'true',
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS,
                    },
                });

                const confirmUrl = `http://localhost:5173/confirm-email/${emailToken}?email=${encodeURIComponent(email)}`; // Frontend route to handle confirmation (includes target email for fallback)
                const mailOptions = {
                    from: `"SyncSpace" <${process.env.EMAIL_USER}>`,
                    to: email,
                    subject: 'Confirm your new email for SyncSpace',
                    text: `Please confirm your new email by visiting: ${confirmUrl}`,
                    html: `<p>Please confirm your new email by clicking the link below:</p><a href="${confirmUrl}">${confirmUrl}</a>`,
                };
                await transporter.sendMail(mailOptions);
            } catch (emailErr) {
                console.error('Error sending confirmation email for email change:', emailErr);
                // Clear the pending fields on failure
                user.pendingEmail = undefined;
                user.emailChangeToken = undefined;
                user.emailChangeExpires = undefined;
                await user.save({ validateBeforeSave: false });
                return res.status(500).json({ message: 'Failed to send confirmation email. Please try again later.' });
            }

            // Inform client that confirmation was sent
            const updatedPartial = await User.findById(req.user._id).select('username email createdAt name about emailNotifications webNotifications pendingEmail');
            return res.status(200).json({ message: 'Confirmation email sent to new address.', pendingEmail: updatedPartial.pendingEmail });
        }

        // Password change: require currentPassword and newPassword
        if (typeof newPassword !== 'undefined' && newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ message: 'Current password is required to change password.' });
            }
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Current password is incorrect.' });
            }
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        // Notification preferences
        if (typeof emailNotifications !== 'undefined') {
            user.emailNotifications = !!emailNotifications;
        }
        if (typeof webNotifications !== 'undefined') {
            user.webNotifications = !!webNotifications;
        }

        await user.save();
        // Return updated profile (same fields as getUserProfile)
    const updated = await User.findById(req.user._id).select('username email createdAt name about emailNotifications webNotifications');
        res.status(200).json(updated);
    } catch (err) {
        console.error('Error updating user profile:', err);
        // Handle duplicate username (unique index) error from MongoDB
        if (err && (err.code === 11000 || err.codeName === 'DuplicateKey')) {
            // err.keyValue should contain the duplicated field
            const dupField = err.keyValue ? Object.keys(err.keyValue)[0] : 'username';
            const fieldName = dupField === 'username' ? 'Username' : dupField;
            return res.status(400).json({ message: `${fieldName} already exists.` });
        }
        res.status(500).json({ message: 'Server error updating profile' });
    }
};

// --- Confirm pending email change ---
const confirmEmailChange = async (req, res) => {
    try {
        const token = req.params.token;
        if (!token) return res.status(400).json({ message: 'Invalid token' });

        const hashed = crypto.createHash('sha256').update(token).digest('hex');
        let user = await User.findOne({ emailChangeToken: hashed, emailChangeExpires: { $gt: Date.now() } });
        if (user) {
            if (!user.pendingEmail) return res.status(400).json({ message: 'No pending email to confirm.' });

            // Apply the pending email
            user.email = user.pendingEmail;
            user.pendingEmail = undefined;
            user.emailChangeToken = undefined;
            user.emailChangeExpires = undefined;
            await user.save();

            return res.status(200).json({ message: 'Email updated successfully.' });
        }

        // If token not found or expired, support a safe fallback when the confirm link includes the target email
        const requestedEmail = req.query?.email;
        if (requestedEmail) {
            // Find any user that currently has that email (change already applied) or has it as pending
            const existing = await User.findOne({ $or: [{ email: requestedEmail }, { pendingEmail: requestedEmail }] });
            if (existing) {
                // If the user's email is already the requested email, consider it successful
                if (existing.email === requestedEmail) {
                    return res.status(200).json({ message: 'Email updated successfully.' });
                }
                // If it's only pending, token may be expired; treat as failure to confirm
            }
            return res.status(400).json({ message: 'Token is invalid or has expired.' });
        }

        return res.status(400).json({ message: 'Token is invalid or has expired.' });
    } catch (err) {
        console.error('Error confirming email change:', err);
        res.status(500).json({ message: 'Server error confirming email change.' });
    }
};

export { getUserProfile, deleteUserProfile, getAllUsers, updateUserProfile, confirmEmailChange };

