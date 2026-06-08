// src/components/Footer/Footer.jsx
import { Gem, Phone, Mail, MapPin, ArrowRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useCMS } from '../../context/CMSContext';

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
function IconTwitter({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
    </svg>
  );
}
function IconPinterest({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.168 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026h.032z"/>
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
  if (link === 'Blog') return 'https://youtu.be/bWR1t-l1Bf8?si=b9LJZdf23ZiA8TIn';
  return '/';
};

export default function Footer() {
  const { setIsSupportOpen } = useApp();
  const { socialMediaData, landingPageData, systemSettingsData } = useCMS();
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
                <div className="footer-logo-icon">
                  {landingPageData?.branding?.logoUrl ? (
                    <img src={landingPageData.branding.logoUrl} alt="Store Logo" style={{ height: 32, width: 32, objectFit: 'contain' }} />
                  ) : (
                    <Gem size={20} />
                  )}
                </div>
                <div>
                  <div className="footer-logo-name">{landingPageData?.branding?.storeName || systemSettingsData?.storeName || landingPageData?.seo?.title || 'Lumina Jewels'}</div>
                </div>
              </div>
              <p className="footer-desc">
                India's most trusted destination for authentic, handcrafted jewellery. 
                BIS certified gold, IGI certified diamonds, and premium silver jewellery since 1998.
              </p>
              <div className="footer-contact-group">
                <a href={`tel:${socialMediaData?.contact?.phone || socialMediaData?.platforms?.whatsapp?.phoneNumber || '+91-9876543210'}`} className="footer-contact-item">
                  <Phone size={14} /> {socialMediaData?.contact?.phone || socialMediaData?.platforms?.whatsapp?.phoneNumber || '+91 98765 43210'}
                </a>
                <a href={`mailto:${socialMediaData?.contact?.email || 'luminajewels.app@gmail.com'}`} className="footer-contact-item">
                  <Mail size={14} /> {socialMediaData?.contact?.email || 'luminajewels.app@gmail.com'}
                </a>
              </div>
              <span className="footer-contact-item">
                <MapPin size={14} /> Mumbai, Maharashtra, India
              </span>
              <div className="footer-socials">
                {(!socialMediaData || socialMediaData?.integrations?.footerIcons !== false) && (
                  <>
                    {(socialMediaData?.platforms?.instagram?.enabled ?? true) && (
                      <a href={socialMediaData?.platforms?.instagram?.url || "https://www.instagram.com/luminajewels2/"} target="_blank" rel="noopener noreferrer" className="footer-social-btn magnetic" id="footer-instagram" aria-label="Instagram"><IconInstagram size={16} /></a>
                    )}
                    {(socialMediaData?.platforms?.facebook?.enabled ?? true) && (
                      <a href={socialMediaData?.platforms?.facebook?.url || "https://facebook.com/luminajewels"} target="_blank" rel="noopener noreferrer" className="footer-social-btn magnetic" id="footer-facebook" aria-label="Facebook"><IconFacebook size={16} /></a>
                    )}
                    {(socialMediaData?.platforms?.youtube?.enabled ?? false) && (
                      <a href={socialMediaData?.platforms?.youtube?.url || "https://youtu.be/bWR1t-l1Bf8"} target="_blank" rel="noopener noreferrer" className="footer-social-btn magnetic" id="footer-youtube" aria-label="YouTube"><IconYoutube size={16} /></a>
                    )}
                    {(socialMediaData?.platforms?.twitter?.enabled ?? false) && (
                      <a href={socialMediaData?.platforms?.twitter?.url || "https://twitter.com/luminajewels"} target="_blank" rel="noopener noreferrer" className="footer-social-btn magnetic" id="footer-twitter" aria-label="Twitter"><IconTwitter size={16} /></a>
                    )}
                    {(socialMediaData?.platforms?.pinterest?.enabled ?? false) && (
                      <a href={socialMediaData?.platforms?.pinterest?.url || "https://pinterest.com/luminajewels"} target="_blank" rel="noopener noreferrer" className="footer-social-btn magnetic" id="footer-pinterest" aria-label="Pinterest"><IconPinterest size={16} /></a>
                    )}
                  </>
                )}
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
              © {new Date().getFullYear()} {systemSettingsData?.storeName || landingPageData?.seo?.title || 'Lumina Jewels'}. All rights reserved. Crafted with ♥ in India.
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
