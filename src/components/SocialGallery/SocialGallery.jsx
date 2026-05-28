// src/components/SocialGallery/SocialGallery.jsx
import { Heart } from 'lucide-react';
import './SocialGallery.css';

// Inline SVG social icons (not in lucide-react@1.16.0)
function IconInstagram({ size = 20, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconFacebook({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function IconYoutube({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.96-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
      <polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
    </svg>
  );
}

// Using CSS gradient placeholders with product images as backgrounds
import p1 from '../../assets/product_1_1779901454806.png';
import p2 from '../../assets/product_2_1779901470655.png';
import p3 from '../../assets/product_3_1779901487427.png';
import p4 from '../../assets/product_4_1779901505569.png';
import p5 from '../../assets/product_5_1779901527769.png';
import catGold from '../../assets/category_gold_1779901256829.png';
import catDiamond from '../../assets/category_diamond_1779901278017.png';
import catBridal from '../../assets/category_bridal_1779901298512.png';
import catRings from '../../assets/category_rings_1779901339180.png';

const galleryItems = [
  { id: 1, img: p1, likes: 1247, tag: '#LuminaJewels' },
  { id: 2, img: catGold, likes: 893, tag: '#GoldJewellery' },
  { id: 3, img: p2, likes: 2145, tag: '#DiamondRings' },
  { id: 4, img: catBridal, likes: 3210, tag: '#BridalJewellery' },
  { id: 5, img: p3, likes: 780, tag: '#GoldEarrings' },
  { id: 6, img: catDiamond, likes: 1560, tag: '#DiamondJewellery' },
  { id: 7, img: catRings, likes: 945, tag: '#RingCollection' },
  { id: 8, img: p4, likes: 1089, tag: '#GoldBangles' },
  { id: 9, img: p5, likes: 2340, tag: '#PolkiChoker' },
];

const socialLinks = [
  { icon: <IconInstagram size={20} />, label: 'Instagram', handle: '@luminajewels', color: '#E1306C', href: '#' },
  { icon: <IconFacebook size={20} />, label: 'Facebook', handle: 'Lumina Jewels', color: '#1877F2', href: '#' },
  { icon: <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.43z"/></svg>, label: 'Pinterest', handle: 'Lumina Jewels', color: '#E60023', href: '#' },
  { icon: <IconYoutube size={20} />, label: 'YouTube', handle: 'Lumina Jewels TV', color: '#FF0000', href: '#' },
];

export default function SocialGallery() {
  return (
    <section className="social-section" id="social-gallery">
      <div className="container">
        <div className="section-header reveal">
          <span className="section-label">Follow Our Journey</span>
          <h2 className="section-title">@LuminaJewels</h2>
          <div className="gold-divider" />
          <p className="section-subtitle">
            Join our community of jewellery lovers. Share your Lumina moments with <strong style={{ color: 'var(--gold)' }}>#LuminaJewels</strong>
          </p>
        </div>

        {/* Instagram Grid */}
        <div className="social-grid reveal">
          {galleryItems.map((item, i) => (
            <a
              key={item.id}
              href="#"
              className="social-item"
              id={`social-item-${item.id}`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <img src={item.img} alt={item.tag} className="social-img" loading="lazy" />
              <div className="social-overlay">
                <div className="social-likes">
                  <Heart size={16} fill="white" />
                  <span>{item.likes.toLocaleString()}</span>
                </div>
                <div className="social-tag">{item.tag}</div>
                <IconInstagram size={28} className="social-insta-icon" />
              </div>
            </a>
          ))}
        </div>

        {/* Social Platforms */}
        <div className="social-platforms reveal">
          <p className="social-platforms-label">Follow us on</p>
          <div className="social-links">
            {socialLinks.map((s, i) => (
              <a
                key={i}
                href={s.href}
                className="social-link-card"
                id={`social-link-${s.label.toLowerCase()}`}
                style={{ '--platform-color': s.color }}
                aria-label={`Follow us on ${s.label}`}
              >
                <div className="social-link-icon">{s.icon}</div>
                <div>
                  <div className="social-link-label">{s.label}</div>
                  <div className="social-link-handle">{s.handle}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
