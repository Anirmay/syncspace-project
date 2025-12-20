import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import ChatMessage from '../components/ChatMessage';

const ChatConversation = () => {
    const { currentUser, logout } = useContext(AuthContext);
    const { userId } = useParams();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [text, setText] = useState('');
    const [otherUser, setOtherUser] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        // fetch user info
        const fetchUser = async () => {
            try {
                const cfg = currentUser?.token ? { headers: { Authorization: `Bearer ${currentUser.token}` } } : {};
                const res = await axios.get(`https://syncspace-project.onrender.com/api/users/${userId}`, cfg);
                setOtherUser(res.data);
            } catch (e) { /* ignore */ }
        };
        fetchUser();
    }, [userId, currentUser]);

    useEffect(() => {
        const fetchMessages = async () => {
            if (!currentUser?.token) return;
            setLoading(true);
            try {
                const cfg = { headers: { Authorization: `Bearer ${currentUser.token}` } };
                const res = await axios.get(`https://syncspace-project.onrender.com/api/messages/direct/${userId}`, cfg);
                setMessages(res.data || []);
                // clear unread for this user in localStorage map
                try {
                    const map = JSON.parse(localStorage.getItem('chatUnread') || '{}');
                    if (map[userId]) { delete map[userId]; localStorage.setItem('chatUnread', JSON.stringify(map)); window.dispatchEvent(new CustomEvent('chat-unread-updated')); }
                } catch (e) {}
            } catch (err) {
                if (err.response?.status === 401 || err.response?.status === 403) { logout(); navigate('/login'); }
            } finally { setLoading(false); }
        };
        fetchMessages();
    }, [userId, currentUser, logout, navigate]);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    // small send icon (used on mobile)
    const SendIcon = ({ className = '' }) => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${className}`}>
            <path d="M3.105 3.105a.75.75 0 011.06-.002l14.49 11.25a.75.75 0 01-.001 1.318l-14.49 1.875a.75.75 0 01-.98-.676V3.105z" />
        </svg>
    );

    const handleSend = async (e) => {
        e?.preventDefault();
        if (!text.trim()) return;
        setSending(true);
        const tempId = `temp_${Date.now()}`;
        const optimistic = { _id: tempId, text, sender: { _id: currentUser.user._id, username: currentUser.user.username }, createdAt: new Date().toISOString() };
        setMessages(prev => [...prev, optimistic]);
        setText('');
        try {
            const cfg = { headers: { Authorization: `Bearer ${currentUser.token}` } };
            const res = await axios.post('https://syncspace-project.onrender.com/api/messages/direct', { text, sender: currentUser.user._id, receiver: userId }, cfg);
            setMessages(prev => prev.map(m => m._id === tempId ? res.data : m));
        } catch (e) {
            setMessages(prev => prev.filter(m => m._id !== tempId));
        } finally { setSending(false); }
    };

    // try to read cached users list to show a name immediately if available
    let cachedName = '';
    try {
        const cached = JSON.parse(localStorage.getItem('chatUsers') || '[]');
        const found = (cached || []).find(u => String(u._id) === String(userId));
        if (found) cachedName = found.username;
    } catch (e) { cachedName = ''; }

    return (
        <div className="bg-slate-900 text-white flex flex-col overflow-hidden" style={{ height: 'calc(100vh - 64px)' }}>
            <header className="py-2 px-3 border-b border-slate-700 flex items-center space-x-3 sticky top-0 z-20 bg-slate-900">
                <button onClick={() => navigate('/chat')} className="p-1 rounded hover:bg-slate-800">←</button>
                <h2 className="font-semibold">{otherUser?.username || cachedName || 'User'}</h2>
            </header>
            <main className="flex-1 overflow-y-auto px-3 py-2 space-y-4 bg-slate-900 scroll-smooth" style={{ paddingBottom: '5.25rem', minHeight: 0 }}>
                {loading ? (<div className="py-4">Loading...</div>) : messages.length === 0 ? (<p className="text-slate-400">No messages yet.</p>) : (
                    messages.map(m => <ChatMessage key={m._id} message={m} currentUser={currentUser.user} />)
                )}
                <div ref={messagesEndRef} />
            </main>
            <footer className="py-2 px-3 border-t border-slate-700 bg-slate-800 flex-shrink-0 sticky bottom-0 z-30 shadow-md">
                <form onSubmit={handleSend} className="flex items-center space-x-3 w-full">
                    <input value={text} onChange={e => setText(e.target.value)} style={{flex: 2}} className="bg-slate-700 rounded p-2 text-sm w-full" placeholder={otherUser?.username ? `Message ${otherUser.username}` : (cachedName ? `Message ${cachedName}` : 'Message')} />
                    <button type="submit" disabled={sending || !text.trim()} className="bg-teal-600 p-2 rounded flex items-center justify-center">
                        {/* show icon on mobile, text on md+ */}
                        <SendIcon className="md:hidden" />
                        <span className="hidden md:inline">Send</span>
                    </button>
                </form>
            </footer>
        </div>
    );
};

export default ChatConversation;
