import mongoose from 'mongoose';

const VersionSchema = new mongoose.Schema({
  key: { type: String, required: true }, // filesystem path or storage key
  originalName: { type: String, required: true },
  mimeType: { type: String },
  size: { type: Number },
  uploadedAt: { type: Date, default: Date.now },
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { _id: false });

const FileSchema = new mongoose.Schema({
  name: { type: String, required: true }, // logical name
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: false },
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: false },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  versions: [VersionSchema],
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Index to quickly find files for a workspace or task
FileSchema.index({ workspace: 1, task: 1 });

export default mongoose.model('File', FileSchema);
