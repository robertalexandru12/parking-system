import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../AuthContext';
import './NavbarStyle.css';

const Navbar = () => {
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="custom-navbar-container">
            <div className="navbar-content">
                <h4 className="title-navbar">
                    <img 
                        src="/images/navbar-icon.png" 
                        alt="Icon" 
                        className="navbar-icon"
                    />
                    Dashboard
                </h4>
                <ul className="nav flex-column">
                    <li className="nav-item">
                        <button className="nav-link" onClick={() => navigate('/dashboard')}>
                            <img 
                                src="/images/statistics.png" 
                                alt="Statistics" 
                                className="nav-icon"
                            />
                            Statistici
                        </button>
                    </li>
                    <li className="nav-item">
                        <button className="nav-link" onClick={() => navigate('/dashboard/history')}>
                            <img 
                                src="/images/history.png" 
                                alt="History" 
                                className="nav-icon"
                            />
                            Istoric
                        </button>
                    </li>
                    <li className="nav-item">
                        <button className="nav-link" onClick={() => navigate('/dashboard/settings')}>
                            <img 
                                src="/images/activity.png" 
                                alt="Settings" 
                                className="nav-icon"
                            />
                            Setări
                        </button>
                    </li>
                    <li className="nav-item">
                        <button className="nav-link" onClick={() => navigate('/dashboard/administrators')}>
                            <img 
                                src="/images/admin.png" 
                                alt="Administrators" 
                                className="nav-icon"
                            />
                            Administratori
                        </button>
                    </li>
                </ul>
            </div>
            <div className="logout-section">
                <button className="logout-btn" onClick={handleLogout}>
                    Deconectează-te
                </button>
            </div>
        </div>
    );
};

export default Navbar;