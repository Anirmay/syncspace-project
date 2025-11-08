import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const FileList = ({ workspaceId, taskId, refreshSignal }) => {
  const { currentUser } = useContext(AuthContext) || { currentUser: null };
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  // custom confirmation modal state
  const [confirm, setConfirm] = useState({ open: false, fileId: null, fileName: '' });
  // toast (sliding notification)
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });
  const API_URL = import.meta.env.VITE_API_URL;

  const fetch = async () => {
    if (!currentUser || !currentUser.token) return;
    setLoading(true);
    try {
      const cfg = { headers: { Authorization: `Bearer ${currentUser.token}` } };
      const url = taskId ? `${API_URL}/api/files/task/${taskId}` : `${API_URL}/api/files/workspace/${workspaceId}`;
      const res = await axios.get(url, cfg);
      setFiles(res.data || []);
    } catch (err) {
      console.error('Fetch files error', err);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [workspaceId, taskId, currentUser, refreshSignal]);

  const download = async (fileId, index) => {
    if (!currentUser || !currentUser.token) return;
    try {
      const url = `${API_URL}/api/files/${fileId}/download?versionIndex=${index}`;
      const cfg = { headers: { Authorization: `Bearer ${currentUser.token}` }, responseType: 'blob' };
      const res = await axios.get(url, cfg);
      const blob = new Blob([res.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      // attempt to get filename from content-disposition or fallback
      const cd = res.headers['content-disposition'] || '';
      const match = cd.match(/filename\*=UTF-8''(.+)$|filename="?([^";]+)"?/);
      const filename = match ? decodeURIComponent(match[1] || match[2]) : `file-${fileId}`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Download error', err);
      alert('Download failed');
    }
  };

  // open confirmation modal (replaces native confirm)
  const handleDelete = (fileId, fileName) => {
    setConfirm({ open: true, fileId, fileName });
  };

  // perform the actual delete after user confirms
  const performDelete = async () => {
    const fileId = confirm.fileId;
    if (!fileId) return setConfirm({ open: false, fileId: null, fileName: '' });
    if (!currentUser || !currentUser.token) {
      setConfirm({ open: false, fileId: null, fileName: '' });
      return setToast({ show: true, msg: 'Authentication required', type: 'error' });
    }

    try {
      const cfg = { headers: { Authorization: `Bearer ${currentUser.token}` } };

      // verify existence (clear handling for 404)
      try {
        await axios.get(`${API_URL}/api/files/${fileId}`, cfg);
      } catch (metaErr) {
        if (metaErr.response && metaErr.response.status === 404) {
          await fetch();
          setConfirm({ open: false, fileId: null, fileName: '' });
          setToast({ show: true, msg: 'File already removed', type: 'info' });
          // auto hide
          setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 2500);
          return;
        }
        throw metaErr;
      }

      await axios.delete(`${API_URL}/api/files/${fileId}`, cfg);
      await fetch();
      setConfirm({ open: false, fileId: null, fileName: '' });
      // show success toast
      setToast({ show: true, msg: 'Delete successfully', type: 'success' });
      setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 3000);
    } catch (err) {
      console.error('Delete file error', err);
      const msg = err?.response?.data?.message || err.message || 'Delete failed';
      setConfirm({ open: false, fileId: null, fileName: '' });
      setToast({ show: true, msg, type: 'error' });
      setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 3500);
    }
  };

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-slate-300">Attachments</h4>
      {actionMsg && <div className="text-sm text-green-400">{actionMsg}</div>}
      {loading && <div className="text-sm text-slate-400">Loading...</div>}
      {!loading && files.length === 0 && <div className="text-sm text-slate-400">No attachments</div>}
      {/* toast (top slide) */}
      <div className={`fixed left-0 right-0 top-4 flex justify-center pointer-events-none z-50`}> 
        <div className={`pointer-events-auto transform transition-transform duration-500 ease-out ${toast.show ? 'translate-y-0' : '-translate-y-full'}`}>
          {toast.show && (
            <div className={`px-4 py-2 rounded shadow-lg text-sm ${toast.type === 'error' ? 'bg-rose-600 text-white' : toast.type === 'info' ? 'bg-slate-600 text-white' : 'bg-emerald-500 text-white'}`}>
              {toast.msg}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {files.map(f => (
          <div key={f._id} className="flex items-center justify-between bg-slate-700 p-2 rounded">
            <div className="text-sm text-slate-200">{f.name}</div>
            <div className="flex items-center gap-2">
              <button onClick={() => download(f._id, f.versions.length - 1)} className="text-sm text-indigo-300 hover:text-indigo-200">Download</button>
              <button onClick={() => { /* show versions later */ }} className="text-sm text-slate-400">Versions ({f.versions?.length || 0})</button>
              <button onClick={() => handleDelete(f._id, f.name)} className="text-sm text-rose-400 hover:text-rose-300">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation modal */}
      {confirm.open && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setConfirm({ open: false, fileId: null, fileName: '' })} />
          <div className="bg-slate-800 text-slate-100 rounded-lg p-6 z-50 w-11/12 max-w-md shadow-xl">
            <h3 className="text-lg font-semibold mb-2">Delete this file and all versions?</h3>
            <p className="text-sm text-slate-300 mb-4">{confirm.fileName}</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirm({ open: false, fileId: null, fileName: '' })} className="px-3 py-1 rounded bg-slate-600 text-slate-100">Cancel</button>
              <button onClick={performDelete} className="px-3 py-1 rounded bg-rose-500 text-white">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileList;
