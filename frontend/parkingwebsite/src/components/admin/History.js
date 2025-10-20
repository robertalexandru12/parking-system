import React, { useContext, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../AuthContext';
import Navbar from './Navbar';
import './DashboardStyle.css';



const History = () => {
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const sortedCars = useMemo(() => {
        return [...cars].sort((a, b) => b.joinTime - a.joinTime);
    }, [cars]);

    const handleLogout = () => {
        logout();
        navigate('/admin');
    };
    

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString('ro-RO'); 
    };
    
    const formatTime = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = new Date(timestamp * 1000);
        return date.toLocaleTimeString('ro-RO', { 
            hour: '2-digit', 
            minute: '2-digit',
            timeZone: 'Europe/Bucharest'
        });
    };

const formatDuration = (seconds) => {
    if (!seconds && seconds !== 0) return 'N/A';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs}h ${mins}m ${secs}s`;
};


    const fetchCarData = async () => {
        if (!searchTerm.trim()) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch(`http://localhost:8080/api/v1/cars/get/${searchTerm}`);
            
            if (!response.ok) {
                throw new Error('Mașina nu a fost găsită');
            }
            
            const data = await response.json();
            
            if (!data || data.length === 0) {
                throw new Error('Nu există înregistrări pentru acest număr de înmatriculare');
            }
            
            setCars(data);
            
        } catch (err) {
            setError(err.message);
            setCars([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchCarData();
    };

    const firstCar = sortedCars[0];
    const hasMultipleCars = sortedCars.length > 1;

    return (
        <div className="d-flex vh-100">
            <Navbar />
            
            <div className="flex-grow-1 p-4">
                <h2>Istoric</h2>
                <p>Bun venit în pagina de vizualizare a istoricului</p>

                {/* Formular de căutare */}
                <div className="mt-4">
                    <h3>Caută mașină după număr de înmatriculare</h3>
                    <form onSubmit={handleSearch} className="input-group mb-3">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Introdu numărul de înmatriculare"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            required
                        />
                        <button 
                            className="btn btn-primary" 
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? 'Se caută...' : 'Caută'}
                        </button>
                    </form>
                </div>

                {loading && <p className="mt-3">Se încarcă...</p>}
                {error && (
                    <div className="mt-4 alert alert-danger">
                        {error}
                    </div>
                )}

                {/* Afișare date mașină */}
                {sortedCars.length > 0 && (
                    <div className="row mt-4">
                        <div className="col-md-6">
                            <h3>Detalii Mașină</h3>
                            <div className="card">
                                <div className="card-body">
                                    <h5 className="card-title">
                                        Număr Înmatriculare: {firstCar.licensePlate}
                                    </h5>
                                    <p className="card-text">
                                        Proprietar: {firstCar.ownerName || 'Necunoscut'}
                                    </p>
                                    {hasMultipleCars && (
                                        <p className="text-muted">
                                            <i className="bi bi-info-circle"></i> Există {sortedCars.length} înregistrări pentru acest număr
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="col-md-6">
                            <h3>Istoric Parcare (cele mai recente primele)</h3>
                            <table className="table " >
                                <thead>
                                <tr>
                                    <th>Data</th>
                                    <th>Ora intrare</th>
                                    <th>Ora ieșire</th>
                                    <th>Durată</th>
                                    <th>Taxa</th>
                                </tr>
                                </thead>
                                <tbody>
                                {sortedCars.map((car, index) => (
                                    <tr key={index}>
                                    <td>{formatDate(car.joinTime)}</td>
                                    <td>{formatTime(car.joinTime)}</td>
                                    <td>{car.leftTime ? formatTime(car.leftTime) : 'Încă în parcare'}</td>
                                    <td>{formatDuration(car.durationTime)}</td>
                                    <td>{car.parkingFee !== undefined ? `${car.parkingFee.toFixed(2)} RON` : 'N/A'}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default History;