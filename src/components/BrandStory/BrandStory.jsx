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

const defaultBadges = [
  { icon: <Award size={20} />, label: 'BIS Hallmark', sub: 'Certified Gold' },
  { icon: <Shield size={20} />, label: '100% Authentic', sub: 'Guaranteed' },
  { icon: <Gem size={20} />, label: 'IGI Certified', sub: 'Diamonds' },
  { icon: <Users size={20} />, label: '50,000+', sub: 'Happy Customers' },
];

import { useCMS } from '../../context/CMSContext';

export default function BrandStory() {
  const { landingPageData } = useCMS();
  const bs = landingPageData?.brandStory || {
    sectionLabel: 'Our Story',
    title: 'Crafting Dreams Into Timeless Jewellery',
    desc1: 'For over 25 years, Lumina Jewels has been India\'s most trusted name in authentic, handcrafted jewellery. Every piece we create tells a story — of passion, precision, and the timeless art of goldsmithing.',
    desc2: 'Our master artisans, many from generations of jewellery-making families, bring centuries of tradition into every creation. From intricate filigree work to modern diamond settings, each piece is a testament to uncompromising craftsmanship.',
    buttonText: 'Discover Our Heritage',
    buttonLink: 'https://en.wikipedia.org/wiki/Jewellery#India',
    yearsOfExcellence: '25+',
    badges: [
      { label: 'BIS Hallmark', sub: 'Certified Gold' },
      { label: '100% Authentic', sub: 'Guaranteed' },
      { label: 'IGI Certified', sub: 'Diamonds' },
      { label: '50,000+', sub: 'Happy Customers' }
    ]
  };

  // Sync Happy Customers from WhyChooseUs stats if available
  const happyCustomerStat = landingPageData?.whyChooseUs?.stats?.find(s => s.label.toLowerCase().includes('happy'));
  const happyCustomerLabel = happyCustomerStat ? `${happyCustomerStat.target}${happyCustomerStat.suffix}` : null;
  const happyCustomerSub = happyCustomerStat ? 'Happy Customers' : null;

  const currentBadges = (bs.badges && bs.badges.length > 0) 
    ? bs.badges.map((badge, i) => {
        // Override the 4th badge (Happy Customers) if we found synced stats
        if (i === 3 && happyCustomerLabel) {
          return { label: happyCustomerLabel, sub: happyCustomerSub, icon: defaultBadges[i % defaultBadges.length].icon };
        }
        return { ...badge, icon: defaultBadges[i % defaultBadges.length].icon };
      })
    : defaultBadges;

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
                <div className="brand-exp-num">{bs.yearsOfExcellence}</div>
                <div className="brand-exp-text">Years of<br/>Excellence</div>
              </div>
            </div>
            {/* Authenticity Badges */}
            <div className="brand-badges">
              {currentBadges.map((b, i) => (
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
            <span className="section-label">{bs.sectionLabel}</span>
            <h2 className="section-title" style={{ textAlign: 'left' }}>
              {bs.title.split(' ').slice(0, -2).join(' ')}
              <span className="shimmer-text" style={{ display: 'block' }}> {bs.title.split(' ').slice(-2).join(' ')}</span>
            </h2>
            <div className="gold-divider gold-divider-left" />

            <p className="brand-desc">
              {bs.desc1}
            </p>
            <p className="brand-desc">
              {bs.desc2}
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

            <a 
              href={bs.buttonLink} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-gold" 
              id="brand-story-btn" 
              style={{ marginTop: '1rem', display: 'inline-block' }}
            >
              {bs.buttonText}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
