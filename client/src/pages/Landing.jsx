import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon, Gem, Hammer, ShieldCheck, Palette } from 'lucide-react';
import { useTheme } from '../ThemeContext';
import './Landing.css';

// ── Hero Slides Metadata (sliding windows with luxury video loops) ──
const HERO_SLIDES = [
  {
    id: 0,
    tagline: 'Fine Craftsmanship & Timeless Elegance',
    titleLine1: 'The Ultimate Luxury',
    titleLine2: 'Crafted in Gold.',
    desc: 'Discover our curated collections of rare diamonds, heritage gold ornaments, and masterpieces of haute horlogerie. Handcrafted with precision by generational artisans.',
    imgFallback: '/cinematic_jewellery_bg.png',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-polishing-a-gold-diamond-ring-41619-large.mp4'
  },
  {
    id: 1,
    tagline: 'Bespoke Royal Heritage',
    titleLine1: 'Generational Masterpieces',
    titleLine2: 'Of Sovereign Gold.',
    desc: 'Intricate 22K gold filigree work and GIA certified solitaire diamonds, designed to capture absolute royalty in every facet and curve for your legacy.',
    imgFallback: '/jewellery_hero.png',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-jewelry-maker-polishing-a-ring-41618-large.mp4'
  },
  {
    id: 2,
    tagline: 'The Art of Haute Horlogerie',
    titleLine1: 'Rose Gold Chronographs',
    titleLine2: 'For the Discerning.',
    desc: 'Explore certified complications, tourbillons, and hand-finished alligator straps curated for watch collectors who demand mathematical excellence.',
    imgFallback: '/jewellery_collection.png',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-goldsmith-working-on-a-piece-of-jewelry-41615-large.mp4'
  }
];

// ── Featured Products Metadata (now including multiple real jewellery images for thumbnails) ──
const PRODUCTS = [
  {
    id: 1,
    name: 'Solitaire Diamond Ring',
    brand: 'Tiffany & Co.',
    category: 'Rings',
    priceVal: 285000,
    priceStr: '₹2,85,000',
    img: '/diamond_ring.png',
    images: [
      '/diamond_ring.png',
      '/jewellery_hero.png',
      '/emerald_pendant.png',
      '/jewellery_collection.png'
    ],
    badge: 'Bestseller',
    description: 'An exquisite 1.5-carat round brilliant cut diamond set in a classic 18K white gold band. Certified by GIA with VVS1 clarity and E color grade, ensuring maximum brilliance and fire for an eternal promise.',
    specs: {
      metal: '18K White Gold',
      weight: '3.8 grams',
      stones: '1.50 ct Solitaire Diamond',
      certification: 'GIA E / VVS1'
    }
  },
  {
    id: 2,
    name: 'Emerald Gold Pendant',
    brand: 'Cartier',
    category: 'Necklaces',
    priceVal: 124000,
    priceStr: '₹1,24,000',
    img: '/emerald_pendant.png',
    images: [
      '/emerald_pendant.png',
      '/jewellery_collection.png',
      '/diamond_ring.png',
      '/jewellery_hero.png'
    ],
    badge: 'New',
    description: 'A rare pear-shaped Zambian emerald nestled within a halo of micro-pave diamonds. Suspended from a delicate 22K yellow gold chain. A timeless statement piece bringing classic sophistication to any look.',
    specs: {
      metal: '22K Yellow Gold',
      weight: '5.2 grams',
      stones: 'Zambian Emerald 0.85ct, Diamonds 0.22ct',
      certification: 'SGL Certified Gemstone'
    }
  },
  {
    id: 3,
    name: 'Rose Gold Tourbillon',
    brand: 'Patek Philippe',
    category: 'Fine Watches',
    priceVal: 1850000,
    priceStr: '₹18,50,000',
    img: '/luxury_watch.png',
    images: [
      '/luxury_watch.png',
      '/cinematic_jewellery_bg.png',
      '/jewellery_collection.png',
      '/emerald_pendant.png'
    ],
    badge: 'Exclusive',
    description: 'A masterpiece of haute horlogerie. Features an in-house automatic tourbillon movement housed in a hand-polished 18K rose gold casing with a scratch-resistant sapphire crystal back and genuine alligator strap.',
    specs: {
      metal: '18K Rose Gold',
      weight: '115 grams',
      movement: 'Calibre L90 Automatic Tourbillon',
      strap: 'Genuine Black Alligator Leather'
    }
  },
  {
    id: 4,
    name: 'Heritage Bridal Set',
    brand: 'Bvlgari',
    category: 'Bridal Sets',
    priceVal: 460000,
    priceStr: '₹4,60,000',
    img: '/jewellery_collection.png',
    images: [
      '/jewellery_collection.png',
      '/jewellery_hero.png',
      '/emerald_pendant.png',
      '/diamond_ring.png'
    ],
    badge: 'Limited',
    description: 'Handcrafted heirloom bridal necklace and matching chandelier earrings set. Intricate filigree work in solid 22K antique gold, accented with delicate temple motifs and selected natural Basra pearls.',
    specs: {
      metal: '22K Antique Yellow Gold',
      weight: '68 grams',
      stones: 'Natural Basra Pearls & Polki Diamonds',
      collection: 'Heritage Royal Bridal Edit'
    }
  }
];

