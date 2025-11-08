import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL : 'http://localhost:5000';

export default function ConfirmEmailPage() {
  const { token } = useParams();
  const [status, setStatus] = useState({ loading: true, ok: false, message: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const confirm = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/users/confirm-email/${token}`);
        setStatus({ loading: false, ok: true, message: res.data?.message || 'Email confirmed successfully.' });
        // Redirect to profile after a short delay
        setTimeout(() => navigate('/profile'), 3000);
      } catch (err) {
        console.error('Confirm email error:', err);
        const msg = err.response?.data?.message || 'Failed to confirm email.';
        // Fallback: if a pendingEmail was stored locally and the logged-in user's email already matches it,
        // consider the change successful and show the success UI.
        try {
          const pending = localStorage.getItem('pendingEmail');
          if (pending) {
            // Try to fetch current user (may fail if not logged in)
            try {
              const ures = await axios.get(`${API_BASE}/api/users/me`);
              const curr = ures.data?.email;
              if (curr && curr === pending) {
                setStatus({ loading: false, ok: true, message: 'Your email changed successfully.' });
                // clear pendingEmail as it's applied
                localStorage.removeItem('pendingEmail');
                setTimeout(() => navigate('/profile'), 3000);
                return;
              }
            } catch (e) {
              // not logged in or cannot fetch profile - fall through to show error
              console.warn('Could not fetch profile during confirm fallback:', e?.message || e);
            }
          }
        } catch (e) {
          console.warn('Confirm fallback check error:', e?.message || e);
        }

        setStatus({ loading: false, ok: false, message: msg });
      }
    };
    confirm();
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8 flex items-center justify-center">
      <div className="max-w-xl w-full bg-slate-800 p-8 rounded shadow text-center">
        {status.loading ? (
          <div>
            <p className="text-slate-400">Confirming your email...</p>
          </div>
        ) : status.ok ? (
          <div>
            <div className="flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-green-600 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-green-400 mt-6">Success</h2>
            <p className="mt-4 text-slate-300">Your email changed successfully.</p>
            <div className="mt-6">
              <Link to="/" className="text-indigo-400 hover:text-indigo-300">Go to Home</Link>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-semibold text-red-400">Error</h2>
            <p className="mt-4 text-slate-300">{status.message}</p>
            <div className="mt-6">
              <Link to="/" className="text-indigo-400 hover:text-indigo-300">Go to Home</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
