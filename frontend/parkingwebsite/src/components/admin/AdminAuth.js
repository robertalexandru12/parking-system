import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../AuthContext';
import './AdminAuthStyle.css'
const background = '/images/admin-background.jpg';

const AdminAuth = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:8080/api/v1/admin-auth/login', {
                username,
                password,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.data === "[INFO] Adminul a fost logat") {
                login(); 
                navigate('/dashboard'); 
            } else {
                setError('Autentificare eșuată!');
            }
        } catch (error) {
            if (error.response && error.response.data) {
                setError(error.response.data);
            } else {
                setError('A apărut o eroare la conectare. Încearcă din nou.');
            }
            console.error('Eroare la autentificare:', error);
        }
    };

    return (
        <div style={{ 
            backgroundImage: `url(${background})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
        <div className="container d-flex justify-content-center align-items-center vh-100">
            <div className="card shadow-lg p-4" style={{ width: '100%', maxWidth: '400px' }}>
                <h2 className="text-center mb-4">Autentificare Admin</h2>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="username" className="form-label">Username</label>
                        <input
                            type="text"
                            className="form-control"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">Parolă</label>
                        <input
                            type="password"
                            className="form-control"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">Autentificare</button>
                </form>
            </div>
        </div>
        </div>
    );

};

export default AdminAuth;