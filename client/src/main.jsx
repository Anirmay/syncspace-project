import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { AuthContextProvider } from './context/AuthContext';

// Apply persisted dark mode before React mounts to avoid a flash of incorrect theme.
try {
  const v = localStorage.getItem('darkMode');
  // default to true if key missing (matches AccountSettings default behavior)
  const isDark = v === null ? true : v === 'true';
  if (isDark) document.documentElement.classList.add('dark');
  else document.documentElement.classList.remove('dark');
} catch (e) {
  // ignore storage access errors
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthContextProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthContextProvider>
  </React.StrictMode>
);

