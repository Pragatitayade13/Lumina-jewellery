import React from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

const Privacy = () => {
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
        <h1 style={{ fontSize: '2.5rem', fontFamily: 'Playfair Display, serif', marginBottom: '2rem', color: '#d4af37' }}>Privacy Policy</h1>
        <p style={{ color: 'rgba(232,224,208,0.7)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          Last updated: August 2024
        </p>
        
        <h2 style={{ fontSize: '1.5rem', marginTop: '2rem', marginBottom: '1rem', color: '#f0ebe0' }}>1. Data Collection</h2>
        <p style={{ color: 'rgba(232,224,208,0.7)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          LuxeOrbit collects data essential to providing our enterprise jewellery management services. This includes business details, inventory data, customer profiles entered by you, and usage telemetry. We do not sell your personal or business data to third parties.
        </p>

        <h2 style={{ fontSize: '1.5rem', marginTop: '2rem', marginBottom: '1rem', color: '#f0ebe0' }}>2. Data Security</h2>
        <p style={{ color: 'rgba(232,224,208,0.7)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          We employ bank-grade AES-256 encryption for data at rest and TLS 1.3 for data in transit. Your inventory valuations, customer databases, and financial reports are securely isolated.
        </p>

        <h2 style={{ fontSize: '1.5rem', marginTop: '2rem', marginBottom: '1rem', color: '#f0ebe0' }}>3. Your Rights</h2>
        <p style={{ color: 'rgba(232,224,208,0.7)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          You retain full ownership of the data you input into LuxeOrbit. You may request a complete data export or account deletion at any time via the Super Admin portal or by contacting support.
        </p>
      </main>
    </div>
  );
};

export default Privacy;
