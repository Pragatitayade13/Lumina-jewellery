import { Heart, ShoppingBag, Eye, Star, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import './ProductCard.css';

import TiltCard from '../TiltCard/TiltCard';

function StarRating({ rating }) {
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={12}
          fill={i <= Math.round(rating) ? 'currentColor' : 'none'}
          strokeWidth={i <= Math.round(rating) ? 0 : 1.5}
        />
      ))}
    </div>
  );
}

function getBadgeClass(badge) {
  if (badge === 'Hot') return 'badge badge-hot';
  if (badge === 'New') return 'badge badge-new';
  return 'badge badge-gold';
}

function getDiscount(price, original) {
  return Math.round(((original - price) / original) * 100);
}

export default function ProductCard({ product }) {
  const { addToCart, toggleWishlist, isWishlisted, setQuickViewProduct, setVtoProduct } = useApp();
  const wishlisted = isWishlisted(product.id);
  const original = product.originalPrice || product.mrp || product.price || 0;
  const current = product.price || 0;
  const discount = getDiscount(current, original);

  return (
    <TiltCard tiltMax={10}>
      <div className="product-card" id={`product-card-${product.id}`}>
        <div className="product-card-img-wrap">
          <Link to={`/product/${product.id}`} style={{ display: 'block', width: '100%', height: '100%' }}>
            <img src={product.image} alt={product.name} className="product-card-img" loading="lazy" />
          </Link>
          
          {product.badge && (
            <div className="product-card-badge">
              <span className={getBadgeClass(product.badge)}>{product.badge}</span>
            </div>
          )}

          <div className="product-quick-view" onClick={(e) => { e.stopPropagation(); setQuickViewProduct(product); }}>
            ◈ Quick View
          </div>
        </div>

        <div className="product-card-body">
          <div className="product-card-category">{product.category}</div>
          <Link to={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
            <div className="product-card-name">{product.name}</div>
          </Link>
          <div className="product-card-rating">
            <StarRating rating={product.rating} />
            <span className="rating-count">({product.reviews})</span>
          </div>
          <div className="product-card-footer">
            <div className="price-wrap">
              <span className="price-current">₹{current.toLocaleString('en-IN')}</span>
              {original > current && (
                <>
                  <span className="price-original">₹{original.toLocaleString('en-IN')}</span>
                  <span className="price-discount">{discount}% off</span>
                </>
              )}
            </div>
            <div className="footer-right-actions">
              <div className="product-actions-vertical">
                <button
                  className={`product-action-btn-small${wishlisted ? ' active' : ''}`}
                  onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
                  aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart size={14} fill={wishlisted ? 'currentColor' : 'none'} />
                </button>
                <button
                  className="product-action-btn-small"
                  onClick={(e) => { e.stopPropagation(); setQuickViewProduct(product); }}
                  aria-label="Quick view"
                >
                  <Eye size={14} />
                </button>
                <button
                  className="product-action-btn-small"
                  onClick={(e) => { e.stopPropagation(); setVtoProduct(product); }}
                  aria-label="Virtual Try On"
                >
                  <Camera size={14} />
                </button>
              </div>
              <button
                className="add-to-cart-btn"
                onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                aria-label={`Add ${product.name} to cart`}
                id={`atc-btn-${product.id}`}
              >
                <ShoppingBag size={13} />
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </TiltCard>
  );
}
