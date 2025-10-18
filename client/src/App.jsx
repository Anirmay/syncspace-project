// client/src/App.jsx

import React, { useContext } from 'react'; // 👈 Import useContext
import { Routes, Route, Link } from 'react-router-dom';
import { AuthContext } from './context/AuthContext'; // 👈 Import AuthContext
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';

function App() {
  const { currentUser, logout } = useContext(AuthContext); // 👈 Get user and logout function

  return (
    <div>
      <nav style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
        {currentUser ? (
          <>
            <span>Welcome, {currentUser.user.username}!</span>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/register">Register</Link>
            <Link to="/login">Login</Link>
          </>
        )}
      </nav>
      <hr />

      <h1>SyncSpace</h1>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </div>
  );
}

export default App;