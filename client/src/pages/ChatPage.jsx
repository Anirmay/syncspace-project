import React, { useState, useContext, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
// TODO: Add Socket.IO client library import here
// import io from 'socket.io-client';

// --- SVG Icons ---
const SendIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"> <path d="M3.105 3.105a.75.75 0 011.06-.002l14.49 11.25a.75.75 0 01-.001 1.318l-14.49 1.875a.75.75 0 01-.98-.676V3.105z" /> </svg> );
const PlusIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"> <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /> </svg> );
const UserIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2 text-slate-500"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>);
const SearchIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-400"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg> );
const CloseIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>);


// --- Spinner Component ---
const Spinner = () => (
    <div className="flex justify-center items-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400"></div>
    </div>
);

// --- Chat Message Component ---
const ChatMessage = ({ message, isOwnMessage }) => {
    const alignment = isOwnMessage ? 'items-end' : 'items-start';
    const bubbleColor = isOwnMessage ? 'bg-indigo-600' : 'bg-slate-700';
    const textColor = 'text-white';
    const timeAlign = isOwnMessage ? 'text-right' : 'text-left';
    const senderName = message.sender?.username || (isOwnMessage ? 'You' : 'User');

    return (
        <div className={`flex flex-col mb-4 ${alignment} transition-opacity duration-300 ease-in-out`}> {/* Added transition */}
            <div className={`flex items-end max-w-lg ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
                 <div className={`w-6 h-6 rounded-full flex-shrink-0 ${isOwnMessage ? 'ml-2' : 'mr-2'} ${isOwnMessage ? 'bg-blue-400' : 'bg-green-400'} flex items-center justify-center text-xs font-bold ring-1 ring-slate-600`}>
                    {senderName.charAt(0).toUpperCase()}
                 </div>
                 <div className={`${bubbleColor} ${textColor} p-3 rounded-lg shadow-md max-w-xs sm:max-w-md md:max-w-lg break-words`}> {/* Added shadow */}
                    {!isOwnMessage && <p className="text-xs font-semibold mb-1 text-indigo-300">{senderName}</p>}
                    <p className="text-sm">{message.text}</p>
                 </div>
            </div>
             <p className={`text-xs text-slate-500 mt-1 ${timeAlign} ${isOwnMessage ? 'mr-8' : 'ml-8'}`}>
                 {new Date(message.createdAt || message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
             </p>
        </div>
    );
};


const ChatPage = () => {
    const { currentUser, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [messageInput, setMessageInput] = useState('');
    const [messages, setMessages] = useState([]); // Direct messages with selectedUser
    const [users, setUsers] = useState([]); // Holds fetched user list
    const [selectedUser, setSelectedUser] = useState(null); // Holds the selected User object
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
                const response = await axios.get(`http://localhost:5000/api/users`, config);
                // Filter out the current user from the list
                setUsers(response.data.filter(user => user._id !== currentUser.user._id));
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
                const response = await axios.get(`http://localhost:5000/api/messages/direct/${selectedUser._id}`, config);
                setMessages(response.data);
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

    // Filter users based on search query
    const filteredUsers = useMemo(() => {
        return users.filter(user =>
            user.username.toLowerCase().includes(userSearchQuery.toLowerCase())
        );
    }, [users, userSearchQuery]);

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
            const response = await axios.post('http://localhost:5000/api/messages/direct', newMessageData, config);

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
        <div className="flex flex-col md:flex-row h-screen bg-slate-900 text-white font-inter overflow-hidden">

            {/* --- Sidebar --- */}
            <aside className="w-full md:w-64 bg-slate-800 flex flex-col border-r border-slate-700 flex-shrink-0"> {/* Added md width */}
                <header className="p-4 border-b border-slate-700 flex justify-between items-center flex-shrink-0">
                    <h2 className="font-semibold text-lg">Users</h2>
                    <button className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-700"> <PlusIcon /> </button>
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
                            className="w-full bg-slate-700 text-sm rounded-md py-2 pl-8 pr-3 border border-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-white placeholder-slate-400"
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
                                 onClick={() => setSelectedUser(user)} 
                                 className={`w-full flex items-center p-2 rounded-md text-left text-sm transition-colors duration-150 ease-in-out ${selectedUser?._id === user._id ? 'bg-indigo-600 text-white font-medium shadow-inner' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
                             >
                                 <UserIcon />
                                 <span className="truncate">{user.username}</span>
                             </button>
                         ))
                    )}
                </nav>

                 <footer className="p-4 border-t border-slate-700 flex items-center space-x-3 flex-shrink-0">
                     <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-bold ring-1 ring-offset-2 ring-offset-slate-800 ring-indigo-400">
                          {currentUser?.user?.username ? currentUser.user.username.charAt(0).toUpperCase() : '?'}
                     </div>
                     <span className="text-sm font-medium truncate">{currentUser?.user?.username || 'User'}</span>
                 </footer>
            </aside>

            {/* --- Main Chat Area --- */}
            <main className="flex-1 flex flex-col overflow-hidden bg-slate-850"> 
                <header className="p-4 border-b border-slate-700 bg-slate-800/80 shadow-sm flex-shrink-0 backdrop-blur-sm"> 
                    <h3 className="font-semibold text-lg truncate">
                         {selectedUser ? `Chat with ${selectedUser.username}` : (loadingUsers ? 'Loading...' : 'Select a User')}
                    </h3>
                </header>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent"> 
                     {loadingMessages ? ( <Spinner /> )
                     : !selectedUser ? (<p className="text-slate-400 text-center pt-10">Please select a user to start chatting.</p>)
                     : error && messages.length === 0 ? (<p className="text-red-400 text-center pt-10">{error}</p>) 
                     : messages.length === 0 ? (<p className="text-slate-400 text-center pt-10">No messages yet with {selectedUser.username}. Send the first one!</p>)
                     : (
                         messages.map(msg => (
                             <ChatMessage
                                 key={msg._id}
                                 message={msg}
                                 isOwnMessage={msg.sender?._id === currentUser?.user?._id || msg.sender === currentUser?.user?._id}
                             />
                         ))
                     )}
                     <div ref={messagesEndRef} /> 
                </div>

                <footer className="p-4 border-t border-slate-700 bg-slate-800/80 flex-shrink-0 backdrop-blur-sm"> 
                    {error && !loadingMessages && messages.length > 0 && <p className="text-red-500 text-xs mb-2">{error}</p>} 
                    <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                        <input
                            type="text"
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            // --- FIX Placeholder ---
                            placeholder={selectedUser ? `Message ${selectedUser.username}` : 'Select a user first'}
                            className="flex-1 bg-slate-700 rounded-lg p-3 border border-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-white placeholder-slate-400 text-sm transition-colors duration-150" 
                            // --- FIX Disabled check ---
                            disabled={!selectedUser || loadingMessages || loadingUsers || sendingMessage} 
                        />
                        <button
                            type="submit"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg p-3 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150" 
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

