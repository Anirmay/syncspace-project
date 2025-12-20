import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
const API_BASE = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL : 'https://syncspace-project.onrender.com';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

// Placeholder Edit Icon
const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block"> {/* Removed ml-2 */}
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
    </svg>
);

// --- NEW: Added CloseIcon Definition ---
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block"> {/* Adjusted size */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
// --- END NEW ---


const ProfilePage = () => {
  const { currentUser } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  // Placeholder state for editable fields
  const [name, setName] = useState('');
  const [about, setAbout] = useState('');
  const [username, setUsername] = useState('');
  // Email is not editable

  useEffect(() => {
    const fetchProfile = async () => {
        if (!currentUser || !currentUser.token) {
            setError('You must be logged in to view this page.');
            setLoading(false);
            return;
          }

          setLoading(true);
          setError('');
          try {
            const token = currentUser?.token || currentUser?.user?.token;
            const config = {
              headers: { Authorization: `Bearer ${token}` },
            };
            const response = await axios.get(`${API_BASE}/api/users/me`, config);
            setProfileData(response.data);
            setUsername(response.data.username || '');
            setName(response.data.name || '');
            setAbout(response.data.about || '');
            // Initialize name and about if they exist in response (add later)
            // setName(response.data.name || '');
            // setAbout(response.data.about || '');
          } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch profile data.');
            console.error("Profile fetch error:", err);
          } finally {
            setLoading(false);
          }
    };

    fetchProfile();
  }, [currentUser]);

  const handleEditToggle = () => {
      setIsEditing(!isEditing);
      if (isEditing && profileData) {
          setUsername(profileData.username || '');
          // Reset name/about later
          setUsernameError('');
          setError('');
          setSaveSuccess('');
      }
  };

  const handleSave = async () => {
    setUsernameError('');
    setError('');
    setSaveSuccess('');
    try {
      const token = currentUser?.token || currentUser?.user?.token;
      const cfg = { headers: { Authorization: `Bearer ${token}` } };
      const payload = { name, username, about };
      const res = await axios.patch(`${API_BASE}/api/users/me`, payload, cfg);
      setProfileData(res.data);
      setUsername(res.data.username || '');
      setName(res.data.name || '');
      setAbout(res.data.about || '');
      setIsEditing(false);
      setSaveSuccess('Profile updated successfully.');
      // clear any previous field errors
      setUsernameError('');
    } catch (err) {
      console.error('Error saving profile:', err);
      const msg = err.response?.data?.message;
      // If server returned a validation/duplicate username error, show it inline
      if (err.response?.status === 400 && msg) {
        // Try to attach it to the username field if it mentions "username"
        if (msg.toLowerCase().includes('username')) {
          setUsernameError(msg);
        } else {
          setError(msg);
        }
      } else if (err.response?.status === 404) {
        setError('Profile endpoint not found (404). Please restart the backend server.');
      } else {
        setError(msg || 'Failed to save profile.');
      }
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white p-4 sm:p-8 font-inter">
      <div className="container mx-auto max-w-2xl bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-2xl p-6 sm:p-8 border border-slate-700/50 relative">

        {/* Edit/Cancel Button */}
        {!loading && profileData && (
             <button
                onClick={handleEditToggle}
                className="absolute top-6 right-6 text-slate-400 hover:text-indigo-400 transition-colors p-2 rounded-full hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800" // Added focus styles
                aria-label={isEditing ? "Cancel Edit" : "Edit Profile"}
             >
                 {isEditing ? <CloseIcon /> : <EditIcon />} {/* Now CloseIcon is defined */}
             </button>
        )}

        <h1 className="text-3xl font-bold mb-8 text-center text-indigo-400">User Profile</h1>

        {loading && <p className="text-center text-slate-400">Loading profile...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {profileData && !loading && !error && (
          <div className="space-y-6">
            {/* Profile Picture */}
            <div className="flex justify-center mb-8">
                <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-4xl font-bold ring-4 ring-indigo-400/30 ring-offset-4 ring-offset-slate-800 shadow-xl transform hover:scale-105 transition-transform duration-300">
                    {profileData.username ? profileData.username.charAt(0).toUpperCase() : '?'}
                </div>
            </div>

            {/* Name */}
             <div className="p-4 bg-slate-700/50 backdrop-blur-sm rounded-lg border border-slate-600/50 shadow-lg hover:shadow-indigo-500/10 transition-all duration-300">
               <label htmlFor="name" className="text-sm text-slate-400 block mb-1">Name</label>
               {isEditing ? (
                   <input
                       type="text" id="name" value={name} onChange={(e) => setName(e.target.value)}
                       className="w-full bg-slate-600/50 rounded-lg p-3 border border-slate-500/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 outline-none text-white placeholder-slate-400 transition-all duration-300"
                       placeholder="Your full name"
                   />
               ) : ( <p className="text-lg font-semibold text-slate-100">{name || '(Not set)'}</p> )}
             </div>

            {/* Username */}
             <div className="p-4 bg-slate-700/50 backdrop-blur-sm rounded-lg border border-slate-600/50 shadow-lg hover:shadow-indigo-500/10 transition-all duration-300">
               <label htmlFor="username" className="text-sm text-slate-400 block mb-1 font-medium">Username</label>
               {isEditing ? (
                    <input
                       type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)}
                       className="w-full bg-slate-600/50 rounded-lg p-3 border border-slate-500/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 outline-none text-white placeholder-slate-400 transition-all duration-300"
                       placeholder="Choose a username"
                    />
               ) : ( <p className="text-lg font-semibold text-slate-100">{profileData.username}</p> )}
          {usernameError && <p className="text-sm text-red-400 mt-2 bg-red-400/10 p-2 rounded-lg">{usernameError}</p>}
             </div>

            {/* About */}
            <div className="p-4 bg-slate-700/50 backdrop-blur-sm rounded-lg border border-slate-600/50 shadow-lg hover:shadow-indigo-500/10 transition-all duration-300">
              <label htmlFor="about" className="text-sm text-slate-400 block mb-1 font-medium">About</label>
              {isEditing ? (
                   <textarea
                       id="about" value={about} onChange={(e) => setAbout(e.target.value)}
                       className="w-full bg-slate-600/50 rounded-lg p-3 border border-slate-500/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 outline-none h-32 resize-none text-white placeholder-slate-400 transition-all duration-300"
                       placeholder="Tell us a bit about yourself..."
                   />
              ) : ( <p className="text-lg text-slate-300">{about || '(Not set)'}</p> )}
            </div>

            {/* Email */}
            <div className="p-4 bg-slate-700/50 backdrop-blur-sm rounded-lg border border-slate-600/50 shadow-lg hover:shadow-indigo-500/10 transition-all duration-300">
              <p className="text-sm text-slate-400 font-medium">Email Address</p>
              <p className="text-lg font-semibold text-slate-100 mt-1">{profileData.email}</p>
              {isEditing && <p className="text-xs text-slate-400 mt-2 bg-slate-600/30 p-2 rounded-lg">Email address cannot be changed here.</p>}
            </div>

            {/* Save/Cancel Buttons */}
            {isEditing && (
                <div className="flex justify-center gap-4 mt-8">
                    <button 
                        onClick={handleSave} 
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800 shadow-lg hover:shadow-indigo-500/25"
                    >
                        Save Changes
                    </button>
                    <button 
                        onClick={handleEditToggle} 
                        className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 border border-slate-600 hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                    >
                        Cancel
                    </button>
                </div>
            )}
            
            {/* Success / Error messages for save */}
            {saveSuccess && (
                <div className="mt-6 text-center px-4 py-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400">
                    <p>{saveSuccess}</p>
                </div>
            )}
            {error && (
                <div className="mt-6 text-center px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
                    <p>{error}</p>
                </div>
            )}
          </div>
        )}

        {/* Back Link */}
        {!isEditing && (
             <div className="mt-8 text-center">
                <Link 
                    to="/" 
                    className="hidden md:flex items-center text-indigo-400 hover:text-indigo-300 transition-all duration-300 hover:translate-x-[-4px] group"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transform transition-transform group-hover:translate-x-[-4px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Home
                </Link>
            </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;

