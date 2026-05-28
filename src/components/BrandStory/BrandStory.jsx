// src/components/BrandStory/BrandStory.jsx
import { Award, Shield, Gem, Users } from 'lucide-react';
import brandImg from '../../assets/brand_story_1779901432157.png';
import './BrandStory.css';

const milestones = [
  { year: '1998', title: 'Founded', desc: 'Lumina Jewels was born from a passion for authentic Indian craftsmanship.' },
  { year: '2005', title: 'BIS Certified', desc: 'Received Bureau of Indian Standards hallmark certification for all gold jewellery.' },
  { year: '2015', title: 'Pan-India Expansion', desc: 'Expanded to 50+ cities with 100,000+ satisfied customers.' },
  { year: '2024', title: 'Digital Excellence', desc: 'Launched premium online shopping experience with nationwide delivery.' },
];

const badges = [
  { icon: <Award size={20} />, label: 'BIS Hallmark', sub: 'Certified Gold' },
  { icon: <Shield size={20} />, label: '100% Authentic', sub: 'Guaranteed' },
  { icon: <Gem size={20} />, label: 'IGI Certified', sub: 'Diamonds' },
  { icon: <Users size={20} />, label: '50,000+', sub: 'Happy Customers' },
];

export default function BrandStory() {
  return (
    <section className="brand-section" id="brand-story">
      <div className="container">
        <div className="brand-grid">
          {/* Image Side */}
          <div className="brand-image-col reveal-left">
            <div className="brand-img-frame">
              <img src={brandImg} alt="Master craftsman at work" className="brand-img" />
              <div className="brand-img-overlay" />
              <div className="brand-exp-badge">
                <div className="brand-exp-num">25+</div>
                <div className="brand-exp-text">Years of<br/>Excellence</div>
              </div>
            </div>
            {/* Authenticity Badges */}
            <div className="brand-badges">
              {badges.map((b, i) => (
                <div key={i} className="brand-badge-item">
                  <div className="brand-badge-icon">{b.icon}</div>
                  <div>
                    <div className="brand-badge-label">{b.label}</div>
                    <div className="brand-badge-sub">{b.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Content Side */}
          <div className="brand-content-col reveal-right">
            <span className="section-label">Our Story</span>
            <h2 className="section-title" style={{ textAlign: 'left' }}>
              Crafting Dreams Into
              <span className="shimmer-text" style={{ display: 'block' }}> Timeless Jewellery</span>
            </h2>
            <div className="gold-divider gold-divider-left" />

            <p className="brand-desc">
              For over 25 years, Lumina Jewels has been India's most trusted name in authentic, handcrafted jewellery.
              Every piece we create tells a story — of passion, precision, and the timeless art of goldsmithing.
            </p>
            <p className="brand-desc">
              Our master artisans, many from generations of jewellery-making families, bring centuries of tradition
              into every creation. From intricate filigree work to modern diamond settings, each piece is a 
              testament to uncompromising craftsmanship.
            </p>

            {/* Timeline */}
            <div className="brand-timeline">
              {milestones.map((m, i) => (
                <div key={i} className="timeline-item">
                  <div className="timeline-year">{m.year}</div>
                  <div className="timeline-dot" />
                  <div className="timeline-content">
                    <div className="timeline-title">{m.title}</div>
                    <div className="timeline-desc">{m.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <button className="btn btn-primary" id="brand-story-btn" style={{ marginTop: '1rem' }}>
              Discover Our Heritage
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
