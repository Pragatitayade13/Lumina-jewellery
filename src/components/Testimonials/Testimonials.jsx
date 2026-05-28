// src/components/Testimonials/Testimonials.jsx
import { useState, useEffect, useRef } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import './Testimonials.css';

const testimonials = [
  { id: 1, name: 'Priya Sharma', city: 'Mumbai', rating: 5, text: 'Absolutely stunning bridal set! The craftsmanship is beyond compare. Received so many compliments at my wedding. Lumina Jewels made my special day even more magical.', initials: 'PS', color: '#C9A84C' },
  { id: 2, name: 'Ananya Reddy', city: 'Hyderabad', rating: 5, text: 'The diamond pendant I ordered arrived beautifully packaged and looks even better in person. Genuine BIS hallmark certified. Will definitely order again!', initials: 'AR', color: '#8B1A2E' },
  { id: 3, name: 'Meera Krishnan', city: 'Chennai', rating: 5, text: 'I have been buying jewellery from Lumina for 5 years now. The quality is consistently exceptional. Their customer service team is also incredibly helpful.', initials: 'MK', color: '#1A4A2E' },
  { id: 4, name: 'Sunita Gupta', city: 'Delhi', rating: 4, text: 'Beautiful gold bangles, exactly as shown in the photos. The weight and finish are premium. Delivery was fast and secure. Highly recommend to everyone!', initials: 'SG', color: '#1A2E5E' },
  { id: 5, name: 'Kavita Patel', city: 'Ahmedabad', rating: 5, text: 'Got the Heritage Jhumkas and they are magnificent! The ruby accents add such elegance. My mother-in-law was thoroughly impressed. Thank you Lumina Jewels!', initials: 'KP', color: '#4A1A5E' },
];

function StarRating({ rating }) {
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={14} fill={i <= rating ? 'currentColor' : 'none'} strokeWidth={i <= rating ? 0 : 1.5} />
      ))}
    </div>
  );
}

export default function Testimonials() {
  const [active, setActive] = useState(0);
  const [isAuto, setIsAuto] = useState(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!isAuto) return;
    intervalRef.current = setInterval(() => {
      setActive(p => (p + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(intervalRef.current);
  }, [isAuto]);

  const go = (dir) => {
    setIsAuto(false);
    setActive(p => (p + dir + testimonials.length) % testimonials.length);
  };

  return (
    <section className="testimonials-section" id="testimonials">
      <div className="testimonials-bg" />
      <div className="container">
        <div className="section-header reveal">
          <span className="section-label">Customer Love</span>
          <h2 className="section-title">What Our Customers Say</h2>
          <div className="gold-divider" />
          <p className="section-subtitle">Real experiences from real jewellery lovers across India.</p>
        </div>

        <div className="testimonials-slider reveal">
          {/* Main Card */}
          <div className="testimonials-main">
            <div className="quote-icon"><Quote size={32} /></div>
            {testimonials.map((t, i) => (
              <div
                key={t.id}
                className={`testimonial-card${i === active ? ' active' : ''}`}
              >
                <StarRating rating={t.rating} />
                <p className="testimonial-text">"{t.text}"</p>
                <div className="testimonial-author">
                  <div className="author-avatar" style={{ background: t.color }}>
                    {t.initials}
                  </div>
                  <div>
                    <div className="author-name">{t.name}</div>
                    <div className="author-city">{t.city}</div>
                  </div>
                </div>
              </div>
            ))}

            <div className="testimonial-controls">
              <button className="testimonial-arrow" onClick={() => go(-1)} id="testimonial-prev-btn">
                <ChevronLeft size={18} />
              </button>
              <div className="testimonial-dots">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    className={`testimonial-dot${i === active ? ' active' : ''}`}
                    onClick={() => { setIsAuto(false); setActive(i); }}
                    id={`testimonial-dot-${i}`}
                  />
                ))}
              </div>
              <button className="testimonial-arrow" onClick={() => go(1)} id="testimonial-next-btn">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Sidebar Thumbnails */}
          <div className="testimonials-sidebar">
            {testimonials.map((t, i) => (
              <div
                key={t.id}
                className={`testimonial-thumb${i === active ? ' active' : ''}`}
                onClick={() => { setIsAuto(false); setActive(i); }}
                id={`testimonial-thumb-${i}`}
              >
                <div className="author-avatar sm" style={{ background: t.color }}>{t.initials}</div>
                <div>
                  <div className="author-name sm">{t.name}</div>
                  <StarRating rating={t.rating} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="testimonial-stats reveal">
          {[
            { value: '4.9/5', label: 'Average Rating', sub: 'Based on 10,000+ reviews' },
            { value: '98%', label: 'Satisfaction Rate', sub: 'Would recommend us' },
            { value: '50K+', label: 'Happy Customers', sub: 'And growing every day' },
          ].map((s, i) => (
            <div key={i} className="t-stat-card">
              <div className="t-stat-value">{s.value}</div>
              <div className="t-stat-label">{s.label}</div>
              <div className="t-stat-sub">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
