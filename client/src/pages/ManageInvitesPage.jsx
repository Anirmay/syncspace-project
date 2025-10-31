import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

// --- Icons ---
const TrashIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg> );
const RefreshIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.183m0 0h-4.992m4.992 0v4.992" /></svg> );
// Round arrow refresh (resend) icon — circular arrow similar to provided image
const RoundRefreshIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-3.354-6.646" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 3v6h-6" />
    </svg>
);
const SendIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L6 12Zm0 0h7.5" /></svg> );
const Spinner = () => ( <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> );
const PageSpinner = () => ( <div className="flex justify-center items-center py-10"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400"></div></div>);
// --- End Icons ---

const ManageInvitesPage = () => {
    const { workspaceId } = useParams();
    const { currentUser, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const [workspace, setWorkspace] = useState(null);
    const [members, setMembers] = useState([]);
    const [invitations, setInvitations] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [inviteEmail, setInviteEmail] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [actionLoading, setActionLoading] = useState({});
    // Remove member modal state
    const [showRemoveModal, setShowRemoveModal] = useState(false);
    const [removeTarget, setRemoveTarget] = useState(null); // { memberUserId, username }
    const [isRemoving, setIsRemoving] = useState(false);

    // --- Fetch Data from API ---
    useEffect(() => {
    const fetchInviteData = async () => {
         if (!currentUser || !currentUserToken) return navigate('/login');
             setLoading(true);
             setError('');
             try {
        const config = { headers: { Authorization: `Bearer ${currentUserToken}` } };
                const [wsRes, membersRes, invitesRes, usersRes] = await Promise.all([
                    axios.get(`http://localhost:5000/api/workspaces/${workspaceId}`, config),
                    axios.get(`http://localhost:5000/api/workspaces/${workspaceId}/members`, config),
                    axios.get(`http://localhost:5000/api/invitations/workspace/${workspaceId}`, config),
                    axios.get(`http://localhost:5000/api/users`, config)
                ]);
                setWorkspace(wsRes.data); // This now includes the populated owner object
                setMembers(membersRes.data);
                setInvitations(invitesRes.data);
                setAllUsers(usersRes.data || []);
             } catch (err) {
                console.error("Error fetching data:", err);
                setError(err.response?.data?.message || 'Failed to load data.');
                 if (err.response?.status === 401 || err.response?.status === 403) {
                     logout();
                     navigate('/login');
                 }
             } finally {
                setLoading(false);
             }
        };
        fetchInviteData();
    }, [workspaceId, currentUser, navigate, logout]);

    // --- Handle Sending New Invite ---
    const handleSendInvite = async (e) => {
        e.preventDefault();
        if (!inviteEmail.trim()) { setError('Email is required.'); return; }
        setIsSending(true);
        setError('');
        try {
            const config = { headers: { Authorization: `Bearer ${currentUserToken}` } };
            const payload = { inviteeEmail, workspaceId };
            const response = await axios.post('http://localhost:5000/api/invitations', payload, config);
            setInvitations(prev => [response.data, ...prev]);
            setInviteEmail('');
        } catch (err) {
             console.error("Send invite error:", err);
             setError(err.response?.data?.message || 'Failed to send invitation.');
        } finally {
            setIsSending(false);
        }
    };

    // --- Handle Removing Member ---
    // Open the remove confirmation modal (replaces window.confirm usage)
    const handleRemoveMember = (memberUserId, username) => {
        setRemoveTarget({ memberUserId, username });
        setShowRemoveModal(true);
    };

    // Cancel remove
    const handleCancelRemove = () => {
        setRemoveTarget(null);
        setShowRemoveModal(false);
    };

    // Confirm removal (actual async operation)
    const handleConfirmRemove = async () => {
        if (!removeTarget) return;
        const { memberUserId, username } = removeTarget;
        const actionKey = `remove_${memberUserId}`;
        setIsRemoving(true);
        setActionLoading(prev => ({ ...prev, [actionKey]: true }));
        setError('');
        console.log('handleConfirmRemove: start', { memberUserId, username, membersLength: members.length });
        try {
            const config = { headers: { Authorization: `Bearer ${currentUserToken}` } };
            // Remove member on server
            await axios.delete(`http://localhost:5000/api/workspaces/${workspaceId}/members/${memberUserId}`, config);
            // Update local members state
            const removedMembers = members.filter(m => m.user?._id === memberUserId);
            const removed = removedMembers[0];
            setMembers(prev => prev.filter(m => m.user?._id !== memberUserId));

            // Remove any invitations in local state that belonged to this user (server also deletes them)
            const removedEmail = removed?.user?.email ? removed.user.email.toLowerCase() : null;
            setInvitations(prev => prev.filter(inv => {
                const inviteeId = inv.inviteeUser?._id || inv.inviteeUser;
                const inviteeEmail = (inv.inviteeEmail || '').toLowerCase();
                if (inviteeId && (inviteeId === memberUserId || inviteeId === (memberUserId))) return false;
                if (removedEmail && inviteeEmail === removedEmail) return false;
                return true;
            }));

            // NOTE: Do not automatically create a new invitation when removing a member.
        } catch (err) {
             console.error("Remove member error:", err);
             setError(err.response?.data?.message || 'Failed to remove member.');
        } finally {
             setActionLoading(prev => ({ ...prev, [actionKey]: false }));
             setIsRemoving(false);
             setShowRemoveModal(false);
             setRemoveTarget(null);
        }
    };

    // --- Handle Resending Invite ---
    const handleResendInvite = async (inviteId, email) => {
        const actionKey = `resend_${inviteId}`;
        setActionLoading(prev => ({ ...prev, [actionKey]: true }));
        setError('');
        try {
            const config = { headers: { Authorization: `Bearer ${currentUserToken}` } };
            const res = await axios.post(`http://localhost:5000/api/invitations/resend/${inviteId}`, {}, config);
            // Use returned invitation (populated) to update local state
            const updatedInvite = res.data?.invitation;
            if (updatedInvite) {
                setInvitations(prev => prev.map(inv => inv._id === inviteId ? updatedInvite : inv));
            } else {
                // Fallback: mark pending
                setInvitations(prev => prev.map(inv => inv._id === inviteId ? ({ ...inv, status: 'pending' }) : inv));
            }
            // NOTE: removed browser alert for better UX. Success state is reflected by updated invitation status above.
        } catch (err) {
            console.error("Resend invite error:", err);
            const errorMsg = err.response?.data?.message || 'Failed to resend invitation.';
            setError(errorMsg);
            // NOTE: removed browser alert for errors; error is shown inline via setError
        } finally {
             setActionLoading(prev => ({ ...prev, [actionKey]: false }));
        }
    };

    // --- Handle sending an invitation for an existing (local) invite entry ---
    const handleSendInvitation = async (invite) => {
        // invite may be a local placeholder (no _id) or a server record with _id
        const actionKey = `send_${invite._id || invite._local}`;
        setActionLoading(prev => ({ ...prev, [actionKey]: true }));
        setError('');
        try {
            const config = { headers: { Authorization: `Bearer ${currentUserToken}` } };
            const payload = { inviteeEmail: invite.inviteeEmail, workspaceId };
            const res = await axios.post('http://localhost:5000/api/invitations', payload, config);
            // Replace local placeholder (by _id) with server response, or prepend if missing
            setInvitations(prev => {
                const found = prev.some(i => i._id === invite._id);
                if (found) return prev.map(i => (i._id === invite._id ? res.data : i));
                return [res.data, ...prev];
            });
        } catch (err) {
            console.error('Send invitation error:', err?.response?.data || err.message || err);
            setError(err.response?.data?.message || 'Failed to send invitation.');
            // fallback: mark local invite as pending (if it was local)
            setInvitations(prev => prev.map(i => i._id === invite._id ? ({ ...i, status: 'pending' }) : i));
        } finally {
            setActionLoading(prev => ({ ...prev, [actionKey]: false }));
        }
    };


    // Sort members so Admins appear first, then alphabetical
    const sortedMembers = useMemo(() => {
        return [...members].sort((a, b) => {
            if (a.role === 'Admin' && b.role !== 'Admin') return -1;
            if (a.role !== 'Admin' && b.role === 'Admin') return 1;
            const aUsername = a.user?.username || '';
            const bUsername = b.user?.username || '';
            return aUsername.localeCompare(bUsername);
        });
    }, [members]);

    // Robust current user id and token detection (support different shapes)
    const currentUserId = useMemo(() => {
        return currentUser?.user?._id || currentUser?._id || currentUser?.id || currentUser?.userId || null;
    }, [currentUser]);

    const currentUserToken = useMemo(() => {
        return currentUser?.token || currentUser?.accessToken || currentUser?.authToken || null;
    }, [currentUser]);

    // Current user's role (if present in members list)
    const currentUserRole = useMemo(() => members.find(m => m.user?._id === currentUserId)?.role, [members, currentUserId]);

    // Also try to match current user by username if id is not present
    const currentUserMember = useMemo(() => {
        const uname = currentUser?.user?.username || currentUser?.username || null;
        if (!uname) return null;
        return members.find(m => m.user?.username === uname) || null;
    }, [members, currentUser]);

    const isAdminUser = currentUserRole === 'Admin' || currentUserMember?.role === 'Admin';
    const ownerId = workspace?.owner?._id || workspace?.owner || null;
    const isOwnerUser = currentUserId && ownerId && currentUserId === ownerId;

    // DEBUG: log structures so we can diagnose why the delete button condition fails
    // (Remove these logs after debugging)
    // eslint-disable-next-line no-console
    console.log('ManageInvites DEBUG:', {
        currentUser,
        currentUserId,
        currentUserToken,
        currentUserRole,
        workspaceOwner: workspace?.owner,
        members,
        sortedMembers
    });

    // Debug: watch invitations state changes
    useEffect(() => {
        // eslint-disable-next-line no-console
        console.log('ManageInvites: invitations state changed. length=', invitations.length, invitations);
    }, [invitations]);

    // Compute users that are not current members and not already invited
    const nonMemberUsers = useMemo(() => {
        const memberIds = new Set(members.map(m => m.user?._id).filter(Boolean));
        const invitedEmails = new Set(invitations.map(inv => (inv.inviteeEmail || '').toLowerCase()));
        const invitedUserIds = new Set(invitations.map(inv => inv.inviteeUser?._id).filter(Boolean));
        return (allUsers || []).filter(u => {
            if (!u || !u._id) return false;
            if (memberIds.has(u._id)) return false;
            if (invitedUserIds.has(u._id)) return false;
            if (invitedEmails.has((u.email || '').toLowerCase())) return false;
            return true;
        });
    }, [allUsers, members, invitations]);

    if (loading) return (
        <div className="min-h-screen bg-slate-900 text-white p-8 font-inter flex items-center justify-center">
            <PageSpinner />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-900 text-white p-8 font-inter">
            <header className="mb-8">
                <Link to="/invitations" className="text-indigo-400 hover:underline mb-2 block">&larr; Back to Invitations</Link>
                <h1 className="text-3xl font-bold text-white">Manage Invites: {workspace?.name || 'Loading...'}</h1>
            </header>

            {/* Remove member confirmation modal */}
            {showRemoveModal && removeTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-slate-800 rounded-lg shadow-lg max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold text-red-400">Confirm member removal</h3>
                        <p className="mt-4 text-sm text-slate-300">Are you sure you want to remove <strong className="text-white">{removeTarget.username}</strong> from this workspace? This action cannot be undone.</p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={handleCancelRemove} disabled={isRemoving} className="px-4 py-2 bg-slate-600 text-white rounded">Cancel</button>
                            <button onClick={handleConfirmRemove} disabled={isRemoving} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded">
                                {isRemoving ? 'Removing...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {error && <p className="text-red-500 text-center py-4 bg-red-900/30 rounded-md mb-6">{error}</p>}

            {/* Send New Invite Form */}
            <section className="mb-10 p-6 bg-slate-800 rounded-lg border border-slate-700">
                {/* ... (form remains the same) ... */}
                <h2 className="text-xl font-semibold mb-4 text-slate-200">Send New Invitation</h2>
                <form onSubmit={handleSendInvite} className="flex flex-col sm:flex-row gap-3">
                    <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="Enter user's email address" required className="flex-grow bg-slate-700 rounded p-2 border border-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-white placeholder-slate-400" disabled={isSending} />
                    <button type="submit" disabled={isSending} className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 min-w-[120px]" > {isSending ? <Spinner /> : <SendIcon />} {isSending ? 'Sending...' : 'Send Invite'} </button>
                </form>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Members List */}
                <section>
                    <h2 className="text-xl font-semibold mb-4 text-slate-200">Current Members ({members.length})</h2>
                    <div className="space-y-3">
                        {members.length === 0 ? (
                            <p className="text-slate-400 p-4 bg-slate-800 rounded-md border border-slate-700">Only the owner is in this workspace.</p>
                        ) : (
                            sortedMembers.map(member => (
                                <div key={member.user?._id || member._id} className="flex justify-between items-center p-4 bg-slate-800 rounded-lg border border-slate-700">
                                    <div>
                                        <h3 className="font-medium text-white">{member.user?.username || 'Loading...'}</h3>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${member.role === 'Admin' ? 'bg-indigo-500 text-indigo-100' : 'bg-slate-600 text-slate-300'}`}>
                                            {member.role}
                                        </span>
                                    </div>
                                    
                                                                                                {/* --- FIX: Correct conditional logic --- */}
                                                                                                {/* Determine owner id robustly and check against current user id */}
                                                                                                                                    { (ownerId !== member.user?._id) &&
                                                                                                                                        (isOwnerUser || isAdminUser) && currentUserToken &&
                                    (
                                        <button
                                            onClick={() => handleRemoveMember(member.user._id, member.user?.username)}
                                            disabled={actionLoading[`remove_${member.user._id}`]}
                                            className="text-red-500 hover:text-red-400 p-1 rounded-full hover:bg-slate-700 transition-colors disabled:opacity-50"
                                            title="Remove member"
                                        >
                                             {actionLoading[`remove_${member.user._id}`] ? <Spinner /> : <TrashIcon />}
                                        </button>
                                    )}
                                    {/* --- END FIX --- */}
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* Request Status List */}
                <section>
                    <h2 className="text-xl font-semibold mb-4 text-slate-200">Invitation Status</h2>
                    <div className="space-y-3">
                        {(invitations.length === 0 && nonMemberUsers.length === 0) ? (
                            <p className="text-slate-400 p-4 bg-slate-800 rounded-md border border-slate-700">No invitations sent for this project yet.</p>
                        ) : (
                            <>
                                {/* Existing invitations (if any) */}
                                {invitations.map(invite => (
                                    <div key={invite._id} className="flex justify-between items-center p-4 bg-slate-800 rounded-lg border border-slate-700">
                                        <div>
                                            {/* Show username prominently if available, otherwise email */}
                                            <h3 className="font-medium text-white">{invite.inviteeUser?.username || invite.inviteeEmail}</h3>
                                            {/* Show email as secondary when username exists */}
                                            {invite.inviteeUser?.username ? (
                                                <p className="text-xs text-slate-400">{invite.inviteeEmail}</p>
                                            ) : null}
                                            <p className="text-xs text-slate-400 mt-1">Sent: {new Date(invite.createdAt).toLocaleString()}</p>
                                            <p className="text-xs text-slate-500 mt-1">Invited by: {invite.inviter?.username || 'Unknown'}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${
                                                invite.status === 'pending' ? 'bg-yellow-600 text-yellow-900' :
                                                invite.status === 'accepted' ? 'bg-green-600 text-green-100' :
                                                'bg-red-600 text-red-100'
                                            }`}>
                                                {invite.status}
                                            </span>
                                            {(invite.status === 'pending' || invite.status === 'rejected') && (
                                                <button
                                                    onClick={() => handleResendInvite(invite._id, invite.inviteeEmail)}
                                                    disabled={actionLoading[`resend_${invite._id}`]}
                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-1 px-3 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                                                    title="Resend invitation"
                                                >
                                                    {actionLoading[`resend_${invite._id}`] ? <Spinner /> : <><RoundRefreshIcon /> <span>Resend</span></>}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {/* Suggested users who are not members and not yet invited */}
                                {nonMemberUsers.length > 0 && nonMemberUsers.map(u => (
                                    <div key={`suggest-${u._id}`} className="flex justify-between items-center p-4 bg-slate-800 rounded-lg border border-slate-700">
                                        <div>
                                            {/* Show username first, email secondary */}
                                            <h3 className="font-medium text-white">{u.username || u.email}</h3>
                                            {u.username && <p className="text-xs text-slate-400">{u.email}</p>}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleSendInvitation({ _id: `suggest-${u._id}`, inviteeEmail: u.email, inviteeUser: u, status: 'not_sent' })}
                                                disabled={actionLoading[`send_suggest-${u._id}`]}
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-1 px-3 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                                            >
                                                {actionLoading[`send_suggest-${u._id}`] ? <Spinner /> : <SendIcon />} Invite
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default ManageInvitesPage;

