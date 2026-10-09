import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    setFormData({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed.');

      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
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
        <div className="form-title">Create Your Account</div>

        {error && <div className="alert-error" style={{ marginBottom: '16px' }}>{error}</div>}
        {success && <div className="alert-success" style={{ marginBottom: '16px' }}>{success}</div>}

        <form onSubmit={handleSubmit} autoComplete="off">
          
          <input type="text" name="prevent_autofill_user" style={{ display: 'none' }} tabIndex="-1" />
          <input type="password" name="prevent_autofill_pass" style={{ display: 'none' }} tabIndex="-1" />

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="input-wrapper">
              <i className="fa-regular fa-user left-icon"></i>
              <input 
                type="text" 
                className="auth-input" 
                name="fullName" 
                placeholder="Enter Full Name" 
                value={formData.fullName} 
                onChange={handleChange} 
                autoComplete="off"
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-wrapper">
              <i className="fa-regular fa-envelope left-icon"></i>
              <input 
                type="email" 
                className="auth-input" 
                name="email" 
                placeholder="Enter Email Address" 
                value={formData.email} 
                onChange={handleChange} 
                autoComplete="off"
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrapper">
              <i className="fa-solid fa-lock left-icon"></i>
              <input 
                type={showPassword ? 'text' : 'password'} 
                className="auth-input" 
                name="password" 
                placeholder="Enter Password" 
                value={formData.password} 
                onChange={handleChange} 
                autoComplete="new-password"
                required 
              />
              <i 
                className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'} toggle-password`} 
                onClick={() => setShowPassword(!showPassword)}
              ></i>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div className="input-wrapper">
              <i className="fa-solid fa-lock left-icon"></i>
              <input 
                type={showPassword ? 'text' : 'password'} 
                className="auth-input" 
                name="confirmPassword" 
                placeholder="Confirm Password" 
                value={formData.confirmPassword} 
                onChange={handleChange} 
                autoComplete="new-password"
                required 
              />
            </div>
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? <span className="spinner"></span> : 'REGISTER'}
          </button>
        </form>

        <div className="footer-text">
          Already have an account? <Link to="/login">Login Here</Link>
        </div>
      </div>

      <style>{`
        .auth-body { background-color: #080b13; color: #ffffff; display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 20px; }
        .auth-card { background: #0d121e; border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 16px; padding: 40px 30px; width: 100%; max-width: 440px; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6); text-align: center; }
        .shield-logo { font-size: 42px; color: #e62e2e; }
        .brand-title { font-size: 26px; font-weight: 800; letter-spacing: 2px; color: #ffffff; margin-top: 4px; }
        .brand-subtitle { font-size: 11px; color: #7b88a1; margin-bottom: 24px; }
        .form-title { text-align: left; font-size: 20px; font-weight: 700; margin-bottom: 20px; color: #ffffff; }

        .input-wrapper { position: relative; display: flex; align-items: center; }
        .input-wrapper .left-icon { position: absolute; left: 14px; color: #5d6a82; font-size: 15px; }
        .input-wrapper .toggle-password { position: absolute; right: 14px; color: #5d6a82; font-size: 15px; cursor: pointer; }

        .auth-input { width: 100%; padding: 12px 42px; background: #141b2a; border: 1px solid #1f293d; border-radius: 8px; color: #ffffff; font-size: 14px; outline: none; transition: border-color 0.2s; }
        .auth-input:focus { border-color: #e62e2e; background: #172033; }

        .btn-submit { width: 100%; padding: 12px; background: #e62e2e; color: #ffffff; border: none; border-radius: 8px; font-size: 15px; font-weight: 700; cursor: pointer; margin-top: 10px; }
        .btn-submit:hover { background: #cc2525; }
        .footer-text { margin-top: 20px; font-size: 13px; color: #929db2; }
        .footer-text a { color: #e62e2e; font-weight: 700; text-decoration: none; }
      `}</style>
    </div>
  );
}
