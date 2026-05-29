import React from 'react';
import { useLocation } from 'react-router-dom';
import { Shield, FileText, Cookie } from 'lucide-react';

export default function LegalPage() {
  const location = useLocation();
  const path = location.pathname.replace('/', '');
  
  let title = 'Legal Information';
  let icon = <FileText size={32} color="var(--gold)" />;
  let content = 'This is a placeholder for legal documentation.';

  if (path === 'privacy-policy') {
    title = 'Privacy Policy';
    icon = <Shield size={32} color="var(--gold)" />;
    content = `At Lumina Jewels, we take your privacy seriously. We collect minimal data necessary to process your orders and improve our service. Your payment information is securely processed and never stored on our servers. We do not sell your personal information to third parties.`;
  } else if (path === 'terms-of-service') {
    title = 'Terms of Service';
    icon = <FileText size={32} color="var(--gold)" />;
    content = `By using Lumina Jewels, you agree to these terms. All prices are subject to change based on daily gold and silver rates. Custom orders cannot be cancelled once production begins. Returns are accepted within 14 days of delivery for unworn items with tags attached.`;
  } else if (path === 'cookies') {
    title = 'Cookie Policy';
    icon = <Cookie size={32} color="var(--gold)" />;
    content = `We use cookies to enhance your browsing experience, remember your preferences, and analyze site traffic. Essential cookies are required for the site to function, while analytics and marketing cookies are optional.`;
  }

  return (
    <div style={{ paddingTop: '100px', minHeight: '60vh', paddingBottom: '100px' }}>
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
          {icon}
        </div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', marginBottom: '2rem', color: 'var(--text-primary)' }}>
          {title}
        </h1>
        <div style={{ background: 'var(--surface)', padding: '3rem', borderRadius: 'var(--radius-lg)', textAlign: 'left', border: '1px solid var(--border)' }}>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '1.1rem' }}>
            {content}
          </p>
          <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Last updated: May 29, 2026
          </div>
        </div>
      </div>
    </div>
  );
}
