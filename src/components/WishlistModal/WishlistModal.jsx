import { useApp } from '../../context/AppContext';
import { X, Trash2, Heart } from 'lucide-react';
import '../CartModal/CartModal.css';

export default function WishlistModal({ isOpen, onClose }) {
  const { wishlist, toggleWishlist, addToCart } = useApp();

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" style={{ zIndex: 9999 }}>
      <div className="auth-modal cart-modal-box" style={{ width: '650px', maxWidth: '100%', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
        
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <Heart size={20} /> Your Wishlist
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem', paddingRight: '0.5rem' }}>
          {wishlist.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
              <Heart size={56} style={{ opacity: 0.15, marginBottom: '1.5rem' }} />
              <p style={{ fontSize: '1.1rem' }}>Your wishlist is empty.</p>
              <button className="btn btn-gold" style={{ marginTop: '1.5rem' }} onClick={onClose}>Continue Shopping</button>
            </div>
          ) : (
            wishlist.map(item => (
              <div key={item.id} className="cart-item-card">
                <div className="cart-item-image-wrapper">
                  <img src={item.image} alt={item.name} className="cart-item-image" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.2rem', color: '#fff' }}>{item.name}</div>
                  <div style={{ fontWeight: 700, color: 'var(--gold)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>₹{item.price.toLocaleString('en-IN')}</div>
                  <button 
                    onClick={() => {
                      addToCart(item);
                      toggleWishlist(item); // Optional: Remove from wishlist when adding to cart
                    }}
                    className="btn btn-sm btn-outline"
                    style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                  >
                    Move to Cart
                  </button>
                </div>
                <button 
                  className="cart-remove-btn"
                  onClick={() => toggleWishlist(item)}
                  title="Remove item"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
