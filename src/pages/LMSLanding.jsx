// src/pages/LMSLanding.jsx
import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stage } from '@react-three/drei';
import { 
  Diamond, Sparkles, Store, ShieldCheck, Cpu, LayoutGrid, 
  BarChart3, RefreshCw, Layers, Users, Zap, Check, ChevronRight, 
  ArrowRight, ShieldAlert, FileText, Receipt, PackageCheck, Heart
} from 'lucide-react';
import './LMSLanding.css';

gsap.registerPlugin(ScrollTrigger);

// 3D Ring Model fallback/simple shape for WebGL Showcase
function RotatingRing() {
  const ringRef = useRef();

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.y = state.clock.getElapsedTime() * 0.5;
      ringRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.3) * 0.2;
    }
  });

  return (
    <group ref={ringRef}>
      {/* Outer band */}
      <mesh castShadow receiveShadow>
        <torusGeometry args={[1.6, 0.25, 32, 64]} />
        <meshStandardMaterial 
          color="#d4af37" 
          metalness={0.9} 
          roughness={0.1} 
          envMapIntensity={1.5}
        />
      </mesh>
      {/* Crown/Base for Diamond */}
      <mesh position={[0, 1.7, 0]}>
        <cylinderGeometry args={[0.3, 0.15, 0.4, 8]} />
        <meshStandardMaterial 
          color="#e5e4e2" 
          metalness={0.95} 
          roughness={0.05} 
        />
      </mesh>
      {/* Solitaire Diamond */}
      <mesh position={[0, 2.05, 0]} castShadow>
        <octahedronGeometry args={[0.45, 0]} />
        <meshStandardMaterial 
          color="#e0f7fa" 
          metalness={0.1}
          roughness={0.02}
          transparent
          opacity={0.85}
          refractionRatio={0.98}
        />
      </mesh>
    </group>
  );
}

// Features List Data
const features = [
  { id: 'inv', title: 'Inventory Management', icon: <Store size={24} />, desc: 'Real-time multi-store stock audits, automatic reorder limits, and detailed SKU status tracking for gold, diamond, and silver items.' },
  { id: 'bill', title: 'Billing System', icon: <Receipt size={24} />, desc: 'Instant itemized invoicing with integrated GST tax slabs (CGST, SGST, IGST), discount applications, and payment method receipts.' },
  { id: 'crm', title: 'CRM Solutions', icon: <Users size={24} />, desc: 'Comprehensive customer purchase history, profile logs, custom wedding wishlists, and tailored loyalty points management.' },
  { id: 'multi', title: 'Multi-Store Syncing', icon: <Layers size={24} />, desc: 'Secure state-isolated databases. Shift and balance active store contexts instantly to prevent global data leaks.' },
  { id: 'report', title: 'Reports & Analytics', icon: <BarChart3 size={24} />, desc: 'Visual revenue matrices, business expense breakdown charts, audit trail updates, and high-performance CSV/Excel exports.' },
  { id: 'logistics', title: 'Logistics & Dispatch', icon: <Cpu size={24} />, desc: 'Shadow-write shipment routing, live tracking updates, zone delivery mappings, and secure customer OTP verification.' },
  { id: 'finance', title: 'Finance Management', icon: <LayoutGrid size={24} />, desc: 'Automatic ledger registry for vendor payments, running expenses, order revenues, and structured approval workflows.' },
  { id: 'rbac', title: 'User Permissions & RBAC', icon: <ShieldCheck size={24} />, desc: 'Secure staff and admin credentials, custom operational restrictions, and end-to-end ledger audit logging.' }
];

// Timeline / Process Steps
const steps = [
  { num: '01', title: 'Store Setup', desc: 'Initialize active stores, set store codes, and assign dedicated staff and delivery partners securely.' },
  { num: '02', title: 'Product Management', desc: 'Stock inventory shelves with metal codes, weight parameters, hallmarked certification details, and HD gallery assets.' },
  { num: '03', title: 'Customer Orders', desc: 'Secure customer checkouts through atomic database transactions. Instantly verify stock levels and reduce inventory levels.' },
  { num: '04', title: 'Billing & Invoice Routing', desc: 'Calculate accurate subtotal costs and tax details. Automatically route and generate invoices matching state laws.' },
  { num: '05', title: 'Logistics Dispatch', desc: 'Auto-create delivery routes, assign local partners, send live tracking history updates, and close shipments.' },
  { num: '06', title: 'Reports & Aggregates', desc: 'Evaluate monthly growth charts, review transactional audit logs, and download spreadsheet summaries.' }
];

