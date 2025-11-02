import path from 'path';
import fs from 'fs';
import File from '../models/File.js';
import Workspace from '../models/Workspace.js';
import Task from '../models/Task.js';

// POST /api/files
// Handles creating a new file record or appending a version to an existing file
const uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });
    const userId = req.user._id;
    const { workspaceId, taskId, fileId } = req.body;

    // Basic auth: verify workspace membership if workspaceId provided
    if (workspaceId) {
      const workspace = await Workspace.findById(workspaceId).select('members');
      if (!workspace) return res.status(404).json({ message: 'Workspace not found.' });
      const isMember = workspace.members.some(m => m.user.equals(userId));
      if (!isMember) return res.status(403).json({ message: 'Not authorized for this workspace.' });
    }

    const filePath = req.file.path; // absolute path on disk
    const relPath = path.relative(process.cwd(), filePath);

    if (fileId) {
      // Append version to existing file
      const existing = await File.findById(fileId);
      if (!existing) return res.status(404).json({ message: 'File record not found.' });
      existing.versions.push({ key: relPath, originalName: req.file.originalname, mimeType: req.file.mimetype, size: req.file.size, uploader: userId });
      await existing.save();
      return res.status(200).json(existing);
    }

    // Create new file record
    const newFile = new File({
      name: req.file.originalname,
      workspace: workspaceId || null,
      task: taskId || null,
      owner: userId,
      versions: [{ key: relPath, originalName: req.file.originalname, mimeType: req.file.mimetype, size: req.file.size, uploader: userId }]
    });
    await newFile.save();
    res.status(201).json(newFile);
  } catch (err) {
    console.error('Upload file error:', err);
    res.status(500).json({ message: 'Failed to upload file.' });
  }
};

// GET /api/files/:id
const getFileMeta = async (req, res) => {
  try {
    const file = await File.findById(req.params.id).populate('owner', 'username _id').populate('versions.uploader', 'username _id');
    if (!file) return res.status(404).json({ message: 'File not found.' });
    res.json(file);
  } catch (err) {
    console.error('Get file meta error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/files/:id/download?versionIndex=0
const downloadFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ message: 'File not found.' });
    const idx = parseInt(req.query.versionIndex || (file.versions.length - 1), 10);
    const version = file.versions[idx];
    if (!version) return res.status(404).json({ message: 'File version not found.' });
    const abs = path.resolve(process.cwd(), version.key);
    if (!fs.existsSync(abs)) return res.status(404).json({ message: 'Stored file missing.' });
    res.download(abs, version.originalName);
  } catch (err) {
    console.error('Download file error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/workspaces/:workspaceId/files
const listFilesForWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const files = await File.find({ workspace: workspaceId }).sort({ createdAt: -1 });
    res.json(files);
  } catch (err) {
    console.error('List workspace files error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/tasks/:taskId/files
const listFilesForTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const files = await File.find({ task: taskId }).sort({ createdAt: -1 });
    res.json(files);
  } catch (err) {
    console.error('List task files error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

export { uploadFile, getFileMeta, downloadFile, listFilesForWorkspace, listFilesForTask };

// DELETE /api/files/:id
const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    const file = await File.findById(id);
    if (!file) return res.status(404).json({ message: 'File record not found.' });

    // Authorization: only owner or workspace admin can delete (basic check)
    const userId = req.user._id;
    if (!file.owner.equals(userId)) {
      // if file belongs to workspace, allow workspace admins (simplified)
      if (file.workspace) {
        const workspace = await Workspace.findById(file.workspace).select('members');
        const isAdmin = workspace.members.some(m => m.user.equals(userId) && m.role === 'Admin');
        if (!isAdmin) return res.status(403).json({ message: 'Not authorized to delete this file.' });
      } else {
        return res.status(403).json({ message: 'Not authorized to delete this file.' });
      }
    }

    // Remove files from disk for every version
    for (const v of file.versions || []) {
      try {
        const abs = path.resolve(process.cwd(), v.key);
        if (fs.existsSync(abs)) fs.unlinkSync(abs);
      } catch (e) {
        console.warn('Failed to remove file from disk during deletion:', e);
      }
    }

    await File.findByIdAndDelete(id);
    res.json({ message: 'File deleted.' });
  } catch (err) {
    console.error('Delete file error:', err);
    res.status(500).json({ message: 'Server error while deleting file.' });
  }
};

export { deleteFile };
