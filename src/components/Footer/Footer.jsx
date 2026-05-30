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
  Company: ['About Us', 'Our Story', 'Careers', 'Press', 'Blog'],
};

// Inline SVGs for Payment Methods
const IconVisa = () => (
  <svg viewBox="0 0 38 12" height="16" fill="#1434CB">
    <path d="M14.28.18L9.34 11.83H6.07l-2.4-8.08c-.28-1.28-.59-1.63-1.42-2.07L.13.62.3.06h5.08c.84 0 1.58.55 1.77 1.5l1.32 6.13L11.53.18h2.75zm10.72 3.12c-.08-.85-.82-1.44-2.12-1.44-2.28 0-3.89 1.15-3.9 2.8-.02 1.22 1.15 1.9 2.03 2.3 1.02.46 1.36.75 1.36 1.17-.02.63-.8.92-1.54.92-1.29 0-2-.2-3.08-.66l-.42 1.83c.77.34 2.2.66 3.66.68 2.45 0 4.05-1.15 4.06-2.85.01-1-.62-1.74-1.95-2.35-.9-.45-1.46-.75-1.46-1.22 0-.42.5-.88 1.48-.88.98 0 1.69.2 2.29.5l.39-1.8zm5.72 8.53h2.64l2.5-11.65h-2.58l-2.56 11.65zM22.05.18l-2.5 11.65h2.64L24.7.18h-2.65z"/>
  </svg>
);

const IconMastercard = () => (
  <svg viewBox="0 0 36 24" height="20">
    <circle cx="12" cy="12" r="12" fill="#EB001B" />
    <circle cx="24" cy="12" r="12" fill="#F79E1B" />
    <path d="M18 21.5a12 12 0 000-19 12 12 0 000 19z" fill="#FF5F00" />
  </svg>
);

const IconRazorpay = () => (
  <svg viewBox="0 0 120 26" height="16">
    <path fill="#02042B" d="M30.74 1.33c-3.15 0-5.74 2.2-6.31 5.17l-1.91 9.94h4.15l1.62-8.38c.18-.94 1.07-1.62 2.1-1.62h2.51l-1.93 10H35.1l3.05-15.11h-7.41zM42.2 11.39c-.16-1.54-.74-2.89-1.86-3.89-1.37-1.23-3.32-1.82-5.48-1.82h-4.08l-2.14 10.76H32.8l1.32-6.57h1.49c1.07 0 1.83.27 2.38.75.48.43.72 1.05.8 1.83l.2 2.12c.11 1.25.7 1.87 1.62 1.87h4.08l-.34-2.55-.15-2.5zM61.42 22.05l5.58-6.1-4.71-4.66h5.36l1.61 1.8 1.96-1.8h5.68l-4.71 4.54 4.87 6.22h-5.44l-2.02-2.83-2.67 2.83h-5.51zM80.05 11.39c-1.46-1.31-3.52-1.82-5.83-1.82h-4.08l-2.14 10.76h4.15l.77-3.83h1.41c2.31 0 4.1-.64 5.31-1.91 1.32-1.39 1.81-3.34 1.38-5.43-.3-1.47-1.07-2.61-2.28-3.71m-2.17 6.23c-.76.74-1.98 1.1-3.41 1.1h-1.56l1.01-5.06h1.56c1.23 0 2.18.24 2.65.67.54.49.8 1.16.8 1.83-.02 1.02-.38 1.57-1.05 2.22zM98.66 11.39c-1.46-1.31-3.52-1.82-5.83-1.82h-4.08l-2.14 10.76h4.15l.77-3.83h1.41c2.31 0 4.1-.64 5.31-1.91 1.32-1.39 1.81-3.34 1.38-5.43-.3-1.47-1.07-2.61-2.28-3.71m-2.17 6.23c-.76.74-1.98 1.1-3.41 1.1h-1.56l1.01-5.06h1.56c1.23 0 2.18.24 2.65.67.54.49.8 1.16.8 1.83-.02 1.02-.38 1.57-1.05 2.22zM107.5 15.65l-2.21-6.08h4.37l1.19 3.86.37 1.39 1.62-5.25h4.28l-6.17 15.42h-4.32l.87-9.34zM16.48 20.25l-2.31 4.31H.9l8.6-14.86h11.96L16.48 20.25z"/>
  </svg>
);

const paymentMethods = [
  { name: 'Razorpay', icon: <IconRazorpay /> },
  { name: 'Visa', icon: <IconVisa /> },
  { name: 'Mastercard', icon: <IconMastercard /> }
];

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
                <a href="#" className="footer-social-btn magnetic" id="footer-instagram" aria-label="Instagram"><IconInstagram size={16} /></a>
                <a href="#" className="footer-social-btn magnetic" id="footer-facebook" aria-label="Facebook"><IconFacebook size={16} /></a>
                <a href="#" className="footer-social-btn magnetic" id="footer-youtube" aria-label="YouTube"><IconYoutube size={16} /></a>
              </div>
            </div>

            {/* Links */}
            {Object.entries(footerLinks).map(([section, links]) => (
              <div key={section} className="footer-links-col stagger-item">
                <h4 className="footer-col-title">{section}</h4>
                <ul className="footer-links-list">
                  {links.map(link => (
                    <li key={link}>
                      <a 
                        href="#" 
                        className="footer-link"
                        onClick={(e) => {
                          e.preventDefault();
                          if (link === 'Contact Support' || link === 'Track Order') {
                            setIsSupportOpen(true);
                          }
                        }}
                      >
                        <ArrowRight size={12} /> {link}
                      </a>
                    </li>
                  ))}
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
                  {p.icon}
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
