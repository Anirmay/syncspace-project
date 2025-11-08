import React, { useState, useContext, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
// --- FIX #1: Added .jsx extension ---
import { AuthContext } from '../context/AuthContext.jsx';
import axios from 'axios';
// --- FIX #2: Added .jsx extension ---
import ChatMessage from '../components/ChatMessage.jsx';
// --- FIX #3: Import our API config ---
import API_BASE from '../apiConfig.js';

// TODO: Add Socket.IO client library import here
// import io from 'socket.io-client';

// --- SVG Icons ---
const SendIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"> <path d="M3.105 3.105a.75.75 0 011.06-.002l14.49 11.25a.75.75 0 01-.001 1.318l-14.49 1.875a.75.75 0 01-.98-.676V3.105z" /> </svg> );
const UserIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2 text-slate-500"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>);
const SearchIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-400"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg> );
const CloseIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>);


// --- Spinner Component ---
const Spinner = () => (
    <div className="flex justify-center items-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400"></div>
    </div>
);

// ChatMessage is now extracted to components/ChatMessage.jsx


const ChatPage = () => {
    const { currentUser, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 768 : false);

    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);
    const location = useLocation();
    const [messageInput, setMessageInput] = useState('');
    const [messages, setMessages] = useState([]); // Direct messages with selectedUser
    const [users, setUsers] = useState([]); // Holds fetched user list
    const [selectedUser, setSelectedUser] = useState(null); // Holds the selected User object
    const [unreadMap, setUnreadMap] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('chatUnread') || '{}');
        } catch (e) { return {}; }
    }); // { userId: count }
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sendingMessage, setSendingMessage] = useState(false);
    const [error, setError] = useState('');
    const messagesEndRef = useRef(null);
    const [userSearchQuery, setUserSearchQuery] = useState('');

    // --- Fetch Users ---
    useEffect(() => {
        const fetchUsers = async () => {
            if (!currentUser || !currentUser.token) {
                setError('Authentication required.');
                setLoadingUsers(false);
                return;
            }
            setLoadingUsers(true);
            setError('');
            try {
                const config = { headers: { Authorization: `Bearer ${currentUser.token}` } };
                // NEW Backend Endpoint needed: GET /api/users (should exclude current user)
                // --- FIX #4: Use API_BASE ---
                const response = await axios.get(`${API_BASE}/api/users`, config);
                // Filter out the current user from the list
                const otherUsers = response.data.filter(user => user._id !== currentUser.user._id);
                setUsers(otherUsers);
                // Cache users list so the conversation page can show a name before remote fetch completes
                try { localStorage.setItem('chatUsers', JSON.stringify(otherUsers)); } catch (e) {}
            } catch (err) {
                console.error("Fetch users error:", err);
                setError(err.response?.data?.message || 'Failed to load users.');
                 if (err.response?.status === 401 || err.response?.status === 403) {
                     logout();
                     navigate('/login');
                 }
            } finally {
                setLoadingUsers(false);
            }
        };
        fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser, logout, navigate]);

        // Fetch server-side notifications and merge direct-message unread counts into unreadMap
        useEffect(() => {
            const fetchNotifs = async () => {
                if (!currentUser?.token) return;
                try {
                    const cfg = { headers: { Authorization: `Bearer ${currentUser.token}` } };
                    // --- FIX #5: Use API_BASE ---
                    const res = await axios.get(`${API_BASE}/api/notifications`, cfg);
                    const notifs = res.data || [];
                    const dmCounts = {};
                    notifs.forEach(n => {
                        try {
                            if (n.type === 'direct_message' && !n.read) {
                                const actorId = (n.actor && (n.actor._id || n.actor)) || null;
                                if (actorId) dmCounts[actorId] = (dmCounts[actorId] || 0) + 1;
                            }
                        } catch (e) {}
                    });
                    if (Object.keys(dmCounts).length) {
                        setUnreadMap(prev => ({ ...dmCounts, ...prev }));
                    }
                } catch (e) {
                    // ignore
                }
            };
            fetchNotifs();
        }, [currentUser]);

        // Persist unread map whenever it changes and notify other windows/components
        useEffect(() => {
            try {
                localStorage.setItem('chatUnread', JSON.stringify(unreadMap));
                // dispatch custom event so Header (same tab) can update without storage event
                window.dispatchEvent(new CustomEvent('chat-unread-updated'));
            } catch (e) {}
        }, [unreadMap]);

    // --- Fetch Direct Messages when selectedUser changes ---
    useEffect(() => {
        if (!selectedUser || !currentUser || !currentUser.token) {
            setMessages([]);
            return;
        }

        const fetchMessages = async () => {
            setLoadingMessages(true);
            setError('');
            try {
                const config = { headers: { Authorization: `Bearer ${currentUser.token}` } };
                // NEW Backend Endpoint needed: GET /api/messages/direct/:userId
                // --- FIX #6: Use API_BASE ---
                const response = await axios.get(`${API_BASE}/api/messages/direct/${selectedUser._id}`, config);
                setMessages(response.data);
                // we've opened this conversation — mark unread for this user as read
                try {
                    setUnreadMap(prev => {
                        if (!selectedUser) return prev;
                        const copy = { ...prev };
                        if (copy[selectedUser._id]) delete copy[selectedUser._id];
                        return copy;
                    });
                    // Mark server-side direct-message notifications from this actor as read
                    try {
                        const cfg = { headers: { Authorization: `Bearer ${currentUser.token}` } };
                        // --- FIX #7: Use API_BASE ---
                        await axios.patch(`${API_BASE}/api/notifications/markDirectRead/${selectedUser._id}`, {}, cfg);
                        // notify header to refresh quickly (it polls every 15s)
                        window.dispatchEvent(new CustomEvent('server-notification-received'));
                    } catch (e) {
                        // ignore errors marking server notifications
                    }
                } catch (e) {}
            } catch (err) {
                console.error(`Fetch direct messages error for ${selectedUser.username}:`, err);
                setError(err.response?.data?.message || `Failed to load messages with ${selectedUser.username}.`);
                 if (err.response?.status === 401 || err.response?.status === 403) {
                     logout();
                     navigate('/login');
                 }
                 setMessages([]);
            } finally {
                setLoadingMessages(false);
            }
        };

        fetchMessages();
        // TODO: Add Socket.IO setup here

    }, [selectedUser, currentUser, logout, navigate]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loadingMessages]);

    // Expose a handler for incoming direct messages (for socket integration later)
    useEffect(() => {
        const handleIncoming = (msg) => {
            try {
                // msg should have sender (id) and receiver (id)
                const senderId = msg?.sender?._id || msg?.sender;
                if (!senderId) return;
                // If currently viewing this convo, append to messages, otherwise increment unread
                if (selectedUser && String(selectedUser._id) === String(senderId)) {
                    setMessages(prev => [...prev, msg]);
                } else {
                    setUnreadMap(prev => {
                        const copy = { ...prev };
                        copy[senderId] = (copy[senderId] || 0) + 1;
                        return copy;
                    });
                    // show a simple browser notification if permitted
                    try {
                        if (window.Notification && Notification.permission === 'granted') {
                            new Notification('New message', { body: msg.text || 'You have a new message.' });
                        } else if (window.Notification && Notification.permission !== 'denied') {
                            Notification.requestPermission();
                        }
                    } catch (e) {}
                }
            } catch (e) { console.error(e); }
        };
        // Expose globally for socket handlers to call: window.onDirectMessage(msg)
        window.onDirectMessage = handleIncoming;
        return () => { try { delete window.onDirectMessage; } catch (e) {} };
    }, [selectedUser]);

    // Filter users based on search query
    const filteredUsers = useMemo(() => {
        return users.filter(user =>
            user.username.toLowerCase().includes(userSearchQuery.toLowerCase())
        );
    }, [users, userSearchQuery]);

    // If URL contains ?open=<userId> (used for mobile navigation), open that conversation
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const openId = params.get('open');
        if (!openId) return;
        if (selectedUser && String(selectedUser._id) === String(openId)) return;
        // Try to find in already-fetched users
        const found = users.find(u => String(u._id) === String(openId));
        if (found) {
            setSelectedUser(found);
            setUnreadMap(prev => { const copy = { ...prev }; if (copy[openId]) delete copy[openId]; return copy; });
            return;
        }
        // Otherwise fetch the user by id
        const fetchUser = async () => {
            try {
                const cfg = currentUser?.token ? { headers: { Authorization: `Bearer ${currentUser.token}` } } : {};
                // --- FIX #8: Use API_BASE ---
                const res = await axios.get(`${API_BASE}/api/users/${openId}`, cfg);
                if (res?.data) {
                    setSelectedUser(res.data);
                    setUnreadMap(prev => { const copy = { ...prev }; if (copy[openId]) delete copy[openId]; return copy; });
                }
            } catch (e) {
                // ignore
            }
        };
        fetchUser();
    }, [location.search, users, currentUser, selectedUser]);

    // --- FIX handleSendMessage ---
    const handleSendMessage = async (e) => {
        e.preventDefault();
        // Use selectedUser here
        if (!messageInput.trim() || !selectedUser || sendingMessage) return; 

        setSendingMessage(true);
        setError('');

        const tempMessageId = `temp_${Date.now()}`;
        const newMessageData = {
            text: messageInput,
            sender: currentUser.user._id, 
            receiver: selectedUser._id, // Use selectedUser._id
            createdAt: new Date().toISOString()
        };

        const optimisticMessage = {
            ...newMessageData,
             _id: tempMessageId,
             sender: { _id: currentUser.user._id, username: currentUser.user.username }
        };
        setMessages(prevMessages => [...prevMessages, optimisticMessage]);
        setMessageInput('');

        try {
            const config = { headers: { Authorization: `Bearer ${currentUser.token}` } };
            // --- FIX #9: Use API_BASE ---
            const response = await axios.post(`${API_BASE}/api/messages/direct`, newMessageData, config);

             setMessages(prevMessages => prevMessages.map(msg =>
                 msg._id === tempMessageId ? response.data : msg
             ));
            // TODO: Replace above with Socket.IO emit for direct message

        } catch (err) {
            console.error("Send message error:", err);
            setError(err.response?.data?.message || 'Failed to send message.');
            setMessages(prevMessages => prevMessages.filter(msg => msg._id !== tempMessageId));
        } finally {
            setSendingMessage(false);
        }
    };
    // --- END FIX ---

    return (
        <div
            className="flex flex-col md:flex-row bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-white font-inter overflow-hidden"
            // ensure chat page occupies viewport below the global header on all viewports
            style={{ height: 'calc(100vh - 64px)' }}
        >

            {/* --- Sidebar --- */}
            <aside className="w-full md:w-56 bg-slate-800 flex flex-col border-r border-slate-700 flex-shrink-0"> {/* Slightly narrower sidebar for chat layout */}
                <header className="p-4 md:p-4 border-b border-slate-700 flex justify-between items-center flex-shrink-0">
                    <h2 className="font-semibold text-lg">Users</h2>
                </header>

                <div className="p-3 border-b border-slate-700 flex-shrink-0">
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-2">
                             <SearchIcon />
                        </span>
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={userSearchQuery}
                            onChange={(e) => setUserSearchQuery(e.target.value)}
                            className="w-full bg-slate-700 text-sm rounded-md py-2 pl-8 pr-3 border border-slate-600 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none text-white placeholder-slate-400"
                        />
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto p-3 space-y-1">
                    {loadingUsers ? ( <Spinner/> )
                      : error && !users.length ? (<p className="text-red-400 text-sm p-2">{error}</p>)
                      : filteredUsers.length === 0 ? (<p className="text-slate-400 text-sm p-2">{userSearchQuery ? 'No users match search.' : 'No other users found.'}</p>)
                      : (
                        filteredUsers.map(user => (
                            <button
                                key={user._id}
                                onClick={() => {
                                    // Mobile: open conversation page. Desktop: open inline in right pane.
                                    if (isMobile) {
                                        navigate(`/chat/${user._id}`);
                                        setUnreadMap(prev => { const copy = { ...prev }; if (copy[user._id]) delete copy[user._id]; return copy; });
                                        return;
                                    }
                                    // Desktop behavior (unchanged): open inline
                                    setSelectedUser(user);
                                    setUnreadMap(prev => { const copy = { ...prev }; if (copy[user._id]) delete copy[user._id]; return copy; });
                                }}
                                className={`w-full flex items-center p-2 rounded-md text-left text-sm transition-colors duration-150 ease-in-out ${selectedUser?._id === user._id ? 'bg-teal-600 text-white font-medium shadow-inner' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
                            >
                                <UserIcon />
                                <span className="truncate flex-1">{user.username}</span>
                                {/* unread badge */}
                                {unreadMap[user._id] ? (
                                    <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-rose-500 rounded-full">{unreadMap[user._id] > 9 ? '9+' : unreadMap[user._id]}</span>
                                ) : null}
                            </button>
                        ))
                    )}
                </nav>

              <footer className="hidden md:flex p-4 border-t border-slate-700 items-center space-x-3 flex-shrink-0">{/* hide current-user footer on mobile */}
                 <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-sm font-bold ring-1 ring-offset-2 ring-offset-slate-800 ring-teal-400">
                         {currentUser?.user?.username ? currentUser.user.username.charAt(0).toUpperCase() : '?'}
                    </div>
                    <span className="text-sm font-medium truncate">{currentUser?.user?.username || 'User'}</span>
                 </footer>
            </aside>

            {/* --- Main Chat Area --- */}
            <main className="flex-1 flex flex-col relative bg-slate-850" style={{ minHeight: 0 }}> 
                <header className={`${isMobile ? 'py-2 px-4' : 'p-4'} border-b border-slate-300 bg-slate-200 shadow-sm flex-shrink-0 backdrop-blur-sm dark:bg-slate-800/80 dark:border-slate-700 dark:text-white`}> 
                {/* Back button on mobile when viewing a conversation */}
                {selectedUser && (
                    <button onClick={() => setSelectedUser(null)} className="md:hidden mr-2 p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-slate-700 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                )}
                <h3 className={`${selectedUser ? '' : 'hidden md:block'} font-semibold text-base truncate text-slate-700 dark:text-white`}>
                    {selectedUser ? selectedUser.username : (loadingUsers ? 'Loading...' : '')}
                </h3>
                </header>

                <div className={`${selectedUser ? 'block' : 'hidden'} md:block flex-1 overflow-y-auto px-4 ${isMobile ? 'py-3' : 'p-4'} space-y-4 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent scroll-smooth`} style={{ paddingBottom: '5.5rem' }}> 
                     {loadingMessages ? ( <Spinner /> )
                     : !selectedUser ? (<p className="text-slate-400 text-center pt-10">Please select a user to start chatting.</p>)
                     : error && messages.length === 0 ? (<p className="text-red-400 text-center pt-10">{error}</p>) 
                     : messages.length === 0 ? (<p className="text-slate-400 text-center pt-10">No messages yet with {selectedUser.username}. Send the first one!</p>)
                     : (
                         messages.map(msg => (
                             <ChatMessage
                                 key={msg._id}
                                 message={msg}
                                 currentUser={currentUser?.user}
                             />
                         ))
                     )}
                     <div ref={messagesEndRef} /> 
                </div>

                <footer className={`${selectedUser ? 'block' : 'hidden'} md:flex ${isMobile ? 'py-2 px-4' : 'p-4'} border-t border-slate-200 bg-slate-100 flex-shrink-0 backdrop-blur-sm dark:bg-slate-800/80 dark:border-slate-700 dark:text-white sticky bottom-0 z-30 shadow-md`}> 
                    {error && !loadingMessages && messages.length > 0 && <p className="text-red-500 text-xs mb-2">{error}</p>} 
                    <form onSubmit={handleSendMessage} className="flex items-center space-x-3 w-full">
                        <input
                            type="text"
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            // --- FIX Placeholder ---
                            placeholder={selectedUser ? `Message ${selectedUser.username}` : 'Select a user first'}
                            style={{ flex: 2 }}
                            className={`bg-white dark:bg-slate-700 rounded-lg w-full ${isMobile ? 'p-2' : 'p-3'} border border-slate-200 dark:border-slate-600 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none text-slate-900 dark:text-white placeholder-slate-400 text-sm transition-colors duration-150`} 
                            // --- FIX Disabled check ---
                            disabled={!selectedUser || loadingMessages || loadingUsers || sendingMessage} 
                        />
                        <button
                            type="submit"
                            className={`bg-teal-600 hover:bg-teal-700 text-white rounded-lg ${isMobile ? 'p-3' : 'p-3'} disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150`} 
                            // --- FIX Disabled check ---
                            disabled={!messageInput.trim() || !selectedUser || loadingMessages || loadingUsers || sendingMessage}
                            aria-label="Send message"
                        >
                            <SendIcon />
                        </button>
                    </form>
                </footer>
            </main>
        </div>
    );
};

export default ChatPage;