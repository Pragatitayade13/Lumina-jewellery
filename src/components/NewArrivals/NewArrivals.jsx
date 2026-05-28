// src/components/NewArrivals/NewArrivals.jsx
import { useState } from 'react';
import { ArrowRight, X, ShoppingBag, Heart, Star } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { products as staticProducts } from '../../data/products';
import { useProducts } from '../../hooks/useProducts';
import ProductCard from '../ProductCard/ProductCard';
import './NewArrivals.css';

function QuickViewModal({ product, onClose }) {
  const { addToCart, toggleWishlist, isWishlisted } = useApp();
  if (!product) return null;
  const wishlisted = isWishlisted(product.id);
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ display: 'flex', maxWidth: '800px' }}>
        <div style={{ flex: '0 0 45%', background: 'var(--surface)' }}>
          <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-xl) 0 0 var(--radius-xl)' }} />
        </div>
        <div style={{ flex: 1, padding: '2.5rem' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <X size={16} />
          </button>
          <span style={{ fontSize: '0.72rem', letterSpacing: '0.2em', color: 'var(--gold)', fontWeight: 600, textTransform: 'uppercase' }}>{product.category}</span>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', margin: '0.5rem 0 0.75rem', color: 'var(--text-primary)' }}>{product.name}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <div className="stars">{[1,2,3,4,5].map(i => <Star key={i} size={14} fill={i <= Math.round(product.rating) ? 'currentColor' : 'none'} strokeWidth={i <= Math.round(product.rating) ? 0 : 1.5} />)}</div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{product.rating} ({product.reviews} reviews)</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.5rem', fontSize: '0.9rem' }}>{product.description}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem', fontSize: '0.82rem' }}>
            <div style={{ background: 'var(--surface)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
              <div style={{ color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Material</div>
              <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{product.material}</div>
            </div>
            <div style={{ background: 'var(--surface)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
              <div style={{ color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Weight</div>
              <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{product.weight}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', color: 'var(--gold)', fontWeight: 700 }}>₹{product.price.toLocaleString('en-IN')}</span>
            <span style={{ color: 'var(--text-muted)', textDecoration: 'line-through' }}>₹{product.originalPrice.toLocaleString('en-IN')}</span>
            <span style={{ color: '#2ecc71', fontSize: '0.8rem', fontWeight: 700 }}>{discount}% OFF</span>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => { addToCart(product); onClose(); }} id={`modal-atc-${product.id}`}>
              <ShoppingBag size={16} /> Add to Cart
            </button>
            <button onClick={() => toggleWishlist(product)} style={{ width: 48, height: 48, background: wishlisted ? 'var(--gold)' : 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: wishlisted ? 'var(--text-dark)' : 'var(--text-secondary)', transition: 'var(--transition)' }}>
              <Heart size={18} fill={wishlisted ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewArrivals() {
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const { products: fbProducts } = useProducts();
  
  const displayProducts = fbProducts.length > 0 ? fbProducts : staticProducts;
  const newProducts = displayProducts.filter(p => p.isNew).concat(displayProducts.slice(0, 4)).slice(0, 4);

  return (
    <section className="new-arrivals-section" id="new-arrivals">
      <div className="container">
        <div className="section-header reveal">
          <span className="section-label">Just Arrived</span>
          <h2 className="section-title">New Arrivals</h2>
          <div className="gold-divider" />
          <p className="section-subtitle">
            Discover our latest jewellery pieces fresh from our master craftsmen's studios.
          </p>
        </div>

        <div className="products-grid">
          {newProducts.map((product, i) => (
            <div key={product.id} className="reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
              <ProductCard product={product} onQuickView={setQuickViewProduct} />
            </div>
          ))}
        </div>

        <div className="section-actions reveal">
          <button
            className="btn btn-outline"
            id="view-all-new-arrivals-btn"
            onClick={() => {}}
          >
            View All New Arrivals <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {quickViewProduct && (
        <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
      )}
    </section>
  );
}
