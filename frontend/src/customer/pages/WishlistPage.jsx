import { useApp } from '../../context/AppContext';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../../components/ProductCard/ProductCard';

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
          <button className="btn btn-gold" onClick={() => navigate('/collections')}>Explore Collections</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {wishlist.map(item => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      )}
    </div>
  );
}
