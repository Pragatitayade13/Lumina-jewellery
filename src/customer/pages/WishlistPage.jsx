import { useApp } from '../../context/AppContext';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function WishlistPage() {
  const { wishlist, toggleWishlist, addToCart } = useApp();
  const navigate = useNavigate();

  return (
    <div>
      <div className="customer-card">
        <h2 className="card-title"><Heart /> My Wishlist</h2>
        <p style={{ color: 'var(--text-muted)' }}>Keep track of your favorite jewellery pieces for future purchases.</p>
      </div>

      {wishlist.length === 0 ? (
        <div className="customer-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Heart size={48} color="var(--border-color)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ marginBottom: '0.5rem' }}>Your wishlist is empty</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Save items you love to revisit them later.</p>
          <button className="btn btn-gold" onClick={() => navigate('/')}>Explore Collections</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {wishlist.map(item => (
            <div key={item.id} className="customer-card" style={{ display: 'flex', flexDirection: 'column', padding: '1rem' }}>
              <div style={{ height: '200px', background: 'radial-gradient(circle, #2a2a2a, #111)', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={item.image} alt={item.name} style={{ maxHeight: '80%', maxWidth: '80%', objectFit: 'contain' }} />
              </div>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>{item.name}</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                <div style={{ color: 'var(--gold)', fontWeight: 600 }}>₹{item.price.toLocaleString()}</div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-icon btn-outline" onClick={() => addToCart(item)} title="Add to Cart">
                    <ShoppingBag size={14} />
                  </button>
                  <button className="btn btn-icon btn-outline" onClick={() => toggleWishlist(item)} style={{ color: 'var(--status-red)', borderColor: 'var(--border-color)' }} title="Remove">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
