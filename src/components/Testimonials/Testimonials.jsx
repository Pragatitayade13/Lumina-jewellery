// src/components/Testimonials/Testimonials.jsx
import { useState, useEffect, useRef } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './Testimonials.css';

const defaultTestimonials = [
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

import { useCMS } from '../../context/CMSContext';

export default function Testimonials() {
  const { landingPageData } = useCMS();
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(0);

  const testData = landingPageData?.testimonials || {
    sectionLabel: 'Customer Love',
    title: 'What Our Customers Say',
    subtitle: 'Real experiences from real jewellery lovers across India.',
    stats: {
      avgRating: { value: '4.9/5', sub: 'Based on 10,000+ reviews' },
      satisfaction: { value: '98%', sub: 'Would recommend us' }
    }
  };

  const activeTestimonials = (landingPageData?.testimonials?.reviews?.length > 0) 
    ? landingPageData.testimonials.reviews 
    : defaultTestimonials;

  // Sync Happy Customers from WhyChooseUs stats if available
  const happyCustomerStat = landingPageData?.whyChooseUs?.stats?.find(s => s.label.toLowerCase().includes('happy'));
  const happyCustomerLabel = happyCustomerStat ? `${happyCustomerStat.target}${happyCustomerStat.suffix}` : (landingPageData?.brandStory?.badges?.[3]?.label || '50,000+');
  const happyCustomerSub = happyCustomerStat ? 'And growing every day' : (landingPageData?.brandStory?.badges?.[3]?.sub || 'And growing every day');

  const next = () => {
    setActive((p) => (p + 1) % activeTestimonials.length);
  };

  const prev = () => {
    setActive((p) => (p - 1 + activeTestimonials.length) % activeTestimonials.length);
  };

  const handleDrag = (e, info) => {
    if (info.offset.x > 100) {
      prev();
    } else if (info.offset.x < -100) {
      next();
    }
  };

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.9,
    })
  };

  const paginate = (newDirection) => {
    setDirection(newDirection);
    if (newDirection === 1) next();
    if (newDirection === -1) prev();
  };

  // Auto scroll effect
  useEffect(() => {
    const timer = setInterval(() => {
      paginate(1);
    }, 6000);
    return () => clearInterval(timer);
  }, [activeTestimonials.length]);

  return (
    <section className="testimonials-section" id="testimonials">
      <div className="testimonials-bg" />
      <div className="container">
        <div className="section-header reveal">
          <span className="section-label">{testData.sectionLabel}</span>
          <h2 className="section-title">{testData.title}</h2>
          <div className="gold-divider" />
          <p className="section-subtitle">{testData.subtitle}</p>
        </div>

        <div className="testimonials-slider reveal">
          {/* Main Card */}
          <div className="testimonials-main">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={active}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 }
                }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={handleDrag}
                className="testimonial-card"
              >
                <div className="quote-icon">
                  <Quote size={40} />
                </div>
                
                <div className="stars">
                  {[...Array(activeTestimonials[active].rating)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                
                <p className="testimonial-text">
                  "{activeTestimonials[active].text}"
                </p>
                
                <div className="testimonial-author">
                  <div className="author-avatar" style={{ backgroundColor: activeTestimonials[active].color }}>
                    {activeTestimonials[active].initials}
                  </div>
                  <div>
                    <h4 className="author-name">{activeTestimonials[active].name}</h4>
                    <p className="author-city">{activeTestimonials[active].city}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="testimonial-controls">
              <button className="testimonial-arrow" onClick={() => paginate(-1)}>
                <ChevronLeft size={20} />
              </button>
              <div className="testimonial-dots">
                {activeTestimonials.map((_, i) => (
                  <button 
                    key={i}
                    className={`testimonial-dot ${i === active ? 'active' : ''}`}
                    onClick={() => {
                      setDirection(i > active ? 1 : -1);
                      setActive(i);
                    }}
                  />
                ))}
              </div>
              <button className="testimonial-arrow" onClick={() => paginate(1)}>
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="testimonial-stats reveal">
          <div className="t-stat-card">
            <div className="t-stat-value">{testData.stats?.avgRating?.value || '4.9/5'}</div>
            <div className="t-stat-label">Average Rating</div>
            <div className="t-stat-sub">{testData.stats?.avgRating?.sub || 'Based on 10,000+ reviews'}</div>
          </div>
          <div className="t-stat-card">
            <div className="t-stat-value">{testData.stats?.satisfaction?.value || '98%'}</div>
            <div className="t-stat-label">Satisfaction Rate</div>
            <div className="t-stat-sub">{testData.stats?.satisfaction?.sub || 'Would recommend us'}</div>
          </div>
          <div className="t-stat-card">
            <div className="t-stat-value">{happyCustomerLabel}</div>
            <div className="t-stat-label">Happy Customers</div>
            <div className="t-stat-sub">{happyCustomerSub}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
