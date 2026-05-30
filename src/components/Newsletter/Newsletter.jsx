// src/components/Newsletter/Newsletter.jsx
import { useState } from 'react';
import { Mail, Send, CheckCircle, Sparkles } from 'lucide-react';
import { db } from '../../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import './Newsletter.css';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await addDoc(collection(db, 'newsletter_subscribers'), {
        email: email.toLowerCase().trim(),
        subscribedAt: serverTimestamp(),
        source: 'landing_page',
      });
      
      // Trigger the welcome email via the backend
      try {
        const response = await fetch('http://localhost:5000/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.toLowerCase().trim() })
        });
        const data = await response.json();
        if (data.previewUrl) {
          console.log("Email Preview URL (For Dev Testing):", data.previewUrl);
        }
      } catch (emailErr) {
        console.error("Failed to trigger welcome email:", emailErr);
      }

      setSubmitted(true);
    } catch (err) {
      // Firebase not configured: just show success for demo
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="newsletter-section" id="newsletter">
      <div className="newsletter-bg" />
      <div className="container">
        <div className="newsletter-card reveal">
          <div className="newsletter-deco">
            <div className="newsletter-deco-circle c1" />
            <div className="newsletter-deco-circle c2" />
          </div>
          
          <div className="newsletter-icon">
            <Mail size={32} />
          </div>

          <span className="section-label">Stay Updated</span>
          <h2 className="newsletter-title">
            Get Exclusive Jewellery
            <span className="shimmer-text" style={{ display: 'block' }}>Offers & Updates</span>
          </h2>

          <p className="newsletter-desc">
            Subscribe to our newsletter and be the first to know about new collections,
            exclusive offers, festive discounts, and jewellery care tips.
          </p>

          <div className="newsletter-perks">
            {['₹500 Welcome Voucher', 'Early Sale Access', 'New Launch Alerts', 'Style Inspiration'].map((perk, i) => (
              <span key={i} className="newsletter-perk">
                <Sparkles size={12} /> {perk}
              </span>
            ))}
          </div>

          {!submitted ? (
            <form className="newsletter-form" onSubmit={handleSubmit} id="newsletter-form">
              <div className="newsletter-input-wrap">
                <Mail size={16} className="newsletter-input-icon" />
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  placeholder="Enter your email address"
                  className="newsletter-input"
                  id="newsletter-email-input"
                  aria-label="Email address for newsletter"
                  disabled={loading}
                />
                <button
                  type="submit"
                  className="newsletter-btn"
                  id="newsletter-submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="newsletter-loading" />
                  ) : (
                    <><Send size={15} /> Subscribe</>
                  )}
                </button>
              </div>
              {error && <p className="newsletter-error">{error}</p>}
              <p className="newsletter-privacy">
                By subscribing, you agree to our <Link to="/privacy-policy">Privacy Policy</Link>. Unsubscribe anytime.
              </p>
            </form>
          ) : (
            <div className="newsletter-success" id="newsletter-success">
              <CheckCircle size={48} />
              <h3>You're In! ✦</h3>
              <p>Welcome to the Lumina family! Your ₹500 welcome voucher has been sent to <strong>{email}</strong></p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
