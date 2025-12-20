import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const FileUpload = ({ workspaceId, taskId, onUploaded }) => {
  const { currentUser } = useContext(AuthContext) || { currentUser: null };
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const f = e.target.files[0];
    setError('');
    if (!f) { setFile(null); return; }
    // Validate extension and MIME for .txt files only
    const name = (f.name || '').toLowerCase();
    const ext = name.includes('.') ? name.split('.').pop() : '';
    const mime = (f.type || '').toLowerCase();
    if (ext !== 'txt' && mime !== 'text/plain') {
      setFile(null);
      setError('Only .txt files are allowed.');
      return;
    }
    setFile(f);
  };

  const handleUpload = async () => {
    if (!file) return setError('Choose a .txt file first');
    if (!currentUser || !currentUser.token) return setError('Authentication required');
    setLoading(true); setError('');
    // Extra safety: verify extension again before sending
    const name = (file.name || '').toLowerCase();
    const ext = name.includes('.') ? name.split('.').pop() : '';
    const mime = (file.type || '').toLowerCase();
    if (ext !== 'txt' && mime !== 'text/plain') {
      setLoading(false);
      return setError('Only .txt files are allowed.');
    }
    try {
      const fd = new FormData();
      fd.append('file', file);
      if (workspaceId) fd.append('workspaceId', workspaceId);
      if (taskId) fd.append('taskId', taskId);

      const cfg = { headers: { Authorization: `Bearer ${currentUser.token}`, 'Content-Type': 'multipart/form-data' } };
      const res = await axios.post('https://syncspace-project.onrender.com/api/files', fd, cfg);
      setFile(null);
      setSuccess('Uploaded successfully');
      setTimeout(() => setSuccess(''), 2200);
      if (onUploaded) onUploaded(res.data);
    } catch (err) {
      console.error('Upload error', err);
      setError(err.response?.data?.message || 'Upload failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm text-slate-300">Attach file</label>
      <div className="flex items-center gap-2">
        <input type="file" accept=".txt,text/plain" onChange={handleChange} className="text-sm text-slate-200" />
        <button disabled={loading} onClick={handleUpload} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm">
          {loading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
      {error && <div className="text-red-400 text-sm">{error}</div>}
      {success && <div className="text-green-400 text-sm">{success}</div>}
    </div>
  );
};

export default FileUpload;
