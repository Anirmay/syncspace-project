import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios'; // We'll need this later

// --- SVG Icons ---
const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path d="M3.105 3.105a.75.75 0 011.06-.002l14.49 11.25a.75.75 0 01-.001 1.318l-14.49 1.875a.75.75 0 01-.98-.676V3.105z" />
    </svg>
);
const PlusIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);
const HashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2 text-slate-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h13.5m-13.5 7.5h13.5m-1.5-15l-1.5 15m-6.75-15l-1.5 15" />
    </svg>
);

// --- Spinner Component Definition ---
const Spinner = () => (
    <div className="flex justify-center items-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400"></div>
    </div>
);
// --- END Spinner ---


// Placeholder Message Component
const ChatMessage = ({ message, isOwnMessage }) => {
    // Basic styling differentiation for own vs other messages
    const alignment = isOwnMessage ? 'items-end' : 'items-start';
    const bubbleColor = isOwnMessage ? 'bg-indigo-600' : 'bg-slate-700';
    const textColor = 'text-white';
    const timeAlign = isOwnMessage ? 'text-right' : 'text-left';

    return (
        <div className={`flex flex-col mb-4 ${alignment}`}>
            <div className={`flex items-end max-w-lg ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
                 {/* Placeholder Avatar */}
                 <div className={`w-6 h-6 rounded-full flex-shrink-0 ${isOwnMessage ? 'ml-2' : 'mr-2'} ${isOwnMessage ? 'bg-blue-400' : 'bg-green-400'}`}></div>
                 {/* Message Bubble */}
                 <div className={`${bubbleColor} ${textColor} p-3 rounded-lg shadow`}>
                    <p className="text-sm">{message.text}</p>
                 </div>
            </div>
             {/* Timestamp */}
             <p className={`text-xs text-slate-500 mt-1 ${timeAlign} ${isOwnMessage ? 'mr-8' : 'ml-8'}`}>
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
        </div>
    );
};


const ChatPage = () => {
    const { currentUser } = useContext(AuthContext);
    const [messageInput, setMessageInput] = useState('');
    const [messages, setMessages] = useState([]); // Will hold fetched/real-time messages
    const [workspaces, setWorkspaces] = useState([]); // Placeholder for workspace list
    const [selectedWorkspace, setSelectedWorkspace] = useState(null); // Placeholder
    const [loadingWorkspaces, setLoadingWorkspaces] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const messagesEndRef = useRef(null); // Ref to scroll to bottom

     // TODO: Fetch workspaces list using actual API call
    useEffect(() => {
        // Simulating fetch - Replace with actual API call later
        setLoadingWorkspaces(true);
        // Assuming you have an endpoint like GET /api/workspaces
        // You would use axios here with the user's token
        setTimeout(() => {
            // Replace with data from API
            const fetchedWorkspaces = [
                { _id: 'ws1', name: 'Project Alpha' },
                { _id: 'ws2', name: 'Marketing Team' },
                { _id: 'ws3', name: 'General' },
            ];
            setWorkspaces(fetchedWorkspaces);
            // Select the first workspace only if the list is not empty
            if (fetchedWorkspaces.length > 0) {
                 setSelectedWorkspace(fetchedWorkspaces[0]._id);
            }
            setLoadingWorkspaces(false);
        }, 500); // Simulate network delay
    }, []); // Run once on mount

     // TODO: Fetch messages when selectedWorkspace changes using actual API call
    useEffect(() => {
        if (!selectedWorkspace) return; // Don't fetch if no workspace is selected

        // Simulating fetch - Replace with actual API call later
        setLoadingMessages(true);
        setMessages([]); // Clear previous messages
        // Assuming an endpoint like GET /api/workspaces/:workspaceId/messages
        setTimeout(() => {
             // Replace with data from API for the selectedWorkspace
             const dummyMessages = [
                { _id: 'm1', sender: 'user1', text: `Messages for ${workspaces.find(ws=>ws._id === selectedWorkspace)?.name || 'Unknown'} - 1`, timestamp: new Date(Date.now() - 5 * 60000), workspace: selectedWorkspace },
                { _id: 'm2', sender: currentUser?.user?.id || 'me', text: `My message in ${workspaces.find(ws=>ws._id === selectedWorkspace)?.name || 'Unknown'}`, timestamp: new Date(Date.now() - 4 * 60000), workspace: selectedWorkspace },
                { _id: 'm3', sender: 'user2', text: `Another message here.`, timestamp: new Date(Date.now() - 3 * 60000), workspace: selectedWorkspace },
             ];
            setMessages(dummyMessages);
            setLoadingMessages(false);
        }, 300); // Simulate network delay
    // IMPORTANT: Add workspaces to dependency array if you use it inside setTimeout
    }, [selectedWorkspace, currentUser, workspaces]);

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);


    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!messageInput.trim() || !selectedWorkspace) return; // Check workspace selection

        console.log(`Sending message to ${selectedWorkspace}:`, messageInput);
        // TODO: Implement actual message sending via Socket.IO

         // Example of adding message locally (remove when using Socket.IO)
         const newMessage = {
            _id: `temp_${Date.now()}`,
            sender: currentUser?.user?.id || 'me',
            text: messageInput,
            timestamp: new Date(),
            workspace: selectedWorkspace // Ensure this is set
         };
         setMessages(prevMessages => [...prevMessages, newMessage]); // Use functional update

        setMessageInput(''); // Clear input
    };

    return (
        // Main container - Full height, flex layout
        <div className="flex h-screen bg-slate-900 text-white font-inter overflow-hidden">

            {/* --- Sidebar --- */}
            <aside className="w-64 bg-slate-800 flex flex-col border-r border-slate-700">
                {/* Sidebar Header */}
                <header className="p-4 border-b border-slate-700 flex justify-between items-center flex-shrink-0"> {/* Added flex-shrink-0 */}
                    <h2 className="font-semibold text-lg">Workspaces</h2>
                    <button className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-700"> <PlusIcon /> </button>
                </header>

                {/* Workspace/Channel List */}
                <nav className="flex-1 overflow-y-auto p-3 space-y-1">
                    {loadingWorkspaces ? ( <p className="text-slate-400 text-sm p-2">Loading...</p> )
                     : workspaces.length === 0 ? (<p className="text-slate-400 text-sm p-2">No workspaces found.</p>) // Handle empty case
                     : (
                        workspaces.map(ws => (
                            <button
                                key={ws._id}
                                onClick={() => setSelectedWorkspace(ws._id)}
                                className={`w-full flex items-center p-2 rounded-md text-left text-sm transition-colors ${selectedWorkspace === ws._id ? 'bg-indigo-600 text-white font-medium' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
                            >
                                <HashIcon />
                                {ws.name}
                            </button>
                        ))
                    )}
                </nav>

                 {/* Sidebar Footer (User Info) */}
                 <footer className="p-4 border-t border-slate-700 flex items-center space-x-3 flex-shrink-0"> {/* Added flex-shrink-0 */}
                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-bold">
                         {currentUser?.user?.username ? currentUser.user.username.charAt(0).toUpperCase() : '?'}
                    </div>
                    <span className="text-sm font-medium truncate">{currentUser?.user?.username || 'User'}</span>
                 </footer>
            </aside>

            {/* --- Main Chat Area --- */}
            <main className="flex-1 flex flex-col overflow-hidden"> {/* Added overflow-hidden */}
                {/* Chat Header */}
                <header className="p-4 border-b border-slate-700 bg-slate-800/50 shadow-sm flex-shrink-0"> {/* Added flex-shrink-0 */}
                    <h3 className="font-semibold text-lg">
                        # {workspaces.find(ws => ws._id === selectedWorkspace)?.name || 'Select a Workspace'} {/* Updated default text */}
                    </h3>
                </header>

                {/* Message Display Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                     {loadingMessages ? ( <Spinner /> )
                     : !selectedWorkspace ? (<p className="text-slate-400 text-center">Please select a workspace to start chatting.</p>) // Handle no selection
                     : messages.length === 0 ? (<p className="text-slate-400 text-center">No messages yet in this workspace.</p>) // Handle no messages
                     : (
                         messages.map(msg => (
                            <ChatMessage
                                key={msg._id}
                                message={msg}
                                isOwnMessage={msg.sender === currentUser?.user?.id}
                            />
                         ))
                     )}
                     <div ref={messagesEndRef} />
                </div>

                {/* Message Input Area */}
                <footer className="p-4 border-t border-slate-700 bg-slate-800/50 flex-shrink-0"> {/* Added flex-shrink-0 */}
                    <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                        <input
                            type="text"
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            placeholder={`Message #${workspaces.find(ws => ws._id === selectedWorkspace)?.name || '...'}`}
                            className="flex-1 bg-slate-700 rounded-lg p-3 border border-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-white placeholder-slate-400 text-sm"
                            disabled={!selectedWorkspace || loadingMessages} // Disable if loading or no workspace selected
                        />
                        <button
                            type="submit"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg p-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!messageInput.trim() || !selectedWorkspace || loadingMessages}
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

