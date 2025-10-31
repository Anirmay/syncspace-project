import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
const API_BASE = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL : 'http://localhost:5000';
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
    <div className="min-h-screen bg-slate-900 text-white p-8 font-inter">
      <div className="container mx-auto max-w-2xl bg-slate-800 rounded-lg shadow-xl p-8 border border-slate-700 relative">

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
            <div className="flex justify-center">
                <div className="w-32 h-32 bg-indigo-500 rounded-full flex items-center justify-center text-4xl font-bold border-4 border-slate-700">
                    {profileData.username ? profileData.username.charAt(0).toUpperCase() : '?'}
                </div>
            </div>

            {/* Name */}
             <div className="p-4 bg-slate-700 rounded-md">
               <label htmlFor="name" className="text-sm text-slate-400 block mb-1">Name</label>
               {isEditing ? (
                   <input
                       type="text" id="name" value={name} onChange={(e) => setName(e.target.value)}
                       className="w-full bg-slate-600 rounded p-2 border border-slate-500 focus:border-indigo-500 focus:ring-indigo-500 outline-none text-white" // Added text-white
                       placeholder="Your full name"
                   />
               ) : ( <p className="text-lg font-semibold">{name || '(Not set)'}</p> )}
             </div>

            {/* Username */}
             <div className="p-4 bg-slate-700 rounded-md">
               <label htmlFor="username" className="text-sm text-slate-400 block mb-1">Username</label>
               {isEditing ? (
                    <input
                       type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)}
                       className="w-full bg-slate-600 rounded p-2 border border-slate-500 focus:border-indigo-500 focus:ring-indigo-500 outline-none text-white" // Added text-white
                    />
               ) : ( <p className="text-lg font-semibold">{profileData.username}</p> )}
          {usernameError && <p className="text-sm text-red-400 mt-1">{usernameError}</p>}
             </div>

            {/* About */}
            <div className="p-4 bg-slate-700 rounded-md">
              <label htmlFor="about" className="text-sm text-slate-400 block mb-1">About</label>
              {isEditing ? (
                   <textarea
                       id="about" value={about} onChange={(e) => setAbout(e.target.value)}
                       className="w-full bg-slate-600 rounded p-2 border border-slate-500 focus:border-indigo-500 focus:ring-indigo-500 outline-none h-24 resize-none text-white" // Added text-white
                       placeholder="Tell us a bit about yourself..."
                   />
              ) : ( <p className="text-lg italic text-slate-300">{about || '(Not set)'}</p> )}
            </div>

            {/* Email */}
            <div className="p-4 bg-slate-700 rounded-md">
              <p className="text-sm text-slate-400">Email Address</p>
              <p className="text-lg font-semibold text-slate-300">{profileData.email}</p>
              {isEditing && <p className="text-xs text-slate-500 mt-1">Email address cannot be changed here.</p>}
            </div>

            {/* Save/Cancel Buttons */}
            {isEditing && (
                <div className="flex justify-center gap-4 mt-6"> {/* Use flex for better alignment */}
                    <button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">Save Changes</button>
                    <button onClick={handleEditToggle} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-6 rounded-lg transition-colors">Cancel</button>
                </div>
            )}
      {/* Success / Error messages for save */}
      {saveSuccess && <p className="text-center text-green-400 mt-4">{saveSuccess}</p>}
      {error && <p className="text-center text-red-500 mt-4">{error}</p>}
          </div>
        )}

        {/* Back Link */}
        {!isEditing && (
             <div className="mt-8 text-center">
              <Link to="/" className="text-indigo-400 hover:text-indigo-300 transition-colors">&larr; Back to Home</Link>
            </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;

