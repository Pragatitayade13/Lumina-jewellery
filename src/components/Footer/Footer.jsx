// src/components/Footer/Footer.jsx
import { Gem, Phone, Mail, MapPin, ArrowRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
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

const IconVisa = () => (
  <svg viewBox="0 0 38 12" height="16" width="50" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.931 0.435913L12.593 11.5549H9.378L11.716 0.435913H14.931ZM28.529 0.435913C28.529 0.435913 26.689 0.052913 24.819 0.052913C21.393 0.052913 18.91 1.83991 18.887 4.67391C18.865 6.76491 20.781 7.93591 22.254 8.65391C23.766 9.39091 24.276 9.85191 24.276 10.5179C24.254 11.5369 23.042 11.9969 21.908 11.9969C19.704 11.9969 18.528 11.3969 17.653 10.9759L17.067 10.6979L16.666 13.3159C17.756 13.8209 19.553 14.2299 21.417 14.2299C25.074 14.2299 27.502 12.4359 27.525 9.48991C27.546 7.84891 26.438 6.64391 24.629 5.78791C23.364 5.17691 22.613 4.78991 22.613 4.10391C22.613 3.44791 23.332 2.80291 24.896 2.80291C26.549 2.78191 27.601 3.16191 28.435 3.54191L28.847 3.73791L29.28 0.908913L28.529 0.435913ZM36.002 0.435913H33.522C32.617 0.435913 31.905 0.925913 31.542 1.76791L26.839 13.2559H30.222C30.222 13.2559 30.835 11.5649 30.985 11.1449C31.353 11.1449 34.618 11.1449 35.086 11.1449C35.215 11.7259 35.632 13.2549 35.632 13.2549H38.566L36.002 0.435913ZM31.869 8.70691C31.869 8.70691 32.846 6.00791 33.056 5.43891C33.242 4.93991 33.398 4.41291 33.522 3.86491C33.57 4.29891 33.896 5.86491 34.116 6.94291L34.788 8.70691H31.869ZM11.084 0.435913L8.031 9.38091L7.697 7.73491C7.294 5.37891 5.568 3.14991 3.141 2.05291L3.901 5.48591L6.786 13.2559H10.158L14.471 0.435913H11.084ZM0.00700003 0.435913H3.21C4.412 0.435913 5.419 0.814913 6.079 1.63791C5.031 1.95491 3.882 2.41791 2.923 3.09091C1.864 3.83491 1.139 4.76491 0.871 5.48591L0.00700003 0.435913Z" fill="#1434CB"/>
  </svg>
);

const paymentMethods = [
  { name: 'UPI', icon: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg' },
  { name: 'Razorpay', icon: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg' },
  { name: 'Visa', type: 'svg', component: IconVisa },
  { name: 'Mastercard', icon: 'https://upload.wikimedia.org/wikipedia/commons/a/a4/Mastercard_2019_logo.svg' }
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
  const location = useLocation();
  
  const isLegalPage = [
    '/privacy-policy', 
    '/terms-of-service', 
    '/cookies', 
    '/returns-policy', 
    '/size-guide', 
    '/care-instructions'
  ].includes(location.pathname);

  if (isLegalPage) {
    return null;
  }

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
                  {p.type === 'svg' ? (
                    <p.component />
                  ) : (
                    <img src={p.icon} alt={p.name} title={p.name} style={{ height: 'auto', maxHeight: '16px', width: 'auto', maxWidth: '50px', objectFit: 'contain' }} />
                  )}
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
