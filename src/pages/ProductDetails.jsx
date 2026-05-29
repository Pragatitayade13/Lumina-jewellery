import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Heart, Shield, Truck, RotateCcw, ChevronLeft, Star, Edit3, X, Camera } from 'lucide-react';
import { useInventory } from '../hooks/useInventory';
import { useReviews } from '../hooks/useReviews';
import { useApp } from '../context/AppContext';
import VirtualTryOn from '../components/VirtualTryOn/VirtualTryOn';
import './ProductDetails.css';

export default function ProductDetails() {
  const { id } = useParams();
  const { inventory, loading } = useInventory();
  const { reviews, loading: reviewsLoading, addReview } = useReviews(id);
  const { addToCart, toggleWishlist, isWishlisted, user, showToast } = useApp();
  
  const [product, setProduct] = useState(null);
  
  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, snippet: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // VTO State
  const [vtoOpen, setVtoOpen] = useState(false);

  const avgRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + Number(r.rating), 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  useEffect(() => {
    if (!loading && inventory.length > 0) {
      const found = inventory.find(item => item.id === id || item.sku === id);
      setProduct(found);
    }
  }, [id, inventory, loading]);

  const handleAddToCart = () => {
    addToCart(product);
  };

  const handleAddToWishlist = () => {
    toggleWishlist(product);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast("Please login to write a review", "error");
      return;
    }
    setIsSubmittingReview(true);
    try {
      await addReview({
        rating: reviewForm.rating,
        snippet: reviewForm.snippet,
        author: user.name || 'Customer'
      });
      showToast("Review submitted successfully!");
      setReviewModalOpen(false);
      setReviewForm({ rating: 5, snippet: '' });
    } catch (err) {
      showToast("Failed to submit review", "error");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading) {
    return <div className="pd-loading">Loading product details...</div>;
  }

  if (!product) {
    return (
      <div className="pd-not-found">
        <h2>Product Not Found</h2>
        <p>The product you are looking for does not exist or has been removed.</p>
        <Link to="/collections" className="btn btn-outline">Back to Collections</Link>
      </div>
    );
  }

  return (
    <div className="product-details-page">
      <div className="pd-container">
        <div className="pd-breadcrumb">
          <Link to="/collections"><ChevronLeft size={16} /> Back to Collections</Link>
        </div>
        
        <div className="pd-grid">
          <div className="pd-image-section">
            <div className="pd-main-image">
              {product.image ? (
                <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                product.name.charAt(0)
              )}
            </div>
            {product.status === 'out' && <div className="pd-badge out-stock">Out of Stock</div>}
          </div>

          <div className="pd-info-section">
            <div className="pd-category">{product.category}</div>
            <h1 className="pd-title">{product.name}</h1>
            <div className="pd-sku">SKU: {product.sku}</div>
            
            <div className="pd-price-wrap">
              <div className="pd-price">₹{product.price.toLocaleString()}</div>
              <div className="pd-tax-note">Inclusive of all taxes</div>
            </div>

            <div className="pd-description">
              <p>Experience the epitome of luxury with this handcrafted masterpiece. Meticulously designed by our master artisans to bring unparalleled elegance to your collection.</p>
            </div>

            <div className="pd-stock-status">
              {product.status === 'out' ? (
                <span style={{ color: 'var(--status-red)' }}>Currently out of stock</span>
              ) : product.status === 'low' || product.status === 'critical' ? (
                <span style={{ color: 'var(--status-yellow)' }}>Only {product.stock} left in stock - order soon!</span>
              ) : (
                <span style={{ color: 'var(--status-green)' }}>In Stock & Ready to Ship</span>
              )}
            </div>

            <div className="pd-specs">
              <div className="spec-row">
                <span className="spec-label">Approx Weight:</span> 
                <span className="spec-value">{product.weight || 'Contact for details'}</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Material / Purity:</span> 
                <span className="spec-value">{product.purity || 'Standard'}</span>
              </div>
            </div>

            <div className="pd-actions" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button 
                className="btn btn-gold pd-btn-cart" 
                onClick={handleAddToCart}
                disabled={product.status === 'out'}
                style={{ flex: 2 }}
              >
                <ShoppingCart size={20} /> {product.status === 'out' ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button 
                className="btn btn-outline" 
                onClick={() => setVtoOpen(true)}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <Camera size={20} /> Try it On
              </button>
              <button className="btn btn-outline pd-btn-wishlist" onClick={handleAddToWishlist} title={isWishlisted(product.id) ? "Remove from Wishlist" : "Add to Wishlist"} style={{ width: 'auto', padding: '0 1.5rem' }}>
                <Heart size={20} fill={isWishlisted(product.id) ? "var(--gold)" : "none"} color={isWishlisted(product.id) ? "var(--gold)" : "currentColor"} />
              </button>
            </div>

            <div className="pd-features">
              <div className="pd-feature-item">
                <Shield size={24} />
                <div>
                  <h4>Lifetime Warranty</h4>
                  <p>Guaranteed purity and craftsmanship</p>
                </div>
              </div>
              <div className="pd-feature-item">
                <Truck size={24} />
                <div>
                  <h4>Insured Shipping</h4>
                  <p>100% secure transit to your doorstep</p>
                </div>
              </div>
              <div className="pd-feature-item">
                <RotateCcw size={24} />
                <div>
                  <h4>15-Day Returns</h4>
                  <p>No questions asked return policy</p>
                </div>
              </div>
            </div>

            <div className="pd-reviews">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0 }}>Customer Reviews</h3>
                <button className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }} onClick={() => setReviewModalOpen(true)}>
                  <Edit3 size={14} /> Write a Review
                </button>
              </div>

              {reviews.length === 0 ? (
                <div style={{ color: 'var(--text-muted)' }}>Be the first to review this product!</div>
              ) : (
                <>
                  <div className="review-stars" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <span style={{ color: 'var(--gold)' }}>
                      {'★'.repeat(Math.round(avgRating))}{'☆'.repeat(5 - Math.round(avgRating))}
                    </span> 
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      ({avgRating}/5 based on {reviews.length} reviews)
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {reviews.map(review => (
                      <div key={review.id} className="review-card">
                        <div className="review-header">
                          <strong>{review.author}</strong> <span className="verified">✓ Verified Buyer</span>
                          <span style={{ marginLeft: 'auto', color: 'var(--gold)', float: 'right' }}>
                            {'★'.repeat(Number(review.rating))}{'☆'.repeat(5 - Number(review.rating))}
                          </span>
                        </div>
                        <p className="review-snippet">"{review.snippet}"</p>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>{review.date}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Write Review Modal */}
      {reviewModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 9999, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-box" style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '500px', border: '1px solid var(--border-color)' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ color: 'var(--gold)', margin: 0 }}>Write a Review</h3>
              <button onClick={() => setReviewModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmitReview}>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Rating (1-5)</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {[1,2,3,4,5].map(num => (
                    <button 
                      key={num} 
                      type="button" 
                      onClick={() => setReviewForm({...reviewForm, rating: num})}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      <Star size={28} fill={num <= reviewForm.rating ? "var(--gold)" : "none"} color={num <= reviewForm.rating ? "var(--gold)" : "var(--text-muted)"} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Your Review</label>
                <textarea 
                  required 
                  className="form-input" 
                  style={{ width: '100%', padding: '0.8rem', background: 'var(--surface)', border: '1px solid var(--border-color)', color: '#fff', borderRadius: '4px', height: '100px', resize: 'none' }} 
                  placeholder="Share your shopping experience and product feedback..."
                  value={reviewForm.snippet}
                  onChange={e => setReviewForm({...reviewForm, snippet: e.target.value})}
                ></textarea>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setReviewModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-gold" disabled={isSubmittingReview}>
                  {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Virtual Try-On Modal */}
      <VirtualTryOn isOpen={vtoOpen} onClose={() => setVtoOpen(false)} product={product} />
    </div>
  );
}
