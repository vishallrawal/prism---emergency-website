import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Home() {
  const [counts, setCounts] = useState({ hospital: 12, police: 10, fire: 7, blood: 8 });
  const [showShareModal, setShowShareModal] = useState(false);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    fetch('/api/services/counts', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.counts) setCounts(data.counts);
      })
      .catch(() => {});
  }, []);

  const getLocationLink = () => (
    `https://www.google.com/maps?q=${location.latitude},${location.longitude}`
  );

  const handleShareLocation = () => {
    if (!navigator.geolocation) {
      alert('Location sharing is not supported by this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocation({
          latitude: coords.latitude,
          longitude: coords.longitude
        });
        setShowShareModal(true);
      },
      () => {
        alert('Please allow location access to share your exact live location.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`🚨 Emergency Live Location Alert! My exact location: ${getLocationLink()}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent('EMERGENCY: Live Location Alert');
    const body = encodeURIComponent(`Emergency Live Location Alert! My exact location: ${getLocationLink()}`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const handleShareSMS = () => {
    const body = encodeURIComponent(`EMERGENCY: My exact location: ${getLocationLink()}`);
    window.open(`sms:?body=${body}`, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getLocationLink());
    alert('✅ Live location link copied to clipboard!');
    setShowShareModal(false);
  };

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="page-content">
        <div className="main-container">
          <div className="hero-banner">
            <h1 className="hero-title">Smart Technology.<span>Safer Tomorrow.</span></h1>
            <p className="hero-desc">
              PRISM is your AI-powered safety companion that connects you to emergency services, predicts traffic, finds fastest routes, and helps save lives.
            </p>

            <div className="hero-action-btns">
              <Link to="/voice" className="btn-voice-emergency">
                <i className="fa-solid fa-microphone"></i> VOICE EMERGENCY
              </Link>
              <button 
                type="button" 
                className="btn-share-location"
                onClick={handleShareLocation}
              >
                <i className="fa-solid fa-location-arrow"></i> Share Live Location
              </button>
            </div>

            <div className="feature-pills">
              <span className="pill"><i className="fa-solid fa-shield-halved" style={{ color: '#e62e2e' }}></i> 24/7 Protection</span>
              <span className="pill"><i className="fa-solid fa-bolt" style={{ color: '#eab308' }}></i> Faster Response</span>
              <span className="pill"><i className="fa-solid fa-robot" style={{ color: '#e62e2e' }}></i> AI Powered</span>
              <span className="pill"><i className="fa-solid fa-crosshairs" style={{ color: '#ef4444' }}></i> Live Tracking</span>
            </div>
          </div>

          <div className="right-column">
            <div className="side-card">
              <div className="card-header">
                <div className="card-title">
                  <i className="fa-solid fa-robot" style={{ color: '#a855f7' }}></i> PRISM Sentinel AI
                </div>
                <span className="badge-active">Active</span>
              </div>
              <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>
                Monitors your journey, detects unusual situations, and ensures you are safe.
              </p>
              <div className="ai-status-box">
                <i className="fa-solid fa-check"></i> All Good! Your journey is on track.
              </div>
            </div>

            <div className="side-card">
              <div className="card-title" style={{ marginBottom: '16px' }}>Important Helpline Numbers</div>
              <div className="helpline-list">
                <div className="helpline-item">
                  <div className="helpline-info"><i className="fa-solid fa-truck-medical" style={{ color: '#22c55e' }}></i> Ambulance</div>
                  <a href="tel:108" className="call-btn">108 Call</a>
                </div>
                <div className="helpline-item">
                  <div className="helpline-info"><i className="fa-solid fa-user-shield" style={{ color: '#3b82f6' }}></i> Police</div>
                  <a href="tel:112" className="call-btn">112 Call</a>
                </div>
                <div className="helpline-item">
                  <div className="helpline-info"><i className="fa-solid fa-fire-extinguisher" style={{ color: '#f97316' }}></i> Fire Brigade</div>
                  <a href="tel:101" className="call-btn">101 Call</a>
                </div>
                <div className="helpline-item">
                  <div className="helpline-info"><i className="fa-solid fa-person-dress" style={{ color: '#ec4899' }}></i> Women Helpline</div>
                  <a href="tel:1091" className="call-btn">1091 Call</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="nearby-section">
          <div className="section-header">
            <h3 className="section-title">Nearby Services</h3>
            <Link to="/nearby-services" className="view-all">View All &rarr;</Link>
          </div>

          <div className="services-grid">
            <div className="service-card">
              <div className="service-title" style={{ color: '#ef4444' }}><i className="fa-solid fa-hospital"></i> Hospitals</div>
              <p className="service-desc">Find nearby hospitals and medical facilities.</p>
              <span className="service-count">{counts.hospital || 12} Hospitals</span>
            </div>

            <div className="service-card">
              <div className="service-title" style={{ color: '#3b82f6' }}><i className="fa-solid fa-building-shield"></i> Police Stations</div>
              <p className="service-desc">Locate nearby police stations instantly.</p>
              <span className="service-count" style={{ color: '#3b82f6' }}>{counts.police || 8} Stations</span>
            </div>

            <div className="service-card">
              <div className="service-title" style={{ color: '#f97316' }}><i className="fa-solid fa-fire-flame-curved"></i> Fire Stations</div>
              <p className="service-desc">Get nearest fire squads quickly.</p>
              <span className="service-count" style={{ color: '#f97316' }}>{counts.fire || 5} Stations</span>
            </div>

            <div className="service-card">
              <div className="service-title" style={{ color: '#ec4899' }}><i className="fa-solid fa-droplet"></i> Blood Banks</div>
              <p className="service-desc">Find blood banks and request blood.</p>
              <span className="service-count" style={{ color: '#ec4899' }}>{counts.blood || 9} Blood Banks</span>
            </div>
          </div>
        </div>
      </main>

      {showShareModal && (
        <div className="modal-backdrop" onClick={() => setShowShareModal(false)}>
          <div className="share-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><i className="fa-solid fa-location-arrow" style={{ color: '#e62e2e' }}></i> Share Live Emergency Location</h3>
              <button className="close-btn" onClick={() => setShowShareModal(false)}>&times;</button>
            </div>
            <p className="modal-desc">Send your real-time GPS emergency tracking link directly to trusted contacts:</p>

            <div className="share-options-grid">
              <button className="share-opt-btn whatsapp" onClick={handleShareWhatsApp}>
                <i className="fa-brands fa-whatsapp"></i> WhatsApp
              </button>
              <button className="share-opt-btn email" onClick={handleShareEmail}>
                <i className="fa-regular fa-envelope"></i> Email
              </button>
              <button className="share-opt-btn sms" onClick={handleShareSMS}>
                <i className="fa-solid fa-comment-sms"></i> SMS
              </button>
              <button className="share-opt-btn copy" onClick={handleCopyLink}>
                <i className="fa-regular fa-copy"></i> Copy Link
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />

      <style>{`
        .main-container { display: grid; grid-template-columns: 1fr 340px; gap: 20px; padding: 24px 40px; }
        .hero-banner { background: linear-gradient(rgba(12, 18, 32, 0.75), rgba(6, 9, 19, 0.95)), url('https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?auto=format&fit=crop&w=1200&q=80') center/cover; border: 1px solid #162035; border-radius: 14px; padding: 48px; display: flex; flex-direction: column; justify-content: center; position: relative; min-height: 380px; }
        .hero-title { font-size: 42px; font-weight: 900; line-height: 1.1; margin-bottom: 12px; }
        .hero-title span { color: #e62e2e; display: block; }
        .hero-desc { font-size: 14px; color: #94a3b8; max-width: 520px; line-height: 1.6; margin-bottom: 30px; }

        .hero-action-btns { display: flex; gap: 14px; margin-bottom: 30px; }
        .btn-voice-emergency { background: #e62e2e; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 800; font-size: 13px; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 20px rgba(230, 46, 46, 0.4); cursor: pointer; border: none; }
        .btn-share-location { background: #261219; border: 1px solid #4a1320; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; font-size: 13px; display: inline-flex; align-items: center; gap: 8px; cursor: pointer; }

        .feature-pills { display: flex; gap: 12px; flex-wrap: wrap; }
        .pill { background: rgba(12, 18, 32, 0.8); border: 1px solid #1e2c45; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 6px; color: #cbd5e1; }

        .right-column { display: flex; flex-direction: column; gap: 20px; }
        .side-card { background: #0c1220; border: 1px solid #162035; border-radius: 14px; padding: 20px; }
        .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .card-title { font-size: 15px; font-weight: 800; display: flex; align-items: center; gap: 8px; }
        .badge-active { background: #064e3b; color: #34d399; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 10px; }
        .ai-status-box { background: #060913; border: 1px solid #1e2c45; border-radius: 8px; padding: 14px; font-size: 12px; color: #a855f7; display: flex; align-items: center; gap: 8px; margin-top: 12px; }

        .helpline-list { display: flex; flex-direction: column; gap: 10px; }
        .helpline-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #141d30; }
        .helpline-item:last-child { border-bottom: none; }
        .helpline-info { display: flex; align-items: center; gap: 10px; font-size: 13px; font-weight: 600; }
        .call-btn { background: #064e3b; color: #34d399; border: 1px solid #059669; padding: 4px 12px; border-radius: 6px; text-decoration: none; font-size: 11px; font-weight: 800; }

        .nearby-section { padding: 0 40px 40px 40px; }
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .section-title { font-size: 18px; font-weight: 800; }
        .view-all { color: #818cf8; text-decoration: none; font-size: 13px; font-weight: 600; }

        .services-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .service-card { background: #0c1220; border: 1px solid #162035; border-radius: 12px; padding: 20px; }
        .service-title { font-size: 14px; font-weight: 700; margin-bottom: 6px; display: flex; align-items: center; gap: 8px; }
        .service-desc { font-size: 12px; color: #64748b; line-height: 1.4; margin-bottom: 12px; }
        .service-count { font-size: 12px; font-weight: 800; color: #e62e2e; }

        
        .modal-backdrop { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.75); backdrop-filter: blur(4px); z-index: 2000; display: flex; justify-content: center; align-items: center; padding: 20px; }
        .share-modal-card { background: #0c1220; border: 1px solid #1e2c45; border-radius: 16px; padding: 28px; width: 100%; max-width: 440px; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .modal-header h3 { font-size: 18px; font-weight: 800; display: flex; align-items: center; gap: 10px; }
        .close-btn { background: transparent; border: none; color: #64748b; font-size: 24px; cursor: pointer; }
        .modal-desc { font-size: 13px; color: #94a3b8; margin-bottom: 20px; line-height: 1.5; }

        .share-options-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
        .share-opt-btn { padding: 14px; border-radius: 10px; font-weight: 700; font-size: 13px; border: none; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 8px; transition: transform 0.2s; }
        .share-opt-btn:hover { transform: translateY(-2px); }
        .share-opt-btn.whatsapp { background: #166534; color: #22c55e; border: 1px solid #15803d; }
        .share-opt-btn.email { background: #1e3a8a; color: #60a5fa; border: 1px solid #1d4ed8; }
        .share-opt-btn.sms { background: #701a75; color: #f0abfc; border: 1px solid #86198f; }
        .share-opt-btn.copy { background: #1f2937; color: #cbd5e1; border: 1px solid #374151; }

        @media (max-width: 900px) {
          .main-container { grid-template-columns: 1fr; }
          .services-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </div>
  );
}
