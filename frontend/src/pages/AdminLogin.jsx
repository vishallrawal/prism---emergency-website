import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setUsername('');
    setPassword('');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Admin authentication failed.');

      login(data.user);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-body">
      <div className="admin-card">
        <div className="shield-icon"><i className="fa-solid fa-user-shield"></i></div>
        <h2 className="admin-title">PRISM Admin Access</h2>
        <p className="admin-sub">Restricted System Administration Portal for Surat City</p>

        {error && <div className="alert-error" style={{ marginBottom: '16px' }}>{error}</div>}

        <form onSubmit={handleSubmit} autoComplete="off">
          
          <input type="text" name="fake_admin_user" style={{ display: 'none' }} tabIndex="-1" />
          <input type="password" name="fake_admin_pass" style={{ display: 'none' }} tabIndex="-1" />

          <div className="form-group">
            <label className="form-label">Admin Username or Email</label>
            <div className="input-box">
              <i className="fa-solid fa-user-gear"></i>
              <input 
                type="text" 
                name="admin_login_username_field"
                placeholder="Enter Username or Email" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                autoComplete="off"
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Admin Password</label>
            <div className="input-box">
              <i className="fa-solid fa-key"></i>
              <input 
                type="password" 
                name="admin_login_password_field"
                placeholder="Enter Admin Password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                autoComplete="new-password"
                required 
              />
            </div>
          </div>

          <button type="submit" className="btn-admin-submit" disabled={loading}>
            {loading ? <span className="spinner"></span> : 'AUTHENTICATE ADMIN'}
          </button>
        </form>
      </div>

      <style>{`
        .admin-login-body {
          background-color: #060913;
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
          color: #fff;
          font-family: 'Inter', sans-serif;
        }

        .admin-card {
          background: #0c1220;
          border: 1px solid #1e2c45;
          border-radius: 16px;
          padding: 40px;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.8);
          text-align: center;
        }

        .shield-icon { font-size: 46px; color: #e62e2e; margin-bottom: 8px; }
        .admin-title { font-size: 24px; font-weight: 800; color: #ffffff; }
        .admin-sub { font-size: 11px; color: #64748b; margin-bottom: 24px; }

        .form-group {
          margin-bottom: 16px;
          text-align: left;
        }

        .form-label {
          font-size: 11px;
          font-weight: 700;
          color: #8fa0b5;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
          display: block;
        }

        .input-box {
          background: #060913 !important;
          border: 1px solid #1e2c45;
          border-radius: 8px;
          padding: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          color: #64748b;
        }

        .input-box input {
          background: transparent !important;
          border: none !important;
          color: #ffffff !important;
          outline: none !important;
          width: 100%;
          font-size: 14px;
        }

        
        .input-box input:-webkit-autofill,
        .input-box input:-webkit-autofill:hover, 
        .input-box input:-webkit-autofill:focus {
          -webkit-text-fill-color: #ffffff !important;
          -webkit-box-shadow: 0 0 0px 1000px #060913 inset !important;
          transition: background-color 5000s ease-in-out 0s;
        }

        .btn-admin-submit {
          width: 100%;
          padding: 13px;
          background: #e62e2e;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-weight: 800;
          font-size: 14px;
          cursor: pointer;
          margin-top: 10px;
          transition: background 0.2s;
        }

        .btn-admin-submit:hover { background: #cc2525; }
      `}</style>
    </div>
  );
}
