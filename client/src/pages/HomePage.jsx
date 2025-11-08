import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { initAOS } from '../utils/animationConfig';
import axios from 'axios';

// Animation variants
const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 60 }
};

const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
};

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
};
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

const RocketIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-indigo-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
    </svg>
);

const ShieldIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-indigo-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
);

const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-indigo-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
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
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, -50]);
  
  const heroScale = useTransform(heroScrollProgress, [0, 1], [1, 1.2]);
  const heroOpacity = useTransform(heroScrollProgress, [0, 1], [1, 0]);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  // If navigation requested a scroll (via header), perform a smooth scroll to the target
  useEffect(() => {
    // Initialize AOS
    initAOS();
    
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
  <motion.main 
    ref={heroRef}
    className="relative min-h-[75vh] flex items-center justify-center px-6 pt-4 pb-16 overflow-hidden"
    style={{ opacity: heroOpacity }}
  >
    {/* Animated background patterns */}
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
          rotate: [0, 180, 360]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "reverse"
        }}
        className="absolute -top-40 left-1/4 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-indigo-400/30 to-purple-400/30 blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
          rotate: [360, 180, 0]
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          repeatType: "reverse"
        }}
        className="absolute -bottom-40 right-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-pink-400/20 to-indigo-400/20 blur-3xl"
      />
    </div>

    {/* Main content */}
    <div className="container mx-auto max-w-7xl relative z-10">
      <motion.div
        className="text-center"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.h1
          variants={item}
          className="text-5xl md:text-7xl font-extrabold leading-tight mb-6"
        >
          Unify Your Workflow.
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            Collaborate in Real-Time.
          </span>
        </motion.h1>

        <motion.p
          variants={item}
          className="text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          SyncSpace is an all-in-one platform that allows teams to manage projects, 
          share documents, and communicate seamlessly — no more switching between tools.
        </motion.p>

        <motion.div
          variants={item}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          {!currentUser && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link 
                to="/register" 
                className="inline-flex items-center px-8 py-4 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg shadow-lg hover:shadow-indigo-500/25 transition-all duration-300"
              >
                Start for Free
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 ml-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </motion.div>
          )}
          <Link 
            to="/about" 
            className="inline-flex items-center text-slate-400 hover:text-white transition-colors"
          >
            Learn more
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 ml-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        </motion.div>

        {/* Feature highlights */}
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
        >
          <motion.div
            variants={item}
            whileHover={{ scale: 1.05 }}
            className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm"
          >
            <div className="flex items-center justify-center mb-4">
              <RocketIcon />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Lightning Fast</h3>
            <p className="text-slate-400">Experience real-time updates and seamless collaboration without delays.</p>
          </motion.div>

          <motion.div
            variants={item}
            whileHover={{ scale: 1.05 }}
            className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm"
          >
            <div className="flex items-center justify-center mb-4">
              <ShieldIcon />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Bank-Level Security</h3>
            <p className="text-slate-400">Your data is protected with enterprise-grade encryption and security measures.</p>
          </motion.div>

          <motion.div
            variants={item}
            whileHover={{ scale: 1.05 }}
            className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm"
          >
            <div className="flex items-center justify-center mb-4">
              <SparklesIcon />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">AI-Powered</h3>
            <p className="text-slate-400">Smart features and automation to boost your team's productivity.</p>
          </motion.div>
        </motion.div>


      </motion.div>
    </div>
  </motion.main>

      {/* --- Social Proof Section --- */}
      <section className="relative py-24 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              x: [-20, 20, -20],
              y: [-20, 20, -20],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at center, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0) 70%)`,
            }}
          />
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.span 
              className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-indigo-500/10 text-indigo-400 mb-4"
              whileHover={{ scale: 1.05 }}
            >
              Global Trust
            </motion.span>
            <h2 className="text-4xl font-bold text-white mb-4">
              Trusted by Innovative Teams
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Join thousands of forward-thinking companies already using SyncSpace to transform their workflows
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {[
              { name: 'FutureTech', color: 'from-indigo-600 to-blue-600' },
              { name: 'Quantum Leap', color: 'from-purple-600 to-pink-600' },
              { name: 'Nova Solutions', color: 'from-teal-600 to-emerald-600' },
              { name: 'Apex Dynamics', color: 'from-orange-600 to-red-600' }
            ].map((company, index) => (
              <motion.div
                key={company.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center"
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${company.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <span className="text-2xl font-bold text-white">{company.name[0]}</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{company.name}</h3>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Stats Section --- */}
      <section className="relative py-24">
        <div className="absolute inset-0 bg-slate-50 dark:bg-slate-900/50 -skew-y-6 transform origin-top-left"></div>
        <div className="container mx-auto px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.span 
              className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-4"
              whileHover={{ scale: 1.05 }}
            >
              By the Numbers
            </motion.span>
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Driving Success at Scale
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Join thousands of teams already using SyncSpace to transform their collaboration
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {[
              { number: '10k+', label: 'Active Users', icon: UsersIcon, color: 'indigo' },
              { number: '5M+', label: 'Documents Shared', icon: FolderIcon, color: 'purple' },
              { number: '99.9%', label: 'Uptime', icon: ClockIcon, color: 'emerald' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className="relative group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <motion.div
                  className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"
                  initial={false}
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                />
                <motion.div 
                  className="relative p-8 bg-white dark:bg-slate-800 rounded-xl shadow-xl"
                  whileHover={{ 
                    y: -5,
                    transition: { type: "spring", stiffness: 300 }
                  }}
                >
                  <div className={`inline-flex p-3 rounded-lg bg-${stat.color}-500/10 mb-4`}>
                    <stat.icon />
                  </div>
                  <motion.h3 
                    className={`text-4xl font-bold text-${stat.color}-600 dark:text-${stat.color}-400 mb-2`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                  >
                    {stat.number}
                  </motion.h3>
                  <p className="text-slate-600 dark:text-slate-300 font-medium">{stat.label}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Features Section --- */}
      <section id="features" className="py-24">
         <div className="container mx-auto px-6 text-center">
           <h3 className="text-3xl md:text-4xl font-bold mb-4" data-aos="fade-up">Everything You Need in One Place</h3>
           <p className="text-slate-400 max-w-xl mx-auto mb-16" data-aos="fade-up" data-aos-delay="100">Stop switching between apps. SyncSpace brings your entire workflow into one unified hub.</p>
           <div className="grid md:grid-cols-3 gap-8">
             <motion.div 
               whileHover={{ 
                 scale: 1.05,
                 boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                 borderColor: "rgba(99, 102, 241, 0.5)"
               }}
               whileTap={{ scale: 0.98 }}
               transition={{
                 type: "spring",
                 stiffness: 300,
                 damping: 20
               }}
               className="p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer"
               data-aos="fade-up"
               data-aos-delay="200"
             >
               <motion.div 
                 whileHover={{ rotate: 360 }}
                 transition={{ duration: 0.6 }}
                 className="inline-block p-4 rounded-full mb-6 bg-gradient-to-br from-indigo-500 to-teal-400 text-white"
               >
                 <KanbanIcon />
               </motion.div>
               <motion.h4 
                 whileHover={{ scale: 1.1 }}
                 className="text-xl font-bold mb-2"
               >
                 Dynamic Kanban Boards
               </motion.h4>
               <p className="text-slate-600 dark:text-slate-300">Visualize your workflow with interactive, drag-and-drop task boards for effortless project management.</p>
             </motion.div>
             <motion.div 
               whileHover={{ 
                 scale: 1.05,
                 boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                 borderColor: "rgba(236, 72, 153, 0.5)"
               }}
               whileTap={{ scale: 0.98 }}
               transition={{
                 type: "spring",
                 stiffness: 300,
                 damping: 20
               }}
               className="p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer"
               data-aos="fade-up"
               data-aos-delay="300"
             >
               <motion.div 
                 whileHover={{ rotate: 360 }}
                 transition={{ duration: 0.6 }}
                 className="inline-block p-4 rounded-full mb-6 bg-gradient-to-br from-pink-500 to-indigo-500 text-white"
               >
                 <DocIcon />
               </motion.div>
               <motion.h4 
                 whileHover={{ scale: 1.1 }}
                 className="text-xl font-bold mb-2"
               >
                 Real-time Document Editor
               </motion.h4>
               <p className="text-slate-600 dark:text-slate-300">Collaborate on documents simultaneously, ensuring everyone is always on the same page.</p>
             </motion.div>
             <motion.div 
               whileHover={{ 
                 scale: 1.05,
                 boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                 borderColor: "rgba(56, 189, 248, 0.5)"
               }}
               whileTap={{ scale: 0.98 }}
               transition={{
                 type: "spring",
                 stiffness: 300,
                 damping: 20
               }}
               className="p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer"
               data-aos="fade-up"
               data-aos-delay="400"
             >
               <motion.div 
                 whileHover={{ rotate: 360 }}
                 transition={{ duration: 0.6 }}
                 className="inline-block p-4 rounded-full mb-6 bg-gradient-to-br from-sky-500 to-indigo-500 text-white"
               >
                 <ChatIcon />
               </motion.div>
               <motion.h4 
                 whileHover={{ scale: 1.1 }}
                 className="text-xl font-bold mb-2"
               >
                 Integrated Chat
               </motion.h4>
               <p className="text-slate-600 dark:text-slate-300">Communicate in real-time with dedicated chat channels for each workspace, keeping conversations organized.</p>
             </motion.div>
           </div>
         </div>
      </section>

      {/* --- Testimonials Section --- */}
      <section id="testimonials" className="py-24">
        <div className="container mx-auto px-6">
          <h3 className="text-3xl md:text-4xl font-bold text-center mb-16" data-aos="fade-up">What Our Users Say</h3>
          <div className="grid lg:grid-cols-3 gap-8">
            <motion.div 
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 25px 50px -12px rgba(99, 102, 241, 0.25)",
                borderColor: "rgba(99, 102, 241, 0.5)"
              }}
              whileTap={{ scale: 0.98 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20
              }}
              className="p-8 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              <div className="flex items-start gap-4">
                <motion.div 
                  whileHover={{ rotate: 15, scale: 1.1 }}
                  className="p-3 rounded-full bg-indigo-50 dark:bg-indigo-900"
                >
                  <QuoteIcon />
                </motion.div>
                <div className="flex-1">
                  <motion.p 
                    whileHover={{ scale: 1.02 }}
                    className="text-lg text-slate-700 dark:text-slate-300 italic my-6"
                  >
                    "SyncSpace has revolutionized how our team works and saved us hours every week."
                  </motion.p>
                  <motion.div 
                    whileHover={{ x: 5 }}
                    className="flex items-center"
                  >
                    <motion.img 
                      whileHover={{ scale: 1.1 }}
                      className="w-12 h-12 rounded-full mr-4" 
                      src="https://placehold.co/100x100/6366F1/FFFFFF?text=SA" 
                      alt="Sarah Adams" 
                    />
                    <div>
                      <h5 className="font-bold text-slate-900 dark:text-white">Sarah Adams</h5>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Project Manager, FutureTech</p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
            <motion.div 
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 25px 50px -12px rgba(20, 184, 166, 0.25)",
                borderColor: "rgba(20, 184, 166, 0.5)"
              }}
              whileTap={{ scale: 0.98 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20
              }}
              className="p-8 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              <div className="flex items-start gap-4">
                <motion.div 
                  whileHover={{ rotate: 15, scale: 1.1 }}
                  className="p-3 rounded-full bg-teal-50 dark:bg-teal-900"
                >
                  <QuoteIcon />
                </motion.div>
                <div className="flex-1">
                  <motion.p 
                    whileHover={{ scale: 1.02 }}
                    className="text-lg text-slate-700 dark:text-slate-300 italic my-6"
                  >
                    "Having tasks, docs, and chat in one place is a true game-changer."
                  </motion.p>
                  <motion.div 
                    whileHover={{ x: 5 }}
                    className="flex items-center"
                  >
                    <motion.img 
                      whileHover={{ scale: 1.1 }}
                      className="w-12 h-12 rounded-full mr-4" 
                      src="https://placehold.co/100x100/06B6D4/FFFFFF?text=MK" 
                      alt="Mark Chen" 
                    />
                    <div>
                      <h5 className="font-bold text-slate-900 dark:text-white">Mark Chen</h5>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Lead Developer, Nova Solutions</p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
            <motion.div 
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 25px 50px -12px rgba(236, 72, 153, 0.25)",
                borderColor: "rgba(236, 72, 153, 0.5)"
              }}
              whileTap={{ scale: 0.98 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20
              }}
              className="p-8 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer"
              data-aos="fade-up"
              data-aos-delay="300"
            >
              <div className="flex items-start gap-4">
                <motion.div 
                  whileHover={{ rotate: 15, scale: 1.1 }}
                  className="p-3 rounded-full bg-pink-50 dark:bg-pink-900"
                >
                  <QuoteIcon />
                </motion.div>
                <div className="flex-1">
                  <motion.p 
                    whileHover={{ scale: 1.02 }}
                    className="text-lg text-slate-700 dark:text-slate-300 italic my-6"
                  >
                    "As a remote team, SyncSpace is our virtual office and keeps us connected."
                  </motion.p>
                  <motion.div 
                    whileHover={{ x: 5 }}
                    className="flex items-center"
                  >
                    <motion.img 
                      whileHover={{ scale: 1.1 }}
                      className="w-12 h-12 rounded-full mr-4" 
                      src="https://placehold.co/100x100/EC4899/FFFFFF?text=EJ" 
                      alt="Emily Johnson" 
                    />
                    <div>
                      <h5 className="font-bold text-slate-900 dark:text-white">Emily Johnson</h5>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Design Lead, Quantum Leap</p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- Final CTA Section --- */}
      <section className="py-24">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative rounded-2xl p-12 overflow-hidden bg-gradient-to-r from-indigo-600 to-teal-400 text-white shadow-xl"
          >
            <motion.h3 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-extrabold mb-4"
            >
              Ready to Streamline Your Workflow?
            </motion.h3>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              viewport={{ once: true }}
              className="text-lg max-w-xl mx-auto mb-8"
            >
              Join thousands of teams building their best work on SyncSpace. Get started for free—no credit card required.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              viewport={{ once: true }}
              className="flex items-center justify-center gap-4"
            >
              {!currentUser && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/register" className="inline-block bg-white text-indigo-700 font-bold py-3 px-8 rounded-full text-lg shadow-md">Sign Up Now</Link>
                </motion.div>
              )}
              <Link to="/contact" className="text-white/90 hover:underline">Contact Sales</Link>
            </motion.div>
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="absolute -right-16 -bottom-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"
            />
          </motion.div>
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

