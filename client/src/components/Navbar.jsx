import React from 'react';

const Navbar = ({ onAddItem, totalCount }) => {
  return (
    <nav className="glass-panel" style={{
      padding: '1.2rem 2rem',
      borderRadius: '0 0 12px 12px',
      borderTop: 'none',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <h1 className="brand-title" style={{ fontSize: '1.6rem', margin: 0 }}>
          AURELIA
        </h1>
        <span style={{ 
          fontSize: '0.75rem', 
          color: 'var(--text-gold)', 
          textTransform: 'uppercase', 
          letterSpacing: '0.2em',
          marginTop: '2px'
        }}>
          Luxury Inventory Management
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            display: 'inline-block',
            width: '8px',
            height: '8px',
            backgroundColor: 'var(--success)',
            borderRadius: '50%',
            boxShadow: '0 0 8px var(--success)'
          }}></span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            System Live
          </span>
        </div>

        <button className="btn btn-gold" onClick={onAddItem}>
          <span style={{ fontSize: '1.2rem', lineHeight: '1', fontWeight: 'bold' }}>+</span> 
          New Acquisition
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
