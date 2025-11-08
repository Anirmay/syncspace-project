import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext.jsx';

const InvitationRespondPage = () => {
  const { inviteId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [adminDeleted, setAdminDeleted] = useState(false);
  // Support different currentUser shapes
  const token = currentUser?.token || currentUser?.accessToken || currentUser?.user?.token;
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchInvite = async () => {
      try {
        setLoading(true);
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get(`${API_URL}/api/invitations/${inviteId}`, config);
        setInvitation(res.data);
      } catch (err) {
        console.error('Error loading invitation:', err);
        // If the invitation's workspace was removed by the admin, the server may return 404/410
        // or occasionally return a 5xx with a message that indicates the workspace was deleted.
        const status = err.response?.status;
        const serverMsg = err.response?.data?.message || err.response?.data?.error || '';
        const looksLikeWorkspaceDeleted = /workspace.*(not found|deleted|does not exist)|deleted.*workspace|not found/i.test(serverMsg);
        // Treat 404/410 as deleted. Also treat 5xx as deleted when server message indicates so,
        // or when the 5xx response has no usable message (common when server throws a raw error).
        if (status === 404 || status === 410 || (status >= 500 && (looksLikeWorkspaceDeleted || !serverMsg))) {
          setAdminDeleted(true);
          setError('The project for this invitation was deleted by the admin.');
        } else {
          setError(serverMsg || 'Failed to load invitation.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchInvite();
  }, [inviteId, token]);

  const respond = async (action) => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.patch(`${API_URL}/api/invitations/${inviteId}/respond`, { action }, config);
      // On accept: redirect to workspace manage page; on reject: back to invitations
      if (action === 'accept') {
        const wsId = invitation?.workspace?._id || invitation?.workspace;
        // After accepting, navigate the user to the workspace page (not the manager page)
        navigate(`/workspace/${wsId}`);
      } else {
        navigate('/invitations');
      }
    } catch (err) {
      console.error('Error responding to invitation:', err);
      setError(err.response?.data?.message || 'Failed to respond to invitation.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !invitation) return <div className="min-h-screen bg-slate-900 text-white p-8">Loading...</div>;
  if (error && !invitation) return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="mb-4">
        <Link to="/invitations" className="text-indigo-400 hover:underline">&larr; Back to Invitation page</Link>
      </div>
      <p className="text-red-500">{error}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8 font-inter">
      <header className="mb-8 flex justify-between items-start">
        <div>
          <Link to="/" className="text-indigo-400 hover:underline mb-2 hidden md:block">&larr; Back to Homepage</Link>
          <h1 className="text-3xl font-bold text-white">Invitation</h1>
        </div>
      </header>

      {invitation ? (
        (invitation.workspace ? (
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 max-w-3xl">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-white">Workspace: <span className="font-medium text-slate-300">{invitation.workspace?.name || 'Unknown'}</span></h2>
            <p className="text-sm text-slate-400 mt-1">Invited by: <span className="text-slate-300">{invitation.inviter?.username || 'A manager'}</span></p>
            <p className="text-sm text-slate-400 mt-1">Invitee email: <span className="text-slate-300">{invitation.inviteeEmail}</span></p>
            <p className="text-sm text-slate-400 mt-1">Status: <span className="text-slate-300">{invitation.status}</span></p>
            {invitation.createdAt && (
              <p className="text-xs text-slate-500 mt-1">Received: {new Date(invitation.createdAt).toLocaleDateString()}</p>
            )}
          </div>

          {/* Project description (if provided) */}
          {invitation.workspace?.description ? (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-200 mb-2">Project Description</h3>
              <p className="text-sm text-slate-300 leading-relaxed">{invitation.workspace.description}</p>
            </div>
          ) : (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-200 mb-2">Project Description</h3>
              <p className="text-sm text-slate-400 italic">No description provided.</p>
            </div>
          )}

          <div className="flex items-center space-x-3">
            <button
              onClick={() => respond('accept')}
              className={`px-4 py-2 rounded text-white ${loading || invitation.status !== 'pending' ? 'bg-emerald-500/60 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-400'}`}
              disabled={loading || invitation.status !== 'pending'}
            >
              Accept
            </button>
            <button
              onClick={() => respond('reject')}
              className={`px-4 py-2 rounded text-white ${loading || invitation.status !== 'pending' ? 'bg-red-500/60 cursor-not-allowed' : 'bg-red-600 hover:bg-red-500'}`}
              disabled={loading || invitation.status !== 'pending'}
            >
              Reject
            </button>
          </div>

          {error && <p className="text-red-400 mt-4">{error}</p>}
          </div>
        ) : (
          // If invitation exists but workspace was deleted, show a simple top-line message (not a boxed card)
          <div className="mb-6">
            <div className="mb-4">
              <Link to="/invitations" className="text-indigo-400 hover:underline">&larr; Back to Invitation page</Link>
            </div>
            <p className="text-red-500">The project for this invitation was deleted by the admin.</p>
          </div>
        ))
      ) : (
        <p className="text-slate-400">No invitation found.</p>
      )}
    </div>
  );
};

export default InvitationRespondPage;
