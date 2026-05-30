import React from 'react';
import { Diamond, Shield, Zap, Star, Award, Crown } from 'lucide-react';
import '../admin.css';

const brands = [
  { name: 'Cartier', icon: <Diamond size={24} /> },
  { name: 'Tiffany & Co.', icon: <Star size={24} /> },
  { name: 'Bvlgari', icon: <Crown size={24} /> },
  { name: 'Van Cleef', icon: <Award size={24} /> },
  { name: 'Rolex', icon: <Shield size={24} /> },
  { name: 'Chopard', icon: <Zap size={24} /> },
];

export default function TrustedBrands() {
  return (
    <div className="admin-card mb-15" style={{ padding: '2rem 0', overflow: 'hidden' }}>
      <div className="card-header" style={{ padding: '0 1.5rem', marginBottom: '2rem', textAlign: 'center' }}>
        <div className="card-title" style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>Trusted by Global Elite Partners</div>
      </div>
      
      <div className="trusted-brands-container">
        <div className="trusted-brands-track">
          {/* Double the list to create infinite seamless loop */}
          {[...brands, ...brands, ...brands].map((brand, i) => (
            <div key={i} className="trusted-brand-item group">
              <div className="trusted-brand-icon transition duration-300 group-hover:scale-110 group-hover:text-[var(--gold)]">
                {brand.icon}
              </div>
              <span className="trusted-brand-name transition duration-300 group-hover:text-[var(--text-primary)]">
                {brand.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
