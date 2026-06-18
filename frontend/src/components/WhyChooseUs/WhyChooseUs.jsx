import { useEffect, useRef, useState } from 'react';
import { Award, Shield, Truck, RefreshCw, Gem, Headphones } from 'lucide-react';
import { useCMS } from '../../context/CMSContext';
import './WhyChooseUs.css';

const defaultFeatures = [
  { icon: 'Award', title: 'BIS Certified Gold', desc: 'All our gold jewellery comes with Bureau of Indian Standards hallmark certification, guaranteeing purity and authenticity.', color: '#C9A84C' },
  { icon: 'Shield', title: 'Secure Payment', desc: 'Multiple secure payment options including UPI, cards, and net banking with 256-bit SSL encryption for all transactions.', color: '#2ecc71' },
  { icon: 'Truck', title: 'Fast Delivery', desc: 'Insured express delivery to all major cities within 3-5 business days, with real-time tracking available 24/7.', color: '#3498db' },
  { icon: 'RefreshCw', title: 'Easy Returns', desc: '15-day hassle-free return policy. Not satisfied? Return it with our pre-paid shipping label, no questions asked.', color: '#e74c3c' },
  { icon: 'Gem', title: 'Premium Quality', desc: 'Each piece passes rigorous quality checks by our expert gemologists before reaching your doorstep.', color: '#9b59b6' },
  { icon: 'Headphones', title: '24/7 Support', desc: 'Our dedicated customer care team is available round the clock to assist you via call, chat, or email.', color: '#e67e22' },
];

const defaultCounters = [
  { target: 25, suffix: '+', label: 'Years in Business' },
  { target: 50, suffix: 'K+', label: 'Happy Customers' },
  { target: 10, suffix: 'K+', label: 'Unique Designs' },
  { target: 99, suffix: '%', label: 'Satisfaction Rate' },
];

import { CheckCircle, Star, Heart } from 'lucide-react';

const getIconComponent = (iconName, size) => {
  switch (iconName) {
    case 'Award': return <Award size={size} />;
    case 'Shield': return <Shield size={size} />;
    case 'Truck': return <Truck size={size} />;
    case 'RefreshCw': return <RefreshCw size={size} />;
    case 'Gem': return <Gem size={size} />;
    case 'Headphones': return <Headphones size={size} />;
    case 'CheckCircle': return <CheckCircle size={size} />;
    case 'Star': return <Star size={size} />;
    case 'Heart': return <Heart size={size} />;
    default: return <Award size={size} />;
  }
};

function AnimatedCounter({ target, suffix }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const animated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !animated.current) {
        animated.current = true;
        let start = 0;
        const duration = 2000;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
          start = Math.min(start + step, target);
          setCount(Math.floor(start));
          if (start >= target) clearInterval(timer);
        }, 16);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export default function WhyChooseUs() {
  const { landingPageData } = useCMS();
  
  const wcu = landingPageData?.whyChooseUs || {
    sectionLabel: 'Our Promise',
    title: 'Why Choose Lumina?',
    subtitle: 'We don\'t just sell jewellery — we promise an experience of trust, quality, and elegance.',
    stats: defaultCounters,
    features: defaultFeatures
  };

  const activeStats = (wcu.stats?.length > 0) ? wcu.stats : defaultCounters;
  const activeFeatures = (wcu.features?.length > 0) ? wcu.features : defaultFeatures;

  return (
    <section className="why-section" id="why-choose-us">
      <div className="container">
        <div className="section-header reveal">
          <span className="section-label">{wcu.sectionLabel}</span>
          <h2 className="section-title">{wcu.title}</h2>
          <div className="gold-divider" />
          <p className="section-subtitle">
            {wcu.subtitle}
          </p>
        </div>

        <div className="why-counters reveal">
          {activeStats.map((stat, i) => (
            <div key={i} className="why-counter">
              <div className="why-counter-value">
                <AnimatedCounter target={stat.target} suffix={stat.suffix} />
              </div>
              <div className="why-counter-label">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="why-grid">
          {activeFeatures.map((f, i) => (
            <div key={i} className="why-card reveal" style={{ transitionDelay: `${i * 0.1}s` }} id={`why-card-${i}`}>
              <div className="why-card-icon" style={{ '--icon-color': f.color }}>
                {getIconComponent(f.icon, 28)}
              </div>
              <h3 className="why-card-title">{f.title}</h3>
              <p className="why-card-desc">{f.desc}</p>
              <div className="why-card-line" style={{ background: f.color }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
