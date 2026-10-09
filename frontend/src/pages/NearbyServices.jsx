import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function NearbyServices() {
  const [services, setServices] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchServices(activeCategory);
  }, [activeCategory]);

  const fetchServices = (cat) => {
    setLoading(true);
    const url = cat === 'all' ? '/api/services' : `/api/services?category=${cat}`;
    fetch(url, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setServices(data.services || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const getBadgeClass = (category) => {
    switch (category) {
      case 'hospital': return 'badge-hospital';
      case 'police': return 'badge-police';
      case 'fire': return 'badge-fire';
      case 'blood': return 'badge-blood';
      default: return 'badge-hospital';
    }
  };

  const getIcon = (category) => {
    switch (category) {
      case 'hospital': return 'fa-hospital';
      case 'police': return 'fa-building-shield';
      case 'fire': return 'fa-fire-flame-curved';
      case 'blood': return 'fa-droplet';
      default: return 'fa-location-dot';
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="page-content">
        <div className="container">
          <div className="page-header">
            <div>
              <h2 className="page-title">Surat City Nearby Emergency Services</h2>
              <p className="page-desc">Instant access to verified Surat hospitals, police stations, fire brigades &amp; blood banks.</p>
            </div>

            <div className="category-filters">
              <button 
                className={`filter-btn ${activeCategory === 'all' ? 'active' : ''}`} 
                onClick={() => setActiveCategory('all')}
              >
                <i className="fa-solid fa-layer-group"></i> All ({services.length})
              </button>
              <button 
                className={`filter-btn ${activeCategory === 'hospital' ? 'active' : ''}`} 
                onClick={() => setActiveCategory('hospital')}
              >
                <i className="fa-solid fa-hospital" style={{ color: '#ef4444' }}></i> Hospitals
              </button>
              <button 
                className={`filter-btn ${activeCategory === 'police' ? 'active' : ''}`} 
                onClick={() => setActiveCategory('police')}
              >
                <i className="fa-solid fa-building-shield" style={{ color: '#3b82f6' }}></i> Police Stations
              </button>
              <button 
                className={`filter-btn ${activeCategory === 'fire' ? 'active' : ''}`} 
                onClick={() => setActiveCategory('fire')}
              >
                <i className="fa-solid fa-fire-flame-curved" style={{ color: '#f97316' }}></i> Fire Squads
              </button>
              <button 
                className={`filter-btn ${activeCategory === 'blood' ? 'active' : ''}`} 
                onClick={() => setActiveCategory('blood')}
              >
                <i className="fa-solid fa-droplet" style={{ color: '#ec4899' }}></i> Blood Banks
              </button>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <div className="spinner"></div>
              <p style={{ marginTop: '12px', color: '#64748b', fontSize: '13px' }}>Loading Surat Emergency Services from MongoDB...</p>
            </div>
          ) : (
            <div className="services-list-grid">
              {services.map((item) => (
                <div key={item._id || item.name} className="service-card">
                  <div>
                    <div className="card-top">
                      <span className={`service-type-badge ${getBadgeClass(item.category)}`}>
                        <i className={`fa-solid ${getIcon(item.category)}`}></i> {item.label || item.category}
                      </span>
                      <span className="rating-tag"><i className="fa-solid fa-star"></i> {item.rating || '4.5'}</span>
                    </div>
                    <h3 className="service-name">{item.name}</h3>
                    <p className="service-address"><i className="fa-solid fa-map-pin"></i> {item.address}</p>
                    {item.phone && (
                      <p className="service-phone"><i className="fa-solid fa-phone"></i> {item.phone}</p>
                    )}
                  </div>
                  <div className="card-actions">
                    <a href={`tel:${item.emergencyPhone || item.phone || '108'}`} className="btn-call">
                      <i className="fa-solid fa-phone"></i> Call Emergency
                    </a>
                    <button 
                      className="btn-route"
                      onClick={() => navigate(`/emergency-route?destination=${encodeURIComponent(item.name)}`)}
                    >
                      <i className="fa-solid fa-route"></i> Route
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />

      <style>{`
        .container { padding: 30px 40px; }
        .page-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; margin-bottom: 24px; }
        .page-title { font-size: 24px; font-weight: 800; }
        .page-desc { font-size: 13px; color: #64748b; margin-top: 4px; }

        .category-filters { display: flex; gap: 10px; flex-wrap: wrap; }
        .filter-btn { background: #0c1220; border: 1px solid #162035; color: #8fa0b5; padding: 10px 18px; border-radius: 10px; font-weight: 700; font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 8px; }
        .filter-btn:hover, .filter-btn.active { background: #121929; color: #ffffff; border-color: #38bdf8; }

        .services-list-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
        .service-card { background: #0c1220; border: 1px solid #162035; border-radius: 14px; padding: 24px; display: flex; flex-direction: column; justify-content: space-between; }
        .service-card:hover { border-color: #1e2c45; }

        .card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
        .service-type-badge { font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; display: flex; align-items: center; gap: 6px; }
        .badge-hospital { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); }
        .badge-police { background: rgba(59, 130, 246, 0.1); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.3); }
        .badge-fire { background: rgba(249, 115, 22, 0.1); color: #f97316; border: 1px solid rgba(249, 115, 22, 0.3); }
        .badge-blood { background: rgba(236, 72, 153, 0.1); color: #ec4899; border: 1px solid rgba(236, 72, 153, 0.3); }

        .rating-tag { font-size: 12px; font-weight: 700; color: #f59e0b; display: flex; align-items: center; gap: 4px; }
        .service-name { font-size: 17px; font-weight: 800; margin-bottom: 8px; color: #ffffff; }
        .service-address { font-size: 12px; color: #64748b; margin-bottom: 6px; display: flex; align-items: flex-start; gap: 6px; }
        .service-phone { font-size: 12px; color: #38bdf8; margin-bottom: 16px; display: flex; align-items: center; gap: 6px; }

        .card-actions { display: flex; gap: 10px; margin-top: auto; }
        .btn-call { flex: 1; background: #064e3b; border: 1px solid #059669; color: #34d399; padding: 10px; border-radius: 8px; font-weight: 700; font-size: 12px; text-decoration: none; display: flex; justify-content: center; align-items: center; gap: 6px; }
        .btn-route { flex: 1; background: #121929; border: 1px solid #1f2d47; color: #ffffff; padding: 10px; border-radius: 8px; font-weight: 700; font-size: 12px; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 6px; }
        .btn-route:hover { border-color: #38bdf8; color: #38bdf8; }
      `}</style>
    </div>
  );
}
