import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    setEmail('');
    setPassword('');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed.');

      login(data.user);

      navigate('/home');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-body">
      <div className="auth-card">
        <div className="logo-container">
          <i className="fa-solid fa-shield-halved shield-logo"></i>
        </div>
        <div className="brand-title">PRISM</div>
        <div className="brand-subtitle">Predictive Response &amp; Intelligent Safety Management</div>

        <div className="form-title">Login to Account</div>

        {error && <div className="alert-error" style={{ marginBottom: '16px' }}>{error}</div>}

        <form onSubmit={handleSubmit} autoComplete="off">
          
          <input type="text" name="prevent_autofill_user" style={{ display: 'none' }} tabIndex="-1" />
          <input type="password" name="prevent_autofill_pass" style={{ display: 'none' }} tabIndex="-1" />

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-wrapper">
              <i className="fa-regular fa-envelope left-icon"></i>
              <input 
                type="email" 
                name="user_login_email_input"
                className="auth-input" 
                placeholder="Enter Email Address" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                autoComplete="off"
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <div className="label-row">
              <label className="form-label">Password</label>
              <a href="#" className="forgot-link" onClick={(e) => { e.preventDefault(); alert('Please contact administrator to reset password.'); }}>Forgot?</a>
            </div>
            <div className="input-wrapper">
              <i className="fa-solid fa-lock left-icon"></i>
              <input 
                type={showPassword ? 'text' : 'password'} 
                name="user_login_password_input"
                className="auth-input" 
                placeholder="Enter Password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                autoComplete="new-password"
                required 
              />
              <i 
                className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'} toggle-password`} 
                onClick={() => setShowPassword(!showPassword)}
              ></i>
            </div>
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? <span className="spinner"></span> : 'SIGN IN'}
          </button>
        </form>

        <div className="footer-text">
          Don't have an account? <Link to="/register">Register here</Link>
        </div>
      </div>

      <style>{`
        .auth-body {
          background-color: #080b13;
          color: #ffffff;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          padding: 20px;
        }

        .auth-card {
          background: #0d121e;
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 40px 30px;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
          text-align: center;
        }

        .shield-logo { font-size: 42px; color: #e62e2e; }
        .brand-title { font-size: 26px; font-weight: 800; letter-spacing: 2px; color: #ffffff; margin-top: 4px; }
        .brand-subtitle { font-size: 11px; color: #7b88a1; margin-bottom: 28px; }
        .form-title { text-align: left; font-size: 20px; font-weight: 700; margin-bottom: 20px; color: #ffffff; }

        .label-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
        .forgot-link { font-size: 12px; color: #e62e2e; text-decoration: none; font-weight: 600; }

        .input-wrapper { position: relative; display: flex; align-items: center; }
        .input-wrapper .left-icon { position: absolute; left: 14px; color: #5d6a82; font-size: 15px; }
        .input-wrapper .toggle-password { position: absolute; right: 14px; color: #5d6a82; font-size: 15px; cursor: pointer; }

        .auth-input {
          width: 100%;
          padding: 12px 42px 12px 42px;
          background: #141b2a;
          border: 1px solid #1f293d;
          border-radius: 8px;
          color: #ffffff;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }

        .auth-input:focus { border-color: #e62e2e; background: #172033; }

        .btn-submit {
          width: 100%;
          padding: 12px;
          background: #e62e2e;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 1px;
          cursor: pointer;
          margin-top: 10px;
        }

        .btn-submit:hover { background: #cc2525; }
        .footer-text { margin-top: 24px; font-size: 13px; color: #929db2; }
        .footer-text a { color: #e62e2e; font-weight: 700; text-decoration: none; }
      `}</style>
    </div>
  );
}
