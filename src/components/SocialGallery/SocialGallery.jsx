// src/components/SocialGallery/SocialGallery.jsx
import { Heart } from 'lucide-react';
import './SocialGallery.css';

function IconInstagram({ size = 20, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm3.98-10.395a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z" />
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
  { icon: <IconInstagram size={20} />, label: 'Instagram', handle: '@luminajewels', color: '#E1306C', href: 'https://instagram.com/luminajewels' },
  { icon: <IconFacebook size={20} />, label: 'Facebook', handle: 'Lumina Jewels', color: '#1877F2', href: 'https://facebook.com/luminajewels' },
  { icon: <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.688 0 1.029-.653 2.568-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.163 0 7.398 2.967 7.398 6.923 0 4.136-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/></svg>, label: 'Pinterest', handle: 'Lumina Jewels', color: '#E60023', href: 'https://pinterest.com/luminajewels' },
  { icon: <IconYoutube size={20} />, label: 'YouTube', handle: 'Lumina Jewels TV', color: '#FF0000', href: 'https://youtube.com/luminajewels' },
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
              href="https://instagram.com/luminajewels"
              target="_blank"
              rel="noopener noreferrer"
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
                target="_blank"
                rel="noopener noreferrer"
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
