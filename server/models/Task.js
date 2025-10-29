    import mongoose from 'mongoose';

    const CommentSchema = new mongoose.Schema({
        text: { type: String, required: true },
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        createdAt: { type: Date, default: Date.now },
    });

    const TaskSchema = new mongoose.Schema(
      {
        title: {
          type: String,
          required: true,
          trim: true,
        },
        description: {
          type: String,
          trim: true,
          default: '',
        },
        assignedTo: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          default: null, // Can be unassigned
        },
        board: { // Reference to the board it belongs to
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Board',
            required: true,
        },
        column: { // Reference to the column it's currently in
            type: mongoose.Schema.Types.ObjectId, // We'll store Column ObjectId here
            required: true,
        },
        // We might add subtasks, due dates, labels etc. later
        comments: [CommentSchema],
        startDate: { type: Date, default: null },
        endDate: { type: Date, default: null }, // For completed tasks
        status: { // Could be derived from column, but explicit status might be useful
            type: String,
            enum: ['todo', 'inprogress', 'done'],
            default: 'todo',
        },
      },
      
      { timestamps: true }
    );
    TaskSchema.pre('save', function(next) {
      next();
    });
    export default mongoose.model('Task', TaskSchema);
    
