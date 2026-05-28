import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import heroBg1 from '../../assets/hero_gold_promo_1779901152036.png';
import heroBg2 from '../../assets/hero_bridal_1779901185653.png';
import heroBg3 from '../../assets/hero_festive_1779901227607.png';
import './Hero.css';

const slides = [
  {
    id: 1,
    badge: '✦ New Collection 2026',
    title: 'Where Gold',
    titleAccent: 'Tells Stories',
    subtitle: 'Discover our exquisite gold jewellery collection — crafted by master artisans with generations of expertise.',
    bg: heroBg1,
    ctas: [
      { label: 'Shop Gold', href: '#new-arrivals', primary: true },
      { label: 'Explore Collection', href: '#categories', primary: false },
    ],
  },
  {
    id: 2,
    badge: '✦ Bridal 2026',
    title: 'Your Perfect',
    titleAccent: 'Bridal Look',
    subtitle: 'Complete bridal sets crafted for the most special day of your life. Diamond-studded elegance meets tradition.',
    bg: heroBg2,
    ctas: [
      { label: 'Explore Bridal', href: '#categories', primary: true },
      { label: 'View Offers', href: '#exclusive-offers', primary: false },
    ],
  },
  {
    id: 3,
    badge: '✦ Festive Sale',
    title: 'Flat 20% Off',
    titleAccent: 'Festive Collection',
    subtitle: 'Celebrate every occasion with our handcrafted festive jewellery. Limited time offers with exclusive coupon codes.',
    bg: heroBg3,
    ctas: [
      { label: 'Shop Sale', href: '#exclusive-offers', primary: true },
      { label: 'New Arrivals', href: '#new-arrivals', primary: false },
    ],
  },
];

const stats = [
  { value: '25+', label: 'Years of Craft' },
  { value: '50K+', label: 'Happy Customers' },
  { value: '10K+', label: 'Unique Designs' },
];

export default function Hero() {
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const next = useCallback(() => setActive(p => (p + 1) % slides.length), []);
  const prev = useCallback(() => setActive(p => (p - 1 + slides.length) % slides.length), []);

  useEffect(() => {
    if (isPaused) return;
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  }, [next, isPaused]);

  const handleCTA = (href) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
      {/* Background Slides */}
      <AnimatePresence initial={false}>
        <motion.div 
          key={`bg-${active}`}
          className="hero-slide active"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          <div
            className="hero-slide-bg"
            style={{ backgroundImage: `url(${slides[active].bg})` }}
          />
          <div className="hero-overlay" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="hero-content-wrap">
        <div className="hero-container">
          <AnimatePresence mode="wait">
            <motion.div 
              key={`content-${active}`}
              className="hero-slide-content"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
                exit: { opacity: 0, transition: { duration: 0.3 } }
              }}
            >
              <motion.span 
                className="hero-badge"
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              >
                <Sparkles size={12} />{slides[active].badge}
              </motion.span>
              
              <motion.h1 
                className="hero-title"
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              >
                {slides[active].title}<span>{slides[active].titleAccent}</span>
              </motion.h1>
              
              <motion.p 
                className="hero-subtitle"
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              >
                {slides[active].subtitle}
              </motion.p>
              
              <motion.div 
                className="hero-actions"
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              >
                {slides[active].ctas.map(cta => (
                  <button
                    key={cta.label}
                    className={`btn ${cta.primary ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => handleCTA(cta.href)}
                    id={`hero-cta-${cta.label.replace(/\s+/g, '-').toLowerCase()}`}
                  >
                    {cta.label}
                  </button>
                ))}
              </motion.div>
              
              <motion.div 
                className="hero-stats"
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              >
                {stats.map(s => (
                  <div key={s.label}>
                    <div className="hero-stat-value">{s.value}</div>
                    <div className="hero-stat-label">{s.label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Arrows */}
      <button className="hero-arrow hero-arrow-prev" onClick={prev} id="hero-prev-btn" aria-label="Previous slide">
        <ChevronLeft size={20} />
      </button>
      <button className="hero-arrow hero-arrow-next" onClick={next} id="hero-next-btn" aria-label="Next slide">
        <ChevronRight size={20} />
      </button>

      {/* Dots */}
      <div className="hero-dots">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`hero-dot${i === active ? ' active' : ''}`}
            onClick={() => setActive(i)}
            id={`hero-dot-${i}`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Scroll Indicator */}
      <div className="hero-scroll-indicator">
        <span>Scroll</span>
        <div className="scroll-line" />
      </div>
    </section>
  );
}
