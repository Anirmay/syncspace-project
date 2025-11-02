import React from 'react';

const ChatMessage = ({ message, currentUser }) => {
    const sender = message.sender;
    const senderId = sender?._id ?? sender;
    const senderUsername = sender?.username ?? (typeof sender === 'string' ? sender : undefined);
    const currentId = currentUser?._id ?? currentUser?._id;
    const currentUsername = currentUser?.username;

    const isOwnMessage = (
        (senderId && currentId && String(senderId) === String(currentId)) ||
        (senderUsername && currentUsername && String(senderUsername) === String(currentUsername))
    );
    const alignment = isOwnMessage ? 'items-end' : 'items-start';
    const bubbleClasses = isOwnMessage ? 'bg-teal-600 text-white' : 'bg-white text-slate-900 dark:bg-slate-700 dark:text-white ring-1 ring-slate-200 dark:ring-slate-600';
    const timeAlign = isOwnMessage ? 'text-right' : 'text-left';
    const senderName = senderUsername || (isOwnMessage ? (currentUsername || 'You') : 'User');

    return (
        <div className={`w-full flex flex-col mb-4 ${alignment} transition-opacity duration-300 ease-in-out`}>
            <div className={`flex items-end max-w-lg ${isOwnMessage ? 'ml-auto flex-row-reverse' : ''}`}>
                 <div className={`w-8 h-8 rounded-full flex-shrink-0 ${isOwnMessage ? 'ml-2' : 'mr-2'} ${isOwnMessage ? 'bg-teal-500 text-white' : 'bg-slate-300 text-slate-700 dark:bg-slate-600 dark:text-white'} flex items-center justify-center text-xs font-bold ring-1 ring-slate-200 dark:ring-slate-600`}>
                    {String(senderName).charAt(0).toUpperCase()}
                 </div>
                 <div className={`${bubbleClasses} p-3 rounded-lg shadow-md max-w-xs sm:max-w-md md:max-w-lg break-words`}>
                    {!isOwnMessage && <p className="text-xs font-semibold mb-1 text-slate-500 dark:text-slate-300">{senderName}</p>}
                    <p className="text-sm">{message.text}</p>
                 </div>
            </div>
             <p className={`text-xs text-slate-400 dark:text-slate-300 mt-1 ${timeAlign} ${isOwnMessage ? 'mr-8' : 'ml-8'}`}>
                 {new Date(message.createdAt || message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
             </p>
        </div>
    );
};

export default ChatMessage;
