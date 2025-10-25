    import React, { useContext, useState } from 'react';
    import { AuthContext } from '../context/AuthContext';
    import { Link, useNavigate } from 'react-router-dom';
    import axios from 'axios'; // <-- Import Axios

    // ... (ToggleSwitch component remains the same) ...
    const ToggleSwitch = ({ label, enabled, setEnabled }) => { /* ... */ };

    const AccountSettingsPage = () => {
        // ADD currentUser to get the token
        const { logout, currentUser } = useContext(AuthContext);
        const navigate = useNavigate();
        const [notificationsEnabled, setNotificationsEnabled] = useState(true);
        const [isDarkMode, setIsDarkMode] = useState(true);
        const [deleteError, setDeleteError] = useState(''); // State for delete error

        const handleLogout = () => {
            logout();
            navigate('/');
        };

        const handleDeleteAccount = async () => { // Make async
            setDeleteError(''); // Clear previous errors
            // Use window.confirm for a simple confirmation
            const confirmed = window.confirm(
                'Are you absolutely sure you want to delete your account? This action cannot be undone.'
            );

            if (confirmed) {
                if (!currentUser || !currentUser.token) {
                     setDeleteError('Authentication error. Please log in again.');
                     return;
                }
                try {
                     const config = {
                         headers: {
                             Authorization: `Bearer ${currentUser.token}`, // Send token
                         },
                     };
                    // Make DELETE request to the backend
                    const response = await axios.delete('http://localhost:5000/api/users/me', config);
                    console.log(response.data.message); // Log success
                    alert('Account deleted successfully.'); // Show confirmation alert
                    logout(); // Log the user out
                    navigate('/'); // Redirect to home
                } catch (err) {
                    console.error("Delete account error:", err);
                    const message = err.response?.data?.message || 'Failed to delete account. Please try again.';
                    setDeleteError(message);
                    alert(`Error: ${message}`); // Show error alert
                }
            } else {
                console.log('Account deletion cancelled.');
            }
        };

        // --- Render function ---
        return (
            <div className="min-h-screen bg-slate-900 text-white p-8 font-inter">
                <div className="container mx-auto max-w-2xl bg-slate-800 rounded-lg shadow-xl p-8 border border-slate-700">
                    <h1 className="text-3xl font-bold mb-8 text-center text-indigo-400">Account Settings</h1>
                    <div className="space-y-6">
                        {/* Security Section */}
                        <div className="p-6 bg-slate-700 rounded-md">
                            <h2 className="text-xl font-semibold mb-4 text-slate-200">Security</h2>
                            <div className="space-y-3">
                                <button className="text-indigo-400 hover:text-indigo-300 w-full text-left disabled:text-slate-500 disabled:cursor-not-allowed" disabled>
                                    Change Password (coming soon)
                                </button>
                                <button className="text-indigo-400 hover:text-indigo-300 w-full text-left disabled:text-slate-500 disabled:cursor-not-allowed" disabled>
                                     Change Email Address (coming soon)
                                </button>
                            </div>
                        </div>
                        {/* Preferences Section */}
                        <div className="p-6 bg-slate-700 rounded-md">
                            <h2 className="text-xl font-semibold mb-4 text-slate-200">Preferences</h2>
                            <div className="space-y-4">
                                <ToggleSwitch label="Email Notifications" enabled={notificationsEnabled} setEnabled={setNotificationsEnabled} />
                                <ToggleSwitch label="Dark Mode Theme" enabled={isDarkMode} setEnabled={setIsDarkMode} />
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
    

