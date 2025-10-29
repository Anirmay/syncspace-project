import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema(
    {
        text: {
            type: String,
            required: true,
            trim: true,
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        workspace: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Workspace',
            // required: false, // Not required if it can be a DM
            default: null, // Default to null for DMs
            index: true,
        },
        // --- ADD THIS FIELD ---
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            // required: false, // Not required if it's a workspace message
            default: null, // Default to null for workspace messages
        },
        // --- END ADD ---
    },
    { timestamps: true } // Adds createdAt and updatedAt automatically
);

// Optional: Add an index for querying direct messages efficiently
MessageSchema.index({ sender: 1, receiver: 1, workspace: 1 });
MessageSchema.index({ receiver: 1, sender: 1, workspace: 1 });


export default mongoose.model('Message', MessageSchema);

