import { useState, useEffect } from 'react';
import { Search, Heart, ShoppingBag, User, Phone, Mail, ChevronRight, Gem, X, Moon, Sun, Store } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { useCMS } from '../../context/CMSContext';
import { useRates } from '../../hooks/useRates';
import { products } from '../../data/products';
import { useTranslation } from 'react-i18next';
import './Header.css';
import { useNavigate, useLocation } from 'react-router-dom';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/collections' },
  { label: 'Men\'s', href: '/mens' },
  { label: 'Collections', href: '/collections' },
  { label: 'New Arrivals', href: '/#new-arrivals' },
  { label: 'Best Sellers', href: '/#best-sellers' },
  { label: 'About Us', href: '/#brand-story' },
  { label: 'Contact Us', href: '#support' },
];

export default function Header({ onCartClick, onWishlistClick }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { cartCount, wishlistCount, setIsAuthOpen, setIsSupportOpen, theme, toggleTheme, user, customerSelectedStore, allPublicStores, setIsCustomerStorePromptOpen } = useApp();
  
  // Resolve store name for customer chip
  const customerStoreName = customerSelectedStore === 'GLOBAL'
    ? 'All Showrooms'
    : customerSelectedStore
      ? (allPublicStores.find(s => s.id === customerSelectedStore)?.name || null)
      : null;
  const isCustomer = user?.role === 'customer' || (!user?.role && !!user);
  const { socialMediaData, landingPageData, systemSettingsData } = useCMS();
  const { rates } = useRates();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const defaultNavLinks = [
    { label: t('nav.home'), href: '/' },
    { label: t('nav.shop'), href: '/collections' },
    { label: t('nav.mens', { defaultValue: 'Men\'s' }), href: '/mens' },
    { label: t('nav.collections'), href: '/collections' },
    { label: t('nav.newArrivals'), href: '/#new-arrivals' },
    { label: t('nav.bestSellers'), href: '/#best-sellers' },
    { label: t('nav.aboutUs'), href: '/#brand-story' },
    { label: t('nav.contactUs'), href: '#support' },
  ];

  const currentNavLinks = (landingPageData?.navBar?.length ? landingPageData.navBar : defaultNavLinks)
    .filter(link => link.label?.toLowerCase() !== 'rings');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (href) => {
    setMenuOpen(false);
    if (href === '#support') {
      setIsSupportOpen(true);
      return;
    }
    
    if (href.startsWith('#') || href.startsWith('/#')) {
      const hash = href.startsWith('/#') ? href.replace('/#', '') : href.replace('#', '');
      
      if (hash === 'home' || hash === '') {
        if (location.pathname !== '/') {
          navigate('/');
        } else {
          if (window.lenis) {
            window.lenis.scrollTo(0, { duration: 1.2 });
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }
        return;
      }

      if (location.pathname !== '/') {
        // Queue the hash scroll for after navigation to home
        sessionStorage.setItem('jw_scroll_to', hash);
        navigate('/');
      } else {
        const el = document.getElementById(hash);
        if (el) {
          if (window.lenis) {
            window.lenis.scrollTo(el, { duration: 1.2, offset: -120 });
          } else {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }
    } else {
      navigate(href);
    }
  };

  // Translate live rates labels
  const goldLabel = t('common.gold24k');
  const silverLabel = t('common.silver');
  const liveRatesLabel = t('common.liveRates');

  return (
    <>
      <div className="header-sticky-wrapper">
        {/* Contact Strip */}
        <div className="contact-strip">
        <div className="header-container" style={{ height: 'auto', display: 'flex', justifyContent: 'space-between', width: '100%', borderBottom: 'none', background: 'transparent' }}>
          <div className="strip-left">
            <span className="strip-item"><Phone size={12} /><a href={`tel:${socialMediaData?.contact?.phone || socialMediaData?.platforms?.whatsapp?.phoneNumber || '+91-9876543210'}`}>{socialMediaData?.contact?.phone || socialMediaData?.platforms?.whatsapp?.phoneNumber || '+91 98765 43210'}</a></span>
            <span className="strip-item"><Mail size={12} /><a href={`mailto:${socialMediaData?.contact?.email || 'luminajewels.app@gmail.com'}`}>{socialMediaData?.contact?.email || 'luminajewels.app@gmail.com'}</a></span>
          </div>
          <div className="strip-right" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'nowrap' }}>
            <span style={{ color: 'var(--gold)', fontWeight: '600', display: 'flex', alignItems: 'center' }}>
              <span className="live-dot" /> {liveRatesLabel}:
            </span>
            <span>{goldLabel} <span style={{ color: '#ffffff', fontWeight: 'bold' }}>₹{rates.gold24k}/g</span></span>
            <span style={{ color: 'var(--gold)', opacity: 0.5 }}>✦</span>
            <span>{silverLabel} <span style={{ color: '#ffffff', fontWeight: 'bold' }}>₹{rates.silver}/g</span></span>
            <span style={{ color: 'var(--gold)', opacity: 0.5 }}>✦</span>
            <span>{t('common.diamond')} <span style={{ color: '#ffffff', fontWeight: 'bold' }}>₹{rates.diamond.toLocaleString()}/ct</span></span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <motion.header 
        className={`header${scrolled ? ' scrolled' : ''}`} 
        id="home"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="header-inner">
          <div className="header-container">
            {/* Logo */}
            <a className="logo" href="#home" onClick={() => handleNavClick('#home')}>
              <div className="logo-icon">
                {landingPageData?.branding?.logoUrl ? (
                  <img src={landingPageData.branding.logoUrl} alt="Store Logo" style={{ height: 32, width: 32, objectFit: 'contain' }} />
                ) : (
                  <Gem size={18} />
                )}
              </div>
              <div className="logo-text">
                <span className="logo-name">{landingPageData?.branding?.storeName || systemSettingsData?.storeName || landingPageData?.seo?.title || 'Lumina Jewels'}</span>
              </div>
            </a>

            {/* Desktop Navigation */}
            <nav className="nav" aria-label="Main Navigation">
              {currentNavLinks.map((link, i) => (
                <a
                  key={i}
                  className="nav-link"
                  href={link.href}
                  onClick={(e) => { e.preventDefault(); handleNavClick(link.href); }}
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="header-actions">
              <div className="header-search" style={{ position: 'relative' }}>
                <Search size={14} color="var(--text-muted)" />
                <input
                  type="text"
                  placeholder={t('common.searchPlaceholder')}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  aria-label={t('common.search')}
                  id="header-search-input"
                />
                <AnimatePresence>
                  {searchQuery.length > 1 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      style={{
                        position: 'absolute', top: '100%', left: 0, right: 0,
                        marginTop: '10px', background: 'var(--surface)', border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)', padding: '0.5rem', zIndex: 1000,
                        maxHeight: '300px', overflowY: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                      }}
                    >
                      {products.filter(p => {
                        const sq = searchQuery.trim();
                        if (!sq) return false;
                        
                        try {
                          const regex = new RegExp(`\\b${sq}`, 'i');
                          return regex.test(p.name) || 
                                 regex.test(p.category) ||
                                 regex.test(p.subcategory) ||
                                 regex.test(p.purity) ||
                                 regex.test(p.price.toString());
                        } catch (e) {
                          // Fallback if regex fails (e.g. invalid chars)
                          const sqLower = sq.toLowerCase();
                          return (p.name && p.name.toLowerCase().includes(sqLower)) || 
                                 (p.category && p.category.toLowerCase().includes(sqLower)) ||
                                 (p.subcategory && p.subcategory.toLowerCase().includes(sqLower)) ||
                                 (p.purity && p.purity.toLowerCase().includes(sqLower)) ||
                                 (p.price && p.price.toString().includes(sqLower));
                        }
                      }).length > 0 ? (
                        products.filter(p => {
                          const sq = searchQuery.trim();
                          if (!sq) return false;
                          
                          try {
                            const regex = new RegExp(`\\b${sq}`, 'i');
                            return regex.test(p.name) || 
                                   regex.test(p.category) ||
                                   regex.test(p.subcategory) ||
                                   regex.test(p.purity) ||
                                   regex.test(p.price.toString());
                          } catch (e) {
                            const sqLower = sq.toLowerCase();
                            return (p.name && p.name.toLowerCase().includes(sqLower)) || 
                                   (p.category && p.category.toLowerCase().includes(sqLower)) ||
                                   (p.subcategory && p.subcategory.toLowerCase().includes(sqLower)) ||
                                   (p.purity && p.purity.toLowerCase().includes(sqLower)) ||
                                   (p.price && p.price.toString().includes(sqLower));
                          }
                        }).map(product => (
                          <div key={product.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem', cursor: 'pointer', borderBottom: '1px solid var(--border-light)' }} onClick={() => { setSearchQuery(''); handleNavClick(`/product/${product.id}`); }}>
                            <img src={product.image} alt={product.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                            <div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: '500' }}>{product.name}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--gold)' }}>₹{product.price.toLocaleString('en-IN')}</div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>No products found</div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Customer Store Chip — visible for guests & customers, hidden for admin roles */}
              {(!user || !['superadmin','admin','manager','staff','finance','logistics','delivery'].includes(user?.role)) && allPublicStores.length > 0 && (
                <button
                  onClick={() => setIsCustomerStorePromptOpen(true)}
                  title={customerStoreName ? `Shopping at ${customerStoreName}` : 'Select a store'}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: customerStoreName ? 'rgba(201,168,76,0.1)' : 'rgba(201,168,76,0.06)',
                    border: `1px solid ${customerStoreName ? 'rgba(201,168,76,0.35)' : 'rgba(201,168,76,0.2)'}`,
                    borderRadius: '20px',
                    padding: '0.35rem 0.85rem',
                    color: 'var(--gold)',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s',
                    animation: !customerStoreName ? 'pulse 2s infinite' : 'none',
                  }}
                >
                  <Store size={13} />
                  <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {customerStoreName || 'Select Store'}
                  </span>
                </button>
              )}


              <button
                className="icon-btn hide-on-mobile"
                id="wishlist-btn"
                aria-label="Wishlist"
                onClick={onWishlistClick}
              >
                <Heart size={16} />
                {wishlistCount > 0 && <span className="count">{wishlistCount}</span>}
              </button>

              <button
                className="icon-btn hide-on-mobile"
                id="cart-btn"
                aria-label="Shopping Cart"
                onClick={onCartClick}
              >
                <ShoppingBag size={16} />
                {cartCount > 0 && <span className="count">{cartCount}</span>}
              </button>

              {user ? (
                <button
                  className="login-btn hide-on-mobile"
                  id="account-btn"
                  onClick={() => {
                    if (user.role === 'customer' || !user.role) navigate('/account');
                    else if (user.role === 'delivery') navigate('/delivery');
                    else navigate('/admin');
                  }}
                  aria-label="Account"
                  style={{
                    background: 'rgba(201,168,76,0.1)',
                    border: '1px solid rgba(201,168,76,0.35)',
                    color: 'var(--gold)'
                  }}
                >
                  <User size={14} />
                  <span>{user.name || 'Account'}</span>
                </button>
              ) : (
                <button
                  className="login-btn hide-on-mobile"
                  id="login-btn"
                  onClick={() => setIsAuthOpen(true)}
                  aria-label={t('nav.login')}
                >
                  <User size={14} />
                  <span>{t('nav.login')}</span>
                </button>
              )}

              <button
                className={`hamburger${menuOpen ? ' open' : ''}`}
                id="hamburger-btn"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
              >
                <span></span><span></span><span></span>
              </button>
            </div>
          </div>
        </div>
      </motion.header>
    </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu${menuOpen ? ' open' : ''}`} role="navigation" aria-label="Mobile Navigation">
        <nav className="mobile-nav">
          {currentNavLinks.map((link, i) => (
            <a
              key={i}
              className="mobile-nav-link"
              href={link.href}
              onClick={(e) => { e.preventDefault(); handleNavClick(link.href); }}
            >
              {link.label} <ChevronRight size={16} />
            </a>
          ))}
        </nav>
        <div className="mobile-menu-actions" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <button className="btn btn-outline" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem' }} onClick={() => { setMenuOpen(false); onWishlistClick(); }}>
            <Heart size={16} /> Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
          </button>
          <button className="btn btn-outline" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem' }} onClick={() => { setMenuOpen(false); onCartClick(); }}>
            <ShoppingBag size={16} /> Cart {cartCount > 0 && `(${cartCount})`}
          </button>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {user ? (
            <button className="btn btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} onClick={() => {
              setMenuOpen(false);
              if (user.role === 'customer' || !user.role) navigate('/account');
              else if (user.role === 'delivery') navigate('/delivery');
              else navigate('/admin');
            }}>
              <User size={16} /> {user.name || 'My Account'}
            </button>
          ) : (
            <button className="btn btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} onClick={() => { setMenuOpen(false); setIsAuthOpen(true); }}>
              <User size={16} /> Login / Register
            </button>
          )}
        </div>
      </div>
    </>
  );
}
