// client/src/context/AuthContext.jsx

import React, { createContext, useState, useEffect } from 'react';

// Create the context
export const AuthContext = createContext();

// Create the provider component
export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(
    // Check localStorage for a user on initial load
    JSON.parse(localStorage.getItem('user')) || null
  );

  // Login function
  const login = (userData) => {
    setCurrentUser(userData);
  };

  // Logout function
  const logout = () => {
    setCurrentUser(null);
  };

  // Use useEffect to update localStorage whenever currentUser changes
  useEffect(() => {
    localStorage.setItem('user', JSON.stringify(currentUser));
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};