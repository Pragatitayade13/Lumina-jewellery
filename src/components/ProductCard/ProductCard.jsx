// src/components/ProductCard/ProductCard.jsx
import { Heart, ShoppingBag, Eye, Star } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import './ProductCard.css';

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

export default function ProductCard({ product, onQuickView }) {
  const { addToCart, toggleWishlist, isWishlisted } = useApp();
  const wishlisted = isWishlisted(product.id);
  const original = product.originalPrice || product.mrp || product.price || 0;
  const current = product.price || 0;
  const discount = getDiscount(current, original);

  return (
    <div className="product-card" id={`product-card-${product.id}`}>
      <div className="product-card-img-wrap">
        <img src={product.image} alt={product.name} className="product-card-img" loading="lazy" />
        
        {product.badge && (
          <div className="product-card-badge">
            <span className={getBadgeClass(product.badge)}>{product.badge}</span>
          </div>
        )}

        <div className="product-card-actions">
          <button
            className={`product-action-btn${wishlisted ? ' active' : ''}`}
            onClick={() => toggleWishlist(product)}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            id={`wishlist-btn-${product.id}`}
          >
            <Heart size={14} fill={wishlisted ? 'currentColor' : 'none'} />
          </button>
          <button
            className="product-action-btn"
            onClick={() => onQuickView && onQuickView(product)}
            aria-label="Quick view"
            id={`quickview-btn-${product.id}`}
          >
            <Eye size={14} />
          </button>
        </div>

        <div className="product-quick-view" onClick={() => onQuickView && onQuickView(product)}>
          ◈ Quick View
        </div>
      </div>

      <div className="product-card-body">
        <div className="product-card-category">{product.category}</div>
        <div className="product-card-name">{product.name}</div>
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
          <button
            className="add-to-cart-btn"
            onClick={() => addToCart(product)}
            aria-label={`Add ${product.name} to cart`}
            id={`atc-btn-${product.id}`}
          >
            <ShoppingBag size={13} />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
