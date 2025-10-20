import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useUserAuth } from '../../UserAuthContext';
import './IndexPageStyle.css';

const IndexPage = () => {
  const navigate = useNavigate();

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useUserAuth();
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ firstname: '',lastname: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginClick = () => {
    setShowLoginModal(true);
    setShowRegisterModal(false);
    setError('');
  };

  const handleInputChange = (e, setData) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
  
    try {
      const response = await axios.post('http://localhost:8080/api/v1/user/login', {
        email,
        password,
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true 
      });
  
      console.log('Răspuns:', response.data);
      login(response.data); 
      
      navigate('/account', { state: { email: email } }); 
  
    } catch (err) {
      setError(err.response?.data?.message || 'Autentificare eșuată');
    }
  };
  
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
  
    try {
      const response = await fetch('http://localhost:8080/api/v1/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData),
      });
  
      const responseText = await response.text();
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = { message: responseText };
      }
  
      if (!response.ok) throw new Error(responseData.message || 'Înregistrare eșuată');
  
      setShowRegisterModal(false);
      setRegisterData({ firstname: '', lastname: '', email: '', password: '' });
      setError('');
    } catch (err) {
      setError(err.message || 'Eroare la înregistrare');
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div className="index-container">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">PARCARE</h1>
          <p className="hero-subtitle">Soluția inteligentă pentru gestionarea parcărilor</p>

          <div className="auth-buttons">
            <button className="auth-button login-button" onClick={handleLoginClick}>
              Autentificare
            </button>
            <button
              className="auth-button register-button"
              onClick={() => {
                setShowRegisterModal(true);
                setShowLoginModal(false);
                setError('');
              }}
            >
              Înregistrare
            </button>
          </div>
        </div>
      </div>

      <div className="features-section">
        <div className="feature-card">
          <div className="feature-icon">🅿️</div>
          <h3>Gestionare simplă</h3>
          <p>Controlează-ți parcarea cu doar câteva clicuri</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">⏱️</div>
          <h3>Economisește timp</h3>
          <p>Rezervă locul tău în avans</p>
        </div>
      </div>

      {showLoginModal && (
        <div className="modal-overlay" onClick={() => setShowLoginModal(false)}>
          <div className="login-modal" onClick={(e) => e.stopPropagation()}>
            {error && <div className="error-alert">{error}</div>}

            <button className="close-modal" onClick={() => setShowLoginModal(false)}>&times;</button>
            <div className="modal-header">
              <h2>Autentificare</h2>
              <div className="modal-icon">🔑</div>
            </div>

            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Adresă email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="modal-input"
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  name="password"
                  placeholder="Parolă"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="modal-input"
                />
              </div>
              <button type="submit" className="submit-button" disabled={isLoading}>
                {isLoading ? 'Se încarcă...' : 'Conectează-te'}
              </button>
            </form>
          </div>
        </div>
      )}

      {showRegisterModal && (
        <div className="modal-overlay" onClick={() => setShowRegisterModal(false)}>
          <div className="login-modal" onClick={(e) => e.stopPropagation()}>
            {error && <div className="error-alert">{error}</div>}

            <button className="close-modal" onClick={() => setShowRegisterModal(false)}>&times;</button>
            <div className="modal-header">
              <h2>Înregistrare</h2>
              <div className="modal-icon">📝</div>
            </div>

            <form onSubmit={handleRegisterSubmit}>
              <div className="form-group">
                <input
                  type="text"
                  name="firstname"
                  placeholder="Prenume"
                  value={registerData.firstname}
                  onChange={(e) => handleInputChange(e, setRegisterData)}
                  required
                  className="modal-input"
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  name="lastname"
                  placeholder="Nume de familie"
                  value={registerData.lastname}
                  onChange={(e) => handleInputChange(e, setRegisterData)}
                  required
                  className="modal-input"
                />
              </div>
              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Adresă email"
                  value={registerData.email}
                  onChange={(e) => handleInputChange(e, setRegisterData)}
                  required
                  className="modal-input"
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  name="password"
                  placeholder="Parolă"
                  value={registerData.password}
                  onChange={(e) => handleInputChange(e, setRegisterData)}
                  required
                  className="modal-input"
                />
              </div>
              <button type="submit" className="submit-button" disabled={isLoading}>
                {isLoading ? 'Se încarcă...' : 'Înregistrează-te'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndexPage;