// Testimonials Data
const testimonials = [
  { name: 'Karan Khandelval', role: 'Owner, Khandelval Jewellers', text: 'This LMS platform revolutionized our Pune store. Spanning 14 registers, the state-isolation prevents any data leak and streamlines billing.' },
  { name: 'Amit Patel', role: 'Operations Director, G&J Corp', text: 'Stunning design and execution. The logistics OTP verification and dynamic invoice calculator saved us over 40 hours of audit time weekly.' },
  { name: 'Meera Krishnan', role: 'Retail Head, Royal Sparkle', text: 'Managing inventory across Mumbai and Chennai is seamless. We set reorder triggers and the Three.js ring visualizer wows retail clients!' },
  { name: 'Sanjay Shah', role: 'Founder, Gold & Jems', text: 'Vastly superior to traditional ERP tools. The system counts stats in real time and export sheets align with accounting criteria.' }
];

// Pricing Plans
const pricingPlans = [
  { name: 'Starter', price: '₹4,999', period: '/month', features: ['Up to 2 Active Stores', 'Full Billing & Invoices', 'Inventory Management', 'Basic Audit Trails', 'Standard CSV Export'], popular: false },
  { name: 'Professional', price: '₹9,999', period: '/month', features: ['Up to 10 Active Stores', 'State-Isolated Database Sync', 'Three.js 3D Ring Visualizer', 'Logistics OTP Dispatch', 'Custom CRM Slabs', 'Priority Support'], popular: true },
  { name: 'Enterprise', price: 'Custom', period: '', features: ['Unlimited Active Stores', 'Dedicated Database Nodes', 'White-label Store Domains', 'API Ledger Integrations', 'Custom Audit Reports', '24/7 Account Manager'], popular: false }
];

