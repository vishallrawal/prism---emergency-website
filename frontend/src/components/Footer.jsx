import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="dynamic-footer">
      <div className="back-to-top" onClick={scrollToTop}>
        <i className="fa-solid fa-arrow-up"></i> Back to top
      </div>

      <div className="footer-main">
        <div className="footer-brand-col">
          <div className="brand-logo">
            <i className="fa-solid fa-shield-halved brand-icon"></i>
            <span className="brand-name">PRISM</span>
          </div>
          <p className="brand-desc">
            Predictive Response &amp; Intelligent Safety Companion for Surat City. Connecting citizens to rapid emergency medical, police, fire &amp; blood services 24/7.
          </p>
          <div className="system-status-indicator">
            <span className="status-dot"></span> All Emergency Networks Operational
          </div>
        </div>

        <div className="footer-links-grid">
          <div className="footer-col">
            <h4>Platform</h4>
            <ul>
              <li><Link to="/home">Dashboard</Link></li>
              <li><Link to="/emergency-route">Emergency Routes</Link></li>
              <li><Link to="/voice">Voice Emergency</Link></li>
              <li><Link to="/ai-assistant">AI Safety Assistant</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Surat Services</h4>
            <ul>
              <li><Link to="/nearby-services">Trauma &amp; Hospitals</Link></li>
              <li><Link to="/nearby-services">Police Stations</Link></li>
              <li><Link to="/nearby-services">Fire Brigades</Link></li>
              <li><Link to="/blood-donor">Blood Donor Network</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Surat Helplines</h4>
            <ul>
              <li><a href="tel:108"><i className="fa-solid fa-truck-medical text-green"></i> Ambulance: 108</a></li>
              <li><a href="tel:112"><i className="fa-solid fa-user-shield text-blue"></i> Police Control: 112</a></li>
              <li><a href="tel:101"><i className="fa-solid fa-fire-extinguisher text-orange"></i> Fire Brigade: 101</a></li>
              <li><a href="tel:1091"><i className="fa-solid fa-person-dress text-pink"></i> Women Helpline: 1091</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="copyright-text">
          &copy; {new Date().getFullYear()} PRISM Safety Network. Surat City Emergency Response.
        </p>
      </div>

      <style>{`
        .dynamic-footer {
          background-color: #050811;
          color: #94a3b8;
          font-family: 'Inter', sans-serif;
          margin-top: auto;
          border-top: 1px solid #141d30;
        }

        .back-to-top {
          background-color: #0b101d;
          color: #cbd5e1;
          text-align: center;
          padding: 10px 0;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
          border-bottom: 1px solid #141d30;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .back-to-top:hover {
          background-color: #121929;
          color: #ffffff;
        }

        .footer-main {
          max-width: 1240px;
          margin: 0 auto;
          padding: 32px 40px;
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 48px;
        }

        .footer-brand-col {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .brand-logo {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .brand-icon {
          color: #e62e2e;
          font-size: 22px;
        }

        .brand-name {
          color: #ffffff;
          font-weight: 800;
          font-size: 20px;
          letter-spacing: 1px;
        }

        .brand-desc {
          font-size: 12px;
          line-height: 1.6;
          color: #64748b;
        }

        .system-status-indicator {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(34, 197, 94, 0.08);
          border: 1px solid rgba(34, 197, 94, 0.2);
          color: #34d399;
          font-size: 11px;
          font-weight: 700;
          padding: 6px 12px;
          border-radius: 20px;
          width: fit-content;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          background-color: #22c55e;
          border-radius: 50%;
          box-shadow: 0 0 6px #22c55e;
        }

        .footer-links-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .footer-col h4 {
          color: #ffffff;
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 12px;
          letter-spacing: 0.5px;
        }

        .footer-col ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .footer-col ul li {
          margin-bottom: 8px;
        }

        .footer-col ul li a {
          color: #8fa0b5;
          font-size: 12px;
          text-decoration: none;
          transition: color 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .footer-col ul li a:hover {
          color: #ffffff;
        }

        .text-green { color: #22c55e; }
        .text-blue { color: #3b82f6; }
        .text-orange { color: #f97316; }
        .text-pink { color: #ec4899; }

        .footer-bottom {
          background-color: #03050c;
          border-top: 1px solid #0e1626;
          padding: 14px 20px;
          text-align: center;
        }

        .copyright-text {
          font-size: 11px;
          color: #475569;
        }

        @media (max-width: 900px) {
          .footer-main {
            grid-template-columns: 1fr;
            gap: 24px;
            padding: 24px 20px;
          }
          .footer-links-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </footer>
  );
}
