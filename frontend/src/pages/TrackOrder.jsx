import { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../config/firebase';
import { doc, onSnapshot, collection } from 'firebase/firestore';
import { Package, CheckCircle, Truck, MapPin, Clock, ArrowLeft, Radio } from 'lucide-react';

// ─── Leaflet loader ────────────────────────────────────────────────────────
function useLeafletMap(mapRef) {
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const trailRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    if (!document.getElementById('leaflet-css-track')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css-track';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    const init = () => {
      const L = window.L;
      if (!L || !mapRef.current || mapInstanceRef.current) return;
      const map = L.map(mapRef.current).setView([19.076, 72.877], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);
      mapInstanceRef.current = map;
    };

    if (window.L) {
      init();
    } else {
      const existing = document.getElementById('leaflet-js-track');
      if (!existing) {
        const script = document.createElement('script');
        script.id = 'leaflet-js-track';
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = init;
        document.head.appendChild(script);
      } else {
        existing.addEventListener('load', init);
      }
    }
  }, []);

  return { mapInstanceRef, markerRef, trailRef };
}

const STATUS_STEPS = [
  { key: 'pending',         label: 'Order Placed',       icon: Package },
  { key: 'confirmed',       label: 'Confirmed',           icon: CheckCircle },
  { key: 'processing',      label: 'Processing',          icon: Clock },
  { key: 'assigned',        label: 'Assigned to Rider',   icon: Radio },
  { key: 'Pending Pickup',  label: 'Picked from Store',   icon: MapPin },
  { key: 'out_for_delivery',label: 'Out for Delivery',    icon: Truck },
  { key: 'delivered',       label: 'Delivered',           icon: CheckCircle },
];

function getStepIndex(status) {
  const idx = STATUS_STEPS.findIndex(s => s.key === status);
  return idx === -1 ? 0 : idx;
}

