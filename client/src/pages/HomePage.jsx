import React, { useState, useContext, useEffect, useRef } from 'react'; // Added useEffect, useRef
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// --- SVG Icons ---
const KanbanIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-indigo-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21M9 17.25v-1.007a3 3 0 00-.879-2.122L7.5 15M9 17.25v-1.007a3 3 0 01.879-2.122L10.5 15M9 17.25h1.007a3 3 0 012.122.879L13.5 21M9 17.25h1.007a3 3 0 002.122-.879L13.5 15M9 17.25h1.007a3 3 0 012.122-.879L13.5 15m0 0v1.007a3 3 0 01.879 2.122L15 21m0 0v-1.007a3 3 0 00.879-2.122L16.5 15m0 0h1.007a3 3 0 012.122.879L21 21m0 0h-1.007a3 3 0 01-2.122-.879L16.5 15m0 0h1.007a3 3 0 002.122-.879L19.5 15m0 0h1.007a3 3 0 012.122.879L22.5 15m0 0h-1.007a3 3 0 01-2.122-.879L19.5 15M3 7.5l1.5 1.5M3 7.5l1.5-1.5M3 7.5H4.5m16.5 0l-1.5 1.5m1.5-1.5l-1.5-1.5m1.5-1.5H19.5M9 4.5l1.5 1.5M9 4.5l1.5-1.5M9 4.5H10.5m4.5 0l-1.5 1.5m1.5-1.5l-1.5-1.5m1.5-1.5H13.5" />
    </svg>
);
const DocIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-indigo-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
);
const ChatIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-indigo-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
);
const QuoteIcon = () => (
    <svg className="w-10 h-10 text-indigo-500" fill="currentColor" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.742 22.879c0 2.222-1.22 3.636-3.266 3.636-1.06 0-2.03-.42-2.734-1.118l-1.848 2.6c1.17.84 2.59 1.3 4.1 1.3 3.63 0 6.64-2.65 6.64-7.27 0-4.2-2.73-7.368-6.53-7.368-3.91 0-6.93 3.168-6.93 7.062 0 3.012 1.94 5.04 4.546 5.04 1.63 0 2.91-1.02 2.91-2.43 0-1.41-.9-2.32-2.22-2.32-1.06 0-1.92.73-1.92 1.8 0 1.02.75 1.74 1.74 1.74.84 0 1.48-.63 1.48-1.59zm13.13 0c0 2.222-1.22 3.636-3.266 3.636-1.06 0-2.03-.42-2.734-1.118l-1.848 2.6c1.17.84 2.59 1.3 4.1 1.3 3.63 0 6.64-2.65 6.64-7.27 0-4.2-2.73-7.368-6.53-7.368-3.91 0-6.93 3.168-6.93 7.062 0 3.012 1.94 5.04 4.546 5.04 1.63 0 2.91-1.02 2.91-2.43 0-1.41-.9-2.32-2.22-2.32-1.06 0-1.92.73-1.92 1.8 0 1.02.75 1.74 1.74 1.74.84 0 1.48-.63 1.48-1.59z" />
    </svg>
);
const MenuIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
);
const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);
const UsersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2 inline-block">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
);
const FolderIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2 inline-block">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
    </svg>
);
const ClockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2 inline-block">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const BellIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.017 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
);
const ChatBubbleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.8}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M7.5 8.25h9m-9 3.75h5.25M21 12a9 9 0 11-18 0 9 9 0 0118 0zM7.5 20.25l1.5-3.75L3 17.25l4.5 3z"
    />
  </svg>
);
const HomePage = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { currentUser, logout } = useContext(AuthContext);
  const dropdownRef = useRef(null);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const handleLogout = () => {
    if (isMobileMenuOpen) toggleMobileMenu();
    if (isDropdownOpen) setIsDropdownOpen(false);
    logout();
  }

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
         const isUserIconButton = event.target.closest('button[aria-label="Account menu"]');
         if (!isUserIconButton) {
            setIsDropdownOpen(false);
         }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const linkStyle = "text-slate-300 hover:text-indigo-400 transition-colors px-3 py-2 rounded-md text-sm font-medium";
  const mobileLinkStyle = "text-slate-300 hover:text-indigo-400 transition-colors block w-full text-center py-3 text-base";
  const iconButtonStyle = "text-slate-300 hover:text-indigo-400 focus:outline-none p-1 rounded-full hover:bg-slate-700 relative";


  return (
    <div className="bg-slate-900 text-white min-h-screen font-inter">
      {/* --- Header --- */}
      <header className="sticky top-0 z-50 bg-slate-900 shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8"> {/* Adjusted padding */}
          <div className="relative flex items-center justify-between h-16">

            {/* Logo */}
            <div className="flex-shrink-0">
                <Link to="/" className="text-2xl font-bold">SyncSpace</Link>
            </div>
            {/* --- Desktop Navigation (Middle Links) --- */}
            <div className="hidden md:flex md:ml-6 flex-grow items-center justify-center">
                <div className="flex space-x-4">
                     {currentUser ? (
                         <>
                            {/* Logged In Links */}
                            <Link to="#" className={linkStyle} aria-disabled="true" style={{opacity: 0.5, cursor: 'not-allowed'}}>Upload Project</Link> {/* Placeholder */}
                            <Link to="/dashboard" className={linkStyle}>Workflow Board</Link>
                            <Link to="/dashboard" className={linkStyle}>Create Project</Link>
                            <Link to="/about" className={linkStyle}>About</Link>
                            <Link to="/contact" className={linkStyle}>Contact</Link>
                         </>
                     ) : (
                         <>
                            {/* Logged Out Links */}
                            <a href="#features" className={linkStyle}>Features</a>
                            <a href="#testimonials" className={linkStyle}>Testimonials</a>
                            {/* Add About/Contact here for logged out users if desired */}
                            <Link to="/about" className={linkStyle}>About</Link>
                            <Link to="/contact" className={linkStyle}>Contact</Link>
                         </>
                     )}
                </div>
            </div>
          {/* --- Right Side Icons/Buttons --- */}
            <div className="hidden md:flex items-center space-x-4">
                {currentUser ? (
                  <>
                    <Link to="/chat" className={iconButtonStyle} aria-label="Chat">
                        <ChatBubbleIcon />
                    </Link>
                    {/* Notification Icon */}
                    <button className={iconButtonStyle} aria-label="Notifications">
                      <BellIcon />
                      {/* Optional: Badge */}
                    </button>

                    {/* Account Icon Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                      <button onClick={toggleDropdown} className="flex items-center text-slate-300 hover:text-indigo-400 focus:outline-none p-1 rounded-full hover:bg-slate-700" aria-label="Account menu"> <UserIcon /> </button>
                      <div className={`absolute right-0 mt-2 w-48 bg-slate-800 rounded-md shadow-lg py-1 border border-slate-700 transition-all duration-200 ease-out origin-top-right ${isDropdownOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                         <div className="px-4 py-2 text-sm text-slate-400 border-b border-slate-700">Hi, {currentUser.user?.username || 'User'}!</div>
                         <Link to="/profile" className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors" onClick={() => setIsDropdownOpen(false)}>User Profile</Link>
                         <Link to="/account-settings" className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors" onClick={() => setIsDropdownOpen(false)}>Account Settings</Link>
                         <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">Logout</button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <Link to="/login" className={linkStyle}>Login</Link>
                    <Link to="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-5 rounded-lg transition-colors text-sm">Get Started</Link>
                  </>
                )}
            </div>
          {/* --- Mobile Menu Button --- */}
            <div className="-mr-2 flex md:hidden"> {/* Adjusted margin */}
              <button onClick={toggleMobileMenu} className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white" aria-controls="mobile-menu" aria-expanded={isMobileMenuOpen}>
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
              </button>
            </div>
          </div>
        </div>

        {/* --- Mobile Menu --- */}
        <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`} id="mobile-menu">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-slate-700"> {/* Added border */}
              {currentUser ? (
                 <>
                    <Link to="#" className={mobileLinkStyle} aria-disabled="true" style={{opacity: 0.5, cursor: 'not-allowed'}} onClick={toggleMobileMenu}>Upload Project</Link>
                    <Link to="/dashboard" className={mobileLinkStyle} onClick={toggleMobileMenu}>Workflow Board</Link>
                    <Link to="/dashboard" className={mobileLinkStyle} onClick={toggleMobileMenu}>Create Project</Link>
                    <Link to="/chat" className={mobileLinkStyle} onClick={toggleMobileMenu}>Chat</Link>
                    <Link to="/about" className={mobileLinkStyle} onClick={toggleMobileMenu}>About</Link>
                    <Link to="/contact" className={mobileLinkStyle} onClick={toggleMobileMenu}>Contact</Link>
                    <hr className="border-slate-700 my-2"/>
                    {/* Simplified mobile - account links */}
                    <Link to="/profile" className={mobileLinkStyle} onClick={toggleMobileMenu}>User Profile</Link>
                    <Link to="/account-settings" className={mobileLinkStyle} onClick={toggleMobileMenu}>Account Settings</Link>
                    {/* Add Notifications Link */}
                     <Link to="#" className={mobileLinkStyle} onClick={toggleMobileMenu}>Notifications</Link>
                    <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-5 rounded-lg block w-full text-center mt-2">Logout</button>
                 </>
              ) : (
                <>
                  <a href="#features" className={mobileLinkStyle} onClick={toggleMobileMenu}>Features</a>
                  <a href="#testimonials" className={mobileLinkStyle} onClick={toggleMobileMenu}>Testimonials</a>
                  <Link to="/about" className={mobileLinkStyle} onClick={toggleMobileMenu}>About</Link>
                  <Link to="/contact" className={mobileLinkStyle} onClick={toggleMobileMenu}>Contact</Link>
                  <hr className="border-slate-700 my-2"/>
                  <Link to="/login" className={mobileLinkStyle} onClick={toggleMobileMenu}>Login</Link>
                  <Link to="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-5 rounded-lg block w-full text-center mt-2" onClick={toggleMobileMenu}>Get Started</Link>
                </>
              )}
            </div>
        </div>
      </header>
      
      {/* --- Hero Section --- */}
       <main className="relative container mx-auto px-6 text-center pt-24 pb-16 overflow-hidden">
         <div className="absolute -top-1/4 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-indigo-700/30 rounded-full filter blur-3xl opacity-50" />
         <div className="relative z-10">
           <h2 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4">Unify Your Workflow.<br /><span className="text-indigo-400">Collaborate in Real-Time.</span></h2>
           <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">SyncSpace is an all-in-one platform that allows teams to manage projects, share documents, and communicate seamlessly, eliminating the need for multiple disconnected tools.</p>
           {!currentUser && (<Link to="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors transform hover:scale-105 inline-block">Start for Free</Link>)}
         </div>
       </main>

      {/* --- Social Proof Section --- */}
      <section className="py-12">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6">Trusted by teams at forward-thinking companies</p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6">
            <span className="text-2xl font-bold text-slate-500 opacity-60">FutureTech</span>
            <span className="text-2xl font-bold text-slate-500 opacity-60">Quantum Leap</span>
            <span className="text-2xl font-bold text-slate-500 opacity-60">Nova Solutions</span>
            <span className="text-2xl font-bold text-slate-500 opacity-60">Apex Dynamics</span>
          </div>
        </div>
      </section>

      {/* --- Stats Section --- */}
      <section className="py-16 bg-slate-800/50">
          <div className="container mx-auto px-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                  <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                      <h4 className="text-3xl font-bold text-indigo-400 mb-2">10k+</h4>
                      <p className="text-slate-400 flex items-center justify-center"><UsersIcon /> Active Users</p>
                  </div>
                  <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                      <h4 className="text-3xl font-bold text-indigo-400 mb-2">500+</h4>
                      <p className="text-slate-400 flex items-center justify-center"><FolderIcon /> Workspaces Created</p>
                  </div>
                  <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                      <h4 className="text-3xl font-bold text-indigo-400 mb-2">99.9%</h4>
                      <p className="text-slate-400 flex items-center justify-center"><ClockIcon /> Uptime Guarantee</p>
                  </div>
              </div>
          </div>
      </section>

      {/* --- Features Section --- */}
      <section id="features" className="py-24">
         <div className="container mx-auto px-6 text-center">
           <h3 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need in One Place</h3>
           <p className="text-slate-400 max-w-xl mx-auto mb-16">Stop switching between apps. SyncSpace brings your entire workflow into one unified hub.</p>
           <div className="grid md:grid-cols-3 gap-8">
             <div className="bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-700 transform hover:-translate-y-2 transition-transform duration-300">
               <div className="inline-block p-4 bg-slate-900 rounded-full mb-6"><KanbanIcon /></div>
               <h4 className="text-xl font-bold mb-2">Dynamic Kanban Boards</h4>
               <p className="text-slate-400">Visualize your workflow with interactive, drag-and-drop task boards for effortless project management.</p>
             </div>
             <div className="bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-700 transform hover:-translate-y-2 transition-transform duration-300">
               <div className="inline-block p-4 bg-slate-900 rounded-full mb-6"><DocIcon /></div>
               <h4 className="text-xl font-bold mb-2">Real-time Document Editor</h4>
               <p className="text-slate-400">Collaborate on documents simultaneously, just like Google Docs, ensuring everyone is always on the same page.</p>
             </div>
             <div className="bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-700 transform hover:-translate-y-2 transition-transform duration-300">
               <div className="inline-block p-4 bg-slate-900 rounded-full mb-6"><ChatIcon /></div>
               <h4 className="text-xl font-bold mb-2">Integrated Chat</h4>
               <p className="text-slate-400">Communicate in real-time with dedicated chat channels for each workspace, keeping all your conversations organized.</p>
             </div>
           </div>
         </div>
      </section>

      {/* --- Testimonials Section --- */}
      <section id="testimonials" className="py-24 bg-slate-800/50">
        <div className="container mx-auto px-6">
          <h3 className="text-3xl md:text-4xl font-bold text-center mb-16">What Our Users Say</h3>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-700">
              <QuoteIcon />
              <p className="text-lg text-slate-300 italic my-6">"SyncSpace has revolutionized how our team works..."</p>
              <div className="flex items-center">
                <img className="w-12 h-12 rounded-full mr-4" src="https://placehold.co/100x100/6366F1/FFFFFF?text=SA" alt="Sarah Adams" />
                <div><h5 className="font-bold text-white">Sarah Adams</h5><p className="text-sm text-slate-400">Project Manager, FutureTech</p></div>
              </div>
            </div>
            <div className="bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-700">
              <QuoteIcon />
              <p className="text-lg text-slate-300 italic my-6">"Having our tasks, docs, and chat in one place is a game-changer..."</p>
              <div className="flex items-center">
                <img className="w-12 h-12 rounded-full mr-4" src="https://placehold.co/100x100/6366F1/FFFFFF?text=MK" alt="Mark Chen" />
                <div><h5 className="font-bold text-white">Mark Chen</h5><p className="text-sm text-slate-400">Lead Developer, Nova Solutions</p></div>
              </div>
            </div>
            <div className="bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-700">
              <QuoteIcon />
              <p className="text-lg text-slate-300 italic my-6">"As a remote team, SyncSpace is our virtual office..."</p>
              <div className="flex items-center">
                <img className="w-12 h-12 rounded-full mr-4" src="https://placehold.co/100x100/6366F1/FFFFFF?text=EJ" alt="Emily Johnson" />
                <div><h5 className="font-bold text-white">Emily Johnson</h5><p className="text-sm text-slate-400">Design Lead, Quantum Leap</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Final CTA Section --- */}
      <section className="py-24">
        <div className="container mx-auto px-6 text-center">
          <div className="relative bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-2xl p-12 overflow-hidden">
            <h3 className="text-3xl md:text-4xl font-extrabold mb-4">Ready to Streamline Your Workflow?</h3>
            <p className="text-lg text-indigo-200 max-w-xl mx-auto mb-8">Join thousands of teams building their best work on SyncSpace. Get started for free—no credit card required.</p>
            {!currentUser && (<Link to="/register" className="bg-white hover:bg-slate-100 text-indigo-700 font-bold py-3 px-8 rounded-lg text-lg transition-colors transform hover:scale-105 inline-block">Sign Up Now</Link>)}
          </div>
        </div>
      </section>
      
      {/* --- Footer --- */}
      <footer className="container mx-auto px-6 py-12 text-center text-slate-500">
        <div className="flex justify-center space-x-6 mb-4">
          <a href="#" className="hover:text-slate-400">Features</a>
          <a href="#" className="hover:text-slate-400">Pricing</a>
          <a href="#" className="hover:text-slate-400">About</a>
          <a href="#" className="hover:text-slate-400">Contact</a>
        </div>
        <p>&copy; 2025 SyncSpace. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;