const CATEGORIES = [
  { name: 'Rings', img: '/diamond_ring.png', count: '124 Items' },
  { name: 'Necklaces', img: '/emerald_pendant.png', count: '86 Items' },
  { name: 'Fine Watches', img: '/luxury_watch.png', count: '32 Items' },
  { name: 'Bridal Sets', img: '/jewellery_collection.png', count: '18 Items' },
  { name: 'Earrings', img: '/model_earrings_three.png', count: '64 Items' },
  { name: 'Bracelets', img: '/model_bracelet_four.png', count: '45 Items' },
  { name: 'Pendants', img: '/model_pendant_five.png', count: '38 Items' },
  { name: 'Chokers', img: '/model_choker_seven.png', count: '22 Items' }
];

const TESTIMONIALS = [
  {
    quote: '" LuxeOrbit has completely transformed how we represent our heritage jewellery boutique. Shifting our front face to a premium, catalog-focused storefront has increased our customer inquiries by 45%. The built-in client consultation system is simply flawless. "',
    author: 'Aura Kapoor',
    role: 'Director, Aura Fine Jewellery'
  },
  {
    quote: '" Our high-net-worth clients expect visual excellence and immediate service. LuxeOrbit allows us to showcase our collections in an interactive, luxury editorial layout while automatically updating precious metal inventory in the background. Exceptional work. "',
    author: 'Vikramaditya Mehta',
    role: 'Founder, Royal Heirloom Jewels'
  },
  {
    quote: '" As a luxury boutique operator, I value security and precision. LuxeOrbit provides the perfect balance: a stunning customer-facing catalog that looks like an editorial magazine, backed by robust merchant POS, live gold rate sync, and full multi-location control. "',
    author: 'Sophia Chen',
    role: 'Creative Partner, Solitaire Guild'
  }
];

