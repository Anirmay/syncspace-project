import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom'; // For linking to workspace details later

// Simple Loading Spinner Component
const Spinner = () => (
    <div className="flex justify-center items-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400"></div>
    </div>
);

// Component to Display List of Workspaces
const WorkspaceList = ({ workspaces, loading, error }) => {
    if (loading) return <Spinner />;
    if (error) return <p className="text-red-500 text-center">{error}</p>;
    if (workspaces.length === 0) {
        return <p className="text-slate-400 text-center py-6">You haven't created or joined any workspaces yet.</p>;
    }

    return (
        <div className="space-y-4">
            {workspaces.map((ws) => (
                // TODO: Link to the actual workspace page later
                <Link to={`/workspace/${ws._id}`} key={ws._id} className="block p-6 bg-slate-700 rounded-lg shadow hover:bg-slate-600 transition-colors border border-slate-600">
                    <h3 className="text-xl font-semibold text-white">{ws.name}</h3>
                    <p className="text-sm text-slate-400 mt-1">Owner: {ws.owner?.username || 'Unknown'}</p>
                    <p className="text-xs text-slate-500 mt-2">Created: {new Date(ws.createdAt).toLocaleDateString()}</p>
                    {/* Add member count or other details later */}
                </Link>
            ))}
        </div>
    );
};

// Component with Form to Create a New Workspace
const CreateWorkspaceForm = ({ onWorkspaceCreated }) => {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { currentUser } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('Workspace name cannot be empty.');
            return;
        }
        setLoading(true);
        setError('');

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${currentUser.token}`,
                },
            };
            const response = await axios.post('http://localhost:5000/api/workspaces', { name }, config);
            setName(''); // Clear input field
            onWorkspaceCreated(response.data); // Notify parent component
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create workspace.');
            console.error("Create workspace error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 bg-slate-700 rounded-lg shadow border border-slate-600 mb-8">
            <h3 className="text-lg font-semibold text-white mb-3">Create New Workspace</h3>
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            <div className="flex flex-col sm:flex-row gap-3">
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter workspace name"
                    required
                    className="flex-grow bg-slate-600 rounded p-2 border border-slate-500 focus:border-indigo-500 focus:ring-indigo-500 outline-none text-white placeholder-slate-400"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Creating...' : 'Create'}
                </button>
            </div>
        </form>
    );
};


// Main Dashboard Page Component
const DashboardPage = () => {
    const { currentUser, logout } = useContext(AuthContext);
    const [workspaces, setWorkspaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Function to fetch workspaces
    const fetchWorkspaces = async () => {
        if (!currentUser || !currentUser.token) {
            setError('Authentication error.');
            setLoading(false);
            return;
        }
        setLoading(true);
        setError('');
        try {
            const config = {
                headers: { Authorization: `Bearer ${currentUser.token}` },
            };
            const response = await axios.get('http://localhost:5000/api/workspaces', config);
            setWorkspaces(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch workspaces.');
            console.error("Fetch workspaces error:", err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch workspaces on component mount
    useEffect(() => {
        fetchWorkspaces();
    }, [currentUser]); // Re-fetch if user logs in/out

    // Callback function to add new workspace to the list without re-fetching all
    const handleWorkspaceCreated = (newWorkspace) => {
        setWorkspaces([newWorkspace, ...workspaces]); // Add to the beginning of the list
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white p-8 font-inter">
            {/* Simple Header */}
             <header className="mb-8 flex justify-between items-center">
                 <h1 className="text-3xl font-bold text-white">Your Workspaces</h1>
                 <div>
                     <span className="mr-4 text-slate-300">Hi, {currentUser?.user?.username || 'User'}!</span>
                     {/* Can add links to Profile/Settings here later */}
                     <Link to="/profile" className="text-indigo-400 hover:underline mr-4">Profile</Link>
                     <button
                         onClick={logout}
                         className="text-red-500 hover:underline"
                     >
                         Logout
                     </button>
                 </div>
             </header>

            {/* Create Workspace Form */}
            <CreateWorkspaceForm onWorkspaceCreated={handleWorkspaceCreated} />

            {/* List of Workspaces */}
            <WorkspaceList workspaces={workspaces} loading={loading} error={error} />

        </div>
    );
};

export default DashboardPage;
