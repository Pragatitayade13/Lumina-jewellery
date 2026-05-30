// src/components/Footer/Footer.jsx
import { Gem, Phone, Mail, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

// Inline SVG social icons (not available in lucide-react@1.16.0)
function IconInstagram({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IconFacebook({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}
function IconYoutube({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.96-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
      <polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
    </svg>
  );
}
import './Footer.css';

const footerLinks = {
  Shop: ['Gold Jewellery', 'Diamond Jewellery', 'Silver Jewellery', 'Bridal Sets', 'New Arrivals'],
  Support: ['Track Order', 'Returns Policy', 'Size Guide', 'Care Instructions', 'Contact Support'],
  Company: ['About Us', 'Blog'],
};

const paymentMethods = [
  { name: 'Visa', icon: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg' },
  { name: 'Mastercard', icon: 'https://upload.wikimedia.org/wikipedia/commons/a/a4/Mastercard_2019_logo.svg' },
  { name: 'PayPal', icon: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg' },
  { name: 'Skrill', icon: 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Skrill_Logo.svg' },
  { name: 'Payoneer', icon: 'https://upload.wikimedia.org/wikipedia/commons/c/c2/Payoneer_logo.svg' },
  { name: 'Amazon Pay', icon: 'https://upload.wikimedia.org/wikipedia/commons/b/b9/Amazon_Pay_logo.svg' },
  { name: 'Google Pay', icon: 'https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg' }
];

const getLinkRoute = (link) => {
  const shopLinks = ['Gold Jewellery', 'Diamond Jewellery', 'Silver Jewellery', 'Bridal Sets'];
  if (shopLinks.includes(link)) {
    if (link === 'Bridal Sets') return '/collections?category=Bridal%20Jewellery';
    return `/collections?category=${encodeURIComponent(link)}`;
  }
  if (link === 'New Arrivals') return '/#new-arrivals';
  if (link === 'About Us' || link === 'Our Story') return '/#brand-story';
  if (link === 'Careers' || link === 'Press') return '/#footer';
  if (link === 'Returns Policy') return '/returns-policy';
  if (link === 'Size Guide') return '/size-guide';
  if (link === 'Care Instructions') return '/care-instructions';
  if (link === 'Privacy Policy') return '/privacy-policy';
  if (link === 'Terms of Service') return '/terms-of-service';
  if (link === 'Cookie Policy' || link === 'Cookies') return '/cookies';
  if (link === 'Blog') return 'https://youtube.com';
  return '/';
};

export default function Footer() {
  const { setIsSupportOpen } = useApp();

  return (
    <footer className="footer" id="footer">
      <div className="footer-top">
        <div className="container">
          <div className="footer-grid stagger-container">
            {/* Brand */}
            <div className="footer-brand stagger-item">
              <div className="footer-logo">
                <div className="footer-logo-icon"><Gem size={20} /></div>
                <div>
                  <div className="footer-logo-name">Lumina Jewels</div>
                  <div className="footer-logo-tag">Crafted with Passion</div>
                </div>
              </div>
              <p className="footer-desc">
                India's most trusted destination for authentic, handcrafted jewellery. 
                BIS certified gold, IGI certified diamonds, and premium silver jewellery since 1998.
              </p>
              <div className="footer-contact">
                <a href="tel:+91-9876543210" className="footer-contact-item">
                  <Phone size={14} /> +91 98765 43210
                </a>
                <a href="mailto:hello@luminajewels.com" className="footer-contact-item">
                  <Mail size={14} /> hello@luminajewels.com
                </a>
                <span className="footer-contact-item">
                  <MapPin size={14} /> Mumbai, Maharashtra, India
                </span>
              </div>
              <div className="footer-socials">
                <a href="https://instagram.com/luminajewels" target="_blank" rel="noopener noreferrer" className="footer-social-btn magnetic" id="footer-instagram" aria-label="Instagram"><IconInstagram size={16} /></a>
                <a href="https://facebook.com/luminajewels" target="_blank" rel="noopener noreferrer" className="footer-social-btn magnetic" id="footer-facebook" aria-label="Facebook"><IconFacebook size={16} /></a>
                <a href="https://youtube.com/luminajewels" target="_blank" rel="noopener noreferrer" className="footer-social-btn magnetic" id="footer-youtube" aria-label="YouTube"><IconYoutube size={16} /></a>
              </div>
            </div>

            {/* Links */}
            {Object.entries(footerLinks).map(([section, links]) => (
              <div key={section} className="footer-links-col stagger-item">
                <h4 className="footer-col-title">{section}</h4>
                <ul className="footer-links-list">
                  {links.map(link => {
                    const route = getLinkRoute(link);
                    const isExternal = route.startsWith('http');
                    
                    if (isExternal) {
                      return (
                        <li key={link}>
                          <a href={route} target="_blank" rel="noopener noreferrer" className="footer-link">
                            <ArrowRight size={12} /> {link}
                          </a>
                        </li>
                      );
                    }
                    
                    return (
                      <li key={link}>
                        <Link 
                          to={route}
                          className="footer-link"
                          onClick={(e) => {
                            if (link === 'Contact Support' || link === 'Track Order') {
                              e.preventDefault();
                              setIsSupportOpen(true);
                            } else if (route.includes('#')) {
                              const id = route.split('#')[1];
                              const el = document.getElementById(id);
                              if (el) {
                                e.preventDefault();
                                el.scrollIntoView({ behavior: 'smooth' });
                              }
                            }
                          }}
                        >
                          <ArrowRight size={12} /> {link}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="footer-divider" />

      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-inner">
            <p className="footer-copy">
              © 2026 Lumina Jewels. All rights reserved. Crafted with ♥ in India.
            </p>
            <div className="footer-payments">
              <span className="footer-payment-label">We Accept:</span>
              {paymentMethods.map(p => (
                <div key={p.name} className="footer-payment-icon-wrapper" style={{ background: '#fff', padding: '0.25rem 0.5rem', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '32px', minWidth: '45px' }}>
                  <img src={p.icon} alt={p.name} title={p.name} style={{ height: 'auto', maxHeight: '16px', width: 'auto', maxWidth: '50px', objectFit: 'contain' }} />
                </div>
              ))}
            </div>
            <div className="footer-legal">
              <Link to="/privacy-policy" className="footer-legal-link">Privacy Policy</Link>
              <Link to="/terms-of-service" className="footer-legal-link">Terms of Service</Link>
              <Link to="/cookies" className="footer-legal-link">Cookies</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
