    import mongoose from 'mongoose';

    const MemberSchema = new mongoose.Schema({
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        role: {
            type: String,
            enum: ['Admin', 'Member'],
            default: 'Member',
        },
    }, { _id: false }); // Don't create separate _id for members

    const WorkspaceSchema = new mongoose.Schema(
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        owner: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        members: [MemberSchema],
        // We might add boards directly here later or keep them separate
        // boards: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Board' }]
      },
      { timestamps: true }
    );

    // Ensure the owner is automatically added as an Admin member upon creation
    WorkspaceSchema.pre('save', function (next) {
        if (this.isNew) {
            // Check if the owner is already listed as a member
            const ownerExists = this.members.some(member => member.user.equals(this.owner));
            if (!ownerExists) {
                this.members.push({ user: this.owner, role: 'Admin' });
            }
        }
        next();
    });


    export default mongoose.model('Workspace', WorkspaceSchema);
    
