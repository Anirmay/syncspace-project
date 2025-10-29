import React, { useContext } from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProfilePage from './pages/ProfilePage';
import AccountSettingsPage from './pages/AccountSettingsPage';
import DashboardPage from './pages/DashboardPage'; // Keep import for the /dashboard route
import WorkspacePage from './pages/WorkspacePage';
import ChatPage from './pages/ChatPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import CreateProjectDetailsPage from './pages/CreateProjectDetailsPage';

// Simple component to protect routes
// It checks if a user is logged in using AuthContext.
// If not logged in, it redirects to the /login page.


// const ContactPage = () => (
//      <div className="min-h-screen bg-slate-900 text-white p-8">
//         <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
//         <p className="text-slate-400">Have questions or feedback? Get in touch via email at <a href="mailto:support@syncspace.example" className="text-indigo-400 hover:underline">support@syncspace.example</a>.</p>
//          <Link to="/" className="text-indigo-400 hover:underline mt-4 inline-block">&larr; Back Home</Link>
//     </div>
// );

const ProtectedRoute = ({ children }) => {
    const { currentUser } = useContext(AuthContext);
    if (!currentUser) {
        // Redirect them to the login page, preserving the intended destination
        return <Navigate to="/login" replace />;
    }
    // If logged in, render the child component (the protected page)
    return children;
};


function App() {
  const { currentUser } = useContext(AuthContext);

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={currentUser ? <Navigate to="/" /> : <AuthPage />} />
        <Route path="/login" element={currentUser ? <Navigate to="/" /> : <AuthPage />} />
        <Route path="/forgot-password" element={currentUser ? <Navigate to="/" /> : <ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={currentUser ? <Navigate to="/" /> : <ResetPasswordPage />} />
        
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* --- PROTECTED ROUTES --- */}
        <Route path="/profile" element={ <ProtectedRoute> <ProfilePage /> </ProtectedRoute> } />
        <Route path="/account-settings" element={ <ProtectedRoute> <AccountSettingsPage /> </ProtectedRoute> } />
        <Route path="/dashboard" element={ <ProtectedRoute> <DashboardPage /> </ProtectedRoute> } />
        <Route path="/workspace/:workspaceId" element={ <ProtectedRoute> <WorkspacePage /> </ProtectedRoute> } />
        {/* --- NEW: Chat Route --- */}
        <Route
            path="/chat"
            element={ <ProtectedRoute> <ChatPage /> </ProtectedRoute> }
        />
        <Route path="/create-project-details" element={ <ProtectedRoute> <CreateProjectDetailsPage /> </ProtectedRoute> } />
        {/* --- END NEW --- */}
        {/* 404 Route */}
        <Route path="*" element={
            <div className="min-h-screen bg-slate-900 text-white p-8 text-center">
                <h1 className="text-4xl font-bold mb-4">404 - Not Found</h1>
                <p className="text-slate-400">The page you are looking for does not exist.</p>
                <Link to="/" className="text-indigo-400 hover:underline mt-6 inline-block">Go back home</Link>
            </div>
        } />
      </Routes>
    </>
  );
}

export default App;

