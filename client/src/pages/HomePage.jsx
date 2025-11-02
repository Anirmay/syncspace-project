import React, { useState, useContext, useEffect, useRef } from 'react'; // Added useEffect, useRef
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
// Use Vite env var for API base, fallback to localhost backend
const API_BASE = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL : 'http://localhost:5000';

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
const MailIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2 inline-block"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>);
const HomePage = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { currentUser, logout } = useContext(AuthContext);
  const dropdownRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationsRef = useRef(null);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  // If navigation requested a scroll (via header), perform a smooth scroll to the target
  useEffect(() => {
    try {
      const targetFromState = location?.state?.scrollTo;
      const hash = location?.hash;
      const target = targetFromState || (hash ? hash.replace('#', '') : null);
      if (target) {
        // small timeout to let the page render
        setTimeout(() => {
          const el = document.getElementById(target);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 80);
        // remove history state/hash so repeated visits don't re-trigger
        try {
          const cleanUrl = window.location.pathname + window.location.search;
          window.history.replaceState({}, document.title, cleanUrl);
        } catch (e) {
          // ignore
        }
      }
    } catch (e) {
      // ignore
    }
  }, [location]);

  return (
    <div className="min-h-screen font-inter bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
      {/* Header moved to global Header component (rendered in App.jsx) */}
      {/* --- Hero Section --- */}
      
      {/* --- Hero Section --- */}
  <main className="relative container mx-auto px-6 text-center pt-16 pb-16 overflow-hidden">
         {/* decorative gradient blobs */}
         <div className="absolute -top-40 left-1/4 w-80 h-80 rounded-full bg-gradient-to-br from-indigo-400 to-teal-300 opacity-20 blur-3xl -z-10"></div>
         <div className="absolute -top-24 right-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-pink-400 to-indigo-500 opacity-12 blur-3xl -z-10"></div>
         <div className="relative z-10">
           <h2 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4">Unify Your Workflow.<br />
             <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-teal-400 dark:from-indigo-300 dark:to-teal-300">Collaborate in Real-Time.</span>
           </h2>
           <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8">SyncSpace is an all-in-one platform that allows teams to manage projects, share documents, and communicate seamlessly — no more switching between tools.</p>
           <div className="flex items-center justify-center gap-4">
             {!currentUser && (<Link to="/register" className="inline-block bg-gradient-to-r from-indigo-600 to-teal-400 hover:from-indigo-500 hover:to-teal-300 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg transform hover:-translate-y-0.5 transition">Start for Free</Link>)}
             <Link to="/about" className="inline-block text-sm font-medium text-slate-600 dark:text-slate-300 hover:underline">Learn more</Link>
           </div>
         </div>
       </main>

      {/* --- Social Proof Section --- */}
      <section className="py-12">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-6">Trusted by teams at forward-thinking companies</p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6">
            <span className="text-2xl font-semibold text-indigo-600 dark:text-indigo-300 opacity-90">FutureTech</span>
            <span className="text-2xl font-semibold text-teal-600 dark:text-teal-300 opacity-90">Quantum Leap</span>
            <span className="text-2xl font-semibold text-pink-600 dark:text-pink-300 opacity-90">Nova Solutions</span>
            <span className="text-2xl font-semibold text-sky-600 dark:text-sky-300 opacity-90">Apex Dynamics</span>
          </div>
        </div>
      </section>

      {/* --- Stats Section --- */}
    <section className="py-16">
          <div className="container mx-auto px-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="p-6 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-md transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl hover:scale-105 cursor-pointer">
            <h4 className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-300 mb-2">10k+</h4>
            <p className="text-slate-600 dark:text-slate-300 flex items-center justify-center"><UsersIcon /> Active Users</p>
          </div>
              <div className="p-6 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-md transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl hover:scale-105 cursor-pointer">
            <h4 className="text-3xl font-extrabold text-teal-600 dark:text-teal-300 mb-2">500+</h4>
            <p className="text-slate-600 dark:text-slate-300 flex items-center justify-center"><FolderIcon /> Workspaces Created</p>
          </div>
              <div className="p-6 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-md transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl hover:scale-105 cursor-pointer">
            <h4 className="text-3xl font-extrabold text-pink-600 dark:text-pink-300 mb-2">99.9%</h4>
            <p className="text-slate-600 dark:text-slate-300 flex items-center justify-center"><ClockIcon /> Uptime Guarantee</p>
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
             <div className="p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl hover:scale-105 cursor-pointer">
               <div className="inline-block p-4 rounded-full mb-6 bg-gradient-to-br from-indigo-500 to-teal-400 text-white"><KanbanIcon /></div>
               <h4 className="text-xl font-bold mb-2">Dynamic Kanban Boards</h4>
               <p className="text-slate-600 dark:text-slate-300">Visualize your workflow with interactive, drag-and-drop task boards for effortless project management.</p>
             </div>
             <div className="p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl hover:scale-105 cursor-pointer">
               <div className="inline-block p-4 rounded-full mb-6 bg-gradient-to-br from-pink-500 to-indigo-500 text-white"><DocIcon /></div>
               <h4 className="text-xl font-bold mb-2">Real-time Document Editor</h4>
               <p className="text-slate-600 dark:text-slate-300">Collaborate on documents simultaneously, ensuring everyone is always on the same page.</p>
             </div>
             <div className="p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl hover:scale-105 cursor-pointer">
               <div className="inline-block p-4 rounded-full mb-6 bg-gradient-to-br from-sky-500 to-indigo-500 text-white"><ChatIcon /></div>
               <h4 className="text-xl font-bold mb-2">Integrated Chat</h4>
               <p className="text-slate-600 dark:text-slate-300">Communicate in real-time with dedicated chat channels for each workspace, keeping conversations organized.</p>
             </div>
           </div>
         </div>
      </section>

      {/* --- Testimonials Section --- */}
      <section id="testimonials" className="py-24">
        <div className="container mx-auto px-6">
          <h3 className="text-3xl md:text-4xl font-bold text-center mb-16">What Our Users Say</h3>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="p-8 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl hover:scale-105 cursor-pointer">
              <div className="flex items-start gap-4"><div className="p-3 rounded-full bg-indigo-50 dark:bg-indigo-900"><QuoteIcon /></div><div className="flex-1">
              <p className="text-lg text-slate-700 dark:text-slate-300 italic my-6">"SyncSpace has revolutionized how our team works and saved us hours every week."</p>
              <div className="flex items-center">
                <img className="w-12 h-12 rounded-full mr-4" src="https://placehold.co/100x100/6366F1/FFFFFF?text=SA" alt="Sarah Adams" />
                <div><h5 className="font-bold text-slate-900 dark:text-white">Sarah Adams</h5><p className="text-sm text-slate-500 dark:text-slate-400">Project Manager, FutureTech</p></div>
              </div></div></div>
            </div>
            <div className="p-8 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl hover:scale-105 cursor-pointer">
              <div className="flex items-start gap-4"><div className="p-3 rounded-full bg-teal-50 dark:bg-teal-900"><QuoteIcon /></div><div className="flex-1">
              <p className="text-lg text-slate-700 dark:text-slate-300 italic my-6">"Having tasks, docs, and chat in one place is a true game-changer."</p>
              <div className="flex items-center">
                <img className="w-12 h-12 rounded-full mr-4" src="https://placehold.co/100x100/06B6D4/FFFFFF?text=MK" alt="Mark Chen" />
                <div><h5 className="font-bold text-slate-900 dark:text-white">Mark Chen</h5><p className="text-sm text-slate-500 dark:text-slate-400">Lead Developer, Nova Solutions</p></div>
              </div></div></div>
            </div>
            <div className="p-8 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl hover:scale-105 cursor-pointer">
              <div className="flex items-start gap-4"><div className="p-3 rounded-full bg-pink-50 dark:bg-pink-900"><QuoteIcon /></div><div className="flex-1">
              <p className="text-lg text-slate-700 dark:text-slate-300 italic my-6">"As a remote team, SyncSpace is our virtual office and keeps us connected."</p>
              <div className="flex items-center">
                <img className="w-12 h-12 rounded-full mr-4" src="https://placehold.co/100x100/EC4899/FFFFFF?text=EJ" alt="Emily Johnson" />
                <div><h5 className="font-bold text-slate-900 dark:text-white">Emily Johnson</h5><p className="text-sm text-slate-500 dark:text-slate-400">Design Lead, Quantum Leap</p></div>
              </div></div></div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Final CTA Section --- */}
      <section className="py-24">
        <div className="container mx-auto px-6 text-center">
          <div className="relative rounded-2xl p-12 overflow-hidden bg-gradient-to-r from-indigo-600 to-teal-400 text-white shadow-xl transform transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl">
            <h3 className="text-3xl md:text-4xl font-extrabold mb-4">Ready to Streamline Your Workflow?</h3>
            <p className="text-lg max-w-xl mx-auto mb-8">Join thousands of teams building their best work on SyncSpace. Get started for free—no credit card required.</p>
            <div className="flex items-center justify-center gap-4">
              {!currentUser && (<Link to="/register" className="inline-block bg-white text-indigo-700 font-bold py-3 px-8 rounded-full text-lg shadow-md hover:translate-y-0.5 transition">Sign Up Now</Link>)}
              <Link to="/contact" className="text-white/90 hover:underline">Contact Sales</Link>
            </div>
            <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
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

