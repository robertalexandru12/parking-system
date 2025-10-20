import React, { useState, useEffect } from 'react';
import './ParkingMap.css';

const ParkingMap = ({ isAdmin = false }) => {
  const [parkingSpots, setParkingSpots] = useState({
    right: [],
    left: []
  });
  const [settings, setSettings] = useState({
    maxNumberOfSpots: 9, 
    price: 0
  });
  const [newSpotNumber, setNewSpotNumber] = useState('');
  const [selectedSide, setSelectedSide] = useState('right');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Math.floor(Date.now() / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  };

  const getBucharestOffset = () => {
    const now = new Date();
    const isDST = now.getTimezoneOffset() < 120;
    return isDST ? 3 * 3600 : 2 * 3600;
  };

  const getOccupationDuration = (joinTimeSeconds) => {
    if (!joinTimeSeconds) return "00:00:00";

    const durationSeconds = currentTime - joinTimeSeconds;
    return formatDuration(durationSeconds);
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/v1/settings/get');
      if (!response.ok) throw new Error('Failed to fetch settings');
      const data = await response.json();
      setSettings(data);
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  const fetchParkingSpots = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:8080/api/v1/parkingspot/allspots');
      if (!response.ok) throw new Error('Failed to fetch parking spots');
      const data = await response.json();
      
      setParkingSpots({
        right: data.filter(spot => spot.orientation === 'right'),
        left: data.filter(spot => spot.orientation === 'left')
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchSettings();
      await fetchParkingSpots();
    };
    loadData();
  }, []);

  const addParkingSpot = async () => {
    if (parkingSpots.right.length + parkingSpots.left.length >= settings.maxNumberOfSpots) {
      alert(`Numărul maxim de locuri (${settings.maxNumberOfSpots}) a fost atins!`);
      return;
    }
    
    if (!newSpotNumber.trim()) {
      alert('Introduceți un număr pentru loc!');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/v1/parkingspot/addspot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newSpotNumber,
          inUse: false,
          orientation: selectedSide
        })
      });

      if (!response.ok) throw new Error('Failed to add parking spot');
      
      await fetchParkingSpots();
      setNewSpotNumber('');
    } catch (err) {
      setError(err.message);
    }
  };

  const removeParkingSpot = async (id) => {
    try {
      const response = await fetch(`http://localhost:8080/api/v1/parkingspot/delete/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete parking spot');
      
      await fetchParkingSpots();
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleOccupation = async (id, orientation) => {
    try {
      const spotToUpdate = parkingSpots[orientation === 'right' ? 'right' : 'left'].find(spot => 
        spot.id === id || spot._id === id
      );
      
      if (!spotToUpdate) return;
  
      const offset = getBucharestOffset();
      const response = await fetch(`http://localhost:8080/api/v1/parkingspot/update/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inUse: !spotToUpdate.inUse,
          name: spotToUpdate.name,
          orientation: spotToUpdate.orientation,
          joinTime: !spotToUpdate.inUse ? Math.floor(Date.now() / 1000) - offset : null
        })
      });
  
      if (!response.ok) throw new Error('Failed to update parking spot');
      
      await fetchParkingSpots();
    } catch (err) {
      setError(err.message);
    }
  };

  if (isLoading) return <div className="loading">Se încarcă...</div>;
  if (error) return <div className="error">Eroare: {error}</div>;

  return (
    <div className="parking-layout-container">
      <div className="parking-map-title">
        <h2>Plan Parcare</h2>
        <div className="map-legend">
          <div className="legend-item">
            <div className="legend-color available"></div>
            <span>Liber</span>
          </div>
          <div className="legend-item">
            <div className="legend-color occupied"></div>
            <span>Ocupat</span>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="parking-layout">
        <div className="parking-side right-side">
          <div className="side-label">Dreapta</div>
          <div className="parking-spots-container">
            {parkingSpots.right.map(spot => (
              <div 
                key={spot.id || spot._id}
                className={`parking-spot ${spot.inUse ? 'occupied' : 'available'}`}
                onClick={() => isAdmin && toggleOccupation(spot.id || spot._id, 'right')}
              >
                <span className="spot-number">{spot.name}</span>
                <div className="spot-status">
                  {spot.inUse ? (
                    <>
                      <div>Ocupat</div>
                      <div className="occupation-time">
                        {getOccupationDuration(spot.joinTime)}
                      </div>
                    </>
                  ) : 'Liber'}
                </div>
                {isAdmin && (
                  <button 
                    className="remove-spot-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeParkingSpot(spot.id || spot._id);
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="road-area">
          <div className="road-line"></div>
          <div className="entrance">INTRARE</div>
          <div className="road-line"></div>
        </div>
        
        <div className="parking-side left-side">
          <div className="side-label">Stânga</div>
          <div className="parking-spots-container">
            {parkingSpots.left.map(spot => (
              <div 
                key={spot.id || spot._id}
                className={`parking-spot ${spot.inUse ? 'occupied' : 'available'}`}
                onClick={() => isAdmin && toggleOccupation(spot.id || spot._id, 'left')}
              >
                <span className="spot-number">{spot.name}</span>
                <div className="spot-status">
                  {spot.inUse ? (
                    <>
                      <div>Ocupat</div>
                      <div className="occupation-time">
                        {getOccupationDuration(spot.joinTime)}
                      </div>
                    </>
                  ) : 'Liber'}
                </div>
                {isAdmin && (
                  <button 
                    className="remove-spot-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeParkingSpot(spot.id || spot._id);
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="parking-controls">
          <div className="control-group">
            <input
              type="text"
              value={newSpotNumber}
              onChange={(e) => setNewSpotNumber(e.target.value)}
              placeholder="Nume loc nou"
              maxLength="3"
              className="spot-input"
            />
            
            <div className="side-selector">
              <button
                className={`side-btn ${selectedSide === 'right' ? 'active' : ''}`}
                onClick={() => setSelectedSide('right')}
              >
                Dreapta
              </button>
              <button
                className={`side-btn ${selectedSide === 'left' ? 'active' : ''}`}
                onClick={() => setSelectedSide('left')}
              >
                Stanga
              </button>
            </div>
          </div>
          
          <button 
            onClick={addParkingSpot}
            disabled={parkingSpots.right.length + parkingSpots.left.length >= settings.maxNumberOfSpots}
            className="add-spot-btn"
          >
            Adauga loc
          </button>
          
          <div className="spots-counter">
            <div className="counter-bubble">
              {parkingSpots.right.length + parkingSpots.left.length}/{settings.maxNumberOfSpots}
            </div>
            <span>Locuri totale</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParkingMap;