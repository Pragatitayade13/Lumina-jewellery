import React from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

const Security = () => {
  return (
    <div className="landing-root" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav className="landing-nav nav-scrolled" style={{ position: 'relative' }}>
        <div className="nav-inner">
          <Link to="/" className="nav-logo">
            <span className="logo-diamond">◆</span>
            <span>LuxeOrbit</span>
          </Link>
          <div className="nav-actions">
            <Link to="/login" className="btn-ghost">Sign In</Link>
          </div>
        </div>
      </nav>

      <main style={{ flex: 1, padding: '4rem 2rem', maxWidth: 800, margin: '0 auto', color: '#f0ebe0' }}>
        <h1 style={{ fontSize: '2.5rem', fontFamily: 'Playfair Display, serif', marginBottom: '2rem', color: '#d4af37' }}>Platform Security</h1>
        <p style={{ color: 'rgba(232,224,208,0.7)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          We understand that luxury jewellery inventory data is highly sensitive. LuxeOrbit is built from the ground up with enterprise-grade security.
        </p>
        
        <h2 style={{ fontSize: '1.5rem', marginTop: '2rem', marginBottom: '1rem', color: '#f0ebe0' }}>Infrastructure Security</h2>
        <p style={{ color: 'rgba(232,224,208,0.7)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          Hosted on isolated cloud environments, our infrastructure benefits from automatic DDoS mitigation, Web Application Firewalls (WAF), and continuous vulnerability scanning.
        </p>

        <h2 style={{ fontSize: '1.5rem', marginTop: '2rem', marginBottom: '1rem', color: '#f0ebe0' }}>Data Encryption</h2>
        <p style={{ color: 'rgba(232,224,208,0.7)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          All data is encrypted in transit using TLS 1.3. Data at rest (including backups) is encrypted using AES-256 block-level encryption. Your database is logically separated to ensure absolute tenant isolation.
        </p>

        <h2 style={{ fontSize: '1.5rem', marginTop: '2rem', marginBottom: '1rem', color: '#f0ebe0' }}>Access Control</h2>
        <p style={{ color: 'rgba(232,224,208,0.7)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          We employ strict Role-Based Access Control (RBAC). Your staff only sees what you explicitly allow them to see. Multi-factor authentication (MFA) is enforced for all Super Admin and Business Owner accounts.
        </p>
      </main>
    </div>
  );
};

export default Security;
