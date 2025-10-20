import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ParkingMap from '../ParkingMap';
import './AccountPageStyle.css';
import { useUserAuth } from '../../UserAuthContext';

const AccountPage = () => {
  const [userData, setUserData] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPlate, setNewPlate] = useState('');
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { logout } = useUserAuth();
  const [parkingStats, setParkingStats] = useState({
    totalSpots: 0,
    occupiedSpots: 0,
    activeReservations: 0
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setReservations((prev) =>
        prev.map((r) => {
          if (r.status !== 'In asteptare' || !r.expirationTime) return r;
          const now = Date.now();
          const diffMs = r.expirationTime - now;
          const minutes = Math.floor(diffMs / 60000);
          const seconds = Math.floor((diffMs % 60000) / 1000);
          const countdown = minutes >= 0 ? `Expira in ${minutes}m ${seconds < 10 ? '0' : ''}${seconds}s` : 'Expirat';
          return { ...r, expiresIn: countdown };
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchParkingStats = async () => {
      try {
        const [totalRes, occupiedRes, activeRes] = await Promise.all([
          fetch('http://localhost:8080/api/v1/parkingspot/getnrofspots', { credentials: 'include' }),
          fetch('http://localhost:8080/api/v1/parkingspot/getnrofoccupiedspots', { credentials: 'include' }),
          fetch('http://localhost:8080/api/v1/reservation/nrofactivereservations', { credentials: 'include' })
        ]);

        const total = await totalRes.json();
        const occupied = await occupiedRes.json();
        const active = await activeRes.json();

        setParkingStats({
          totalSpots: total,
          occupiedSpots: occupied,
          activeReservations: active
        });
      } catch (err) {
        console.error('Eroare la obținerea statisticilor:', err);
      }
    };

    fetchParkingStats();
  }, []);

  useEffect(() => {
    const fetchUserAndReservations = async () => {
      try {
        const meRes = await fetch('http://localhost:8080/api/v1/user/me', { credentials: 'include' });
        if (!meRes.ok) return navigate('/');
        const meData = await meRes.json();

        const email = meData?.email;
        if (!email) return navigate('/');

        const profileRes = await fetch(`http://localhost:8080/api/v1/user/profile/${email}`, { credentials: 'include' });
        if (!profileRes.ok) throw new Error('Nu s-a putut obține profilul');
        const profileData = await profileRes.json();
        setUserData(profileData);

        const id = profileData?.id;
        const reservationRes = await fetch(`http://localhost:8080/api/v1/reservation/get/${id}`, { credentials: 'include' });
        if (!reservationRes.ok) throw new Error('Eroare la încărcarea rezervărilor');
        const reservationData = await reservationRes.json();

        const priceRes = await fetch('http://localhost:8080/api/v1/settings/get', { credentials: 'include' });
        const settings = await priceRes.json();
        const pricePerHour = settings.price;

        const now = Date.now();
        const formatted = reservationData
          .sort((a, b) => b.reservationTime - a.reservationTime)
          .map((r) => {
            const dateStr = new Date(r.reservationTime).toLocaleString();
            let status = '';
            let expiresIn = '';

            if (r.expired === false) status = 'In asteptare';
            else if (r.expired === true && r.entryTime !== 0 && r.leftTime === 0) status = 'In curs';
            else if (r.entryTime !== 0 && r.leftTime !== 0) status = 'Finalizat';
            else if (r.expired === true && r.leftTime === 0 && r.entryTime === 0) status = 'Expirat';
            else status = 'Necunoscut';

            if (status === 'In asteptare') {
              const diffMs = r.expirationTime - now;
              const minutes = Math.floor(diffMs / 60000);
              const seconds = Math.floor((diffMs % 60000) / 1000);
              expiresIn = `Expira in ${minutes}m ${seconds < 10 ? '0' : ''}${seconds}s`;
            } else if (status === 'Expirat') {
              expiresIn = 'Tarif: 0 RON';
            } else if (status === 'In curs') {
              const diff = now - r.entryTime;
              const hours = Math.ceil(diff / (1000 * 60 * 60));
              const total = (hours * pricePerHour).toFixed(2);
              expiresIn = `Tarif: ${total} RON`;
            } else if (status === 'Finalizat') {
              const diff = r.leftTime - r.entryTime;
              const hours = Math.ceil(diff / (1000 * 60 * 60));
              const total = (hours * pricePerHour).toFixed(2);
              expiresIn = `Tarif: ${total} RON`;
            }

            return {
              licensePlate: r.licensePlate,
              rezervationTime: dateStr,
              status,
              expiresIn,
              expirationTime: r.expirationTime
            };
          });
        setReservations(formatted);
      } catch (err) {
        console.error(err);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndReservations();
  }, [navigate]);

  const handleAddReservation = async (e) => {
    e.preventDefault();
    setAddError('');
    setAddSuccess('');
    if (!newPlate || !userData?.id) return;

    try {
      const checkRes = await fetch(`http://localhost:8080/api/v1/reservation/verifyreservation/${newPlate}`, { credentials: 'include' });
      const checkText = await checkRes.text();
      if (checkText === 'Yes') {
        setAddError('Există deja o rezervare activă pentru această plăcuță.');
        return;
      }

      const body = {
        reservationTime: Date.now(),
        licensePlate: newPlate
      };

      const addRes = await fetch(`http://localhost:8080/api/v1/reservation/add/${userData.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body)
      });

      if (!addRes.ok) throw new Error('Eroare la adăugarea rezervării');

      setAddSuccess('Rezervarea a fost adăugată cu succes!');
      setNewPlate('');
      setTimeout(() => {
        setShowAddModal(false);
        window.location.reload();
      }, 1500);
    } catch (err) {
      setAddError(err.message || 'Eroare necunoscută la adăugare');
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const { currentPassword, newPassword } = passwordData;
    const email = userData?.email;
    if (!email) return setError('Nu s-a putut identifica adresa de email');

    try {
      const res = await fetch('http://localhost:8080/api/v1/user/updatepassword', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, currentPassword, newPassword })
      });
      const responseText = await res.text();
      if (!res.ok) throw new Error(responseText || 'Eroare la schimbarea parolei');
      setSuccess(responseText || 'Parola a fost schimbată cu succes!');
      setPasswordData({ currentPassword: '', newPassword: '' });
      setTimeout(() => setShowPasswordModal(false), 1500);
    } catch (err) {
      setError(err.message || 'Eroare necunoscută');
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/v1/user/logout', {
        method: 'POST',
        credentials: 'include'
      });
      if (res.ok) {
        logout();
        navigate('/');
      }
    } catch (err) {
      console.error('Eroare la logout:', err);
    }
  };

  if (loading) return <div>Se încarcă datele utilizatorului...</div>;
  if (!userData) return null;

  return (
    <div className="cont-page">
      <div className="page-header">
        <h1 className="page-title">Contul meu</h1>
        <p className="page-subtitle">Gestionează informațiile contului tău</p>
      </div>

      <div className="profile-section">
        <div className="profile-card">
          <div className="card-header">
            <div className="user-avatar">
              <span>{userData.firstname?.charAt(0)}{userData.lastname?.charAt(0)}</span>
            </div>
            <h2>Profil utilizator</h2>
          </div>
          <div className="profile-info">
            <div className="info-row"><span className="info-label">Nume:</span><span className="info-value">{userData.lastname}</span></div>
            <div className="info-row"><span className="info-label">Prenume:</span><span className="info-value">{userData.firstname}</span></div>
            <div className="info-row"><span className="info-label">Email:</span><span className="info-value">{userData.email}</span></div>
          </div>
          <div className="profile-actions">
            <button className="btn change-password-btn" onClick={() => setShowPasswordModal(true)}>Schimbă parola</button>
            <button className="btn logout-btn" onClick={handleLogout}>Deconectare</button>
          </div>
        </div>

        <ParkingMap />
      </div>

      <div className="parking-stats">
        <div className="stats-card">
          <h3>Disponibilitate parcare</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Total locuri:</span>
              <span className="stat-value">{parkingStats.totalSpots}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Locui ocupate:</span>
              <span className="stat-value">{parkingStats.occupiedSpots}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Rezervări active:</span>
              <span className="stat-value">{parkingStats.activeReservations}</span>
            </div>
            <div className="stat-item highlight">
              <span className="stat-label">Rezervări disponibile:</span>
              <span className="stat-value">
                {parkingStats.totalSpots - parkingStats.activeReservations}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="reservations-section">
        <h2 className="table-title">Rezervările mele</h2>
        <button className="btn submit-btn" onClick={() => setShowAddModal(true)} style={{ marginBottom: '1rem' }}>Adaugă Rezervare</button>
        <div className="table-container">
          <table className="reservation-table">
            <thead>
              <tr>
                <th>Număr de întrămriculare</th>
                <th>Data rezervării</th>
                <th>Status</th>
                <th>Detalii</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((res, index) => (
                <tr key={index}>
                  <td>{res.licensePlate}</td>
                  <td>{res.rezervationTime}</td>
                  <td className={`status ${res.status.toLowerCase().replace(/ /g, '-')}`}>{res.status}</td>
                  <td>{res.expiresIn || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showAddModal && (
        <div className="modal-overlay" onClick={() => { setShowAddModal(false); setAddError(''); setAddSuccess(''); }}>
          <div className="password-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Adaugă Rezervare</h2>
              <button className="close-modal" onClick={() => setShowAddModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleAddReservation}>
              {(addError || addSuccess) && <div className={`modal-message ${addError ? 'error' : 'success'}`}>{addError || addSuccess}</div>}
              <div className="form-group">
                <label htmlFor="plate">Număr de înmatriculare</label>
                <input type="text" id="plate" name="plate" value={newPlate} onChange={(e) => setNewPlate(e.target.value)} required placeholder="Ex: B123XYZ" />
              </div>
              <div className="form-actions">
                <button type="button" className="btn cancel-btn" onClick={() => setShowAddModal(false)}>Anulează</button>
                <button type="submit" className="btn submit-btn">Adaugă</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => { setShowPasswordModal(false); setError(''); setSuccess(''); setPasswordData({ currentPassword: '', newPassword: '' }); }}>
          <div className="password-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Schimbă parola</h2>
              <button className="close-modal" onClick={() => setShowPasswordModal(false)}>&times;</button>
            </div>
            <form onSubmit={handlePasswordSubmit}>
              {(error || success) && <div className={`modal-message ${error ? 'error' : 'success'}`}>{error || success}</div>}
              <div className="form-group">
                <label htmlFor="currentPassword">Parola curentă</label>
                <input type="password" id="currentPassword" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="newPassword">Parola nouă</label>
                <input type="password" id="newPassword" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} required minLength="6" />
              </div>
              <div className="form-actions">
                <button type="button" className="btn cancel-btn" onClick={() => setShowPasswordModal(false)}>Anulează</button>
                <button type="submit" className="btn submit-btn">Salvează parola</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountPage;
