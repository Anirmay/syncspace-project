import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads directory exists
const uploadsRoot = path.resolve(process.cwd(), 'uploads');
try { fs.mkdirSync(uploadsRoot, { recursive: true }); } catch (e) { /* ignore */ }

// Simple storage: one folder per workspace (if provided) else root
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const workspaceId = req.body.workspaceId || req.query.workspaceId || 'global';
      const dest = path.join(uploadsRoot, workspaceId.toString());
      fs.mkdirSync(dest, { recursive: true });
      cb(null, dest);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const safe = Date.now() + '-' + Math.random().toString(36).slice(2, 9) + path.extname(file.originalname);
    cb(null, safe);
  }
});

const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB limit for PoC

export default upload;