const SOCIAL_POSTS = [
  { img: '/model_ring_one.png', tag: '#GoldRing' },
  { img: '/model_necklace_two.png', tag: '#EmeraldPendant' },
  { img: '/model_earrings_three.png', tag: '#DiamondChandelier' },
  { img: '/model_bracelet_four.png', tag: '#GoldBracelets' },
  { img: '/model_pendant_five.png', tag: '#RubyPendant' },
  { img: '/model_pearl_six.png', tag: '#PearlChoker' },
  { img: '/model_choker_seven.png', tag: '#GoldChoker' }
];

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  
  // Hero Slider State
  const [currentSlide, setCurrentSlide] = useState(0);

  // E-commerce states
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState(null); // for Quick View modal
  const [activeImageIdx, setActiveImageIdx] = useState(0); // for Quick View image selection
  
  // Testimonials state
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Monitor scroll for nav styling transition and scroll-triggered section animations
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      // Trigger scroll reveal animations
      const revealElements = document.querySelectorAll('.reveal-on-scroll');
      revealElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const elemTop = rect.top;
        const elemBottom = rect.bottom;
        // Check if element is visible in the viewport
        const isVisible = elemTop < window.innerHeight - 80 && elemBottom >= 0;
        if (isVisible) {
          el.classList.add('revealed');
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    // Initial check on load
    setTimeout(handleScroll, 100);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-rotate Hero Slides (sliding windows) every 8 seconds
  useEffect(() => {
    const heroTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 8000);
    return () => clearInterval(heroTimer);
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const tTimer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 6000);
    return () => clearInterval(tTimer);
  }, []);

  // E-commerce handlers
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    setCartOpen(true); // Open cart side drawer immediately on add
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const getCartTotal = () => {
    const total = cart.reduce((sum, item) => sum + item.priceVal * item.quantity, 0);
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(total);
  };

  const getCartItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  // Scroll to section helper
  const scrollToSection = (id) => {
    setMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="landing-root">
      
      {/* ── ROOT BACKGROUND VIDEO & WATERMARK ── */}
      <div className="root-bg-container">
        <div className="root-bg-watermark" />
        <img src="/cinematic_jewellery_bg.png" alt="Background" className="root-bg-image animated-bg" />
        <div className="root-bg-overlay" />
      </div>
      
      {/* ── TOP NOTIFICATION BAR ── */}
      <div className="top-bar">
        <span>Exclusive Launch Offer</span> &bull; Free Insured Shipping Worldwide on Orders Above ₹50,000
      </div>

      {/* ── NAVIGATION ── */}
      <nav className={`landing-nav ${scrolled ? 'nav-scrolled' : ''}`}>
        <div className="nav-inner">
          
          <a href="#" className="nav-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <span>LuxeOrbit</span><span className="logo-gold">&bull;</span>
          </a>

          <ul className="nav-links">
            <li><a href="#categories" className="nav-link" onClick={(e) => { e.preventDefault(); scrollToSection('categories'); }}>Categories</a></li>
            <li><a href="#featured" className="nav-link" onClick={(e) => { e.preventDefault(); scrollToSection('featured'); }}>Featured</a></li>
            <li><a href="#lookbook" className="nav-link" onClick={(e) => { e.preventDefault(); scrollToSection('lookbook'); }}>Lookbook</a></li>
            <li><a href="#about" className="nav-link" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}>About Us</a></li>
          </ul>

          <div className="nav-actions">
            {/* Theme Toggle */}
            <button
              className="nav-icon-btn theme-toggle-btn"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button 
              className="nav-icon-btn" 
              onClick={() => setCartOpen(true)}
              aria-label="View Cart"
            >
              <span>🛒</span>
              {getCartItemCount() > 0 && (
                <span className="cart-count-badge">{getCartItemCount()}</span>
              )}
            </button>
            
            <Link to="/login" className="btn-merchant" style={{ backgroundColor: '#c5a059', color: '#fff', borderColor: '#c5a059' }}>Login</Link>
          </div>

          <button 
            className={`hamburger ${menuOpen ? 'open' : ''}`} 
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

        </div>

        {/* ── MOBILE MENU ── */}
        <div className={`mobile-menu ${menuOpen ? 'menu-open' : ''}`}>
          <a href="#categories" className="mobile-link" onClick={(e) => { e.preventDefault(); scrollToSection('categories'); }}>Categories</a>
          <a href="#featured" className="mobile-link" onClick={(e) => { e.preventDefault(); scrollToSection('featured'); }}>Featured Collection</a>
          <a href="#lookbook" className="mobile-link" onClick={(e) => { e.preventDefault(); scrollToSection('lookbook'); }}>Lookbook</a>
          <a href="#about" className="mobile-link" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}>About Us</a>
          <div className="mobile-actions">
            <Link to="/login" className="btn-merchant w-full" style={{ backgroundColor: '#c5a059', color: '#fff', borderColor: '#c5a059' }} onClick={() => setMenuOpen(false)}>Login</Link>
          </div>
        </div>
      </nav>

      {/* ── DYNAMIC HERO SLIDER (SLIDING WINDOWS WITH VIDEO LOOPS) ── */}
      <section className="hero-section">
        {HERO_SLIDES.map((slide, index) => (
          <div 
            key={slide.id} 
            className={`hero-slide ${index === currentSlide ? 'slide-active' : ''}`}
          >
            <div className="hero-slide-bg">
              <video 
                autoPlay 
                loop 
                muted 
                playsInline 
                poster={slide.imgFallback}
              >
                <source src={slide.videoUrl} type="video/mp4" />
                <img src={slide.imgFallback} alt={slide.titleLine1} />
              </video>
            </div>
            <div className="hero-slide-overlay" />

            <div className="hero-slide-content">
              <p className="hero-tagline">{slide.tagline}</p>
              <h1 className="hero-title">
                {slide.titleLine1} <br />
                <span className="title-italic">{slide.titleLine2}</span>
              </h1>
              <p className="hero-desc">{slide.desc}</p>
              <a 
                href="#featured" 
                className="hero-cta-btn"
                onClick={(e) => { e.preventDefault(); scrollToSection('featured'); }}
              >
                Shop the Collection &rarr;
              </a>
            </div>
          </div>
        ))}

        {/* Slide navigation dots (vertical slider panel) */}
        <div className="hero-slider-dots">
          {HERO_SLIDES.map((slide, index) => (
            <button 
              key={slide.id} 
              className={`hero-slider-dot ${index === currentSlide ? 'dot-active' : ''}`}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Show slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Centered Bouncing Scroll Hint */}
        <a 
          href="#categories" 
          className="hero-scroll-hint"
          onClick={(e) => { e.preventDefault(); scrollToSection('categories'); }}
        >
          <span>Scroll to explore</span>
          <div className="scroll-arrow" />
        </a>
      </section>

      {/* ── SHOP BY CATEGORY ── */}
      <section className="section-padding category-section reveal-on-scroll" id="categories">
        <div className="container-inner">
          <div className="section-head">
            <span className="section-subtitle">Exquisite Categories</span>
            <h2 className="section-title-main">Shop by Category</h2>
          </div>

          <div className="category-grid">
            {CATEGORIES.map((cat, idx) => (
              <a 
                href="#featured" 
                key={idx} 
                className="category-card"
                onClick={(e) => { e.preventDefault(); scrollToSection('featured'); }}
              >
                <div className="category-img-wrap">
                  <img src={cat.img} alt={cat.name} />
                  <div className="category-card-overlay" />
                </div>
                <h3 className="category-title">{cat.name}</h3>
                <span className="category-count">{cat.count}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section className="section-padding featured-section reveal-on-scroll" id="featured">
        <div className="container-inner">
          <div className="section-head">
            <span className="section-subtitle">Curated Highlights</span>
            <h2 className="section-title-main">Trending Masterpieces</h2>
          </div>

          <div className="products-grid">
            {PRODUCTS.map((prod) => (
              <div key={prod.id} className="product-card">
                <div className="product-img-container">
                  <img src={prod.img} alt={prod.name} />
                  {prod.badge && <span className="product-tag">{prod.badge}</span>}
                  
                  <div className="product-hover-actions">
                    <button 
                      className="product-action-btn"
                      onClick={() => {
                        setActiveProduct(prod);
                        setActiveImageIdx(0); // reset thumbnail to main image when modal opens
                      }}
                    >
                      Quick View
                    </button>
                    <button 
                      className="product-action-btn"
                      onClick={() => addToCart(prod)}
                    >
                      Add To Cart
                    </button>
                  </div>
                </div>

                <div className="product-info-box">
                  <span className="prod-meta">{prod.brand} | {prod.category}</span>
                  <h3 className="prod-title">{prod.name}</h3>
                  <div className="rating-stars">★★★★★</div>
                  <span className="prod-price">{prod.priceStr}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROMOTIONAL LOOKBOOK ── */}
      <section className="lookbook-section reveal-on-scroll" id="lookbook">
        <div className="container-inner">
          <div className="lookbook-split">
            <div className="lookbook-image">
              <img src="/jewellery_hero.png" alt="Bridal Gold Lookbook Collection" />
            </div>
            <div className="lookbook-card">
              <span className="lookbook-label">The Heritage Edit</span>
              <h2 className="lookbook-title">Royal Bridal Gold & Pearls Collection</h2>
              <p className="lookbook-desc">
                Drawing inspiration from historic Indian royal courts, our latest bridal campaign showcases 22K pure antique gold fused with delicate Basra pearls and uncut diamonds. Built for the modern bride seeking legacy.
              </p>
              <a href="#featured" className="lookbook-link" onClick={(e) => { e.preventDefault(); scrollToSection('featured'); }}>
                Explore the Lookbook
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── NEW SECTION: THE ARTISAN STUDIO (VIDEO NARRATIVE) ── */}
      <section className="artisan-studio-section reveal-on-scroll">
        <div className="container-inner">
          <div className="artisan-studio-grid">
            <div className="artisan-video-wrapper">
              <img src="/model_necklace_two.png" alt="Generational Story" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div className="artisan-video-overlay" />
            </div>
            
            <div className="artisan-studio-text">
              <span className="artisan-label">The Goldsmith's Legacy</span>
              <h2 className="artisan-title">Every Sketch Tells a Generational Story</h2>
              <p className="artisan-desc">
                Every creation in our studio begins with a hand-drawn concept, followed by meticulous wax sculpting and solid metal smelting. The fusion of generational craftsmanship with GIA-certified diamond placing results in structural excellence and brilliant fire built to endure for lifetimes.
              </p>
              <a 
                href="#about" 
                className="lookbook-link"
                onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}
              >
                Learn Our Process
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US (VALUES) ── */}
      <section className="section-padding values-section reveal-on-scroll" id="about">
        <div className="values-bg-slider"></div>
        <div className="container-inner relative-z">
          <div className="section-head">
            <span className="section-subtitle">Our Promise</span>
            <h2 className="section-title-main">Exceptional Luxury Standards</h2>
          </div>

          <div className="values-grid">
            <div className="value-card glass-card">
              <div className="value-icon"><Gem size={30} strokeWidth={1.5} /></div>
              <h3 className="value-title">Certified Jewels</h3>
              <p className="value-desc">Every gemstone is verified by GIA, SGL, or IGI, ensuring absolute purity, clarity, and authenticity.</p>
            </div>
            
            <div className="value-card glass-card">
              <div className="value-icon"><Hammer size={30} strokeWidth={1.5} /></div>
              <h3 className="value-title">Generational Craft</h3>
              <p className="value-desc">Hand-finished by master gold filigree and diamond setters with skills passed down for centuries.</p>
            </div>

            <div className="value-card glass-card">
              <div className="value-icon"><ShieldCheck size={30} strokeWidth={1.5} /></div>
              <h3 className="value-title">Insured Transit</h3>
              <p className="value-desc">Complimentary shipping fully-insured door-to-door, guaranteeing a secure hand-delivery.</p>
            </div>

            <div className="value-card glass-card">
              <div className="value-icon"><Palette size={30} strokeWidth={1.5} /></div>
              <h3 className="value-title">Bespoke Design</h3>
              <p className="value-desc">Book an exclusive session with our leading designers to create your custom one-of-a-kind jewellery piece.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="section-padding testimonials-section reveal-on-scroll">
        <div className="testimonials-bg-slider"></div>
        
        {/* Floating attractive elements */}
        <img src="/emerald_pendant.png" className="floating-jewel jewel-1" alt="" />
        <img src="/model_earrings_three.png" className="floating-jewel jewel-2" alt="" />
        <img src="/luxury_watch.png" className="floating-jewel jewel-3" alt="" />

        <div className="container-inner relative-z">
          <div className="testimonial-wrapper">
            <div className="quote-icon">“</div>
            <div className="testimonial-carousel">
              {TESTIMONIALS.map((t, idx) => (
                <div key={idx} className={`testimonial-card ${idx === activeTestimonial ? 'active' : ''}`}>
                  <p className="testimonial-quote">{t.quote}</p>
                  <div className="testimonial-client">
                    <span className="client-name">{t.author}</span>
                    <span className="client-role">{t.role}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="carousel-dots">
              {TESTIMONIALS.map((_, idx) => (
                <button 
                  key={idx} 
                  className={`carousel-dot ${idx === activeTestimonial ? 'active' : ''}`}
                  onClick={() => setActiveTestimonial(idx)}
                  aria-label={`Testimonial slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SOCIAL SHOWCASE (#LuxeOrbit) ── */}
      <section className="section-padding social-gallery-section reveal-on-scroll">
        <div className="container-inner">
          <div className="social-head">
            <h2 className="social-tag-title">#LuxeOrbit</h2>
            <p className="social-subtitle-tag">
              Tag <span className="highlight-tag">@ninetheme</span> in your Instagram posts for a chance to be featured here.
            </p>
            <p className="social-secondary-tag">
              Find more inspiration on <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="social-insta-link">our Instagram account</a>.
            </p>
          </div>

          <div className="social-slideshow-wrapper">
            <div className="social-slideshow-track">
              {/* Duplicate posts for seamless infinite loop */}
              {[...SOCIAL_POSTS, ...SOCIAL_POSTS].map((post, idx) => (
                <div key={idx} className="social-slide-card">
                  <img src={post.img} alt={`Social Feature ${(idx % SOCIAL_POSTS.length) + 1}`} />
                  <div className="social-slide-hover">
                    <span className="social-slide-tag">{post.tag}</span>
                    <span className="social-slide-heart">♥</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* ── NEWSLETTER SIGNUP ── */}
      <section className="section-padding newsletter-section reveal-on-scroll">
        <div className="container-inner">
          <div className="newsletter-box">
            <h3>Subscribe to the Club</h3>
            <p>Receive exclusive collection previews, seasonal private lookbooks, and luxury jewellery maintenance insights direct to your inbox.</p>
            <form className="newsletter-form" onSubmit={(e) => { e.preventDefault(); alert('Thank you for subscribing! Keep an eye on your inbox for our next luxury dispatch.'); e.target.reset(); }}>
              <input type="email" placeholder="Your Email Address" className="newsletter-input" required />
              <button type="submit" className="newsletter-btn">Subscribe</button>
            </form>
          </div>
        </div>
      </section>

      {/* ── MERCHANT SAAS CALLOUT ── */}
      <section className="merchant-callout">
        <div className="container-inner">
          <div className="merchant-callout-inner">
            <div className="merchant-callout-text">
              <span className="merchant-tag">LuxeOrbit Merchant Ecosystem</span>
              <h2 className="merchant-title">Are you a boutique owner or store manager?</h2>
              <p className="merchant-desc">
                Streamline your precious metal store operations with LuxeOrbit. Manage multi-location inventory, synchronize gold/silver rates live (MCX/LBMA), track custom designer workflows, handle client concierge portfolios, and file automated GST reports.
              </p>
            </div>
            <div className="merchant-actions">
              <Link to="/login" className="btn-merchant">Merchant Portal</Link>
              <Link to="/register" className="btn-primary-gold">Register Boutique</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="landing-footer">
        <div className="container-inner">
          <div className="footer-top">
            
            <div className="footer-brand">
              <h4>LuxeOrbit<span>&bull;</span></h4>
              <p className="footer-tagline">Crafting eternal statements of pure luxury and unmatched artisan skill since 1926.</p>
              <div className="footer-socials">
                {/* Facebook */}
                <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Facebook">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                </a>
                {/* Instagram */}
                <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Instagram">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                  </svg>
                </a>
                {/* Pinterest */}
                <a href="https://www.pinterest.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Pinterest">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
                  </svg>
                </a>
                {/* Twitter / X */}
                <a href="https://www.x.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Twitter">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.631L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
                  </svg>
                </a>
              </div>

            </div>

            <div className="footer-col">
              <h5>Collections</h5>
              <ul className="footer-links">
                <li><a href="#featured" className="footer-link-a" onClick={(e) => { e.preventDefault(); scrollToSection('featured'); }}>The Bridal Collection</a></li>
                <li><a href="#featured" className="footer-link-a" onClick={(e) => { e.preventDefault(); scrollToSection('featured'); }}>Solitaire Diamond Series</a></li>
                <li><a href="#featured" className="footer-link-a" onClick={(e) => { e.preventDefault(); scrollToSection('featured'); }}>Tourbillon Timepieces</a></li>
                <li><a href="#featured" className="footer-link-a" onClick={(e) => { e.preventDefault(); scrollToSection('featured'); }}>Heritage Filigree Gold</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h5>Concierge Care</h5>
              <ul className="footer-links">
                <li><a href="#" className="footer-link-a" onClick={(e) => { e.preventDefault(); alert('Please register or log in to schedule a direct concierge virtual video consultation.'); }}>Book Consultation</a></li>
                <li><a href="#" className="footer-link-a" onClick={(e) => { e.preventDefault(); alert('Free insured shipping is provided on all orders. Detailed shipping guidelines are sent upon purchase.'); }}>Shipping & returns</a></li>
                <li><a href="#" className="footer-link-a" onClick={(e) => { e.preventDefault(); alert('We provide lifetime polish and gemstone inspection services at any of our physical boutiques.'); }}>Jewellery Care Guide</a></li>
                <li><a href="#" className="footer-link-a" onClick={(e) => { e.preventDefault(); alert('Please drop us an email at support@luxeorbit.com for rapid customer assistance.'); }}>Contact Support</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h5>Platform</h5>
              <ul className="footer-links">
                <li><Link to="/login" className="footer-link-a">Merchant Login</Link></li>
                <li><Link to="/register" className="footer-link-a">Store Registration</Link></li>
                <li><Link to="/privacy" className="footer-link-a">Merchant Privacy Rules</Link></li>
                <li><Link to="/terms" className="footer-link-a">SaaS Terms of Service</Link></li>
              </ul>
            </div>

          </div>

          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} LuxeOrbit. All rights reserved.</p>
            <div className="footer-bottom-links">
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms & Conditions</Link>
              <Link to="/security">Security Policies</Link>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Powered by NineTheme
          </div>
        </div>
      </footer>

      {/* ── QUICK VIEW MODAL (WITH INTERACTIVE IMAGES ROW) ── */}
      {activeProduct && (
        <div className="modal-overlay" onClick={() => setActiveProduct(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setActiveProduct(null)}>&times;</button>
            
            <div className="modal-img-area">
              <div className="modal-main-img-wrap">
                <img src={activeProduct.images[activeImageIdx]} alt={activeProduct.name} />
              </div>
              <div className="modal-thumbnails">
                {activeProduct.images.map((imgUrl, idx) => (
                  <button 
                    key={idx}
                    className={`modal-thumb-btn ${idx === activeImageIdx ? 'thumb-active' : ''}`}
                    onClick={() => setActiveImageIdx(idx)}
                    aria-label={`View alternate image ${idx + 1}`}
                  >
                    <img src={imgUrl} alt={`thumbnail ${idx + 1}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="modal-details-area">
              <span className="modal-category">{activeProduct.brand} | {activeProduct.category}</span>
              <h2 className="modal-title">{activeProduct.name}</h2>
              <div className="modal-price">{activeProduct.priceStr}</div>
              <p className="modal-desc">{activeProduct.description}</p>
              
              <div className="modal-specs">
                <div className="spec-item">
                  <span className="spec-label">Metal / Purity</span>
                  <span className="spec-val">{activeProduct.specs.metal}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Approx Net Weight</span>
                  <span className="spec-val">{activeProduct.specs.weight}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Stones & Carats</span>
                  <span className="spec-val">{activeProduct.specs.stones}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Certification / Origin</span>
                  <span className="spec-val">{activeProduct.specs.certification || activeProduct.specs.collection}</span>
                </div>
              </div>

              <div className="modal-actions-row">
                <button 
                  className="btn-modal-cart"
                  onClick={() => {
                    addToCart(activeProduct);
                    setActiveProduct(null);
                  }}
                >
                  Add To Shopping Bag
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SHOPPING CART DRAWER ── */}
      {cartOpen && (
        <div className="drawer-overlay" onClick={() => setCartOpen(false)} />
      )}
      <div className={`cart-drawer ${cartOpen ? 'drawer-open' : ''}`}>
        <div className="drawer-header">
          <h3>Shopping Bag ({getCartItemCount()})</h3>
          <button className="drawer-close-btn" onClick={() => setCartOpen(false)}>&times;</button>
        </div>

        <div className="drawer-items">
          {cart.length === 0 ? (
            <div className="empty-cart-msg">
              <p>Your luxury shopping bag is currently empty.</p>
              <button 
                className="btn-merchant" 
                style={{ marginTop: '1.5rem', width: 'auto', display: 'inline-block' }}
                onClick={() => setCartOpen(false)}
              >
                Continue Browsing
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="cart-item">
                <img src={item.img} alt={item.name} className="cart-item-img" />
                <div className="cart-item-details">
                  <span className="cart-item-name">{item.name} ({item.quantity})</span>
                  <span className="cart-item-price">
                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(item.priceVal * item.quantity)}
                  </span>
                  <button 
                    className="cart-item-remove"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="drawer-footer">
            <div className="cart-summary-row">
              <span className="cart-summary-label">Estimated Total:</span>
              <span className="cart-summary-total">{getCartTotal()}</span>
            </div>
            <button 
              className="btn-checkout"
              onClick={() => {
                alert('Checkout Simulated! Under our luxury concierge program, an agent will reach out via email to process insurance, security deposits, and customized delivery dates.');
                setCart([]);
                setCartOpen(false);
              }}
            >
              Secure Checkout &rarr;
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
