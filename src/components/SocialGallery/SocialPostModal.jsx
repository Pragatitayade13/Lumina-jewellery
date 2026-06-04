import React, { useEffect, useState } from 'react';
import { X, Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';
import './SocialGallery.css';

export default function SocialPostModal({ isOpen, onClose, post }) {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  // Reset state when post changes
  useEffect(() => {
    setIsLiked(false);
    setIsSaved(false);
    setComments([
      { id: 1, user: 'jewelrylover99', text: 'Absolutely stunning! 😍' },
      { id: 2, user: 'styleicon', text: 'Need this in my collection ASAP.' }
    ]);
    setNewComment('');
  }, [post]);

  // Scroll lock removed as requested

  if (!isOpen || !post) return null;

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title || 'Lumina Jewels',
          text: post.description,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    setComments([...comments, {
      id: Date.now(),
      user: 'you',
      text: newComment
    }]);
    setNewComment('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content social-modal-content" onClick={e => e.stopPropagation()}>
        <button className="social-modal-close" onClick={onClose} aria-label="Close">
          <X size={24} />
        </button>
        
        <div className="social-post-layout">
          {/* Image Section */}
          <div className="social-post-image-container">
            <img
              src={post.image || post.img}
              alt={post.title || post.tag}
              className="social-post-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/src/assets/product_1_1779901454806.png';
              }}
            />
          </div>

          {/* Details Section */}
          <div className="social-post-details">
            {/* Header */}
            <div className="social-post-header" style={{ paddingRight: '3.5rem' }}>
              <div className="social-post-avatar">LJ</div>
              <div className="social-post-author">
                <h4>Lumina Jewels</h4>
                <p>Luxury Jewellery</p>
              </div>
              <button 
                className={isFollowing ? 'btn-ghost' : 'btn-outline'} 
                style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', marginLeft: 'auto', borderRadius: 'var(--radius-full)' }}
                onClick={() => setIsFollowing(!isFollowing)}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            </div>

            {/* Content & Comments */}
            <div className="social-post-body" data-lenis-prevent>
              <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                <h3 className="shimmer-text" style={{ fontSize: '1.5rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
                  {post.title || post.tag}
                </h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                  {post.description || "Discover the elegance of our latest collection. Each piece is crafted with precision and passion, designed to illuminate your everyday moments."}
                </p>
                <div style={{ color: 'var(--gold)', fontSize: '0.9rem', display: 'flex', gap: '8px' }}>
                  {post.tag && <span>{post.tag}</span>}
                  <span>#LuxuryJewellery</span>
                  <span>#Diamonds</span>
                </div>
              </div>
              
              {/* Comments List */}
              <div className="social-comments-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {comments.map(comment => (
                  <div key={comment.id} style={{ display: 'flex', gap: '10px', fontSize: '0.9rem' }}>
                    <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{comment.user}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{comment.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer / Actions */}
            <div className="social-post-footer">
              <div className="social-post-actions">
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <Heart 
                    size={24} 
                    className="social-action-icon" 
                    fill={isLiked ? 'var(--accent-ruby, #e11d48)' : 'none'}
                    color={isLiked ? 'var(--accent-ruby, #e11d48)' : 'currentColor'}
                    onClick={() => setIsLiked(!isLiked)}
                  />
                  <label htmlFor="comment-input" style={{ margin: 0, padding: 0 }}>
                    <MessageCircle size={24} className="social-action-icon" />
                  </label>
                  <Share2 size={24} className="social-action-icon" onClick={handleShare} />
                </div>
                <Bookmark 
                  size={24} 
                  className="social-action-icon" 
                  fill={isSaved ? 'currentColor' : 'none'}
                  onClick={() => {
                    setIsSaved(!isSaved);
                    if (!isSaved) alert('Saved to your collection');
                  }}
                />
              </div>
              <div className="social-post-likes">
                {(post.likes + (isLiked ? 1 : 0) || 1247).toLocaleString()} likes
              </div>
              <div className="social-post-date" style={{ marginBottom: '12px' }}>
                {post.createdAt?.toDate ? new Date(post.createdAt.toDate()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Just now'}
              </div>
              
              {/* Add Comment Input */}
              <form onSubmit={handleAddComment} style={{ display: 'flex', borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: '4px' }}>
                <input
                  id="comment-input"
                  type="text"
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  style={{ 
                    flex: 1, 
                    background: 'transparent', 
                    border: 'none', 
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontSize: '0.9rem'
                  }}
                />
                <button 
                  type="submit" 
                  disabled={!newComment.trim()}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: newComment.trim() ? 'var(--gold)' : 'var(--text-muted)',
                    fontWeight: 'bold',
                    cursor: newComment.trim() ? 'pointer' : 'default',
                    transition: 'color 0.2s'
                  }}
                >
                  Post
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

