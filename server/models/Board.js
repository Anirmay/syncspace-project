    import mongoose from 'mongoose';

    const ColumnSchema = new mongoose.Schema({
        name: {
            type: String,
            required: true,
            trim: true,
        },
        tasks: [{ // Array of Task ObjectIds belonging to this column
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Task',
        }],
        // We'll store board reference if needed, maybe not needed if embedded
         board: {
             type: mongoose.Schema.Types.ObjectId,
             ref: 'Board',
             // required: true // Required only if not embedded
         }
    });

    const BoardSchema = new mongoose.Schema(
      {
        title: {
          type: String,
          required: true,
          trim: true,
        },
        workspace: { // Reference to the workspace it belongs to
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Workspace',
          required: true,
        },
        // Embed columns directly within the board document
        columns: [ColumnSchema],
      },
      { timestamps: true }
    );

    // Add a default set of columns when a new board is created
    BoardSchema.pre('save', function(next) {
        if (this.isNew && this.columns.length === 0) {
            this.columns.push(
                { name: 'To Do', tasks: [] },
                { name: 'In Progress', tasks: [] },
                { name: 'Done', tasks: [] }
            );
             // Assign board ID to columns if needed (not strictly necessary when embedded)
            this.columns.forEach(col => col.board = this._id);
        }
        next();
    });

    export default mongoose.model('Board', BoardSchema);
    
