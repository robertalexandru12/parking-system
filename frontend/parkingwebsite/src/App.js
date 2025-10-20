import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { UserAuthProvider } from './UserAuthContext';
import AccountPage from './components/users/AccountPage';
import AdminAuth from './components/admin/AdminAuth';
import Dashboard from './components/admin/Dashboard';
import History from './components/admin/History';
import Administrators from './components/admin/Administrators';
import Settings from './components/admin/Settings';
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedUserRoute from './components/ProtectedUserRoute';
import IndexPage from './components/users/IndexPage';

const App = () => {
    return (
        <Router>
            
            <AuthProvider>
                <UserAuthProvider>
                    <Routes>
                        <Route path="/admin" element={<AdminAuth />} />
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard/history"
                            element={
                                <ProtectedRoute>
                                    <History />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard/settings"
                            element={
                                <ProtectedRoute>
                                    <Settings />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard/administrators"
                            element={
                                <ProtectedRoute>
                                    <Administrators />
                                </ProtectedRoute>
                            }
                        />

                        {/* Rute pentru utilizator */}
                        <Route path="/" element={<IndexPage />} />
                        <Route
                            path="/account"
                            element={
                                <ProtectedUserRoute>
                                    <AccountPage />
                                </ProtectedUserRoute>
                            }
                        />
                    </Routes>
                </UserAuthProvider>
            </AuthProvider>
        </Router>
    );
};

export default App;