export default function TrackOrder() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [partnerLocation, setPartnerLocation] = useState(null);
  const [partnerTrail, setPartnerTrail] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);
  const { mapInstanceRef, markerRef, trailRef } = useLeafletMap(mapRef);

  // Subscribe to the order document
  useEffect(() => {
    if (!db || !orderId) { setLoading(false); setError('No order ID provided.'); return; }
    const unsub = onSnapshot(doc(db, 'orders', orderId), (snap) => {
      if (snap.exists()) {
        setOrder({ id: snap.id, ...snap.data() });
        setError(null);
      } else {
        setError('Order not found. Please check your order ID.');
      }
      setLoading(false);
    }, () => { setError('Failed to load order details.'); setLoading(false); });
    return () => unsub();
  }, [orderId]);

  // Subscribe to delivery partner location
  useEffect(() => {
    if (!db || !order?.deliveryPartnerId) return;
    const unsub = onSnapshot(doc(db, 'locations', order.deliveryPartnerId), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setPartnerLocation(data);
        if (data.lat && data.lng) {
          setPartnerTrail(prev => {
            const point = { lat: data.lat, lng: data.lng };
            if (prev.length === 0) return [point];
            const last = prev[prev.length - 1];
            if (Math.hypot(last.lat - data.lat, last.lng - data.lng) < 0.00005) return prev;
            return [...prev, point];
          });
        }
      } else {
        setPartnerLocation(null);
      }
    });
    return () => unsub();
  }, [order?.deliveryPartnerId]);

  // Update Leaflet marker + trail
  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = window.L;
    if (!map || !L || !partnerLocation?.lat) return;

    const { lat, lng } = partnerLocation;

    if (!markerRef.current) {
      const icon = L.divIcon({
        className: '',
        html: `<div style="
          width:20px;height:20px;
          background:#c9a84c;
          border-radius:50%;
          border:3px solid #fff;
          box-shadow:0 0 0 0 rgba(201,168,76,0.6);
          animation:live-pulse 1.5s infinite;
        "></div>
        <style>@keyframes live-pulse{0%{box-shadow:0 0 0 0 rgba(201,168,76,0.6)}70%{box-shadow:0 0 0 14px rgba(201,168,76,0)}100%{box-shadow:0 0 0 0 rgba(201,168,76,0)}}</style>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
      markerRef.current = L.marker([lat, lng], { icon })
        .addTo(map)
        .bindPopup(`<b>🚚 ${partnerLocation.partnerName || 'Your Rider'}</b><br/>En route to you`);
    } else {
      markerRef.current.setLatLng([lat, lng]);
    }
    map.setView([lat, lng], Math.max(map.getZoom(), 14));

    if (partnerTrail.length > 1) {
      const coords = partnerTrail.map(p => [p.lat, p.lng]);
      if (trailRef.current) {
        trailRef.current.setLatLngs(coords);
      } else {
        trailRef.current = L.polyline(coords, {
          color: '#c9a84c', weight: 3, opacity: 0.7, dashArray: '6, 6'
        }).addTo(map);
      }
    }
  }, [partnerLocation, partnerTrail]);

  const stepIndex = order ? getStepIndex(order.status) : 0;
  const isLive = partnerLocation && ['out_for_delivery', 'assigned', 'Pending Pickup', 'shipped'].includes(order?.status);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <Package size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <div>Loading order details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', background: 'var(--bg)', padding: '2rem', textAlign: 'center' }}>
        <Package size={64} style={{ opacity: 0.2, color: 'var(--text-muted)' }} />
        <h2 style={{ color: 'var(--text-primary)', margin: 0 }}>Order Not Found</h2>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>{error}</p>
        <Link to="/" style={{ color: 'var(--gold)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none' }}>
          <ArrowLeft size={16} /> Back to Lumina Jewels
        </Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <Link to="/" style={{ color: 'var(--text-muted)', display: 'flex' }}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontFamily: 'Playfair Display, serif', color: 'var(--text-primary)' }}>
              Track Your Order
            </h1>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Order <span style={{ color: 'var(--gold)', fontWeight: 700, fontFamily: 'monospace' }}>{order.id}</span>
            </div>
          </div>
          {isLive && (
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(46,204,113,0.12)', border: '1px solid rgba(46,204,113,0.3)', borderRadius: '20px', padding: '0.3rem 0.75rem', fontSize: '0.75rem', color: '#2ecc71', fontWeight: 700 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#2ecc71', display: 'inline-block', animation: 'live-pulse 1.5s infinite' }} />
              LIVE
            </div>
          )}
        </div>

        {/* Order summary card */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--admin-border)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Customer</div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>{order.customer}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Item</div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.2rem' }}>{order.product}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Amount</div>
              <div style={{ fontWeight: 700, color: 'var(--gold)', marginTop: '0.2rem' }}>₹{order.amount?.toLocaleString('en-IN')}</div>
            </div>
            {order.deliveryPartnerName && (
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Rider</div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Truck size={14} color="var(--gold)" />
                  {order.deliveryPartnerName}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Progress stepper */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--admin-border)', borderRadius: '16px', padding: '1.5rem 2rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem' }}>
            Delivery Progress
          </div>
          <div style={{ position: 'relative' }}>
            {/* Background track */}
            <div style={{ position: 'absolute', top: '14px', left: '14px', right: '14px', height: '3px', background: 'var(--admin-border)', zIndex: 0 }} />
            {/* Progress fill */}
            <div style={{
              position: 'absolute', top: '14px', left: '14px',
              height: '3px', zIndex: 1,
              background: 'linear-gradient(90deg, var(--gold), #f1c40f)',
              width: stepIndex === 0 ? '0%' : `${(stepIndex / (STATUS_STEPS.length - 1)) * 100}%`,
              transition: 'width 0.6s ease',
            }} />
            {/* Steps */}
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
              {STATUS_STEPS.map((step, i) => {
                const StepIcon = step.icon;
                const done = i <= stepIndex;
                const active = i === stepIndex;
                return (
                  <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', maxWidth: '70px' }}>
                    <div style={{
                      width: 30, height: 30,
                      borderRadius: '50%',
                      background: done ? (active ? 'var(--gold)' : '#2ecc71') : 'var(--surface)',
                      border: done ? 'none' : '2px solid var(--admin-border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.4s',
                      boxShadow: active ? '0 0 0 4px rgba(201,168,76,0.25)' : 'none',
                    }}>
                      <StepIcon size={14} color={done ? '#000' : 'var(--text-muted)'} />
                    </div>
                    <div style={{ fontSize: '0.6rem', textAlign: 'center', color: done ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: active ? 700 : 400, lineHeight: 1.3 }}>
                      {step.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>




        {/* Footer */}
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
          <div style={{ marginBottom: '0.5rem' }}>
            Having trouble? <a href="mailto:support@luminajewels.com" style={{ color: 'var(--gold)' }}>Contact Support</a>
          </div>
          <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
            ← Back to Lumina Jewels
          </Link>
        </div>

      </div>
    </div>
  );
}
