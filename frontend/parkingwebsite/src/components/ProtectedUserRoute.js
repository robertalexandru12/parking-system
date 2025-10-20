import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUserAuth } from '../UserAuthContext';
import '../App.css';

const ProtectedUserRoute = ({ children }) => {
  const { isAuthenticated, loading } = useUserAuth();

  if (loading) return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{
        width: '50px',
        height: '50px',
        border: '5px solid #f3f3f3',
        borderTop: '5px solid #3498db',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}></div>
      <p style={{ marginTop: '20px', fontSize: '18px', color: '#333' }}>
        Se verifică autentificarea...
      </p>
    </div>
  );

  if (!isAuthenticated) return <Navigate to="/" />;

  return children;
};

export default ProtectedUserRoute;