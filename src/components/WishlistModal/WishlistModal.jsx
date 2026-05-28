import { useApp } from '../../context/AppContext';
import { X, Trash2, Heart } from 'lucide-react';
import '../CartModal/CartModal.css';

export default function WishlistModal({ isOpen, onClose }) {
  const { wishlist, toggleWishlist, addToCart } = useApp();

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" style={{ zIndex: 9999 }}>
      <div className="auth-modal" style={{ width: '400px', maxWidth: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Heart size={20} /> Your Wishlist
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', maxHeight: '60vh', marginBottom: '1.5rem' }}>
          {wishlist.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
              <Heart size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <p>Your wishlist is empty.</p>
            </div>
          ) : (
            wishlist.map(item => (
              <div key={item.id} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', background: 'var(--surface)', padding: '0.75rem', borderRadius: '8px' }}>
                <img src={item.image} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.name}</div>
                  <div style={{ fontWeight: 700, color: 'var(--gold)', marginTop: '0.25rem' }}>₹{item.price.toLocaleString('en-IN')}</div>
                  <button 
                    onClick={() => addToCart(item)}
                    style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', padding: '0.5rem 0', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'underline' }}
                  >
                    Move to Cart
                  </button>
                </div>
                <button 
                  onClick={() => toggleWishlist(item)}
                  style={{ background: 'none', border: 'none', color: 'var(--status-red)', cursor: 'pointer', padding: '0.5rem' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
