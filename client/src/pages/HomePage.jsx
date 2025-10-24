import React, { useState } from 'react'; // NEW: Import useState
import { Link } from 'react-router-dom';

// --- SVG Icons (no changes) ---
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
// NEW: Hamburger Menu Icon
const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);
// NEW: Close Icon
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);


const HomePage = () => {
  // NEW: State for mobile menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // NEW: Function to toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="bg-slate-900 text-white min-h-screen font-inter">
      {/* --- Header --- */}
      {/* NEW: Added sticky, top-0, z-50, bg-slate-900 and shadow for sticky effect */}
      <header className="sticky top-0 z-50 bg-slate-900 shadow-md">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">SyncSpace</h1>
          
          {/* --- Desktop Navigation --- */}
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-slate-300 hover:text-indigo-400 transition-colors">Features</a>
            <a href="#testimonials" className="text-slate-300 hover:text-indigo-400 transition-colors">Testimonials</a>
            <Link to="/login" className="text-slate-300 hover:text-indigo-400 transition-colors">Login</Link>
            <Link to="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-5 rounded-lg transition-colors">
              Get Started
            </Link>
          </nav>

          {/* --- Mobile Menu Button --- */}
          {/* NEW: Hamburger button shown only on medium screens and below */}
          <div className="md:hidden">
            <button onClick={toggleMobileMenu} aria-label="Toggle menu">
              {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {/* --- Mobile Menu --- */}
        {/* NEW: Mobile navigation panel */}
        <div className={`md:hidden absolute top-full left-0 w-full bg-slate-800 shadow-xl transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-screen opacity-100 py-4' : 'max-h-0 opacity-0 overflow-hidden'}`}>
            <nav className="flex flex-col items-center space-y-4 px-6">
              <a href="#features" className="text-slate-300 hover:text-indigo-400 transition-colors block w-full text-center py-2" onClick={toggleMobileMenu}>Features</a>
              <a href="#testimonials" className="text-slate-300 hover:text-indigo-400 transition-colors block w-full text-center py-2" onClick={toggleMobileMenu}>Testimonials</a>
              <Link to="/login" className="text-slate-300 hover:text-indigo-400 transition-colors block w-full text-center py-2" onClick={toggleMobileMenu}>Login</Link>
              <Link to="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-5 rounded-lg transition-colors block w-full text-center" onClick={toggleMobileMenu}>
                Get Started
              </Link>
            </nav>
        </div>
      </header>
      
      {/* --- Hero Section (no changes) --- */}
      <main className="relative container mx-auto px-6 text-center pt-24 pb-16 overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-1/4 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-indigo-700/30 rounded-full filter blur-3xl opacity-50" />
        
        <div className="relative z-10">
          <h2 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4">
            Unify Your Workflow.
            <br />
            <span className="text-indigo-400">Collaborate in Real-Time.</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">
            SyncSpace is an all-in-one platform that allows teams to manage projects, share documents, and communicate seamlessly, eliminating the need for multiple disconnected tools.
          </p>
          <Link to="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors transform hover:scale-105 inline-block">
            Start for Free
          </Link>
        </div>
      </main>

      {/* --- Social Proof Section (no changes) --- */}
      <section className="py-12">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6">
            Trusted by teams at forward-thinking companies
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6">
            <span className="text-2xl font-bold text-slate-500 opacity-60">FutureTech</span>
            <span className="text-2xl font-bold text-slate-500 opacity-60">Quantum Leap</span>
            <span className="text-2xl font-bold text-slate-500 opacity-60">Nova Solutions</span>
            <span className="text-2xl font-bold text-slate-500 opacity-60">Apex Dynamics</span>
          </div>
        </div>
      </section>

      {/* --- Features Section (no changes) --- */}
      <section id="features" className="py-24 bg-slate-800/50">
        <div className="container mx-auto px-6 text-center">
          <h3 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need in One Place</h3>
          <p className="text-slate-400 max-w-xl mx-auto mb-16">
            Stop switching between apps. SyncSpace brings your entire workflow into one unified hub.
          </p>
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

      {/* --- Testimonials Section (no changes) --- */}
      <section id="testimonials" className="py-24">
        <div className="container mx-auto px-6">
          <h3 className="text-3xl md:text-4xl font-bold text-center mb-16">What Our Users Say</h3>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-700">
              <QuoteIcon />
              <p className="text-lg text-slate-300 italic my-6">"SyncSpace has revolutionized how our team works. We're more organized and productive than ever before. The real-time collaboration is seamless."</p>
              <div className="flex items-center">
                <img className="w-12 h-12 rounded-full mr-4" src="https://placehold.co/100x100/6366F1/FFFFFF?text=SA" alt="Sarah Adams" />
                <div><h5 className="font-bold text-white">Sarah Adams</h5><p className="text-sm text-slate-400">Project Manager, FutureTech</p></div>
              </div>
            </div>
            <div className="bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-700">
              <QuoteIcon />
              <p className="text-lg text-slate-300 italic my-6">"Having our tasks, docs, and chat in one place is a game-changer. We've cut our meetings in half and just get more done."</p>
              <div className="flex items-center">
                <img className="w-12 h-12 rounded-full mr-4" src="https://placehold.co/100x100/6366F1/FFFFFF?text=MK" alt="Mark Chen" />
                <div><h5 className="font-bold text-white">Mark Chen</h5><p className="text-sm text-slate-400">Lead Developer, Nova Solutions</p></div>
              </div>
            </div>
            <div className="bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-700">
              <QuoteIcon />
              <p className="text-lg text-slate-300 italic my-6">"As a remote team, SyncSpace is our virtual office. The integrated chat and live doc editing keep us all perfectly in sync."</p>
              <div className="flex items-center">
                <img className="w-12 h-12 rounded-full mr-4" src="https://placehold.co/100x100/6366F1/FFFFFF?text=EJ" alt="Emily Johnson" />
                <div><h5 className="font-bold text-white">Emily Johnson</h5><p className="text-sm text-slate-400">Design Lead, Quantum Leap</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Final CTA Section (no changes) --- */}
      <section className="py-24 bg-slate-800/50">
        <div className="container mx-auto px-6 text-center">
          <div className="relative bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-2xl p-12 overflow-hidden">
            <h3 className="text-3xl md:text-4xl font-extrabold mb-4">Ready to Streamline Your Workflow?</h3>
            <p className="text-lg text-indigo-200 max-w-xl mx-auto mb-8">Join thousands of teams building their best work on SyncSpace. Get started for free—no credit card required.</p>
            <Link to="/register" className="bg-white hover:bg-slate-100 text-indigo-700 font-bold py-3 px-8 rounded-lg text-lg transition-colors transform hover:scale-105 inline-block">Sign Up Now</Link>
          </div>
        </div>
      </section>
      
      {/* --- Footer (no changes) --- */}
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

