import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

// Simple Loading Spinner Component
const Spinner = () => (
    <div className="flex justify-center items-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400"></div>
    </div>
);

// Component to Display List of Workspaces
const WorkspaceList = ({ title, workspaces, loading, error, onUpdateStatus }) => {
    if (workspaces.length === 0) {
        return <p className="text-slate-500 text-sm italic px-6 pb-4">{`No ${title.toLowerCase()} yet.`}</p>;
    }

    return (
        <div className="space-y-4 px-6 pb-6">
            {workspaces.map((ws) => (
                <div key={ws._id} className="p-6 card flex justify-between items-center">
                    <Link to={`/workspace/${ws._id}`} className="flex-grow mr-4 group"> {/* Added group */}
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">{ws.name}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Owner: {ws.owner?.username || 'Unknown'}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">Created: {new Date(ws.createdAt).toLocaleDateString()}</p>
                    </Link>
                    <button
                        onClick={() => onUpdateStatus(ws._id, ws.status === 'active' ? 'archived' : 'active')}
                        className={`text-xs font-medium py-1 px-3 rounded-full ${
                            ws.status === 'active'
                            ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                            : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                        } transition-colors shadow-sm`}
                        title={ws.status === 'active' ? 'Mark as Done (Archive)' : 'Reactivate Project'}
                    >
                        {ws.status === 'active' ? 'Archive' : 'Reactivate'}
                    </button>
                </div>
            ))}
        </div>
    );
};

// Component with Form to Create a New Workspace
const CreateWorkspaceForm = ({ onWorkspaceCreated }) => {
    const [name, setName] = useState('');
    // Removed unused loading/error state for this simplified form
    const { currentUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) {
            // Use a simple alert or a dedicated error state if needed
            alert('Workspace name cannot be empty.'); 
            return;
        }
        // Navigate to a detail page, passing the name
        navigate('/create-project-details', { state: { projectName: name } });
    };

    return (
        <form onSubmit={handleSubmit} className="card p-6 mb-8">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Create New Workspace</h3>
            <div className="flex flex-col sm:flex-row gap-3">
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter workspace name"
                    required
                    className="flex-grow bg-slate-100 dark:bg-slate-800 rounded p-3 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white placeholder-slate-400"
                />
                <button
                    type="submit"
                    className="btn-primary"
                >
                    Next 
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
    const navigate = useNavigate(); // Added useNavigate

    // --- ADD THIS LINE ---
    // This is your live backend URL from the .env file
    const API_URL = import.meta.env.VITE_API_URL;

    // Function to fetch workspaces
    const fetchWorkspaces = async () => {
         // If there's no logged-in user, don't redirect — show public/empty state instead
         if (!currentUser || !currentUser.token) {
             setError('');
             setWorkspaces([]);
             setLoading(false);
             return;
         }
         setLoading(true); 
         setError('');
         try {
             const config = { headers: { Authorization: `Bearer ${currentUser.token}` } };
             // --- FIX #1 ---
             // OLD: const response = await axios.get('http://localhost:5000/api/workspaces/my', config); 
             const response = await axios.get(`${API_URL}/api/workspaces/my`, config); 
             // --- END FIX ---
             setWorkspaces(response.data);
            } catch (err) {
             setError(err.response?.data?.message || 'Failed to fetch workspaces.'); 
             console.error("Fetch workspaces error:", err);
             // Handle auth errors specifically
             if (err.response?.status === 401 || err.response?.status === 403) {
                 logout(); // Log out user
                 navigate('/login'); // Redirect to login
             }
        } finally { 
             setLoading(false); 
        }
       };

    // Fetch workspaces on component mount
    useEffect(() => {
        fetchWorkspaces();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser]); // Re-fetch if user changes

    const handleWorkspaceCreated = () => {
        // Refetch workspaces after creation (or after navigating back)
        // This ensures the new workspace appears
        fetchWorkspaces(); 
       };

    const handleUpdateStatus = async (workspaceId, newStatus) => {
         setError(''); 
         const originalWorkspaces = [...workspaces];
         setWorkspaces(prev => prev.map(ws =>
             ws._id === workspaceId ? { ...ws, status: newStatus } : ws
         ));

        try {
            const config = { headers: { Authorization: `Bearer ${currentUser.token}` } };
            // Ensure the route matches your backend (using :workspaceId likely)
            // --- FIX #2 ---
            // OLD: await axios.patch(`http://localhost:5000/api/workspaces/${workspaceId}/status`, { status: newStatus }, config);
            await axios.patch(`${API_URL}/api/workspaces/${workspaceId}/status`, { status: newStatus }, config);
        } catch (err) {
            setError(err.response?.data?.message || `Failed to update workspace status.`);
            console.error("Update status error:", err);
            setWorkspaces(originalWorkspaces); // Revert on error
            if (err.response?.status === 401 || err.response?.status === 403) {
                logout();
                navigate('/login');
            }
        }
    };

    const activeWorkspaces = workspaces.filter(ws => ws.status === 'active');
    const archivedWorkspaces = workspaces.filter(ws => ws.status === 'archived');

    return (
        <div className="min-h-screen font-inter bg-white text-slate-900 dark:bg-slate-900 dark:text-white p-8">
             <Link to="/" className="text-indigo-400 hover:underline mb-4 hidden md:block">&larr; Back to Homepage</Link>
             <header className="mb-8 flex flex-wrap justify-between items-center gap-4 bg-transparent"> {/* header */}
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Your Workspaces</h1>
                                <div className="flex items-center space-x-4"> {/* Grouped user info/actions */}
                                    {currentUser ? null : (
                                        <>
                                            <Link to="/login" className="text-indigo-600 dark:text-indigo-300 hover:underline">Login</Link>
                                            <Link to="/register" className="btn-primary">Sign up</Link>
                                        </>
                                    )}
                                </div>
             </header>

            <div className="mb-10 px-0 sm:px-6"> {/* Adjusted padding */}
                <CreateWorkspaceForm onWorkspaceCreated={handleWorkspaceCreated} />
                {/* Display general fetch error here */}
                {error && <p className="text-red-500 text-center mt-4">{error}</p>} 
            </div>


            {loading ? <Spinner/> : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    <section>
                        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4 px-6 border-b border-slate-200 dark:border-slate-700 pb-2">
                            Running Projects ({activeWorkspaces.length})
                        </h2>
                        <WorkspaceList
                            title="Running Projects"
                            workspaces={activeWorkspaces}
                            loading={false} 
                            error={null} 
                            onUpdateStatus={handleUpdateStatus}
                        />
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4 px-6 border-b border-slate-200 dark:border-slate-700 pb-2">
                            Done Projects ({archivedWorkspaces.length})
                        </h2>
                         <WorkspaceList
                            title="Done Projects"
                            workspaces={archivedWorkspaces}
                            loading={false}
                            error={null}
                            onUpdateStatus={handleUpdateStatus}
                        />
                    </section>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;