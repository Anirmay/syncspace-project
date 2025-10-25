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

// Simple component to protect routes
// It checks if a user is logged in using AuthContext.
// If not logged in, it redirects to the /login page.
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
      {/* Routes define the different pages of the application */}
      <Routes>
        {/* Root Route: Always shows HomePage */}
        <Route
            path="/"
            element={<HomePage />}
        />

        {/* Authentication Routes: Redirect to home if already logged in */}
        <Route
            path="/register"
            element={currentUser ? <Navigate to="/" /> : <AuthPage />}
        />
         <Route
            path="/login"
            element={currentUser ? <Navigate to="/" /> : <AuthPage />}
        />

        {/* Password Reset Routes: Redirect to home if already logged in */}
        <Route
            path="/forgot-password"
            element={currentUser ? <Navigate to="/" /> : <ForgotPasswordPage />}
        />
        <Route
            path="/reset-password/:token" // ":token" captures the token from the URL
            element={currentUser ? <Navigate to="/" /> : <ResetPasswordPage />}
        />

        {/* --- PROTECTED ROUTES (Require Login) --- */}
        {/* Profile Page Route */}
        <Route
            path="/profile"
            element={
                <ProtectedRoute> {/* Wrap with ProtectedRoute */}
                    <ProfilePage />
                </ProtectedRoute>
            }
        />
        {/* Account Settings Route */}
         <Route
            path="/account-settings"
            element={
                <ProtectedRoute> {/* Wrap with ProtectedRoute */}
                    <AccountSettingsPage />
                </ProtectedRoute>
            }
        />
        {/* Dashboard Route */}
        <Route
            path="/dashboard"
            element={
                <ProtectedRoute> {/* Wrap with ProtectedRoute */}
                    <DashboardPage />
                </ProtectedRoute>
            }
        />
        <Route
            path="/workspace/:workspaceId" // This matches /workspace/SOME_ID
            element={
                <ProtectedRoute>
                    <WorkspacePage />
                </ProtectedRoute>
            }
        />
         {/* --- END PROTECTED ROUTES --- */}

        {/* Optional: Catch-all route for 404 Not Found (add later if needed) */}
        {/* <Route path="*" element={<h1>404 Not Found</h1>} /> */}

      </Routes>
    </>
  );
}

export default App;

