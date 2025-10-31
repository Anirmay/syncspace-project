    import React, { useContext, useState, useEffect } from 'react';
    import { AuthContext } from '../context/AuthContext';
    import { Link, useNavigate } from 'react-router-dom';
    import axios from 'axios'; // <-- Import Axios
    const API_BASE = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL : 'http://localhost:5000';

    // Simple ToggleSwitch implementation
    const ToggleSwitch = ({ label, enabled, setEnabled }) => {
        const handle = (e) => {
            // Try to call setEnabled with the new boolean; fall back to calling without args
            if (typeof setEnabled === 'function') {
                try {
                    setEnabled(!enabled);
                } catch (err) {
                    try { setEnabled(); } catch (err2) { /* ignore */ }
                }
            }
        };

        return (
            <div className="flex items-center justify-between p-2 toggle-row rounded">
                <div className="text-sm text-slate-200">{label}</div>
                <button type="button" onClick={handle} aria-pressed={enabled} className={`w-12 h-6 rounded-full p-1 transition-colors ${enabled ? 'bg-indigo-500' : 'bg-slate-500'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform ${enabled ? 'translate-x-6' : ''}`} />
                </button>
            </div>
        );
    };

    const AccountSettingsPage = () => {
        // ADD currentUser to get the token
        const { logout, currentUser } = useContext(AuthContext);
        const navigate = useNavigate();
        const [notificationsEnabled, setNotificationsEnabled] = useState(true);
        const [webNotificationsEnabled, setWebNotificationsEnabled] = useState(true);
        const [isDarkMode, setIsDarkMode] = useState(() => {
            try {
                const v = localStorage.getItem('darkMode');
                return v === null ? true : v === 'true';
            } catch (e) {
                return true;
            }
        });
        const [deleteError, setDeleteError] = useState(''); // State for delete error
        const [prefsError, setPrefsError] = useState('');
        const [currentEmail, setCurrentEmail] = useState('');

        // Toast state
        const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });
        const showToast = (message, type = 'info', duration = 3500) => {
            setToast({ visible: true, message, type });
            setTimeout(() => setToast(t => ({ ...t, visible: false })), duration);
        };

        const handleLogout = () => {
            logout();
            navigate('/');
        };

        // Delete account confirmation modal
        const [showDeleteModal, setShowDeleteModal] = useState(false);
        const [isDeleting, setIsDeleting] = useState(false);

        // Security: change password/email states
        const [showChangePassword, setShowChangePassword] = useState(false);
        const [showChangeEmail, setShowChangeEmail] = useState(false);
        const [currentPasswordInput, setCurrentPasswordInput] = useState('');
        const [newPasswordInput, setNewPasswordInput] = useState('');
        const [changePwdError, setChangePwdError] = useState('');
        const [changePwdSuccess, setChangePwdSuccess] = useState('');

        const [newEmailInput, setNewEmailInput] = useState('');
        const [changeEmailError, setChangeEmailError] = useState('');
        const [changeEmailSuccess, setChangeEmailSuccess] = useState('');

        const handleChangePasswordSubmit = async (e) => {
            e.preventDefault();
            setChangePwdError('');
            setChangePwdSuccess('');
            if (!currentPasswordInput || !newPasswordInput) {
                setChangePwdError('Please provide current and new passwords.');
                return;
            }
            // If current and new passwords are identical, show friendly message
            if (currentPasswordInput === newPasswordInput) {
                setChangePwdError('Same password');
                showToast('Same password', 'error');
                return;
            }
            try {
                const token = currentUser?.token || currentUser?.user?.token;
                const cfg = { headers: { Authorization: `Bearer ${token}` } };
                await axios.patch(`${API_BASE}/api/users/me`, { currentPassword: currentPasswordInput, newPassword: newPasswordInput }, cfg);
                    setChangePwdSuccess('Password changed successfully.');
                    showToast('Password changed successfully.', 'success');
                // clear inputs and keep user logged in
                setCurrentPasswordInput('');
                setNewPasswordInput('');
                setShowChangePassword(false);
            } catch (err) {
                console.error('Change password error:', err);
                    const srvMsg = err.response?.data?.message || '';
                    if (srvMsg && srvMsg.toLowerCase().includes('incorrect')) {
                        setChangePwdError('Wrong Password');
                        showToast('Wrong Password', 'error');
                    } else {
                        setChangePwdError(srvMsg || 'Failed to change password.');
                        if (srvMsg) showToast(srvMsg, 'error');
                    }
            }
        };

        const handleChangeEmailSubmit = async (e) => {
            e.preventDefault();
            setChangeEmailError('');
            setChangeEmailSuccess('');
            if (!newEmailInput || !currentPasswordInput) {
                setChangeEmailError('Please provide a new email and your current password.');
                return;
            }
            // client-side same email check
            if (newEmailInput === currentEmail) {
                setChangeEmailError('Same email');
                showToast('Same email', 'error');
                return;
            }
            try {
                const token = currentUser?.token || currentUser?.user?.token;
                const cfg = { headers: { Authorization: `Bearer ${token}` } };
                const res = await axios.patch(`${API_BASE}/api/users/me`, { email: newEmailInput, currentPassword: currentPasswordInput }, cfg);
                // Server sends confirmation email to the new address; it does not immediately change the email.
                const msg = res.data?.message || 'A confirmation link was sent to the new email.';
                setChangeEmailSuccess(msg);
                showToast(msg, 'success');
                // store pendingEmail locally so the confirm page can detect the applied change
                if (res.data?.pendingEmail) {
                    try { localStorage.setItem('pendingEmail', res.data.pendingEmail); } catch (e) { /* ignore */ }
                }
                setNewEmailInput('');
                setCurrentPasswordInput('');
                setShowChangeEmail(false);
            } catch (err) {
                console.error('Change email error:', err);
                const srvMsg = err.response?.data?.message || '';
                if (srvMsg && srvMsg.toLowerCase().includes('incorrect')) {
                    setChangeEmailError('Wrong Password');
                    showToast('Wrong Password', 'error');
                } else {
                    setChangeEmailError(srvMsg || 'Failed to change email.');
                    if (srvMsg) showToast(srvMsg, 'error');
                }
            }
        };

        const handleDeleteAccount = async () => { // Make async
            setDeleteError(''); // Clear previous errors
            // Use window.confirm for a simple confirmation
                // show modal instead of browser confirm
                setShowDeleteModal(true);
        };

        const handleConfirmDelete = async () => {
            setDeleteError('');
            setIsDeleting(true);
            try {
                if (!currentUser) {
                    setDeleteError('Authentication error. Please log in again.');
                    setIsDeleting(false);
                    setShowDeleteModal(false);
                    return;
                }
                const token = currentUser?.token || currentUser?.user?.token;
                if (!token) {
                    setDeleteError('Authentication error. Please log in again.');
                    setIsDeleting(false);
                    setShowDeleteModal(false);
                    return;
                }
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const response = await axios.delete(`${API_BASE}/api/users/me`, config);
                console.log(response.data.message);
                setDeleteError('');
                setIsDeleting(false);
                setShowDeleteModal(false);
                logout();
                navigate('/');
            } catch (err) {
                console.error('Delete account error:', err);
                const message = err.response?.data?.message || 'Failed to delete account. Please try again.';
                setDeleteError(message);
                setIsDeleting(false);
                setShowDeleteModal(false);
            }
        };

    // Load current preference values from profile
    useEffect(() => {
        const loadPrefs = async () => {
            if (!currentUser) return;
            try {
                const token = currentUser?.token || currentUser?.user?.token;
                if (!token) return;
                const cfg = { headers: { Authorization: `Bearer ${token}` } };
                const res = await axios.get(`${API_BASE}/api/users/me`, cfg);
                const data = res.data || {};
                setNotificationsEnabled(typeof data.emailNotifications === 'boolean' ? data.emailNotifications : true);
                setWebNotificationsEnabled(typeof data.webNotifications === 'boolean' ? data.webNotifications : true);
                setCurrentEmail(data.email || '');
            } catch (err) {
                console.error('Error loading preferences:', err);
            }
        };
        loadPrefs();
    }, [currentUser]);

    const updatePreferences = async (newPrefs) => {
        setPrefsError('');
        if (!currentUser) {
            setPrefsError('Authentication required.');
            return;
        }
        try {
            const token = currentUser?.token || currentUser?.user?.token;
            const cfg = { headers: { Authorization: `Bearer ${token}` } };
            await axios.patch(`${API_BASE}/api/users/me`, newPrefs, cfg);
        } catch (err) {
            console.error('Failed to update preferences:', err);
            setPrefsError(err.response?.data?.message || 'Failed to update preferences.');
        }
    };

    const handleToggleEmailNotifications = async () => {
        const newVal = !notificationsEnabled;
        setNotificationsEnabled(newVal);
        await updatePreferences({ emailNotifications: newVal });
    };

    const handleToggleWebNotifications = async () => {
        const newVal = !webNotificationsEnabled;
        setWebNotificationsEnabled(newVal);
        await updatePreferences({ webNotifications: newVal });
    };

    // Apply dark mode class to document and persist
    useEffect(() => {
        try {
            if (isDarkMode) {
                document.documentElement.classList.add('dark');
                localStorage.setItem('darkMode', 'true');
            } else {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('darkMode', 'false');
            }
        } catch (e) {
            console.error('Could not persist dark mode:', e);
        }
    }, [isDarkMode]);

        // --- Render function ---
        return (
            <div className="min-h-screen bg-slate-900 text-white p-8 font-inter relative">
                {/* Toast container (slide down/up) */}
                <div className={`fixed inset-x-0 top-4 flex justify-center pointer-events-none z-50 transition-transform duration-300 ${toast.visible ? 'translate-y-0 opacity-100' : '-translate-y-24 opacity-0'}`}>
                    <div className={`max-w-lg w-full mx-4 pointer-events-auto rounded shadow-lg px-4 py-2 text-sm ${toast.type === 'success' ? 'bg-green-600' : toast.type === 'error' ? 'bg-red-600' : 'bg-indigo-600'}`}>
                        {toast.message}
                    </div>
                </div>

                {/* Delete confirmation modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                        <div className="bg-slate-800 rounded-lg shadow-lg max-w-md w-full p-6">
                            <h3 className="text-lg font-semibold text-red-400">Confirm account deletion</h3>
                            <p className="mt-4 text-sm text-slate-300">Are you absolutely sure you want to delete your account? This action cannot be undone.</p>
                            <div className="mt-6 flex justify-end gap-3">
                                <button onClick={() => { setShowDeleteModal(false); }} disabled={isDeleting} className="px-4 py-2 bg-slate-600 text-white rounded">Cancel</button>
                                <button onClick={handleConfirmDelete} disabled={isDeleting} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded">
                                    {isDeleting ? 'Deleting...' : 'Confirm'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="container mx-auto max-w-2xl bg-slate-800 rounded-lg shadow-xl p-8 border border-slate-700">
                    <h1 className="text-3xl font-bold mb-8 text-center text-indigo-400">Account Settings</h1>
                    <div className="space-y-6">
                        {/* Security Section */}
                        <div className="p-6 bg-slate-700 rounded-md">
                            <h2 className="text-xl font-semibold mb-4 text-slate-200">Security</h2>
                            <div className="space-y-3">
                                <div>
                                    <button onClick={() => { setShowChangePassword(!showChangePassword); setShowChangeEmail(false); }} className="text-indigo-400 hover:text-indigo-300 w-full text-left font-medium">
                                        {showChangePassword ? 'Cancel Change Password' : 'Change Password'}
                                    </button>
                                    {showChangePassword && (
                                        <form onSubmit={handleChangePasswordSubmit} className="mt-3 space-y-2">
                                            <input type="password" placeholder="Current password" value={currentPasswordInput} onChange={e => setCurrentPasswordInput(e.target.value)} className="w-full p-2 rounded bg-slate-600" />
                                            <input type="password" placeholder="New password" value={newPasswordInput} onChange={e => setNewPasswordInput(e.target.value)} className="w-full p-2 rounded bg-slate-600" />
                                            {changePwdError && <p className="text-red-400 text-sm">{changePwdError}</p>}
                                            {changePwdSuccess && <p className="text-green-400 text-sm">{changePwdSuccess}</p>}
                                            <div>
                                                <button type="submit" className="mt-2 bg-indigo-600 px-4 py-2 rounded">Save Password</button>
                                            </div>
                                        </form>
                                    )}
                                </div>

                                <div>
                                    <button onClick={() => { setShowChangeEmail(!showChangeEmail); setShowChangePassword(false); }} className="text-indigo-400 hover:text-indigo-300 w-full text-left font-medium">
                                        {showChangeEmail ? 'Cancel Change Email' : 'Change Email Address'}
                                    </button>
                                    {showChangeEmail && (
                                        <form onSubmit={handleChangeEmailSubmit} className="mt-3 space-y-2">
                                            <input type="email" placeholder="New email" value={newEmailInput} onChange={e => setNewEmailInput(e.target.value)} className="w-full p-2 rounded bg-slate-600" />
                                            <input type="password" placeholder="Current password" value={currentPasswordInput} onChange={e => setCurrentPasswordInput(e.target.value)} className="w-full p-2 rounded bg-slate-600" />
                                            {changeEmailError && <p className="text-red-400 text-sm">{changeEmailError}</p>}
                                            {changeEmailSuccess && <p className="text-green-400 text-sm">{changeEmailSuccess}</p>}
                                            <div>
                                                <button type="submit" className="mt-2 bg-indigo-600 px-4 py-2 rounded">Save Email</button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            </div>
                        </div>
                        {/* Preferences Section */}
                        <div className="p-6 bg-slate-700 rounded-md">
                            <h2 className="text-xl font-semibold mb-4 text-slate-200">Preferences</h2>
                            <div className="space-y-4">
                                <ToggleSwitch label="Email Notifications" enabled={notificationsEnabled} setEnabled={handleToggleEmailNotifications} />
                                <ToggleSwitch label="Web Notifications" enabled={webNotificationsEnabled} setEnabled={handleToggleWebNotifications} />
                                <ToggleSwitch label="Dark Mode Theme" enabled={isDarkMode} setEnabled={setIsDarkMode} />
                                {prefsError && <p className="text-red-400 text-sm">{prefsError}</p>}
                            </div>
                        </div>
                        {/* Actions Section */}
                        <div className="p-6 bg-slate-700 rounded-md">
                             <h2 className="text-xl font-semibold mb-4 text-slate-200">Account Actions</h2>
                             <div className="space-y-3">
                                <button onClick={handleLogout} className="w-full text-left text-yellow-500 hover:text-yellow-400 font-medium">Logout</button>
                                <button onClick={handleDeleteAccount} className="w-full text-left text-red-500 hover:text-red-400 font-medium">Delete Account</button>
                                {deleteError && <p className="text-red-500 text-sm mt-2">{deleteError}</p>}
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 text-center">
                        <Link to="/" className="text-indigo-400 hover:text-indigo-300 transition-colors">&larr; Back to Home</Link>
                    </div>
                </div>
            </div>
        );
    };

    export default AccountSettingsPage;
    

