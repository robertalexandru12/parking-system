import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../AuthContext';
import Navbar from './Navbar';
import ParkingMap from '../ParkingMap';
import './SettingsStyle.css';
import './DashboardStyle.css';

const Settings = () => {
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext);
    const [settings, setSettings] = useState({
        price: 0,
        maxNumberOfSpots: 9
    });
    const [editMode, setEditMode] = useState({
        price: false,
        spots: false
    });
    const [tempValues, setTempValues] = useState({
        price: 0,
        spots: 9
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/v1/settings/get');
                if (!response.ok) throw new Error('Failed to fetch settings');
                const data = await response.json();
                setSettings(data);
                setTempValues({
                    price: data.price,
                    spots: data.maxNumberOfSpots
                });
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/admin');
    };

    const handleEditToggle = (field) => {
        setEditMode(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const handleInputChange = (e, field) => {
        setTempValues(prev => ({
            ...prev,
            [field]: e.target.value
        }));
    };

    const handleSave = async (field) => {
        try {
            setIsLoading(true);
            let endpoint, body;
            
            if (field === 'price') {
                endpoint = `http://localhost:8080/api/v1/settings/updateprice/${tempValues.price}`;
            } else {
                endpoint = `http://localhost:8080/api/v1/settings/updatemaxnrofspots/${tempValues.spots}`;
            }

            const response = await fetch(endpoint, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) throw new Error(`Failed to update ${field}`);

          
            setSettings(prev => ({
                ...prev,
                [field === 'price' ? 'price' : 'maxNumberOfSpots']: tempValues[field]
            }));
            
            setEditMode(prev => ({
                ...prev,
                [field]: false
            }));
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <div className="loading-spinner">Se încarcă...</div>;
    if (error) return <div className="error-message">Eroare: {error}</div>;

    return (
        <div className="settings-container">
            <Navbar />
            
            <div className="settings-content">
                <div className="settings-header">
                    <h2>Setări Parcare</h2>
                    <p>Administrează configurația sistemului de parcare</p>
                </div>

                <div className="settings-cards">
                    <div className="settings-card">
                        <div className="card-header">
                            <h3>Preț parcare</h3>
                            <span className="card-icon">💰</span>
                        </div>
                        
                        {editMode.price ? (
                            <div className="card-edit-mode">
                                <input
                                    type="number"
                                    value={tempValues.price}
                                    onChange={(e) => handleInputChange(e, 'price')}
                                    className="settings-input"
                                    min="0"
                                />
                                <div className="edit-actions">
                                    <button 
                                        onClick={() => handleSave('price')}
                                        className="save-btn"
                                    >
                                        Salvează
                                    </button>
                                    <button 
                                        onClick={() => handleEditToggle('price')}
                                        className="cancel-btn"
                                    >
                                        Anulează
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="card-display-mode">
                                <span className="card-value">{settings.price} RON/ora</span>
                                <button 
                                    onClick={() => handleEditToggle('price')}
                                    className="edit-btn"
                                >
                                    Editează
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="settings-card">
                        <div className="card-header">
                            <h3>Număr maxim locuri</h3>
                            <span className="card-icon">🅿️</span>
                        </div>
                        
                        {editMode.spots ? (
                            <div className="card-edit-mode">
                                <input
                                    type="number"
                                    value={tempValues.spots}
                                    onChange={(e) => handleInputChange(e, 'spots')}
                                    className="settings-input"
                                    min="1"
                                    max="50"
                                />
                                <div className="edit-actions">
                                    <button 
                                        onClick={() => handleSave('spots')}
                                        className="save-btn"
                                    >
                                        Salvează
                                    </button>
                                    <button 
                                        onClick={() => handleEditToggle('spots')}
                                        className="cancel-btn"
                                    >
                                        Anulează
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="card-display-mode">
                                <span className="card-value">{settings.maxNumberOfSpots} locuri</span>
                                <button 
                                    onClick={() => handleEditToggle('spots')}
                                    className="edit-btn"
                                >
                                    Editează
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="parking-map-section">
                    <h3>Harta locurilor de parcare</h3>
                    <ParkingMap isAdmin={true} />
                </div>
            </div>
        </div>
    );
};

export default Settings;