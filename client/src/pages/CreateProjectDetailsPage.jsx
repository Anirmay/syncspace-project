import React, { useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Spinner = () => (
    <div className="flex justify-center items-center py-2">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-400"></div>
    </div>
);

// Checkbox component for user selection
const UserCheckbox = ({ user, isSelected, onToggle }) => (
    <div className="flex items-center p-2 rounded hover:bg-slate-600 transition-colors">
        <input
            type="checkbox"
            id={`user-${user._id}`}
            checked={isSelected}
            // This calls the onToggle function passed down as a prop
            onChange={() => onToggle(user._id)}
            className="h-4 w-4 rounded border-slate-500 text-indigo-600 focus:ring-indigo-500 bg-slate-600 mr-3 cursor-pointer" // Added cursor
        />
        <label htmlFor={`user-${user._id}`} className="text-sm text-slate-200 cursor-pointer">
            {user.username} ({user.email})
        </label>
    </div>
);


const CreateProjectDetailsPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { currentUser } = useContext(AuthContext);

    const initialProjectName = location.state?.projectName || '';

    const [projectName, setProjectName] = useState(initialProjectName);
    const [description, setDescription] = useState('');
    const [userList, setUserList] = useState([]);
    const [selectedMemberIds, setSelectedMemberIds] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [fetchUsersError, setFetchUsersError] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    // TODO: Add state for fetched user list for invites

    // Redirect back if no project name was passed (user accessed directly)
    useEffect(() => {
        if (!initialProjectName && !loading) { // Check loading state too
            console.warn("No project name found in location state, redirecting.");
            navigate('/dashboard', { replace: true }); // Use replace to avoid history entry
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialProjectName, navigate, loading]);

     // TODO: Fetch user list for invites when component mounts
     // useEffect(() => { fetchUsers(); }, []);

    // --- NEW: Fetch user list ---
     useEffect(() => {
        let isMounted = true; // Prevent state update on unmounted component
        const fetchUsers = async () => {
            if (!currentUser || !currentUser.token) return;
            setLoadingUsers(true);
            setFetchUsersError('');
            try {
                const config = { headers: { Authorization: `Bearer ${currentUser.token}` } };
                const response = await axios.get('http://localhost:5000/api/users', config);
                if (isMounted) {
                    setUserList(response.data);
                }
            } catch (err) {
                console.error("Error fetching users:", err);
                if (isMounted) {
                    setFetchUsersError(err.response?.data?.message || 'Failed to load users.');
                }
            } finally {
                if (isMounted) {
                    setLoadingUsers(false);
                }
            }
        };
        fetchUsers();
        return () => { isMounted = false; }; // Cleanup function
     }, [currentUser]);
     // --- END NEW ---

     const handleMemberToggle = (userId) => {
         setSelectedMemberIds(prevSelected =>
             prevSelected.includes(userId)
                 ? prevSelected.filter(id => id !== userId) // Remove if already selected
                 : [...prevSelected, userId] // Add if not selected
         );
         console.log("Selected members:", selectedMemberIds); // Log selection change
     };

    const handleFinalSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');
        if (!projectName) { setError('Project Name is missing.'); setLoading(false); return; }

        try {
            const config = {
                 headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${currentUser.token}`,
                },
             };
            const payload = { name: projectName, description: description, membersToInvite: selectedMemberIds };
            console.log("Submitting final project data:", payload);

            await axios.post('http://localhost:5000/api/workspaces', payload, config);
            navigate('/dashboard'); // Redirect on success
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create project.');
            console.error("Final create project error:", err);
            setLoading(false); // Make sure loading stops on error
        }
        // No need for finally setLoading(false) if it's done in catch
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white p-8 font-inter">
            <div className="container mx-auto max-w-2xl">
                <header className="mb-8">
                     <Link to="/dashboard" className="text-indigo-400 hover:underline mb-4 inline-block">&larr; Back to Workspaces</Link>
                     <h1 className="text-3xl font-bold text-white">Create New Project - Details</h1>
                </header>

                <form onSubmit={handleFinalSubmit} className="bg-slate-800 p-8 rounded-lg shadow-xl border border-slate-700 space-y-6">
                    {error && <p className="text-red-500 text-sm text-center bg-red-900/30 p-3 rounded">{error}</p>}

                    {/* Project Name */}
                    <div>
                         <label htmlFor="projectName" className="block text-sm font-medium text-slate-300 mb-1">Project Name</label>
                         <input type="text" id="projectName" value={projectName} readOnly className="w-full bg-slate-700 rounded p-3 border border-slate-600 outline-none text-slate-400 cursor-not-allowed"/>
                    </div>

                    {/* Project Description */}
                    <div>
                         <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-1">Project Description (Optional)</label>
                         <textarea id="description" rows="4" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-slate-700 rounded p-3 border border-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-white placeholder-slate-400 resize-none" placeholder="Add a brief description..."></textarea>
                    </div>

                    {/* Invite Members Section */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Invite Members</label>
                        <div className="bg-slate-700 rounded p-3 border border-slate-600 max-h-48 overflow-y-auto">
                            {loadingUsers && <Spinner />}
                            {fetchUsersError && <p className="text-red-400 text-sm">{fetchUsersError}</p>}
                            {!loadingUsers && !fetchUsersError && userList.length === 0 && ( <p className="text-slate-400 text-sm">No other users found to invite.</p> )}
                            {!loadingUsers && !fetchUsersError && userList.length > 0 && (
                                <div className="space-y-1">
                                    {userList.map(user => (
                                        <UserCheckbox
                                            key={user._id}
                                            user={user}
                                            isSelected={selectedMemberIds.includes(user._id)}
                                            // Ensure this function exists in scope
                                            onToggle={handleMemberToggle}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-4 pt-4 border-t border-slate-700">
                        <button type="button" onClick={() => navigate('/dashboard')} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-6 rounded-lg transition-colors">Cancel</button>
                        <button type="submit" disabled={loading || !projectName} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            {loading ? 'Creating...' : 'Create Project'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateProjectDetailsPage;
