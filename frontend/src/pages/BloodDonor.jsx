import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function BloodDonor() {
  const [donors, setDonors] = useState([]);
  const [filterGroup, setFilterGroup] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [patientName, setPatientName] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [hospitalLoc, setHospitalLoc] = useState('');
  const [contactNum, setContactNum] = useState('');
  const [alertSuccess, setAlertSuccess] = useState(false);
  const [dispatchLoading, setDispatchLoading] = useState(false);

  useEffect(() => {
    fetchDonors(filterGroup);
  }, [filterGroup]);

  const fetchDonors = (group) => {
    setLoading(true);
    const url = group === 'ALL' ? '/api/blood-donors' : `/api/blood-donors?bloodGroup=${group}`;
    fetch(url, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setDonors(data.donors || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setDispatchLoading(true);

    try {
      const res = await fetch('/api/blood-donors/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          patientName,
          bloodGroup,
          hospitalLocation: hospitalLoc,
          contactNumber: contactNum
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setAlertSuccess(true);
      const newDonor = {
        _id: Date.now(),
        name: `${patientName} (Urgent Patient)`,
        bloodGroup,
        location: hospitalLoc,
        distance: hospitalLoc,
        phone: contactNum,
        isAvailable: true
      };
      setDonors([newDonor, ...donors]);
      setPatientName('');
      setHospitalLoc('');
      setContactNum('');

      setTimeout(() => setAlertSuccess(false), 5000);
    } catch (err) {
      alert(err.message || 'Failed to dispatch request.');
    } finally {
      setDispatchLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="page-content">
        <div className="container">
          <div className="request-card">
            <div className="request-header">
              <i className="fa-solid fa-hand-holding-medical"></i> Request Emergency Blood in Surat
            </div>
            <p className="request-desc">Broadcasting your request alerts 50+ verified volunteer donors across Surat city instantly.</p>

            {alertSuccess && (
              <div className="alert-banner">
                <i className="fa-solid fa-circle-check"></i> Emergency Blood Alert Dispatched to Surat Donors &amp; Hospitals!
              </div>
            )}

            <form onSubmit={handleRequestSubmit}>
              <div className="form-group">
                <label className="form-label">Patient Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Patient Name" 
                  value={patientName} 
                  onChange={(e) => setPatientName(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Required Blood Group</label>
                <select 
                  className="form-select" 
                  value={bloodGroup} 
                  onChange={(e) => setBloodGroup(e.target.value)}
                >
                  <option value="O+">O+</option>
                  <option value="A+">A+</option>
                  <option value="B+">B+</option>
                  <option value="AB+">AB+</option>
                  <option value="O-">O-</option>
                  <option value="A-">A-</option>
                  <option value="B-">B-</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Hospital Location (Surat)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. SMIMER Hospital, Adajan, Varachha" 
                  value={hospitalLoc} 
                  onChange={(e) => setHospitalLoc(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contact Number</label>
                <input 
                  type="tel" 
                  className="form-input" 
                  placeholder="10-digit mobile number" 
                  value={contactNum} 
                  onChange={(e) => setContactNum(e.target.value)} 
                  required 
                />
              </div>

              <button type="submit" className="btn-dispatch" disabled={dispatchLoading}>
                {dispatchLoading ? <span className="spinner"></span> : <><i className="fa-solid fa-paper-plane"></i> Dispatch Emergency Request</>}
              </button>
            </form>
          </div>

          <div className="main-content">
            <div className="content-header">
              <h2 className="content-title">Verified Surat City Donors</h2>
              <div className="filter-group">
                {['ALL', 'O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'].map(grp => (
                  <button 
                    key={grp}
                    className={`filter-btn ${filterGroup === grp ? 'active' : ''}`}
                    onClick={() => setFilterGroup(grp)}
                  >
                    {grp}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px' }}>
                <div className="spinner"></div>
                <p style={{ marginTop: '12px', color: '#64748b', fontSize: '13px' }}>Loading Surat Donors from MongoDB...</p>
              </div>
            ) : donors.length === 0 ? (
              <div style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>
                No active donors found for group {filterGroup} in Surat database.
              </div>
            ) : (
              <div className="donors-grid">
                {donors.map(donor => (
                  <div key={donor._id || donor.phone} className="donor-card">
                    <div className="donor-left">
                      <div className="blood-badge">{donor.bloodGroup}</div>
                      <div className="donor-info">
                        <div className="donor-name">{donor.name}</div>
                        <div className="donor-meta">
                          <span><i className="fa-solid fa-location-dot"></i> {donor.location || donor.distance}</span>
                          <span className="donor-status">
                            <i className="fa-solid fa-circle-check"></i> {donor.isAvailable ? 'Available' : 'Unavailable'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <a href={`tel:${donor.phone}`} className="btn-call">
                      <i className="fa-solid fa-phone"></i> Call
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      <style>{`
        .container { padding: 30px 40px; display: grid; grid-template-columns: 360px 1fr; gap: 30px; }
        .request-card { background: #0c1220; border: 1px solid #162035; border-radius: 14px; padding: 24px; display: flex; flex-direction: column; gap: 16px; height: fit-content; }
        .request-header { display: flex; align-items: center; gap: 10px; font-size: 18px; font-weight: 800; color: #ec4899; }
        .request-desc { font-size: 12px; color: #64748b; line-height: 1.5; }

        .alert-banner { background: rgba(52, 211, 153, 0.1); border: 1px solid rgba(52, 211, 153, 0.3); color: #34d399; padding: 12px; border-radius: 8px; font-size: 12px; font-weight: 700; display: flex; align-items: center; gap: 8px; }

        .btn-dispatch { background: #ec4899; color: #ffffff; border: none; padding: 14px; border-radius: 8px; font-weight: 800; font-size: 13px; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 8px; width: 100%; }
        .btn-dispatch:hover { background: #db2777; }

        .main-content { display: flex; flex-direction: column; gap: 20px; }
        .content-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
        .content-title { font-size: 22px; font-weight: 800; }

        .filter-group { display: flex; gap: 6px; flex-wrap: wrap; }
        .filter-btn { background: #0c1220; border: 1px solid #162035; color: #8fa0b5; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; }
        .filter-btn.active { background: #ec4899; border-color: #ec4899; color: #ffffff; }

        .donors-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        .donor-card { background: #0c1220; border: 1px solid #162035; border-radius: 12px; padding: 18px; display: flex; justify-content: space-between; align-items: center; }
        .donor-card:hover { border-color: #ec4899; }

        .donor-left { display: flex; align-items: center; gap: 14px; }
        .blood-badge { width: 44px; height: 44px; border-radius: 50%; border: 2px solid #ec4899; color: #ec4899; background: rgba(236, 72, 153, 0.1); display: flex; justify-content: center; align-items: center; font-weight: 900; font-size: 14px; flex-shrink: 0; }

        .donor-info { display: flex; flex-direction: column; gap: 4px; }
        .donor-name { font-size: 14px; font-weight: 800; }
        .donor-meta { font-size: 12px; color: #64748b; display: flex; align-items: center; gap: 10px; }
        .donor-status { color: #34d399; font-weight: 600; display: flex; align-items: center; gap: 4px; }

        .btn-call { background: #042f2e; border: 1px solid #0d9488; color: #2dd4bf; padding: 8px 16px; border-radius: 8px; font-weight: 700; font-size: 12px; text-decoration: none; display: flex; align-items: center; gap: 6px; }

        @media (max-width: 900px) {
          .container { grid-template-columns: 1fr; }
          .donors-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
