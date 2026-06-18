import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, CheckCircle, Clock, Package, Truck, AlertCircle, Phone, MessageSquare, MapPin, ShieldCheck, ShoppingBag, Landmark, ArrowRight, User, HelpCircle, FileText, Check } from 'lucide-react';
import { useOrders } from '../../hooks/useOrders';
import { useLogistics } from '../../hooks/useLogistics';

const MILESTONES = [
  { key: 'placed', label: 'Ordered' },
  { key: 'PACKED', label: 'Packed' },
  { key: 'OUT_FOR_DELIVERY', label: 'Shipped' },
  { key: 'DELIVERED', label: 'Delivered' }
];

const TIMELINE_STEPS = [
  { key: 'placed', label: 'Order Placed', desc: 'Seller has received and confirmed your order' },
  { key: 'PREPARING', label: 'Preparing Jewellery', desc: 'Item is being polished and verified in vault' },
  { key: 'QUALITY_CHECK', label: 'Quality Audit Complete', desc: 'Weight, purity and specs certified' },
  { key: 'PACKED', label: 'Packed & Sealed', desc: 'Securely packaged in a temper-evident security box' },
  { key: 'READY', label: 'Handed over to Courier', desc: 'Picked up from store and in transit' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', desc: 'Secure transit partner is heading to your address' },
  { key: 'NEAR_CUSTOMER', label: 'Near Your Location', desc: 'Rider is arriving shortly' },
  { key: 'DELIVERED', label: 'Delivered Successfully', desc: 'Order delivered, OTP verified' }
];

export default function OrderTracking() {
  const { orderId } = useParams();
  const { orders } = useOrders();
  const { shipments } = useLogistics();
  
  const [partnerLocation, setPartnerLocation] = useState(null);
  const [eta, setEta] = useState('15 mins');
  const [distance, setDistance] = useState('2.1 km');
  const [lastUpdated, setLastUpdated] = useState('Just now');

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  // Find the order
  const order = orders?.find(o => o.id === orderId) || {
    id: orderId || '#LJ-7890',
    createdAt: { seconds: Date.now() / 1000 },
    status: 'pending',
    product: 'Royal Gold Jewellery Item',
    storeName: 'Khandelval Pune',
    deliveryPartnerName: 'Ramesh Singh',
    customer: 'John Doe',
    address: '123 Luxury Avenue, Pune, Maharashtra',
    phone: '+91 98765 43210',
    amount: 61158.31,
    paymentMethod: 'Cash on Delivery'
  };

  const shipment = shipments?.find(s => s.orderId === order.id);
  const currentStatus = shipment?.status || order.status?.toUpperCase() || 'PENDING';

  // Load Leaflet dynamically
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => {
      const L = window.L;
      if (!L || !mapRef.current) return;
      const map = L.map(mapRef.current, { zoomControl: false }).setView([19.076, 72.877], 14);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(map);
      L.control.zoom({ position: 'bottomright' }).addTo(map);
      mapInstanceRef.current = map;
    };
    document.head.appendChild(script);
  }, []);

  // Poll for location updates every 15 seconds
  useEffect(() => {
    const fetchTracking = async () => {
      try {
        const { getAuth } = await import('firebase/auth');
        const auth = getAuth();
        const token = auth.currentUser ? await auth.currentUser.getIdToken() : '';
        const res = await fetch(`/api/delivery/tracking?orderId=${order.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (data.success && data.latestCheckpoint) {
          const { latitude, longitude } = data.latestCheckpoint;
          setPartnerLocation({ lat: latitude, lng: longitude });
          setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
          setDistance('1.5 km');
          setEta('10 mins');
        } else {
          // Fallback mock updates for demo
          const randomLat = 19.076 + (Math.random() - 0.5) * 0.003;
          const randomLng = 72.877 + (Math.random() - 0.5) * 0.003;
          setPartnerLocation({ lat: randomLat, lng: randomLng });
          setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        }
      } catch (e) {
        console.warn("Failed to poll location", e);
      }
    };

    fetchTracking();
    const interval = setInterval(fetchTracking, 15000);
    return () => clearInterval(interval);
  }, [order.id]);

  // Update Map Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = window.L;
    if (!map || !L || !partnerLocation) return;

    const { lat, lng } = partnerLocation;
    if (!markerRef.current) {
      const riderIcon = L.divIcon({
        className: '',
        html: `
          <div class="rider-marker-container">
            <div class="rider-pulse-ring"></div>
            <div class="rider-icon-inner">🏍️</div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });
      markerRef.current = L.marker([lat, lng], { icon: riderIcon }).addTo(map)
        .bindPopup('<b>🏍️ Secure Delivery Partner</b>').openPopup();
    } else {
      markerRef.current.setLatLng([lat, lng]);
    }
    map.setView([lat, lng], map.getZoom());
  }, [partnerLocation]);

  const isStepCompleted = (stepKey) => {
    if (stepKey === 'placed') return true;
    const statesMap = {
      'PENDING': 1, 'PREPARING': 2, 'QUALITY_CHECK': 3, 'PACKED': 4,
      'READY': 5, 'OUT_FOR_DELIVERY': 6, 'NEAR_CUSTOMER': 7, 'DELIVERED': 8
    };
    const currentWeight = statesMap[currentStatus] || 1;
    const targetWeight = statesMap[stepKey] || 0;
    return currentWeight >= targetWeight;
  };

  const getProgressPercent = () => {
    if (currentStatus === 'DELIVERED') return 100;
    if (['OUT_FOR_DELIVERY', 'NEAR_CUSTOMER'].includes(currentStatus)) return 75;
    if (['READY', 'PACKED'].includes(currentStatus)) return 50;
    if (['PREPARING', 'QUALITY_CHECK'].includes(currentStatus)) return 25;
    return 10;
  };

  const deliveryPartnerName = order.deliveryPartnerName || shipment?.deliveryPartnerName;

  return (
    <div style={{ maxWidth: '950px', margin: '0 auto', paddingBottom: '5rem', color: '#fff' }}>
      
      {/* Styles */}
      <style>{`
        .rider-marker-container {
          position: relative;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .rider-pulse-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: rgba(46, 204, 113, 0.4);
          animation: ringPulse 2s infinite ease-out;
        }
        .rider-icon-inner {
          position: relative;
          background: #000;
          border: 2px solid #2ecc71;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.5);
          z-index: 5;
        }
        @keyframes ringPulse {
          0% { transform: scale(0.6); opacity: 1; }
          100% { transform: scale(1.6); opacity: 0; }
        }

        .amazon-card {
          background: #111;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }

        /* Amazon-style Progress Bar */
        .progress-container {
          display: flex;
          justify-content: space-between;
          position: relative;
          margin: 2rem 0;
          padding: 0 1rem;
        }
        .progress-line-bg {
          position: absolute;
          top: 10px;
          left: 2rem;
          right: 2rem;
          height: 4px;
          background: #2b2b2b;
          z-index: 1;
        }
        .progress-line-fill {
          position: absolute;
          top: 10px;
          left: 2rem;
          height: 4px;
          background: #2ecc71;
          z-index: 2;
          transition: width 0.4s ease;
        }
        .milestone-node {
          position: relative;
          z-index: 3;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          width: 80px;
        }
        .milestone-dot {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #111;
          border: 3px solid #2b2b2b;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          color: #fff;
          transition: all 0.3s ease;
        }
        .milestone-dot.completed {
          background: #2ecc71;
          border-color: #2ecc71;
        }
        .milestone-dot.active {
          background: #111;
          border-color: #2ecc71;
          box-shadow: 0 0 8px #2ecc71;
        }
        .milestone-label {
          font-size: 0.8rem;
          font-weight: 600;
          margin-top: 0.5rem;
          color: var(--text-secondary);
        }
        .milestone-label.completed {
          color: #fff;
        }
        .milestone-label.active {
          color: #2ecc71;
        }

        /* Details list layout */
        .details-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 1.5rem;
        }
        @media(max-width: 768px) {
          .details-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Back to Orders */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/account/orders" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>
          <ChevronLeft size={16} /> Back to My Orders
        </Link>
      </div>

      {/* Header Banner - Estimated Delivery */}
      <div className="amazon-card" style={{ borderLeft: '4px solid #2ecc71' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 700, color: '#fff' }}>
              {currentStatus === 'DELIVERED' ? 'Delivered Successfully' : 'Arriving by 9 PM'}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.3rem 0 0 0' }}>
              Your order <strong style={{ color: '#fff' }}>{order.id.toUpperCase()}</strong> has been dispatched from {order.storeName || 'Lumina central vault'}.
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Latest telemetry check: </span>
            <span style={{ fontSize: '0.8rem', color: '#2ecc71', fontWeight: 600 }}>{lastUpdated}</span>
          </div>
        </div>

        {/* Amazon Horizontal Progress Bar */}
        <div className="progress-container">
          <div className="progress-line-bg" />
          <div className="progress-line-fill" style={{ width: `calc(${getProgressPercent()}% - 4rem)` }} />
          
          {MILESTONES.map((milestone, idx) => {
            const isCompleted = isStepCompleted(milestone.key);
            const isActive = currentStatus === milestone.key || (milestone.key === 'placed' && currentStatus === 'PENDING');
            
            return (
              <div key={idx} className="milestone-node">
                <div className={`milestone-dot ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                  {isCompleted && <Check size={12} strokeWidth={3} />}
                </div>
                <span className={`milestone-label ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                  {milestone.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Details Grid */}
      <div className="details-grid">
        
        {/* Left Side: Map / Detailed timeline log */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Active rider map widget */}
          {['OUT_FOR_DELIVERY', 'NEAR_CUSTOMER', 'IN_TRANSIT'].includes(currentStatus) && (
            <div className="amazon-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                <span>🏍️ Rider Distance: <strong style={{color:'#fff'}}>{distance}</strong></span>
                <span>ETA: <strong style={{color:'var(--gold)'}}>{eta}</strong></span>
              </div>
              <div ref={mapRef} style={{ height: '280px', borderRadius: '6px', overflow: 'hidden' }} />
            </div>
          )}

          {/* Chronological Activity Log (Amazon/Flipkart style) */}
          <div className="amazon-card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
              Detailed Tracking History
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingLeft: '1rem' }}>
              {TIMELINE_STEPS.map((step, idx) => {
                const isDone = isStepCompleted(step.key);
                const isCurrent = currentStatus === step.key;
                
                return (
                  <div key={idx} style={{ display: 'flex', gap: '1.5rem', position: 'relative', opacity: isDone || isCurrent ? 1 : 0.4 }}>
                    
                    {/* Vertical connecting line */}
                    {idx < TIMELINE_STEPS.length - 1 && (
                      <div style={{
                        position: 'absolute',
                        left: '7px',
                        top: '1.2rem',
                        bottom: '-1.5rem',
                        width: '2px',
                        background: isDone ? '#2ecc71' : '#2b2b2b'
                      }} />
                    )}

                    {/* Timeline Node Dot */}
                    <div style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      background: isCurrent ? '#111' : isDone ? '#2ecc71' : '#2b2b2b',
                      border: `3px solid ${isCurrent ? '#2ecc71' : isDone ? '#2ecc71' : '#2b2b2b'}`,
                      boxShadow: isCurrent ? '0 0 6px #2ecc71' : 'none',
                      zIndex: 2,
                      marginTop: '2px'
                    }} />

                    <div>
                      <h4 style={{ fontSize: '0.9rem', margin: 0, fontWeight: 600, color: isCurrent ? '#2ecc71' : '#fff' }}>
                        {step.label}
                      </h4>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Shipping address, Payment mode & Support card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Shipping details */}
          <div className="amazon-card">
            <h3 style={{ fontSize: '1rem', color: 'var(--gold)', margin: '0 0 1rem 0', letterSpacing: '0.5px' }}>Delivery Address</h3>
            <div style={{ fontSize: '0.85rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
              <div style={{ fontWeight: 700, color: '#fff', marginBottom: '0.3rem' }}>{order.customer}</div>
              <div>{order.address}</div>
              <div style={{ marginTop: '0.5rem' }}>Phone: {order.phone}</div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="amazon-card">
            <h3 style={{ fontSize: '1rem', color: 'var(--gold)', margin: '0 0 1rem 0', letterSpacing: '0.5px' }}>Payment Summary</h3>
            <div style={{ fontSize: '0.85rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span>Method</span>
                <span style={{ color: '#fff', fontWeight: 600 }}>{order.paymentMethod}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                <span>Grand Total</span>
                <span style={{ color: 'var(--gold)', fontWeight: 700, fontSize: '0.95rem' }}>₹{order.amount?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Active Courier Partner details */}
          <div className="amazon-card">
            <h3 style={{ fontSize: '1rem', color: 'var(--gold)', margin: '0 0 1rem 0', letterSpacing: '0.5px' }}>Delivery Associate</h3>
            {deliveryPartnerName ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <div style={{ width: 38, height: 38, background: 'linear-gradient(135deg, var(--gold) 0%, #a38230 100%)', color: '#000', fontWeight: 'bold', fontSize: '0.9rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {deliveryPartnerName.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#fff' }}>{deliveryPartnerName}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>Secure Courier Partner</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <a href="tel:+919876543210" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.8rem', padding: '0.55rem' }}>
                    <Phone size={13} /> Call Partner
                  </a>
                  <button className="btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.8rem', padding: '0.55rem', background: 'var(--gold)', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '4px' }}>
                    <MessageSquare size={13} /> Chat Support
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
                <User size={18} color="var(--text-muted)" style={{ marginBottom: '0.5rem' }} />
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Awaiting Courier Assignment</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
