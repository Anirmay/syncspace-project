import React, { useContext } from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage'; // 👈 Import your new stylish page

// A simple Dashboard placeholder for logged-in users
const Dashboard = () => {
    const { currentUser, logout } = useContext(AuthContext);
    return (
        <div className="p-8 bg-slate-900 text-white min-h-screen">
            <h1 className="text-2xl font-bold">Welcome to your Dashboard, {currentUser.user.username}!</h1>
            <p>Your collaborative workspace is ready.</p>
            <button onClick={logout} className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg">Logout</button>
        </div>
    );
};

function App() {
  const { currentUser } = useContext(AuthContext);

  return (
    <>
      <Routes>
        <Route 
            path="/" 
            element={currentUser ? <Dashboard /> : <HomePage />} 
        />
        
        {/* UPDATED: Both routes now point to AuthPage */}
        <Route 
            path="/register" 
            element={currentUser ? <Navigate to="/" /> : <AuthPage />} 
        />
        <Route 
            path="/login" 
            element={currentUser ? <Navigate to="/" /> : <AuthPage />} 
        />
      </Routes>
    </>
  );
}

export default App;

