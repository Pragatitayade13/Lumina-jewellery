import React from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

const Terms = () => {
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
        <h1 style={{ fontSize: '2.5rem', fontFamily: 'Playfair Display, serif', marginBottom: '2rem', color: '#d4af37' }}>Terms of Service</h1>
        <p style={{ color: 'rgba(232,224,208,0.7)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          Last updated: August 2024
        </p>
        
        <h2 style={{ fontSize: '1.5rem', marginTop: '2rem', marginBottom: '1rem', color: '#f0ebe0' }}>1. Acceptance of Terms</h2>
        <p style={{ color: 'rgba(232,224,208,0.7)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          By accessing or using the LuxeOrbit platform, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.
        </p>

        <h2 style={{ fontSize: '1.5rem', marginTop: '2rem', marginBottom: '1rem', color: '#f0ebe0' }}>2. Enterprise Subscriptions</h2>
        <p style={{ color: 'rgba(232,224,208,0.7)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          LuxeOrbit is offered on a subscription basis. You will be billed in advance on a recurring schedule. Failure to pay may result in the suspension of your store's access.
        </p>

        <h2 style={{ fontSize: '1.5rem', marginTop: '2rem', marginBottom: '1rem', color: '#f0ebe0' }}>3. Service Availability</h2>
        <p style={{ color: 'rgba(232,224,208,0.7)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          We guarantee a 99.9% uptime SLA for Enterprise customers. Scheduled maintenance will be communicated at least 48 hours in advance.
        </p>
      </main>
    </div>
  );
};

export default Terms;
