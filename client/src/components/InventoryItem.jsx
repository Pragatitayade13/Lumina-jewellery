import React from 'react';

const InventoryItem = ({ item, onEdit, onDelete }) => {
  const { id, name, sku, category, material, purity, weight, price, stock, imageUrl, description } = item;

  // Currency Formatter
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Stock indicator classification
  const getStockClass = () => {
    if (stock === 0) return 'out';
    if (stock <= 5) return 'low';
    return 'in';
  };

  const getStockText = () => {
    if (stock === 0) return 'Out of Stock';
    if (stock <= 5) return `Low Stock (${stock})`;
    return `In Stock (${stock})`;
  };

  // Material Badge Color mapping helper
  const getMaterialBadge = () => {
    switch (material) {
      case 'Gold':
        return <span className="badge badge-gold">22K Gold</span>;
      case 'Silver':
        return <span className="badge badge-silver">Sterling Silver</span>;
      case 'Platinum':
        return <span className="badge badge-platinum">Platinum</span>;
      case 'Rose Gold':
        return <span className="badge badge-rosegold">Rose Gold</span>;
      case 'Diamond-Set':
        return <span className="badge badge-diamond">Diamond-Set</span>;
      default:
        return <span className="badge">{material}</span>;
    }
  };

  // Category vector SVG mockup renderer
  const renderMockupSvg = () => {
    const strokeColor = '#d4af37'; // gold
    const fillGrad = 'url(#goldGrad)';

    // Let's render custom SVG paths for different categories
    switch (category) {
      case 'Ring':
        return (
          <svg viewBox="0 0 100 100" style={{ width: '60px', height: '60px' }}>
            <defs>
              <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f3d078" />
                <stop offset="50%" stopColor="#d4af37" />
                <stop offset="100%" stopColor="#aa851c" />
              </linearGradient>
            </defs>
            {/* Ring Band */}
            <circle cx="50" cy="60" r="22" fill="none" stroke={fillGrad} strokeWidth="4" />
            {/* Diamond Setting */}
            <polygon points="50,22 38,34 50,42 62,34" fill="none" stroke={fillGrad} strokeWidth="3" />
            <line x1="38" y1="34" x2="62" y2="34" stroke={fillGrad} strokeWidth="2" />
            {/* Sparkling Lines */}
            <line x1="50" y1="12" x2="50" y2="18" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="32" y1="20" x2="38" y2="24" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="68" y1="20" x2="62" y2="24" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        );
      case 'Necklace':
        return (
          <svg viewBox="0 0 100 100" style={{ width: '60px', height: '60px' }}>
            <defs>
              <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f3d078" />
                <stop offset="50%" stopColor="#d4af37" />
                <stop offset="100%" stopColor="#aa851c" />
              </linearGradient>
            </defs>
            {/* Chain */}
            <path d="M 20,30 C 20,70 80,70 80,30" fill="none" stroke={fillGrad} strokeWidth="3.5" strokeLinecap="round" />
            {/* Hanging Pendant */}
            <path d="M 50,56 L 40,70 L 50,82 L 60,70 Z" fill="none" stroke={fillGrad} strokeWidth="2.5" />
            <circle cx="50" cy="70" r="4" fill={fillGrad} />
          </svg>
        );
      case 'Earrings':
        return (
          <svg viewBox="0 0 100 100" style={{ width: '60px', height: '60px' }}>
            <defs>
              <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f3d078" />
                <stop offset="50%" stopColor="#d4af37" />
                <stop offset="100%" stopColor="#aa851c" />
              </linearGradient>
            </defs>
            {/* Left Earring */}
            <path d="M 35,25 L 35,45" fill="none" stroke={fillGrad} strokeWidth="3" strokeLinecap="round" />
            <path d="M 35,45 C 20,60 50,60 35,75" fill="none" stroke={fillGrad} strokeWidth="2" />
            <polygon points="35,65 31,73 39,73" fill={fillGrad} />
            {/* Right Earring */}
            <path d="M 65,25 L 65,45" fill="none" stroke={fillGrad} strokeWidth="3" strokeLinecap="round" />
            <path d="M 65,45 C 50,60 80,60 65,75" fill="none" stroke={fillGrad} strokeWidth="2" />
            <polygon points="65,65 61,73 69,73" fill={fillGrad} />
          </svg>
        );
      case 'Bracelet':
        return (
          <svg viewBox="0 0 100 100" style={{ width: '60px', height: '60px' }}>
            <defs>
              <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f3d078" />
                <stop offset="50%" stopColor="#d4af37" />
                <stop offset="100%" stopColor="#aa851c" />
              </linearGradient>
            </defs>
            {/* Oval band representing bracelet in perspective */}
            <ellipse cx="50" cy="50" rx="36" ry="16" fill="none" stroke={fillGrad} strokeWidth="4" />
            {/* Beaded details */}
            <circle cx="20" cy="43" r="3" fill="#fff" />
            <circle cx="30" cy="48" r="3" fill="#fff" />
            <circle cx="50" cy="50" r="4.5" fill={fillGrad} stroke="#fff" strokeWidth="1" />
            <circle cx="70" cy="48" r="3" fill="#fff" />
            <circle cx="80" cy="43" r="3" fill="#fff" />
          </svg>
        );
      case 'Pendant':
        return (
          <svg viewBox="0 0 100 100" style={{ width: '60px', height: '60px' }}>
            <defs>
              <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f3d078" />
                <stop offset="50%" stopColor="#d4af37" />
                <stop offset="100%" stopColor="#aa851c" />
              </linearGradient>
            </defs>
            {/* Single Loop & Hook */}
            <circle cx="50" cy="30" r="8" fill="none" stroke={fillGrad} strokeWidth="3" />
            <path d="M 50,38 L 50,48" fill="none" stroke={fillGrad} strokeWidth="3.5" />
            {/* Gem Drop */}
            <path d="M 50,48 C 30,68 35,82 50,82 C 65,82 70,68 50,48 Z" fill={fillGrad} stroke="#fff" strokeWidth="1" />
          </svg>
        );
      default: // Other (Gemstone silhouette)
        return (
          <svg viewBox="0 0 100 100" style={{ width: '60px', height: '60px' }}>
            <defs>
              <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f3d078" />
                <stop offset="50%" stopColor="#d4af37" />
                <stop offset="100%" stopColor="#aa851c" />
              </linearGradient>
            </defs>
            <polygon points="50,20 78,42 66,80 34,80 22,42" fill="none" stroke={fillGrad} strokeWidth="3.5" />
            <line x1="50" y1="20" x2="50" y2="80" stroke={fillGrad} strokeWidth="2" />
            <line x1="22" y1="42" x2="78" y2="42" stroke={fillGrad} strokeWidth="2" />
            <line x1="50" y1="20" x2="34" y2="80" stroke={fillGrad} strokeWidth="1" />
            <line x1="50" y1="20" x2="66" y2="80" stroke={fillGrad} strokeWidth="1" />
          </svg>
        );
    }
  };

  return (
    <div className="glass-panel" style={{
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative',
      height: '100%'
    }}>
      {/* Upper Section: Mockup Picture Box */}
      <div style={{
        height: '170px',
        backgroundColor: '#0a0a0c',
        backgroundImage: 'radial-gradient(circle, #191922 0%, #07070a 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        position: 'relative'
      }}>
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={name} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { e.target.style.display = 'none'; }} // fallback if URL fails
          />
        ) : null}
        
        {/* Render Vector Mockup when no imageUrl or fallback */}
        {(!imageUrl) && renderMockupSvg()}

        {/* Floating Badges */}
        <div style={{
          position: 'absolute',
          top: '0.8rem',
          left: '0.8rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.3rem'
        }}>
          {getMaterialBadge()}
          <span className="badge badge-stock" style={{
            fontSize: '0.7rem',
            padding: '0.2rem 0.5rem',
            backgroundColor: 'rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            {purity}
          </span>
        </div>

        <div style={{
          position: 'absolute',
          top: '0.8rem',
          right: '0.8rem'
        }}>
          <span className={`badge badge-stock ${getStockClass()}`}>
            {getStockText()}
          </span>
        </div>
      </div>

      {/* Details Box */}
      <div style={{
        padding: '1.2rem',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {category}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-gold)', fontWeight: '500', fontFamily: 'var(--font-mono)' }}>
            {sku}
          </span>
        </div>

        <h3 style={{ 
          fontSize: '1.05rem', 
          fontWeight: '500', 
          color: 'var(--text-primary)', 
          lineHeight: '1.3',
          marginBottom: '0.5rem',
          fontFamily: 'var(--font-sans)',
          minHeight: '2.6rem', /* ensures alignment on multiple lines */
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {name}
        </h3>

        {description && (
          <p style={{
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            marginBottom: '1rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            height: '2.5rem'
          }}>
            {description}
          </p>
        )}

        {/* Footer Metrics */}
        <div style={{
          marginTop: 'auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          paddingTop: '0.8rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <div>
            <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Weight
            </span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {weight} g
            </span>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Retail Value
            </span>
            <span style={{ 
              fontSize: '1.25rem', 
              fontWeight: '600', 
              color: 'var(--text-gold)',
              fontFamily: 'var(--font-serif)'
            }}>
              {formatCurrency(price)}
            </span>
          </div>
        </div>

        {/* Action Panel overlay at bottom on hover, or simply positioned */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '0.5rem',
          marginTop: '0.8rem',
          paddingTop: '0.5rem'
        }}>
          <button 
            className="btn-icon-only edit" 
            title="Edit Item"
            onClick={() => onEdit(item)}
          >
            ✏️
          </button>
          <button 
            className="btn-icon-only delete" 
            title="Delete Item"
            onClick={() => onDelete(id)}
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryItem;
