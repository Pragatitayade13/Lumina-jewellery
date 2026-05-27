import React from 'react';

const Dashboard = ({ items }) => {
  // Compute stats
  const totalItemsCount = items.length;
  const totalValue = items.reduce((sum, item) => sum + (item.price * item.stock), 0);
  const lowStockCount = items.filter(item => item.stock > 0 && item.stock <= 5).length;
  const outOfStockCount = items.filter(item => item.stock === 0).length;

  // Format currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div style={{ marginBottom: '2.5rem' }}>
      <h2 className="brand-title" style={{ 
        fontSize: '1.2rem', 
        marginBottom: '1rem', 
        letterSpacing: '0.1em',
        color: 'var(--text-gold)'
      }}>
        Inventory Overview
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.2rem'
      }}>
        {/* Card 1: Total Value */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Vault Valuation
          </span>
          <span style={{ 
            fontFamily: 'var(--font-serif)', 
            fontSize: '1.8rem', 
            fontWeight: 'bold', 
            color: 'var(--text-primary)',
            background: 'linear-gradient(to right, var(--gold-light), #fff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            {formatCurrency(totalValue)}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Combined retail value
          </span>
        </div>

        {/* Card 2: Total Items */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Catalogued Pieces
          </span>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
            {totalItemsCount}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Unique design styles
          </span>
        </div>

        {/* Card 3: Low Stock */}
        <div className="glass-panel" style={{ 
          padding: '1.5rem', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '0.5rem',
          borderLeft: lowStockCount > 0 ? '3px solid var(--warning)' : '1px solid rgba(212, 175, 55, 0.1)'
        }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Low Stock Alerts
          </span>
          <span style={{ 
            fontFamily: 'var(--font-serif)', 
            fontSize: '1.8rem', 
            fontWeight: 'bold', 
            color: lowStockCount > 0 ? 'var(--warning)' : 'var(--text-primary)' 
          }}>
            {lowStockCount}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            5 units or fewer remaining
          </span>
        </div>

        {/* Card 4: Out of Stock */}
        <div className="glass-panel" style={{ 
          padding: '1.5rem', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '0.5rem',
          borderLeft: outOfStockCount > 0 ? '3px solid var(--error)' : '1px solid rgba(212, 175, 55, 0.1)'
        }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Depleted Inventory
          </span>
          <span style={{ 
            fontFamily: 'var(--font-serif)', 
            fontSize: '1.8rem', 
            fontWeight: 'bold', 
            color: outOfStockCount > 0 ? 'var(--error)' : 'var(--text-primary)'
          }}>
            {outOfStockCount}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Currently unavailable
          </span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