export default function LMSLanding() {
  const navigate = useNavigate();
  const [navScrolled, setNavScrolled] = useState(false);
  const heroRef = useRef(null);
  const ringShowcaseRef = useRef(null);
  const [activeTab, setActiveTab] = useState('features');

  // Stats counter state
  const [stats, setStats] = useState({ stores: 0, orders: 0, products: 0, uptime: 0 });

  // Handle nav background on scroll
  useEffect(() => {
    const handleScroll = () => {
      setNavScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Parallax Mouse Effect on Hero Ring
  const handleHeroMouseMove = (e) => {
    if (!ringShowcaseRef.current) return;
    const { clientX, clientY } = e;
    const moveX = (clientX - window.innerWidth / 2) * 0.03;
    const moveY = (clientY - window.innerHeight / 2) * 0.03;
    
    gsap.to(ringShowcaseRef.current, {
      x: moveX,
      y: moveY,
      duration: 0.8,
      ease: 'power2.out'
    });
  };

  // GSAP Animations
  useEffect(() => {
    // 1. Navbar stagger entrance
    gsap.fromTo('.lms-logo', 
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' }
    );
    gsap.fromTo('.lms-nav-link-item', 
      { opacity: 0, y: -10 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out', delay: 0.1 }
    );

    // 2. Hero word-by-word reveal
    const heroTitle = document.querySelector('.lms-hero-headline');
    if (heroTitle) {
      const words = heroTitle.innerText.split(' ');
      heroTitle.innerHTML = words.map(w => `<span class="hero-word" style="display:inline-block; opacity:0; transform:translateY(20px); margin-right:8px;">${w}</span>`).join('');
      gsap.to('.hero-word', {
        opacity: 1,
        y: 0,
        stagger: 0.06,
        duration: 0.8,
        ease: 'power4.out',
        delay: 0.2
      });
    }

    // Hero details entrance
    gsap.fromTo('.hero-fade-in',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out', delay: 0.6 }
    );

    // 3. Stats section count-up on scroll
    ScrollTrigger.create({
      trigger: '.lms-stats',
      start: 'top 85%',
      onEnter: () => {
        // Increment stats
        gsap.to({}, {
          duration: 2,
          onUpdate: function () {
            const progress = this.progress();
            setStats({
              stores: Math.floor(progress * 500),
              orders: Math.floor(progress * 100),
              products: Math.floor(progress * 1000),
              uptime: (90 + progress * 9.9).toFixed(1)
            });
          }
        });
      }
    });

    // 4. Feature Cards staggered reveal
    gsap.fromTo('.lms-feature-card',
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.05,
        duration: 0.6,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.lms-features-grid',
          start: 'top 90%',
          toggleActions: 'play none none reverse'
        }
      }
    );

    // 5. Timeline Progress Line growth
    gsap.fromTo('.lms-timeline-progress',
      { height: '0%' },
      {
        height: '100%',
        ease: 'none',
        scrollTrigger: {
          trigger: '.lms-timeline-container',
          start: 'top 50%',
          end: 'bottom 50%',
          scrub: true
        }
      }
    );

    // Timeline step activation
    const steps = gsap.utils.toArray('.lms-timeline-step');
    steps.forEach((step, idx) => {
      ScrollTrigger.create({
        trigger: step,
        start: 'top 60%',
        onEnter: () => step.classList.add('active'),
        onLeaveBack: () => step.classList.remove('active')
      });
    });

    // 6. Pricing cards reveal
    gsap.fromTo('.lms-pricing-card',
      { opacity: 0, y: 60 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.1,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.lms-pricing-grid',
          start: 'top 85%'
        }
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <div className="lms-page" onMouseMove={handleHeroMouseMove}>
      
      {/* Background Gold Particles */}
      <div className="lms-particles-container">
        {Array.from({ length: 45 }).map((_, i) => (
          <div
            key={i}
            className="lms-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 5 + 2}px`,
              height: `${Math.random() * 5 + 2}px`,
              animationDelay: `${Math.random() * -30}s`,
              animationDuration: `${Math.random() * 15 + 15}s`
            }}
          />
        ))}
      </div>
      
      {/* ─── PREMIUM NAVBAR ─── */}
      <nav className={`lms-nav ${navScrolled ? 'scrolled' : ''}`}>
        <div className="lms-nav-container">
          <Link to="/lms" className="lms-logo">
            LUMINA<span>LMS</span>
          </Link>
          <ul className="lms-nav-links">
            <li className="lms-nav-link-item"><a href="#features" className="lms-nav-item">Features</a></li>
            <li className="lms-nav-link-item"><a href="#showcase" className="lms-nav-item">3D Showcase</a></li>
            <li className="lms-nav-link-item"><a href="#gallery" className="lms-nav-item">Collections</a></li>
            <li className="lms-nav-link-item"><a href="#process" className="lms-nav-item">Process</a></li>
            <li className="lms-nav-link-item"><a href="#pricing" className="lms-nav-item">Pricing</a></li>
          </ul>
          <div className="lms-nav-actions">
            <Link to="/collections" className="lms-nav-link-item lms-nav-item" style={{ marginRight: '1rem' }}>B2C Shop</Link>
            <button className="lms-btn lms-btn-primary" onClick={() => navigate('/admin')}>
              Admin Panel
            </button>
          </div>
        </div>
      </nav>

      {/* ─── HERO SECTION ─── */}
      <header className="lms-hero">
        <div className="lms-hero-glow"></div>
        <div className="lms-hero-container">
          <div className="lms-hero-content">
            <div className="lms-hero-badge hero-fade-in">
              <Sparkles size={12} style={{ marginRight: '6px' }} /> B2B JEWELLERY SaaS PLATFORM
            </div>
            <h1 className="lms-hero-headline">
              Transform Your Retail Business with <span className="gold-txt">Smart Enterprise</span> Logistics
            </h1>
            <p className="lms-hero-subheadline hero-fade-in">
              BIS-certified tracking, dynamic ledger bookkeeping, automated multi-store databases, and OTP-routed logistics. Everything designed for next-generation gold, diamond, and luxury jewellery brands.
            </p>
            <div className="lms-hero-ctas hero-fade-in">
              <button onClick={() => navigate('/admin')} className="lms-btn lms-btn-primary">
                Start Free Trial <ArrowRight size={16} style={{ marginLeft: '8px' }} />
              </button>
              <a href="#features" className="lms-btn lms-btn-secondary">
                Explore Features
              </a>
            </div>
          </div>
          <div className="lms-hero-showcase hero-fade-in" ref={ringShowcaseRef}>
            <div className="lms-hero-rays"></div>
            <img 
              src="/src/assets/product_5_1779901527769.png" 
              alt="Luxury Diamond Ring" 
              className="lms-hero-showcase-ring"
            />
          </div>
        </div>
      </header>

      {/* ─── STATISTICS SECTION ─── */}
      <section className="lms-stats">
        <div className="lms-stats-container">
          <div className="lms-stat-card">
            <div className="lms-stat-number">{stats.stores}+</div>
            <div className="lms-stat-label">Active Stores</div>
          </div>
          <div className="lms-stat-card">
            <div className="lms-stat-number">{stats.orders}K+</div>
            <div className="lms-stat-label">Orders Processed</div>
          </div>
          <div className="lms-stat-card">
            <div className="lms-stat-number">{stats.products}K+</div>
            <div className="lms-stat-label">Products Managed</div>
          </div>
          <div className="lms-stat-card">
            <div className="lms-stat-number">{stats.uptime}%</div>
            <div className="lms-stat-label">System Uptime</div>
          </div>
        </div>
      </section>

      {/* ─── FEATURE SHOWCASE SECTION ─── */}
      <section className="lms-features" id="features">
        <div className="lms-section-header">
          <h2 className="lms-section-title">
            Engineered to Scale <span>Enterprise Operations</span>
          </h2>
          <p className="lms-section-subtitle">
            Say goodbye to slow audits, inventory leaks, and tax errors. Lumina LMS provides state-of-the-art secure nodes to power billing, CRM, ledger reporting, and logistics.
          </p>
        </div>
        <div className="lms-features-grid">
          {features.map((feat) => (
            <div key={feat.id} className="lms-feature-card">
              <div className="lms-feature-icon">{feat.icon}</div>
              <h3 className="lms-feature-title">{feat.title}</h3>
              <p className="lms-feature-desc">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 3D JEWELLERY SHOWCASE ─── */}
      <section className="lms-3d-section" id="showcase">
        <div className="lms-3d-container">
          <div className="lms-3d-info">
            <div className="lms-hero-badge" style={{ marginBottom: '1.5rem', width: 'fit-content' }}>
              INTERACTIVE RETAIL SHOWCASE
            </div>
            <h2 className="lms-section-title" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
              Virtual <span>3D Customization</span> Canvas
            </h2>
            <p className="lms-section-subtitle" style={{ textAlign: 'left', marginBottom: '2.5rem', lineHeight: '1.7' }}>
              Provide clients with a cinematic high-fidelity preview of precious materials. Drag, rotate, and interact with diamonds, solid gold cuts, and platinum bands directly in the web browser at a locked 60 FPS.
            </p>
            <button className="lms-btn lms-btn-primary" onClick={() => navigate('/collections')}>
              Try Virtual Try-On <Sparkles size={16} style={{ marginLeft: '8px' }} />
            </button>
          </div>
          <div className="lms-3d-canvas-wrap">
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} intensity={1.2} castShadow />
              <directionalLight position={[-10, 10, 5]} intensity={0.8} />
              <RotatingRing />
              <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1.5} />
            </Canvas>
            <div className="lms-3d-hint">Drag to rotate the solitaire model</div>
          </div>
        </div>
      </section>

      {/* ─── PRODUCT & STORE GALLERY ─── */}
      <section className="lms-gallery" id="gallery">
        <div className="lms-section-header">
          <h2 className="lms-section-title">
            Curated <span>Jewellery Collections</span>
          </h2>
          <p className="lms-section-subtitle">
            Explore our state-isolated inventory catalog. Customers can place real-time checkout orders that immediately link to the respective store logs.
          </p>
        </div>
        <div className="lms-gallery-grid">
          <div className="lms-gallery-item">
            <img src="/src/assets/category_rings_1779901339180.png" alt="Rings" />
            <div className="lms-gallery-overlay">
              <div className="lms-gallery-title">Luxury Diamonds</div>
              <div className="lms-gallery-tag">18K White Gold Solitaire</div>
            </div>
          </div>
          <div className="lms-gallery-item">
            <img src="/src/assets/category_necklaces_1779901360570.png" alt="Necklaces" />
            <div className="lms-gallery-overlay">
              <div className="lms-gallery-title">Bridal Sets</div>
              <div className="lms-gallery-tag">Heritage Polki Chokers</div>
            </div>
          </div>
          <div className="lms-gallery-item">
            <img src="/src/assets/category_earrings_1779901376432.png" alt="Earrings" />
            <div className="lms-gallery-overlay">
              <div className="lms-gallery-title">Jhumka Studs</div>
              <div className="lms-gallery-tag">BIS-Certified Gold</div>
            </div>
          </div>
          <div className="lms-gallery-item">
            <img src="/src/assets/category_bangles_1779901402606.png" alt="Bangles" />
            <div className="lms-gallery-overlay">
              <div className="lms-gallery-title">Engagement Sets</div>
              <div className="lms-gallery-tag">Platinum & Diamond Bands</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TIMELINE / PROCESS SECTION ─── */}
      <section className="lms-timeline" id="process">
        <div className="lms-section-header">
          <h2 className="lms-section-title">
            Workflow <span>Execution Roadmap</span>
          </h2>
          <p className="lms-section-subtitle">
            Follow the automated lifecycle of stock additions, customer checkouts, invoice tax generation, logistics dispatching, and auditing.
          </p>
        </div>
        <div className="lms-timeline-container">
          <div className="lms-timeline-line"></div>
          <div className="lms-timeline-progress"></div>
          {steps.map((step, idx) => (
            <div key={idx} className="lms-timeline-step">
              <div className="lms-timeline-badge">{step.num}</div>
              <div className="lms-timeline-card">
                <h3 className="lms-timeline-title">{step.title}</h3>
                <p className="lms-timeline-desc">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── TESTIMONIALS MARQUEE ─── */}
      <section className="lms-testimonials">
        <div className="lms-section-header" style={{ marginBottom: '3rem' }}>
          <h2 className="lms-section-title">
            Trusted by <span>Industry Leaders</span>
          </h2>
          <p className="lms-section-subtitle">
            Hear from regional showroom owners who managed data isolation, reduced stock leaks, and secured logistics with Lumina LMS.
          </p>
        </div>
        <div className="lms-marquee-container">
          {/* Double arrays for seamless marquee infinite loop */}
          {[...testimonials, ...testimonials].map((test, idx) => (
            <div key={idx} className="lms-testimonial-card">
              <div className="lms-quote">“</div>
              <p className="lms-feedback">{test.text}</p>
              <div className="lms-client">
                <div className="lms-client-avatar">{test.name.substring(0,2).toUpperCase()}</div>
                <div>
                  <div className="lms-client-name">{test.name}</div>
                  <div className="lms-client-role">{test.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── PRICING SECTION ─── */}
      <section className="lms-pricing" id="pricing">
        <div className="lms-section-header">
          <h2 className="lms-section-title">
            Simple <span>Transparent Pricing</span>
          </h2>
          <p className="lms-section-subtitle">
            Start free and upgrade to unlock multi-store databases, custom inventory APIs, and 3D visual try-ons.
          </p>
        </div>
        <div className="lms-pricing-grid">
          {pricingPlans.map((plan, idx) => (
            <div key={idx} className={`lms-pricing-card ${plan.popular ? 'popular' : ''}`}>
              {plan.popular && <span className="lms-popular-tag">Popular Plan</span>}
              <div className="lms-plan-name">{plan.name}</div>
              <div className="lms-plan-price">{plan.price}<span>{plan.period}</span></div>
              <ul className="lms-plan-features">
                {plan.features.map((feat, i) => (
                  <li key={i}><Check size={14} /> {feat}</li>
                ))}
              </ul>
              <button 
                onClick={() => navigate('/admin')} 
                className={`lms-btn ${plan.popular ? 'lms-btn-primary' : 'lms-btn-secondary'}`}
                style={{ marginTop: 'auto', width: '100%' }}
              >
                Get Started
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CALL TO ACTION SECTION ─── */}
      <section className="lms-cta">
        <div className="lms-cta-glow"></div>
        <div className="lms-cta-container">
          <h2 className="lms-cta-title">
            Transform Your Jewellery Business with Smart Management
          </h2>
          <p className="lms-cta-desc">
            Join 500+ premium retailers who have isolated multi-store data, reduced audit workloads, and scaled operations globally.
          </p>
          <button onClick={() => navigate('/admin')} className="lms-btn lms-btn-primary" style={{ padding: '1.2rem 2.5rem', fontSize: '1rem' }}>
            Book A Personal Demo <ChevronRight size={18} />
          </button>
        </div>
      </section>

      {/* ─── FOOTER SECTION ─── */}
      <footer className="lms-footer">
        <div className="lms-footer-container">
          <div className="lms-footer-logo">
            LUMINA<span>LMS</span>
          </div>
          <ul className="lms-footer-nav">
            <li><a href="#features" className="lms-footer-link">Features</a></li>
            <li><a href="#showcase" className="lms-footer-link">3D Showcase</a></li>
            <li><a href="#gallery" className="lms-footer-link">Collections</a></li>
            <li><a href="#process" className="lms-footer-link">Process</a></li>
            <li><a href="#pricing" className="lms-footer-link">Pricing</a></li>
          </ul>
          <div className="lms-footer-divider"></div>
          <div className="lms-footer-bottom">
            <div>
              © {new Date().getFullYear()} Lumina LMS. All rights reserved. Crafted with ♥ in India.
            </div>
            <div>
              Engineered by <span style={{ color: 'var(--lms-gold)', fontWeight: 600 }}>AgroZone Technology Pvt. Ltd.</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
