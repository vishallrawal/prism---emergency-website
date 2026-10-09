import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function UserProfile() {
  const { user, updateUser } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Unable to load profile.');
        setFullName(data.user.fullName || '');
        setPhone(data.user.phone || '');
        setAddress(data.user.address || '');
        setBloodGroup(data.user.bloodGroup || 'O+');
        updateUser(data.user);
      })
      .catch((profileError) => setError(profileError.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    setSuccess('');
    setError('');

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ fullName, phone, address, bloodGroup })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Profile update failed.');

      updateUser({ fullName, phone, address, bloodGroup });
      setSuccess('Profile updated successfully.');
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="page-wrapper"><Navbar /><main className="page-content"><div className="profile-loading">Loading profile...</div></main><Footer /></div>;
  }

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="page-content">
        <div className="profile-container">
          <div className="profile-header-card">
            <div className="profile-title-box">
              <h2>Edit Profile - {fullName || 'User'}</h2>
              <p className="role-tag"><i className="fa-solid fa-shield-halved"></i> PRISM Registered User</p>
              <span className="email-sub"><i className="fa-regular fa-envelope"></i> {user?.email}</span>
            </div>
            <div className="header-actions"><span className="blood-badge-header">{bloodGroup}</span></div>
          </div>

          <div className="profile-grid">
            <div className="card">
              <h3 className="card-heading"><i className="fa-solid fa-id-card"></i> Personal Information</h3>
              {success && <div className="alert-success" style={{ marginBottom: '16px' }}>{success}</div>}
              {error && <div className="alert-error" style={{ marginBottom: '16px' }}>{error}</div>}

              <form onSubmit={handleSaveProfile}>
                <div className="form-group">
                  <label className="form-label" htmlFor="profile-full-name">Full Name</label>
                  <input id="profile-full-name" type="text" className="form-input" value={fullName} onChange={(event) => setFullName(event.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="profile-phone">Mobile / Phone</label>
                  <input id="profile-phone" type="tel" className="form-input" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Enter mobile number" />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="profile-address">Address</label>
                  <textarea id="profile-address" className="form-input" value={address} onChange={(event) => setAddress(event.target.value)} rows="3" placeholder="Enter address" />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="profile-blood-group">Blood Group</label>
                  <select id="profile-blood-group" className="form-input" value={bloodGroup} onChange={(event) => setBloodGroup(event.target.value)}>
                    {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((group) => <option key={group} value={group}>{group}</option>)}
                  </select>
                </div>
                <button type="submit" className="btn-primary" disabled={saving} style={{ width: 'auto', minWidth: '150px', marginTop: '14px' }}>
                  {saving ? <span className="spinner"></span> : <><i className="fa-solid fa-floppy-disk"></i> SAVE PROFILE</>}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <style>{`
        .profile-container { padding: 30px 40px; max-width: 900px; margin: 0 auto; }
        .profile-header-card { background: #0c1220; border: 1px solid #162035; border-radius: 14px; padding: 24px 30px; display: flex; align-items: center; gap: 20px; margin-bottom: 20px; }
        .profile-title-box h2 { font-size: 24px; font-weight: 800; }
        .role-tag { font-size: 12px; color: #34d399; font-weight: 700; display: flex; align-items: center; gap: 6px; margin: 4px 0; }
        .email-sub { font-size: 13px; color: #64748b; }
        .header-actions { margin-left: auto; }
        .blood-badge-header { width: 54px; height: 54px; border-radius: 50%; background: rgba(236, 72, 153, 0.12); border: 2px solid #ec4899; color: #ec4899; display: flex; justify-content: center; align-items: center; font-size: 18px; font-weight: 900; }
        .profile-grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: 24px; }
        .card { background: #0c1220; border: 1px solid #162035; border-radius: 14px; padding: 24px; }
        .card-heading { font-size: 16px; font-weight: 800; margin-bottom: 18px; display: flex; align-items: center; gap: 8px; }
        .form-group { margin-bottom: 16px; }
        .form-label { display: block; font-size: 12px; color: #8fa0b5; font-weight: 700; margin-bottom: 6px; }
        .form-input { width: 100%; box-sizing: border-box; background: #060913; border: 1px solid #1e2c45; border-radius: 8px; color: #fff; padding: 11px 12px; font: inherit; }
        .profile-loading { padding: 80px; text-align: center; color: #94a3b8; }
        @media (max-width: 600px) { .profile-container { padding: 20px; } .profile-header-card { padding: 20px; } }
      `}</style>
    </div>
  );
}
