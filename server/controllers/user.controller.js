import User from '../models/User.js'; // Adjust path if needed
import mongoose from 'mongoose'; // Import mongoose if not already

// --- Get User Profile (Existing) ---
const getUserProfile = async (req, res) => {
    // req.user is added by the 'protect' middleware
    // Return only necessary fields, exclude password implicitly if using select('-password')
    // Or explicitly select fields:
    try {
        // Find user by ID attached by middleware, select specific fields
        const user = await User.findById(req.user._id).select('username email createdAt'); // Example selection
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
export { getUserProfile, deleteUserProfile, getAllUsers };

