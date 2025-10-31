import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

// Icons (small subset used in header)
const ChatBubbleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3.75h5.25M21 12a9 9 0 11-18 0 9 9 0 0118 0zM7.5 20.25l1.5-3.75L3 17.25l4.5 3z" />
  </svg>
);
const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.017 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
  </svg>
);

const Header = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const location = useLocation();
  const [isDarkModeLocal, setIsDarkModeLocal] = useState(() => {
    try {
      const v = localStorage.getItem('darkMode');
      if (v === null) return document.documentElement.classList.contains('dark');
      return v === 'true';
    } catch (e) {
      return document.documentElement.classList.contains('dark');
    }
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationsRef = useRef(null);
  const accountRef = useRef(null);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  useEffect(() => {
    let intervalId;
    const fetchNotifications = async () => {
      try {
        const token = currentUser?.token || currentUser?.user?.token;
        if (!token) return;
        const cfg = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get('http://localhost:5000/api/notifications', cfg);
        setNotifications(res.data || []);
      } catch (err) {
        // ignore
      }
    };
    fetchNotifications();
    intervalId = setInterval(fetchNotifications, 15000);
    function handleClickOutside(e) {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) setIsNotificationsOpen(false);
      if (accountRef.current && !accountRef.current.contains(e.target)) setIsAccountOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => { clearInterval(intervalId); document.removeEventListener('mousedown', handleClickOutside); };
  }, [currentUser]);

  // Keep document and localStorage in sync when toggling from header
  useEffect(() => {
    try {
      if (isDarkModeLocal) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('darkMode', 'true');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('darkMode', 'false');
      }
    } catch (e) {
      // ignore
    }
  }, [isDarkModeLocal]);

  const toggleDarkMode = (e) => {
    e?.stopPropagation();
    setIsDarkModeLocal(d => !d);
  };

  const markAllRead = async () => {
    try {
      const token = currentUser?.token || currentUser?.user?.token;
      if (!token) return;
      const cfg = { headers: { Authorization: `Bearer ${token}` } };
      await axios.patch('http://localhost:5000/api/notifications/markAllRead', {}, cfg);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      // ignore
    }
  };

  const handleNotificationClick = async (n) => {
    try {
      const token = currentUser?.token || currentUser?.user?.token;
      if (!token) return;
      const cfg = { headers: { Authorization: `Bearer ${token}` } };
      // mark this notification as read on the server
      await axios.patch(`http://localhost:5000/api/notifications/${n._id}/read`, {}, cfg);
      setNotifications(prev => prev.map(p => p._id === n._id ? { ...p, read: true } : p));
      if (n.link) window.location.href = n.link;
    } catch (err) {
      // ignore
    }
  };

  // Hide header on auth pages
  const hideOn = ['/login', '/register', '/forgot-password', '/reset-password', '/auth'];
  if (hideOn.some(p => location.pathname.startsWith(p))) return null;

  const linkStyle = "text-slate-300 hover:text-indigo-400 transition-colors px-3 py-2 rounded-md text-sm font-medium";
  const iconButtonStyle = "text-slate-300 hover:text-indigo-400 focus:outline-none p-1 rounded-full hover:bg-slate-700 relative";

  // Helpers to mark active nav item based on current location
  const normalize = (p) => {
    if (!p) return '/';
    try {
      // remove trailing slashes
      const s = p.replace(/\/+$|^\s+|\s+$/g, '');
      return s === '' ? '/' : s.replace(/\/$/, '');
    } catch (e) { return p; }
  };

  const isActive = (path, exact = true) => {
    if (!path) return false;
    try {
      const loc = normalize(location.pathname || '/');
      const target = normalize(path);

      // Special-case: treat any workspace route as part of the Dashboard nav
      // so that visiting /workspace/:workspaceId highlights "Workflow Board".
      if (target === '/dashboard') {
        if (loc === target) return true;
        if (loc.startsWith('/workspace')) return true;
        if (!exact && loc.startsWith(target)) return true;
        return false;
      }

      if (!exact) return loc.startsWith(target);
      return loc === target;
    } catch (e) {
      return false;
    }
  };

  // Stronger active style: teal text + subtle pill background to clearly indicate current page
  const navClass = (path, exact = true) => `${linkStyle} ${isActive(path, exact) ? 'text-teal-400 font-semibold bg-slate-800/10 dark:bg-slate-700/10 px-2 py-1 rounded-md' : ''}`;
  const iconClass = (path) => `${iconButtonStyle} ${isActive(path) ? 'text-teal-400' : ''}`;

  return (
    <header className="sticky top-0 z-50 bg-slate-900 shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center gap-3" aria-label="SyncSpace home">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center shadow-md ring-1 ring-slate-100/10">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6 text-white" aria-hidden="true">
                  <circle cx="6" cy="12" r="2" />
                  <circle cx="18" cy="6" r="2" />
                  <circle cx="18" cy="18" r="2" />
                  <path d="M8 12l6-4" />
                  <path d="M8 12l6 4" />
                </svg>
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">SyncSpace</span>
            </Link>
          </div>
          <div className="hidden md:flex md:ml-6 flex-grow items-center justify-center">
            <div className="flex space-x-4">
              {currentUser ? (
                <>
                    <Link to="/dashboard" className={navClass('/dashboard', false)}>Workflow Board</Link>
                    <Link to="/invitations" className={navClass('/invitations', false)}>Invitations</Link>
                    <Link to="/about" className={navClass('/about')}>About</Link>
                    <Link to="/contact" className={navClass('/contact')}>Contact</Link>
                </>
              ) : (
                <>
                  <a href="#features" className={linkStyle}>Features</a>
                  <a href="#testimonials" className={linkStyle}>Testimonials</a>
                  <Link to="/about" className={navClass('/about')}>About</Link>
                  <Link to="/contact" className={navClass('/contact')}>Contact</Link>
                </>
              )}
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            {currentUser ? (
              <>
                {/* Dark/Light toggle */}
                <button onClick={toggleDarkMode} aria-label="Toggle dark mode" className="p-1 rounded-full hover:bg-slate-700 transition-colors" title="Toggle theme">
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-transparent">
                    <svg className={`w-5 h-5 transition-transform duration-500 ${isDarkModeLocal ? 'rotate-0 scale-100 text-yellow-400' : 'rotate-12 scale-95 text-slate-300'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      {isDarkModeLocal ? (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364l-1.414 1.414M7.05 16.95l-1.414 1.414M18.364 18.364l-1.414-1.414M7.05 7.05L5.636 5.636M12 7a5 5 0 100 10 5 5 0 000-10z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                      )}
                    </svg>
                  </div>
                </button>
                <Link to="/chat" className={iconClass('/chat')} aria-label="Chat"><ChatBubbleIcon /></Link>
                <div className="relative" ref={notificationsRef}>
                  <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className={iconButtonStyle} aria-label="Notifications"><BellIcon />
                    {Array.isArray(notifications) && notifications.filter(n => !n.read).length > 0 && (
                      <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">{notifications.filter(n => !n.read).length}</span>
                    )}
                  </button>
                  <div className={`absolute right-0 mt-2 w-72 bg-slate-800 header-notifications rounded-md shadow-lg py-2 border border-slate-700 transition-all duration-150 origin-top-right ${isNotificationsOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                    <div className="flex items-center justify-between px-3 py-2 border-b border-slate-700">
                      <div className="text-sm text-slate-300 font-semibold">Notifications</div>
                      <button onClick={(e) => { e.stopPropagation(); markAllRead(); }} className="text-xs text-slate-400 hover:text-slate-200">Mark all</button>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {(Array.isArray(notifications) && notifications.length === 0) && <div className="px-3 py-3 text-sm text-slate-400">No notifications</div>}
                      {(Array.isArray(notifications) ? notifications.slice(0, 20) : []).map(n => (
                        <div key={n._id} onClick={(e) => { e.stopPropagation(); handleNotificationClick(n); setIsNotificationsOpen(false); }} className={`px-3 py-2 text-sm cursor-pointer hover:bg-slate-700 ${n.read ? 'text-slate-400' : 'text-white'}`}>
                          <div className="truncate">{n.message}</div>
                          <div className="text-xs text-slate-500 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Account dropdown */}
                <div className="relative" ref={accountRef}>
                  <button onClick={() => setIsAccountOpen(open => !open)} className="flex items-center space-x-3 focus:outline-none p-1 rounded-full hover:bg-slate-700">
                    <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-sm font-bold ring-1 ring-offset-2 ring-offset-slate-800 ring-teal-400">{currentUser?.user?.username ? currentUser.user.username.charAt(0).toUpperCase() : '?'}</div>
                    <span className="text-slate-300 text-sm">Hi, {currentUser?.user?.username || 'User'}!</span>
                  </button>

            <div className={`absolute right-0 mt-2 w-48 bg-slate-800 rounded-md shadow-lg py-1 border border-slate-700 transition-all duration-150 origin-top-right ${isAccountOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
              <Link to="/profile" onClick={() => setIsAccountOpen(false)} className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white">User Profile</Link>
              <Link to="/account-settings" onClick={() => setIsAccountOpen(false)} className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white">Account Settings</Link>
              <button onClick={() => { setIsAccountOpen(false); logout(); }} className="block w-full text-left px-4 py-2 text-sm text-rose-400 hover:bg-slate-700">Logout</button>
            </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login" className="text-slate-300 hover:text-indigo-400">Login</Link>
                <Link to="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded">Sign up</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
