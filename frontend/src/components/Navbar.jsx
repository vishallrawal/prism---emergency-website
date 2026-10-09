import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <Link to="/home" className="brand">
        <i className="fa-solid fa-shield-halved brand-icon"></i>
        <div>
          <span>PRISM</span>
          <span className="brand-sub">Predictive Response &amp; Intelligent Safety</span>
        </div>
      </Link>

      <button className="mobile-menu-toggle" type="button" onClick={() => setMenuOpen((open) => !open)} aria-label="Toggle navigation" aria-expanded={menuOpen}>
        <i className={`fa-solid ${menuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
      </button>

      <div className={`mobile-nav-panel ${menuOpen ? 'open' : ''}`}>
      <ul className="nav-menu">
        <li><Link to="/home" className={`nav-link ${isActive('/home')}`}><i className="fa-solid fa-house"></i> Home</Link></li>
        <li><Link to="/emergency-route" className={`nav-link ${isActive('/emergency-route')}`}><i className="fa-solid fa-route"></i> Emergency Route</Link></li>
        <li><Link to="/voice" className={`nav-link ${isActive('/voice')}`}><i className="fa-solid fa-microphone"></i> Voice</Link></li>
        <li><Link to="/nearby-services" className={`nav-link ${isActive('/nearby-services')}`}><i className="fa-solid fa-location-dot"></i> Nearby Services</Link></li>
        <li><Link to="/blood-donor" className={`nav-link ${isActive('/blood-donor')}`}><i className="fa-solid fa-droplet"></i> Blood Donor</Link></li>
        <li><Link to="/ai-assistant" className={`nav-link ${isActive('/ai-assistant')}`}><i className="fa-solid fa-robot"></i> AI Assistant</Link></li>
      </ul>

      <div className="auth-btns">
        {user ? (
          <>
            <Link to="/profile" className="welcome-user-btn">
              {user.avatar ? (
                <img src={user.avatar} alt="Avatar" style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <i className="fa-solid fa-circle-user"></i>
              )}
              <span>Welcome {user.fullName || user.username}</span>
            </Link>

            <button onClick={handleLogout} className="btn-logout">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn-login">Login</Link>
            <Link to="/register" className="btn-register">Register</Link>
          </>
        )}
      </div>
      </div>

      <style>{`
        .navbar { display: flex; justify-content: space-between; align-items: center; padding: 18px 40px; background: #080d1a; border-bottom: 1px solid #141d30; position: relative; z-index: 1000; }
        .brand { display: flex; align-items: center; gap: 10px; font-weight: 800; font-size: 20px; color: #ffffff; text-decoration: none; }
        .brand-icon { color: #e62e2e; font-size: 24px; }
        .brand-sub { font-size: 10px; color: #64748b; font-weight: 500; display: block; }
        
        .nav-menu { display: flex; align-items: center; gap: 20px; list-style: none; margin: 0; padding: 0; }
        .nav-link { color: #8fa0b5; text-decoration: none; font-size: 13.5px; font-weight: 600; display: flex; align-items: center; gap: 6px; transition: 0.2s; }
        .nav-link:hover, .nav-link.active { color: #ffffff; }
        .nav-link.active i { color: #e62e2e; }

        .auth-btns { display: flex; align-items: center; gap: 10px; }
        .welcome-user-btn { background: #121929; border: 1px solid #1f2d47; color: #38bdf8; padding: 8px 18px; border-radius: 8px; font-weight: 700; font-size: 13px; text-decoration: none; display: flex; align-items: center; gap: 8px; transition: 0.2s; }
        .welcome-user-btn:hover { background: #1e2c45; color: #ffffff; }
        .btn-admin-link { background: #261219; border: 1px solid #4a1320; color: #f87171; padding: 8px 14px; border-radius: 8px; font-weight: 700; font-size: 13px; text-decoration: none; display: flex; align-items: center; gap: 6px; }
        .btn-login { background: #121929; border: 1px solid #1f2d47; color: #fff; padding: 8px 18px; border-radius: 8px; font-weight: 600; font-size: 13px; text-decoration: none; }
        .btn-register { background: #e62e2e; color: #fff; padding: 8px 18px; border-radius: 8px; font-weight: 700; font-size: 13px; text-decoration: none; }
        .btn-logout { background: #e62e2e; color: #fff; border: none; padding: 8px 18px; border-radius: 8px; font-weight: 700; font-size: 13px; cursor: pointer; }
        .mobile-menu-toggle { display: none; }
        .mobile-nav-panel { display: flex; align-items: center; justify-content: space-between; flex: 1; margin-left: 42px; gap: 20px; }

        @media (max-width: 1080px) {
          .navbar { padding: 14px 20px; }
          .mobile-menu-toggle { display: inline-flex; align-items: center; justify-content: center; width: 42px; height: 42px; background: #121929; border: 1px solid #263754; color: #fff; border-radius: 8px; font-size: 18px; }
          .mobile-nav-panel { display: none; position: absolute; top: 100%; left: 0; right: 0; margin: 0; padding: 16px 20px 20px; background: #080d1a; border-bottom: 1px solid #1e2c45; box-shadow: 0 16px 24px rgba(0,0,0,.35); }
          .mobile-nav-panel.open { display: flex; flex-direction: column; align-items: stretch; gap: 16px; }
          .nav-menu { flex-direction: column; align-items: stretch; gap: 4px; }
          .nav-link { padding: 12px; border-radius: 8px; background: #0c1220; }
          .auth-btns { width: 100%; }
          .welcome-user-btn, .btn-login, .btn-register, .btn-logout { flex: 1; justify-content: center; text-align: center; }
        }
        @media (max-width: 420px) { .brand-sub { display: none; }.brand { font-size: 18px; } .auth-btns { flex-wrap: wrap; }.welcome-user-btn { flex-basis: 100%; } }
      `}</style>
    </nav>
  );
}
