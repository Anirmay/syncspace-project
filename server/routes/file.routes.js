import express from 'express';
import { uploadFile, getFileMeta, downloadFile, listFilesForWorkspace, listFilesForTask, deleteFile } from '../controllers/file.controller.js';
import upload from '../middleware/upload.middleware.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Upload a file (form-data: file, workspaceId, taskId, optional fileId to add version)
router.post('/', protect, upload.single('file'), uploadFile);

// Get metadata
router.get('/:id', protect, getFileMeta);

// Download current or specific version
router.get('/:id/download', protect, downloadFile);

// List files for a workspace
router.get('/workspace/:workspaceId', protect, listFilesForWorkspace);

// List files for a task
router.get('/task/:taskId', protect, listFilesForTask);
// Delete a file (removes DB record and stored versions)
router.delete('/:id', protect, deleteFile);

export default router;
