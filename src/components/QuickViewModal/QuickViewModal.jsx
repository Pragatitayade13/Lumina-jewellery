import { X, ShoppingBag, Heart, Star } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function QuickViewModal() {
  const { addToCart, toggleWishlist, isWishlisted, quickViewProduct, setQuickViewProduct } = useApp();
  
  if (!quickViewProduct) return null;
  const product = quickViewProduct;
  const wishlisted = isWishlisted(product.id);
  const discount = Math.round(((product.originalPrice || product.price - product.price) / (product.originalPrice || product.price)) * 100) || 0;

  const onClose = () => setQuickViewProduct(null);

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" style={{ zIndex: 9999 }}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ display: 'flex', maxWidth: '800px', background: 'var(--surface)', borderRadius: 'var(--radius-xl)' }}>
        <div style={{ flex: '0 0 45%' }}>
          <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-xl) 0 0 var(--radius-xl)' }} />
        </div>
        <div style={{ flex: 1, padding: '2.5rem', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <X size={16} />
          </button>
          <span style={{ fontSize: '0.72rem', letterSpacing: '0.2em', color: 'var(--gold)', fontWeight: 600, textTransform: 'uppercase' }}>{product.category}</span>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', margin: '0.5rem 0 0.75rem', color: 'var(--text-primary)' }}>{product.name}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <div className="stars" style={{ display: 'flex', color: 'var(--gold)' }}>{[1,2,3,4,5].map(i => <Star key={i} size={14} fill={i <= Math.round(product.rating || 5) ? 'currentColor' : 'none'} strokeWidth={i <= Math.round(product.rating || 5) ? 0 : 1.5} />)}</div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{product.rating || 5} ({product.reviews || 0} reviews)</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.5rem', fontSize: '0.9rem' }}>{product.description || 'Experience the perfect blend of traditional craftsmanship and contemporary design with this stunning piece.'}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem', fontSize: '0.82rem' }}>
            <div style={{ background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
              <div style={{ color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Material</div>
              <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{product.material || '22k Gold'}</div>
            </div>
            <div style={{ background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
              <div style={{ color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Weight</div>
              <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{product.weight || '14.5g'}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', color: 'var(--gold)', fontWeight: 700 }}>₹{(product.price || 0).toLocaleString('en-IN')}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <>
                <span style={{ color: 'var(--text-muted)', textDecoration: 'line-through' }}>₹{product.originalPrice.toLocaleString('en-IN')}</span>
                <span style={{ color: '#2ecc71', fontSize: '0.8rem', fontWeight: 700 }}>{discount}% OFF</span>
              </>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-primary" style={{ flex: 1, display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center' }} onClick={() => { addToCart(product); onClose(); }} id={`global-modal-atc-${product.id}`}>
              <ShoppingBag size={16} /> Add to Cart
            </button>
            <button onClick={() => toggleWishlist(product)} style={{ width: 48, height: 48, background: wishlisted ? 'var(--gold)' : 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: wishlisted ? 'var(--text-dark)' : 'var(--text-secondary)', transition: 'var(--transition)' }}>
              <Heart size={18} fill={wishlisted ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
