import mongoose from 'mongoose';

const InvitationSchema = new mongoose.Schema(
    {
        workspace: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Workspace',
            required: true,
            index: true,
        },
        inviter: { // User who sent the invite
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        inviteeEmail: { // Email address the invite was sent to
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            index: true,
        },
        inviteeUser: { // Link to the User account once they accept/exist
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null, // Starts as null until user accepts/is found
            index: true,
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected', 'expired'],
            default: 'pending',
            index: true,
        },
        // Optional: Add an expiry date for invitations
        // expiresAt: { type: Date }
    },
    { timestamps: true } // Adds createdAt, updatedAt
);

// Optional: Prevent duplicate pending invites for the same user+workspace
InvitationSchema.index({ workspace: 1, inviteeEmail: 1, status: 1 }, { unique: true, partialFilterExpression: { status: 'pending' } });


export default mongoose.model('Invitation', InvitationSchema);