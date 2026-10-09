import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ totalUsers: 0, totalAdmins: 0, totalDonors: 0, totalServices: 0, totalRequests: 0, totalLogs: 0 });
  const [usersList, setUsersList] = useState([]);
  const [donorsList, setDonorsList] = useState([]);
  const [servicesList, setServicesList] = useState([]);
  const [logsList, setLogsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newDonor, setNewDonor] = useState({ name: '', bloodGroup: 'O+', phone: '', location: '', distance: '2.0 km' });
  const [newService, setNewService] = useState({ name: '', category: 'hospital', address: '', phone: '', rating: '4.5' });

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchDonors();
    fetchServices();
    fetchLogs();
  }, []);

  const adminHeaders = {};

  const fetchStats = () => {
    fetch('/api/admin/stats', { headers: adminHeaders, credentials: 'include' })
      .then(res => res.json())
      .then(data => data.stats && setStats(data.stats))
      .catch(() => {});
  };

  const fetchUsers = () => {
    fetch('/api/admin/users', { headers: adminHeaders, credentials: 'include' })
      .then(res => res.json())
      .then(data => { setUsersList(data.users || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const fetchDonors = () => {
    fetch('/api/admin/donors', { headers: adminHeaders, credentials: 'include' })
      .then(res => res.json())
      .then(data => setDonorsList(data.donors || []))
      .catch(() => {});
  };

  const fetchServices = () => {
    fetch('/api/admin/services', { headers: adminHeaders, credentials: 'include' })
      .then(res => res.json())
      .then(data => setServicesList(data.services || []))
      .catch(() => {});
  };

  const fetchLogs = () => {
    fetch('/api/admin/logs', { headers: adminHeaders, credentials: 'include' })
      .then(res => res.json())
      .then(data => setLogsList(data.logs || []))
      .catch(() => {});
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user account permanently?')) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: adminHeaders,
        credentials: 'include'
      });
      if (res.ok) {
        setUsersList(usersList.filter(u => u._id !== id));
        fetchStats();
      }
    } catch (err) {
      alert('Delete failed');
    }
  };
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editForm, setEditForm] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    role: 'user',
    bloodGroup: 'O+',
    phone: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: ''
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  const handleOpenEditUser = (u) => {
    setEditingUserId(u._id);
    setEditForm({
      fullName: u.fullName || '',
      username: u.username || '',
      email: u.email || '',
      password: '',
      role: u.role || 'user',
      bloodGroup: u.bloodGroup || 'O+',
      phone: u.phone || '',
      address: u.address || '',
      emergencyContactName: u.emergencyContactName || '',
      emergencyContactPhone: u.emergencyContactPhone || ''
    });
    setEditError('');
    setEditSuccess('');
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingUserId(null);
    setEditError('');
    setEditSuccess('');
  };

  const handleSaveUserEdit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError('');
    setEditSuccess('');

    try {
      const res = await fetch(`/api/admin/users/${editingUserId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...adminHeaders
        },
        credentials: 'include',
        body: JSON.stringify(editForm)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update user details.');
      }

      setEditSuccess('User updated successfully!');
      setUsersList(usersList.map(u => u._id === editingUserId ? { ...u, ...data.user } : u));
      fetchStats();

      setTimeout(() => {
        handleCloseEditModal();
      }, 900);
    } catch (err) {
      setEditError(err.message || 'Error updating user.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteDonor = async (id) => {
    if (!window.confirm('Delete donor entry?')) return;
    try {
      const res = await fetch(`/api/admin/donors/${id}`, {
        method: 'DELETE',
        headers: adminHeaders,
        credentials: 'include'
      });
      if (res.ok) {
        setDonorsList(donorsList.filter(d => d._id !== id));
        fetchStats();
      }
    } catch (err) {
      alert('Delete failed');
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('Delete emergency service entry?')) return;
    try {
      const res = await fetch(`/api/admin/services/${id}`, {
        method: 'DELETE',
        headers: adminHeaders,
        credentials: 'include'
      });
      if (res.ok) {
        setServicesList(servicesList.filter(s => s._id !== id));
        fetchStats();
      }
    } catch (err) {
      alert('Delete failed');
    }
  };

  const handleAddDonorSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/donors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...adminHeaders },
        credentials: 'include',
        body: JSON.stringify(newDonor)
      });
      if (res.ok) {
        setNewDonor({ name: '', bloodGroup: 'O+', phone: '', location: '', distance: '2.0 km' });
        fetchDonors();
        fetchStats();
        alert('Blood Donor added successfully!');
      }
    } catch (err) { alert('Failed to add donor'); }
  };

  const handleAddServiceSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...adminHeaders },
        credentials: 'include',
        body: JSON.stringify(newService)
      });
      if (res.ok) {
        setNewService({ name: '', category: 'hospital', address: '', phone: '', rating: '4.5' });
        fetchServices();
        fetchStats();
        alert('Emergency Service added successfully!');
      }
    } catch (err) { alert('Failed to add service'); }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-wrapper">
      <aside className="sidebar">
        <div>
          <div className="sidebar-brand">
            <i className="fa-solid fa-shield-halved brand-icon"></i>
            <div>
              <span className="brand-title">PRISM</span>
              <span className="brand-sub">Admin Panel (Surat)</span>
            </div>
          </div>
          <ul className="nav-list">
            <li className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}>
              <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('overview'); }}>
                <i className="fa-solid fa-chart-pie"></i> Overview &amp; Users
              </a>
            </li>
            <li className={`nav-item ${activeTab === 'donors' ? 'active' : ''}`}>
              <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('donors'); }}>
                <i className="fa-solid fa-droplet"></i> Blood Donors
              </a>
            </li>
            <li className={`nav-item ${activeTab === 'services' ? 'active' : ''}`}>
              <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('services'); }}>
                <i className="fa-solid fa-hospital"></i> Nearby Services
              </a>
            </li>
            <li className={`nav-item ${activeTab === 'logs' ? 'active' : ''}`}>
              <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('logs'); }}>
                <i className="fa-solid fa-triangle-exclamation"></i> Emergency Logs
              </a>
            </li>
            <li className="nav-item">
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/home'); }}>
                <i className="fa-solid fa-globe"></i> View Website
              </a>
            </li>
          </ul>
        </div>
        <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }} className="logout-link">
          <i className="fa-solid fa-right-from-bracket"></i> Logout Admin
        </a>
      </aside>

      <main className="main-content-area">
        <div className="top-bar">
          <h1 className="page-title">Surat City Admin Control Panel</h1>
          <div className="admin-pill">
            <i className="fa-solid fa-user-gear" style={{ color: '#ef4444' }}></i>
            <span>Admin: <strong>{user?.username || user?.fullName}</strong></span>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon icon-blue"><i className="fa-solid fa-users"></i></div>
            <div className="stat-info">
              <p>Registered Users</p>
              <h3>{stats.totalUsers || usersList.length}</h3>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon icon-purple"><i className="fa-solid fa-droplet"></i></div>
            <div className="stat-info">
              <p>Surat Blood Donors</p>
              <h3>{stats.totalDonors || donorsList.length}</h3>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon icon-green"><i className="fa-solid fa-hospital"></i></div>
            <div className="stat-info">
              <p>Emergency Services</p>
              <h3>{stats.totalServices || servicesList.length}</h3>
            </div>
          </div>
        </div>

        
        {activeTab === 'overview' && (
          <div className="panel">
            <h2 className="panel-header">Registered Users Management</h2>
            {loading ? <div className="spinner"></div> : (
              <table>
                <thead>
                  <tr>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Username</th>
                    <th>Blood Group</th>
                    <th>Role</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((u) => (
                    <tr key={u._id}>
                      <td><strong>{u.fullName}</strong></td>
                      <td>{u.email}</td>
                      <td>@{u.username}</td>
                      <td><span className="blood-tag">{u.bloodGroup || 'O+'}</span></td>
                      <td><span className="role-badge">{u.role?.toUpperCase()}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}>
                          <button onClick={() => handleOpenEditUser(u)} className="btn-edit" title="Edit User">
                            <i className="fa-solid fa-pen-to-square"></i> Edit
                          </button>
                          {u.username !== user?.username ? (
                            <button onClick={() => handleDeleteUser(u._id)} className="btn-delete" title="Delete User">
                              <i className="fa-solid fa-trash"></i> Delete
                            </button>
                          ) : (
                            <span style={{ color: '#64748b', fontSize: '11px', fontStyle: 'italic' }}>(You)</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        
        {activeTab === 'donors' && (
          <div>
            <div className="panel" style={{ marginBottom: '24px' }}>
              <h2 className="panel-header">Add New Surat Blood Donor</h2>
              <form onSubmit={handleAddDonorSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr) 100px', gap: '10px' }}>
                <input type="text" className="form-input" placeholder="Donor Name" value={newDonor.name} onChange={e => setNewDonor({...newDonor, name: e.target.value})} required />
                <select className="form-select" value={newDonor.bloodGroup} onChange={e => setNewDonor({...newDonor, bloodGroup: e.target.value})}>
                  <option value="O+">O+</option><option value="A+">A+</option><option value="B+">B+</option><option value="AB+">AB+</option>
                  <option value="O-">O-</option><option value="A-">A-</option><option value="B-">B-</option><option value="AB-">AB-</option>
                </select>
                <input type="tel" className="form-input" placeholder="Phone" value={newDonor.phone} onChange={e => setNewDonor({...newDonor, phone: e.target.value})} required />
                <input type="text" className="form-input" placeholder="Area (e.g. Adajan)" value={newDonor.location} onChange={e => setNewDonor({...newDonor, location: e.target.value})} required />
                <input type="text" className="form-input" placeholder="Distance" value={newDonor.distance} onChange={e => setNewDonor({...newDonor, distance: e.target.value})} />
                <button type="submit" className="btn-primary" style={{ height: '42px', padding: '0', display: 'flex', justifyContent: 'center', alignItems: 'center', justifySelf: 'center', width: '100%' }}>Add Donor</button>
              </form>
            </div>

            <div className="panel">
              <h2 className="panel-header">All Surat Blood Donors ({donorsList.length})</h2>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Group</th>
                    <th>Phone</th>
                    <th>Location</th>
                    <th>Distance</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {donorsList.map((d) => (
                    <tr key={d._id}>
                      <td><strong>{d.name}</strong></td>
                      <td><span className="blood-tag">{d.bloodGroup}</span></td>
                      <td>{d.phone}</td>
                      <td>{d.location}</td>
                      <td>{d.distance}</td>
                      <td><button onClick={() => handleDeleteDonor(d._id)} className="btn-delete">Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        
        {activeTab === 'services' && (
          <div>
            <div className="panel" style={{ marginBottom: '24px' }}>
              <h2 className="panel-header">Add New Surat Emergency Service</h2>
              <form onSubmit={handleAddServiceSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr) 100px', gap: '10px' }}>
                <input type="text" className="form-input" placeholder="Service Name" value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} required />
                <select className="form-select" value={newService.category} onChange={e => setNewService({...newService, category: e.target.value})}>
                  <option value="hospital">Hospital</option>
                  <option value="police">Police Station</option>
                  <option value="fire">Fire Station</option>
                  <option value="blood">Blood Bank</option>
                </select>
                <input type="text" className="form-input" placeholder="Address (Surat)" value={newService.address} onChange={e => setNewService({...newService, address: e.target.value})} required />
                <input type="tel" className="form-input" placeholder="Phone" value={newService.phone} onChange={e => setNewService({...newService, phone: e.target.value})} />
                <input type="text" className="form-input" placeholder="Rating (e.g 4.8)" value={newService.rating} onChange={e => setNewService({...newService, rating: e.target.value})} />
                <button type="submit" className="btn-primary" style={{ height: '42px', padding: '0', display: 'flex', justifyContent: 'center', alignItems: 'center', justifySelf: 'center', width: '100%' }}>Add Service</button>
              </form>
            </div>

            <div className="panel">
              <h2 className="panel-header">All Emergency Services ({servicesList.length})</h2>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Address</th>
                    <th>Phone</th>
                    <th>Rating</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {servicesList.map((s) => (
                    <tr key={s._id}>
                      <td><strong>{s.name}</strong></td>
                      <td><span className="role-badge">{s.category?.toUpperCase()}</span></td>
                      <td>{s.address}</td>
                      <td>{s.phone}</td>
                      <td>⭐ {s.rating}</td>
                      <td><button onClick={() => handleDeleteService(s._id)} className="btn-delete">Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        
        {activeTab === 'logs' && (
          <div className="panel">
            <h2 className="panel-header">Emergency System Activity Logs</h2>
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Message</th>
                  <th>Patient / Contact</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logsList.map((l, idx) => (
                  <tr key={idx}>
                    <td><span className="role-badge" style={{ background: '#450a0a', color: '#fca5a5' }}>{l.type}</span></td>
                    <td>{l.message}</td>
                    <td>{l.patientName ? `${l.patientName} (${l.contactNumber})` : 'System'}</td>
                    <td>{new Date(l.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        
        {isEditModalOpen && (
          <div className="modal-overlay" onClick={handleCloseEditModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className="fa-solid fa-user-pen" style={{ color: '#38bdf8', fontSize: '20px' }}></i>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Edit User Account</h3>
                </div>
                <button type="button" className="modal-close-btn" onClick={handleCloseEditModal}>
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>

              {editError && <div className="modal-alert modal-alert-error">{editError}</div>}
              {editSuccess && <div className="modal-alert modal-alert-success">{editSuccess}</div>}

              <form onSubmit={handleSaveUserEdit} className="edit-user-form">
                <div className="form-grid-2">
                  <div className="modal-field">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editForm.fullName}
                      onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="modal-field">
                    <label>Username *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editForm.username}
                      onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                      required
                    />
                  </div>

                  <div className="modal-field">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      className="form-input"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="modal-field">
                    <label>New Password (leave blank to keep current)</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Enter new password to change"
                      value={editForm.password}
                      onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                      autoComplete="new-password"
                    />
                  </div>

                  <div className="modal-field">
                    <label>Account Role</label>
                    <select
                      className="form-select"
                      value={editForm.role}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    >
                      <option value="user">User (Normal Citizen)</option>
                      <option value="admin">Admin (Surat Control Room)</option>
                    </select>
                  </div>

                  <div className="modal-field">
                    <label>Blood Group</label>
                    <select
                      className="form-select"
                      value={editForm.bloodGroup}
                      onChange={(e) => setEditForm({ ...editForm, bloodGroup: e.target.value })}
                    >
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>

                  <div className="modal-field">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="+91 9876543210"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    />
                  </div>

                  <div className="modal-field">
                    <label>City / Residential Address</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Address in Surat"
                      value={editForm.address}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    />
                  </div>

                  <div className="modal-field">
                    <label>Emergency Contact Person</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Contact Name"
                      value={editForm.emergencyContactName}
                      onChange={(e) => setEditForm({ ...editForm, emergencyContactName: e.target.value })}
                    />
                  </div>

                  <div className="modal-field">
                    <label>Emergency Contact Phone</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="Emergency Helpline / Relative Phone"
                      value={editForm.emergencyContactPhone}
                      onChange={(e) => setEditForm({ ...editForm, emergencyContactPhone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={handleCloseEditModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-save" disabled={editLoading}>
                    {editLoading ? (
                      <span><i className="fa-solid fa-spinner fa-spin"></i> Saving...</span>
                    ) : (
                      <span><i className="fa-solid fa-check"></i> Save Changes</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <style>{`
        .admin-wrapper { display: flex; min-height: 100vh; background-color: #060913; color: #ffffff; }
        .sidebar { width: 260px; background-color: #0b0f1d; border-right: 1px solid #141c2e; padding: 24px 16px; display: flex; flex-direction: column; justify-content: space-between; flex-shrink: 0; }
        .sidebar-brand { display: flex; align-items: center; gap: 12px; margin-bottom: 36px; padding-left: 8px; }
        .brand-icon { color: #e62e2e; font-size: 26px; }
        .brand-title { font-size: 18px; font-weight: 800; color: #ffffff; }
        .brand-sub { font-size: 11px; color: #5a6e85; display: block; }

        .nav-list { list-style: none; display: flex; flex-direction: column; gap: 8px; padding: 0; }
        .nav-item a { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 10px; color: #7f93a8; text-decoration: none; font-size: 14px; font-weight: 600; }
        .nav-item.active a { background: #261219; color: #ffffff; border-left: 3px solid #e62e2e; }
        .nav-item.active a i { color: #e62e2e; }

        .logout-link { display: flex; align-items: center; gap: 12px; padding: 12px 16px; color: #e62e2e; text-decoration: none; font-size: 14px; font-weight: 700; }

        .main-content-area { flex: 1; padding: 36px 40px; overflow-y: auto; }
        .top-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
        .page-title { font-size: 24px; font-weight: 800; }
        .admin-pill { background: #121929; border: 1px solid #1e2a40; padding: 8px 16px; border-radius: 20px; font-size: 13px; color: #8fa0b5; display: flex; align-items: center; gap: 8px; }

        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: #0c1220; border: 1px solid #162035; border-radius: 12px; padding: 22px; display: flex; align-items: center; gap: 18px; }
        .stat-icon { width: 48px; height: 48px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
        .icon-blue { background: #12213a; color: #3b82f6; }
        .icon-purple { background: #221338; color: #ec4899; }
        .icon-green { background: #0f2922; color: #22c55e; }
        .stat-info p { font-size: 12px; color: #64748b; font-weight: 600; margin-bottom: 4px; }
        .stat-info h3 { font-size: 24px; font-weight: 800; }

        .panel { background: #0c1220; border: 1px solid #162035; border-radius: 12px; padding: 24px; }
        .panel-header { font-size: 16px; font-weight: 700; margin-bottom: 20px; }

        table { width: 100%; border-collapse: collapse; text-align: left; }
        th, td { padding: 12px 14px; border-bottom: 1px solid #141c2e; font-size: 13px; }
        th { color: #475569; font-size: 11px; text-transform: uppercase; font-weight: 700; }
        td { color: #cbd5e1; }

        .role-badge { background: #2e1065; color: #c084fc; border: 1px solid #581c87; padding: 3px 10px; border-radius: 6px; font-size: 10px; font-weight: 800; }
        .blood-tag { background: rgba(236, 72, 153, 0.15); color: #ec4899; border: 1px solid #ec4899; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 800; }
        
        .btn-edit { background: #112240; border: 1px solid #1d4ed8; color: #60a5fa; padding: 5px 12px; border-radius: 6px; font-size: 11.5px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; transition: 0.2s; }
        .btn-edit:hover { background: #1d4ed8; color: #ffffff; }

        .btn-delete { color: #ef4444; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); padding: 5px 10px; border-radius: 6px; font-size: 11.5px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; transition: 0.2s; }
        .btn-delete:hover { background: #ef4444; color: #ffffff; border-color: #ef4444; }

        .modal-overlay { position: fixed; inset: 0; background: rgba(3, 7, 18, 0.82); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 20px; }
        .modal-content { background: #0c1220; border: 1px solid #1e2c45; border-radius: 14px; width: 100%; max-width: 680px; max-height: 90vh; overflow-y: auto; padding: 28px; box-shadow: 0 20px 50px rgba(0,0,0,0.6); }
        .modal-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #162035; padding-bottom: 16px; margin-bottom: 20px; }
        .modal-close-btn { background: #121929; border: 1px solid #1e2c45; color: #94a3b8; width: 32px; height: 32px; border-radius: 8px; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
        .modal-close-btn:hover { background: #e62e2e; color: #ffffff; border-color: #e62e2e; }

        .form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
        .modal-field { display: flex; flex-direction: column; gap: 6px; }
        .modal-field label { font-size: 11.5px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }

        .modal-alert { padding: 10px 14px; border-radius: 8px; font-size: 12.5px; font-weight: 600; margin-bottom: 16px; }
        .modal-alert-error { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: #f87171; }
        .modal-alert-success { background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); color: #4ade80; }

        .modal-actions { display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid #162035; padding-top: 18px; }
        .btn-cancel { background: #121929; border: 1px solid #1e2c45; color: #cbd5e1; padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; }
        .btn-cancel:hover { background: #1e2c45; color: #ffffff; }
        .btn-save { background: linear-gradient(135deg, #0284c7, #2563eb); border: none; color: #ffffff; padding: 10px 24px; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3); }
        .btn-save:hover { background: linear-gradient(135deg, #0369a1, #1d4ed8); }
        .btn-save:disabled { opacity: 0.6; cursor: not-allowed; }

        @media (max-width: 900px) {
          .admin-wrapper { display: block; }
          .sidebar { width: 100%; min-height: auto; padding: 14px 16px; gap: 12px; }
          .sidebar-brand { margin-bottom: 8px; }
          .nav-list { flex-direction: row; overflow-x: auto; padding-bottom: 4px; }
          .nav-item { flex: 0 0 auto; }
          .nav-item a { padding: 10px 12px; white-space: nowrap; }
          .logout-link { padding: 8px 12px; }
          .main-content-area { padding: 24px 20px; overflow-x: hidden; }
          .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
          .panel { overflow-x: auto; }
        }
        @media (max-width: 640px) {
          .main-content-area { padding: 20px 16px; }
          .top-bar { align-items: flex-start; gap: 12px; flex-direction: column; margin-bottom: 20px; }
          .page-title { font-size: 21px; }
          .stats-grid { grid-template-columns: 1fr; }
          .stat-card { padding: 16px; }
          .form-grid-2 { grid-template-columns: 1fr; }
          .modal-actions { flex-direction: column-reverse; }
          .modal-actions button { width: 100%; }
          th, td { padding: 10px; white-space: nowrap; }
        }
      `}</style>
    </div>
  );
}
