import React from 'react';

const ConfirmLogoutModal = ({ isOpen, onCancel, onConfirm, isProcessing }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div role="dialog" aria-modal="true" aria-labelledby="confirm-logout-title" className="bg-white dark:bg-slate-800 rounded-lg shadow-lg max-w-sm w-full p-6">
        <h3 id="confirm-logout-title" className="text-lg font-semibold text-slate-900 dark:text-white">Confirm logout</h3>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">Are you sure you want to log out?</p>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 rounded">Cancel</button>
          <button onClick={onConfirm} disabled={isProcessing} className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded">
            {isProcessing ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmLogoutModal;
