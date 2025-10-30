import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

// Simple Loading Spinner Component
const Spinner = () => (
    <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400"></div>
    </div>
);

const InvitationsPage = () => {
    const { currentUser, logout } = useContext(AuthContext); // Get logout
    const navigate = useNavigate(); // Get navigate
    const [ownedProjects, setOwnedProjects] = useState([]);
    const [invitedProjects, setInvitedProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('send'); // 'send' or 'join'

    useEffect(() => {
        const fetchData = async () => {
            if (!currentUser || !currentUser.token) {
                setError('Authentication required.');
                setLoading(false);
                navigate('/login'); // Redirect if not authenticated
                return;
            }
            setLoading(true);
            setError('');
            try {
                const config = { headers: { Authorization: `Bearer ${currentUser.token}` } };
                
                // Fetch both lists in parallel
                const [managedRes, pendingRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/workspaces/managed', config), // Fetches projects user owns/admins
                    axios.get('http://localhost:5000/api/invitations/pending', config) // Fetches pending invites for user
                ]);

                setOwnedProjects(managedRes.data);
                setInvitedProjects(pendingRes.data); // Data from /api/invitations/pending

            } catch (err) {
                console.error("Error fetching invitation data:", err);
                setError(err.response?.data?.message || 'Failed to load invitation data.');
                if (err.response?.status === 401 || err.response?.status === 403) {
                    logout(); // Logout on auth error
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [currentUser, navigate, logout]); // Add navigate and logout to dependencies

    return (
        <div className="min-h-screen bg-slate-900 text-white p-8 font-inter">
            <header className="mb-8 flex justify-between items-center">
                <div>
                     <Link to="/" className="text-indigo-400 hover:underline mb-2 block">&larr; Back to Homepage</Link>
                     <h1 className="text-3xl font-bold text-white">Invitations</h1>
                 </div>
                 <div className="flex items-center space-x-4">
                      <span className="text-slate-300">Hi, {currentUser?.user?.username || 'User'}!</span>
                      <button onClick={logout} className="text-red-500 hover:underline">Logout</button>
                 </div>
            </header>

            {/* Tab Navigation */}
            <div className="mb-6 border-b border-slate-700">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('send')}
                        className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-150 ease-in-out focus:outline-none ${
                            activeTab === 'send'
                                ? 'border-indigo-500 text-indigo-400'
                                : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-500'
                        }`}
                    >
                        Send Requests ({loading ? '...' : ownedProjects.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('join')}
                        className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-150 ease-in-out focus:outline-none ${
                            activeTab === 'join'
                                ? 'border-indigo-500 text-indigo-400'
                                : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-500'
                        }`}
                    >
                         Join Requests ({loading ? '...' : invitedProjects.length})
                    </button>
                </nav>
            </div>

            {loading && <Spinner />}
            {error && <p className="text-red-500 text-center py-6">{error}</p>}

            {!loading && !error && (
                <div>
                    {/* Send Requests Tab Content */}
                    {activeTab === 'send' && (
                        <section>
                            <h2 className="text-xl font-semibold mb-4 text-slate-200">Projects You Manage</h2>
                             {ownedProjects.length === 0 ? (
                                <p className="text-slate-400">You don't own or manage any projects to send invites from.</p>
                             ) : (
                                <div className="space-y-3">
                                    {ownedProjects.map(project => (
                                        <Link
                                            // This link goes to the page where you can manage invites *for* this project
                                            to={`/invitations/manage/${project._id}`} 
                                            key={project._id}
                                            className="block p-4 bg-slate-800 rounded-lg shadow hover:bg-slate-700 transition-colors border border-slate-700"
                                        >
                                            <h3 className="font-medium text-white">{project.name}</h3>
                                            <p className="text-xs text-slate-400 mt-1">Owner: {project.owner?.username || 'N/A'}</p>
                                        </Link>
                                    ))}
                                </div>
                             )}
                        </section>
                    )}

                    {/* Join Requests Tab Content */}
                    {activeTab === 'join' && (
                        <section>
                            <h2 className="text-xl font-semibold mb-4 text-slate-200">Pending Invitations</h2>
                            {invitedProjects.length === 0 ? (
                                <p className="text-slate-400">You have no pending invitations.</p>
                             ) : (
                                <div className="space-y-3">
                                    {/* Updated to use the data structure from invitation.controller.js */}
                                    {invitedProjects.map(invite => (
                                        <Link
                                            // This link goes to the page where you can accept/reject
                                            to={`/invitations/respond/${invite._id}`} 
                                            key={invite._id}
                                            className="block p-4 bg-slate-800 rounded-lg shadow hover:bg-slate-700 transition-colors border border-slate-700"
                                        >
                                            <h3 className="font-medium text-white">{invite.workspace?.name || 'Unknown Project'}</h3>
                                            <p className="text-xs text-slate-400 mt-1">Invited by: {invite.inviter?.username || 'N/A'}</p>
                                            <p className="text-xs text-slate-500 mt-1">Received: {new Date(invite.createdAt).toLocaleDateString()}</p>
                                        </Link>
                                    ))}
                                </div>
                             )}
                        </section>
                    )}
                </div>
            )}
        </div>
    );
};

export default InvitationsPage;

