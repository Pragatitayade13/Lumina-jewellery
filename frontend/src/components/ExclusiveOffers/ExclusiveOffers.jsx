// src/components/ExclusiveOffers/ExclusiveOffers.jsx
import { useState, useEffect } from 'react';
import { Tag, Clock, Copy, Check, Zap } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useCMS } from '../../context/CMSContext';
import './ExclusiveOffers.css';

function CountdownTimer({ endDate }) {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = Math.max(0, endDate - Date.now());
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTime({ h, m, s });
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [endDate]);

  const pad = n => String(n).padStart(2, '0');
  return (
    <div className="countdown">
      {[['h', 'Hrs'], ['m', 'Min'], ['s', 'Sec']].map(([key, label]) => (
        <div key={key} className="countdown-unit">
          <div className="countdown-value">{pad(time[key])}</div>
          <div className="countdown-label">{label}</div>
        </div>
      ))}
    </div>
  );
}

function CouponCard({ code, discount, description, endDate, color }) {
  const [copied, setCopied] = useState(false);
  const { showToast } = useApp();

  const copy = () => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(true);
    showToast(`Coupon ${code} copied!`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="coupon-card" style={{ '--coupon-color': color }} id={`coupon-${code}`}>
      <div className="coupon-left">
        <div className="coupon-discount">{discount}</div>
        <div className="coupon-desc">{description}</div>
        {endDate && (
          <div className="coupon-timer">
            <Clock size={12} /><span>Limited time offer</span>
          </div>
        )}
      </div>
      <div className="coupon-divider">
        <div className="coupon-circle top" />
        <div className="coupon-dashes" />
        <div className="coupon-circle bottom" />
      </div>
      <div className="coupon-right">
        <div className="coupon-code-label">Use Code</div>
        <div className="coupon-code">{code}</div>
        <button className="coupon-copy-btn" onClick={copy} id={`copy-${code}-btn`}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied!' : 'Copy Code'}
        </button>
      </div>
    </div>
  );
}

const coupons = [
  { code: 'LUMINA20', discount: '20% OFF', description: 'On all gold jewellery above ₹15,000', color: 'var(--gold)', endDate: Date.now() + 86400000 * 3 },
  { code: 'BRIDAL30', discount: '30% OFF', description: 'On complete bridal sets', color: '#8B1A2E', endDate: Date.now() + 86400000 * 7 },
  { code: 'BOGO50', discount: 'Buy 1 Get 1', description: 'On selected silver jewellery', color: '#C0C0C0', endDate: Date.now() + 86400000 * 2 },
  { code: 'FESTIVE25', discount: '25% OFF', description: 'Festive season special offer', color: '#2ecc71', endDate: Date.now() + 86400000 * 5 },
];

export default function ExclusiveOffers() {
  const { showToast } = useApp();
  const { landingPageData } = useCMS();

  const defaultOffers = {
    sectionLabel: 'Limited Time',
    title: 'Exclusive Offers',
    subtitle: 'Grab these amazing deals before they\'re gone! Use coupon codes at checkout.',
    flashTitle: 'Wedding Collection',
    flashSub: 'Up to 40% off on selected bridal jewellery sets',
    flashEndDate: Date.now() + 86400000 * 1.5,
    banners: [
      { title: 'Festival Offers', sub: 'Up to 35% on gold', icon: '✦', bg: 'linear-gradient(135deg, #2a1f00, #1a0800)' },
      { title: 'First Purchase', sub: '₹500 cashback', icon: '◈', bg: 'linear-gradient(135deg, #1a002a, #0d0015)' },
      { title: 'Refer & Earn', sub: '₹1000 for every referral', icon: '◉', bg: 'linear-gradient(135deg, #001a10, #000d08)' },
    ]
  };
  const offers = { ...defaultOffers, ...(landingPageData?.exclusiveOffers || {}) };

  return (
    <section className="offers-section" id="exclusive-offers">
      <div className="offers-bg" />
      <div className="container">
        <div className="section-header reveal">
          <span className="section-label"><Zap size={12} style={{ display: 'inline', marginRight: 6 }} />{offers.sectionLabel}</span>
          <h2 className="section-title">{offers.title}</h2>
          <div className="gold-divider" />
          <p className="section-subtitle">{offers.subtitle}</p>
        </div>

        {/* Flash Sale Banner */}
        <div className="flash-sale-banner reveal">
          <div className="flash-sale-left">
            <div className="flash-badge"><Zap size={16} />Flash Sale</div>
            <h3 className="flash-title">{offers.flashTitle}</h3>
            <p className="flash-sub">{offers.flashSub}</p>
          </div>
          <div className="flash-sale-right">
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
              <Clock size={12} style={{ display: 'inline', marginRight: 4 }} />Ends in
            </p>
            <CountdownTimer endDate={offers.flashEndDate} />
          </div>
        </div>


        {/* Offer Banners */}
        <div className="offer-banners reveal">
          {(offers.banners || []).map((b, i) => (
            <div key={i} className="offer-banner-card" style={{ background: b.bg }} id={`offer-banner-${i}`}>
              <div className="offer-banner-icon">{b.icon}</div>
              <div>
                <div className="offer-banner-title">{b.title}</div>
                <div className="offer-banner-sub">{b.sub}</div>
              </div>
              <button 
                className="btn btn-outline" 
                style={{ marginTop: '1rem', fontSize: '0.78rem', padding: '0.5rem 1.2rem' }}
                onClick={() => showToast(`${b.title} claimed successfully! Offer will be applied at checkout.`)}
              >
                <Tag size={13} /> Claim Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
