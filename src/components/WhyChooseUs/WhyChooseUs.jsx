// src/components/WhyChooseUs/WhyChooseUs.jsx
import { useEffect, useRef, useState } from 'react';
import { Award, Shield, Truck, RefreshCw, Gem, Headphones } from 'lucide-react';
import './WhyChooseUs.css';

const features = [
  { icon: <Award size={28} />, title: 'BIS Certified Gold', desc: 'All our gold jewellery comes with Bureau of Indian Standards hallmark certification, guaranteeing purity and authenticity.', color: '#C9A84C' },
  { icon: <Shield size={28} />, title: 'Secure Payment', desc: 'Multiple secure payment options including UPI, cards, and net banking with 256-bit SSL encryption for all transactions.', color: '#2ecc71' },
  { icon: <Truck size={28} />, title: 'Fast Delivery', desc: 'Insured express delivery to all major cities within 3-5 business days, with real-time tracking available 24/7.', color: '#3498db' },
  { icon: <RefreshCw size={28} />, title: 'Easy Returns', desc: '15-day hassle-free return policy. Not satisfied? Return it with our pre-paid shipping label, no questions asked.', color: '#e74c3c' },
  { icon: <Gem size={28} />, title: 'Premium Quality', desc: 'Each piece passes rigorous quality checks by our expert gemologists before reaching your doorstep.', color: '#9b59b6' },
  { icon: <Headphones size={28} />, title: '24/7 Support', desc: 'Our dedicated customer care team is available round the clock to assist you via call, chat, or email.', color: '#e67e22' },
];

const counters = [
  { target: 25, suffix: '+', label: 'Years in Business' },
  { target: 50, suffix: 'K+', label: 'Happy Customers' },
  { target: 10, suffix: 'K+', label: 'Unique Designs' },
  { target: 99, suffix: '%', label: 'Satisfaction Rate' },
];

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
  return (
    <section className="why-section" id="why-choose-us">
      <div className="container">
        <div className="section-header reveal">
          <span className="section-label">Our Promise</span>
          <h2 className="section-title">Why Choose Lumina?</h2>
          <div className="gold-divider" />
          <p className="section-subtitle">
            We don't just sell jewellery — we promise an experience of trust, quality, and elegance.
          </p>
        </div>

        {/* Counter Stats */}
        <div className="why-counters reveal">
          {counters.map((c, i) => (
            <div key={i} className="why-counter" id={`counter-${i}`}>
              <div className="why-counter-value">
                <AnimatedCounter target={c.target} suffix={c.suffix} />
              </div>
              <div className="why-counter-label">{c.label}</div>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="why-grid">
          {features.map((f, i) => (
            <div key={i} className="why-card reveal" style={{ transitionDelay: `${i * 0.1}s` }} id={`why-card-${i}`}>
              <div className="why-card-icon" style={{ '--icon-color': f.color }}>
                {f.icon}
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
