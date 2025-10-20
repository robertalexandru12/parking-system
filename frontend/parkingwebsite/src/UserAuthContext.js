// UserAuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';

const UserAuthContext = createContext();

export const UserAuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); 

  const checkAuth = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/v1/user/me', {
        credentials: 'include',
      });

      if (res.ok) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Eroare la autentificare:', err);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth(); 
  }, []);

  const login = () => setIsAuthenticated(true);
  const logout = () => setIsAuthenticated(false);

  return (
    <UserAuthContext.Provider value={{ isAuthenticated, login, logout, loading }}>
      {children}
    </UserAuthContext.Provider>
  );
};

export const useUserAuth = () => useContext(UserAuthContext);
