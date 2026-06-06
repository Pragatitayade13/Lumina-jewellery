import { useState, useMemo, useRef, useEffect } from 'react';
import { Map, Package, CheckCircle, ShieldAlert, Phone, MapPin, RefreshCcw, Camera, Truck, XCircle, IndianRupee, Navigation, Navigation2, Radio, Clock } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useOrders } from '../../hooks/useOrders';
import { useLogistics, LOGISTICS_STATES } from '../../hooks/useLogistics';
import { useDeliveryLocation } from '../../hooks/useDeliveryLocation';
import { useApp } from '../../context/AppContext';

function StatCard({ icon, iconClass, label, value, trend, trendUp, trendNote, accentColor }) {
  return (
    <div className="stat-card" style={{ '--card-accent': accentColor, background: 'var(--surface)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <div className={iconClass} style={{ color: accentColor }}>{icon}</div>
        <div className={`stat-trend ${trendUp ? 'up' : 'down'}`} style={{ fontSize: '0.75rem', fontWeight: 600, color: trendUp ? 'var(--status-green)' : 'var(--status-red)' }}>
          {trendUp ? '↑' : '↓'} {trend}
        </div>
      </div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{label}</div>
      <div style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.2rem 0' }}>{value}</div>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{trendNote}</div>
    </div>
  );
}


// ─── Load Leaflet dynamically (no bundler issues) ─────────────────────────
function useLeaflet(mapRef, center) {
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const trailRef = useRef(null);
  const partnersRef = useRef({});

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Inject Leaflet CSS
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
      const map = L.map(mapRef.current).setView(center, 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);
      mapInstanceRef.current = map;
    };
    document.head.appendChild(script);
    return () => { /* keep map alive */ };
  }, []);

  return { mapInstanceRef, markerRef, trailRef, partnersRef };
}

function LiveMapTab({ isTracking, myPosition, myTrail, startTracking, stopTracking, partnerLocations }) {
  const mapRef = useRef(null);
  const center = [19.076, 72.877]; // Mumbai default
  const { mapInstanceRef, markerRef, trailRef, partnersRef } = useLeaflet(mapRef, center);

  // Update MY marker + trail when position changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = window.L;
    if (!map || !L || !myPosition) return;

    const { lat, lng } = myPosition;

    // My pulsing marker
    if (!markerRef.current) {
      const myIcon = L.divIcon({
        className: '',
        html: `<div style="
          width:18px;height:18px;
          background:var(--gold, #c9a84c);
          border-radius:50%;
          border:3px solid #fff;
          box-shadow:0 0 0 0 rgba(201,168,76,0.6);
          animation:live-pulse 1.5s infinite;
        "></div>
        <style>@keyframes live-pulse{0%{box-shadow:0 0 0 0 rgba(201,168,76,0.6)}70%{box-shadow:0 0 0 12px rgba(201,168,76,0)}100%{box-shadow:0 0 0 0 rgba(201,168,76,0)}}</style>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });
      markerRef.current = L.marker([lat, lng], { icon: myIcon })
        .addTo(map)
        .bindPopup('<b>📍 You are here</b>');
    } else {
      markerRef.current.setLatLng([lat, lng]);
    }
    map.setView([lat, lng], map.getZoom() < 14 ? 14 : map.getZoom());

    // Breadcrumb trail polyline
    if (myTrail.length > 1) {
      const coords = myTrail.map(p => [p.lat, p.lng]);
      if (trailRef.current) {
        trailRef.current.setLatLngs(coords);
      } else {
        trailRef.current = L.polyline(coords, {
          color: '#c9a84c',
          weight: 3,
          opacity: 0.8,
          dashArray: '6, 6'
        }).addTo(map);
      }
    }
  }, [myPosition, myTrail]);

  // Update other partner markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = window.L;
    if (!map || !L) return;

    const current = new Set();
    partnerLocations.forEach(p => {
      if (!p.lat || !p.lng) return;
      current.add(p.id);
      if (!partnersRef.current[p.id]) {
        const icon = L.divIcon({
          className: '',
          html: `<div style="background:#3498db;width:14px;height:14px;border-radius:50%;border:2px solid #fff;"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });
        partnersRef.current[p.id] = L.marker([p.lat, p.lng], { icon })
          .addTo(map)
          .bindPopup(`<b>🚚 ${p.partnerName || 'Partner'}</b>`);
      } else {
        partnersRef.current[p.id].setLatLng([p.lat, p.lng]);
      }
    });

    // Remove stale markers
    Object.keys(partnersRef.current).forEach(id => {
      if (!current.has(id)) {
        partnersRef.current[id].remove();
        delete partnersRef.current[id];
      }
    });
  }, [partnerLocations]);

  return (
    <div style={{ position: 'relative' }}>
      {/* Controls bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '1rem',
        padding: '1rem 1.5rem',
        background: 'var(--surface)',
        border: '1px solid var(--admin-border)',
        borderBottom: 'none',
        borderRadius: '12px 12px 0 0',
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Route Navigation</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.15rem' }}>
            {isTracking ? (
              <>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2ecc71', display: 'inline-block', animation: 'live-pulse 1.5s infinite' }} />
                <span style={{ color: '#2ecc71', fontWeight: 600 }}>Live tracking active</span>
                {myPosition && (
                  <span style={{ color: 'var(--text-muted)', marginLeft: 4 }}>
                    · {myPosition.lat.toFixed(5)}, {myPosition.lng.toFixed(5)} · ±{Math.round(myPosition.accuracy)}m
                  </span>
                )}
              </>
            ) : (
              <span>Location tracking off — click "Go On Duty" to start</span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {partnerLocations.length} partner{partnerLocations.length !== 1 ? 's' : ''} online
          </span>
          <button
            onClick={isTracking ? stopTracking : startTracking}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.5rem 1.25rem',
              background: isTracking ? 'rgba(231,76,60,0.15)' : 'var(--gold)',
              color: isTracking ? '#e74c3c' : '#000',
              border: isTracking ? '1px solid #e74c3c' : 'none',
              borderRadius: '8px',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '0.85rem',
              transition: 'all 0.2s',
            }}
          >
            <Radio size={14} />
            {isTracking ? 'Go Off Duty' : 'Go On Duty'}
          </button>
        </div>
      </div>

      {/* Map container */}
      <div
        ref={mapRef}
        style={{
          height: '500px',
          border: '1px solid var(--admin-border)',
          borderRadius: '0 0 12px 12px',
          overflow: 'hidden',
          zIndex: 0,
        }}
      />

      {/* Trail stats overlay */}
      {myTrail.length > 1 && (
        <div style={{
          position: 'absolute', bottom: '12px', left: '12px',
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
          padding: '0.6rem 1rem', borderRadius: '8px',
          color: '#fff', fontSize: '0.78rem', zIndex: 500,
          display: 'flex', gap: '1rem', alignItems: 'center',
        }}>
          <span style={{ color: '#c9a84c', fontWeight: 700 }}>📍 Trail</span>
          <span>{myTrail.length} points recorded</span>
        </div>
      )}
    </div>
  );
}

export default function DeliveryOperations() {

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab') || 'dashboard';
  
  const { orders: liveOrders } = useOrders();
  const { shipments, updateStatus: updateLogisticsStatus, verifyDeliveryOTP } = useLogistics();
  const { user, showToast } = useApp();
  const isSuperAdmin = user?.role === 'superadmin';
  const prevAssignedCountRef = useRef(0);
  const [optimisticStatuses, setOptimisticStatuses] = useState({});

  useEffect(() => {
    if (!liveOrders) return;
    const currentAssignedCount = liveOrders.filter(o => o.status === 'assigned').length;
    
    // If the number of assigned orders increases, trigger a notification
    if (currentAssignedCount > prevAssignedCountRef.current && prevAssignedCountRef.current !== 0) {
      showToast(`🔔 New delivery assigned! Check your Assigned Orders tab.`);
      
      // Attempt to play a subtle notification sound (may be blocked by browser without interaction)
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.volume = 0.5;
        audio.play().catch(e => console.log('Audio autoplay blocked'));
      } catch (e) {}
    }
    
    // Update the ref to the current count
    prevAssignedCountRef.current = currentAssignedCount;
  }, [liveOrders, showToast]);
    const { isTracking, myPosition, myTrail, startTracking, stopTracking, partnerLocations } = useDeliveryLocation(
    user?.uid,
    user?.name || user?.email
  );
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpInputs, setOtpInputs] = useState(['', '', '', '', '', '']);
  const [photos, setPhotos] = useState({});
  const [cameraModal, setCameraModal] = useState({ isOpen: false, pickupId: null });
  const [failureModal, setFailureModal] = useState({ isOpen: false, order: null, reason: '' });
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Delivery Reminder Notification
  useEffect(() => {
    if (!liveOrders) return;
    const hasPending = liveOrders.some(o => ['assigned', 'in_transit', 'out_for_delivery'].includes(o.status));
    if (!hasPending) return;
    
    const interval = setInterval(() => {
      showToast('⏰ Reminder: You have active pending deliveries to complete.');
    }, 120000); // 2 minutes for demo purposes (would be longer in production)
    
    return () => clearInterval(interval);
  }, [liveOrders, showToast]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please allow camera permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    if (cameraModal.isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [cameraModal.isOpen]);

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      
      setPhotos(prev => ({ ...prev, [cameraModal.pickupId]: dataUrl }));
      const isDelivery = cameraModal.isDelivery;
      const pickupId = cameraModal.pickupId;
      setCameraModal({ isOpen: false, pickupId: null, isDelivery: false });
      
      if (isDelivery) {
        setTimeout(() => {
           const order = liveOrders.find(o => o.id === pickupId);
           if (order) handleDeliveryClick(order, true);
        }, 300);
      }
    }
  };

  const allAssigned = liveOrders 
    ? liveOrders.map(o => ({
        ...o,
        address: o.city || 'Mumbai',
        time: o.date || 'Today',
        type: o.amount > 100000 ? 'High Value' : 'Standard'
      }))
    : [];

  const assignedOrders = allAssigned.filter(o => o.status === 'packed'); // Before assignment, or keep assigned? The prompt: Pending -> Packed -> Assigned -> In Transit
  const pendingPickups = allAssigned.filter(o => o.status === 'assigned');
  const activeTransits = allAssigned.filter(o => ['in_transit', 'out_for_delivery', 'delayed'].includes(o.status));

  const totalAssigned = allAssigned.length;
  const pendingDeliveries = allAssigned.filter(o => ['assigned', 'in_transit', 'out_for_delivery', 'delayed'].includes(o.status)).length;
  const deliveredOrders = liveOrders ? liveOrders.filter(o => o.status === 'delivered').length : 0;
  const failedDeliveries = liveOrders ? liveOrders.filter(o => ['cancelled', 'returned'].includes(o.status)).length : 0;
  const earnings = deliveredOrders * 50;

  const staticReturns = [
    { id: '#RET-4402', customer: 'Anjali Desai', address: 'Andheri East, Mumbai', type: 'Old Gold Exchange', estValue: '₹80,000', instructions: 'Verify 22k hallmark before sealing.', isMock: true },
    { id: '#RET-4405', customer: 'Vikram Mehta', address: 'Colaba, Mumbai', type: 'Return', estValue: '₹35,000', instructions: 'Check for physical damage.', isMock: true }
  ];

  const dynamicReturns = allAssigned
    .filter(o => ['cancelled', 'returned'].includes(o.status))
    .map(o => ({
      id: o.id,
      customer: o.customer,
      address: o.address,
      type: o.status === 'cancelled' ? 'Failed Delivery Return' : 'Customer Return',
      estValue: `₹${(o.amount || 0).toLocaleString('en-IN')}`,
      instructions: 'Secure item and return to hub.',
      isMock: false
    }));

  const assignedReturns = [...dynamicReturns, ...staticReturns];

  const handleDeliveryClick = (order, skipPhoto = false) => {
    if (!skipPhoto && !photos[order.id]) {
      setCameraModal({ isOpen: true, pickupId: order.id, isDelivery: true });
      return;
    }

    setSelectedOrder(order);
    setShowOtpModal(true);
    setOtpInputs(['', '', '', '', '', '']);
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value[value.length - 1];
    const newOtp = [...otpInputs];
    newOtp[index] = value;
    setOtpInputs(newOtp);
  };

  const verifyOtp = async () => {
    const enteredOtp = otpInputs.join('');
    if (enteredOtp.length < 6) return;
    
    try {
      if (selectedOrder) {
        const linkedShipment = shipments.find(s => s.orderId === selectedOrder.id);
        if (linkedShipment) {
          const success = await verifyDeliveryOTP(linkedShipment.id, enteredOtp, user?.role, user?.uid);
          if (success) {
            showToast('Delivery marked as successful!');
            setShowOtpModal(false);
            setSelectedOrder(null);
            setOptimisticStatuses(prev => { const next = {...prev}; delete next[selectedOrder.id]; return next; });
          } else {
            alert('Invalid OTP. Please try again or contact support.');
          }
        }
      }
    } catch (err) {
      alert('Failed to verify OTP or update delivery status in database.');
    }
  };

  const renderOrderList = (list, emptyMessage) => {
    if (list.length === 0) {
      return (
        <div style={{ padding: '3rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
          <Package size={48} color="var(--text-muted)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>{emptyMessage}</p>
        </div>
      );
    }
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {list.map(order => (
          <div key={order.id} className="admin-card" style={{ padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
            {order.type === 'High Value' && (
              <div style={{ position: 'absolute', top: 0, right: 0, background: 'var(--status-red)', color: '#fff', fontSize: '0.65rem', padding: '0.2rem 0.5rem', borderBottomLeftRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <ShieldAlert size={10} /> HIGH VALUE
              </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
              <span style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--gold)' }}>{order.id}</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{order.time}</span>
            </div>
            
            <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.2rem' }}>{order.customer || 'Customer'}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'flex-start', gap: '0.4rem', marginBottom: '1rem' }}>
              <MapPin size={14} style={{ marginTop: '0.1rem', flexShrink: 0 }} />
              <span>{order.address}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Status</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: (optimisticStatuses[order.id] || order.status) === 'pending' ? 'var(--status-orange)' : 'var(--status-green)', textTransform: 'capitalize' }}>
                  {(optimisticStatuses[order.id] || order.status) === 'in_transit' ? 'In Transit' : (optimisticStatuses[order.id] || order.status).replace(/_/g, ' ')}
                </div>
                {order.updatedAt && (
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.1rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <Clock size={10} />
                    {new Date(order.updatedAt?.toDate ? order.updatedAt.toDate() : order.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                
                {['in_transit', 'out_for_delivery', 'delayed'].includes(order.status) && (
                   <select 
                     className="form-input" 
                     style={{ 
                       width: 'auto', 
                       minWidth: '135px',
                       padding: '0 0.5rem', 
                       fontSize: '0.8rem', 
                       height: '32px', 
                       background: 'rgba(255,255,255,0.05)', 
                       color: 'var(--text-primary)', 
                       border: '1px solid var(--admin-border)', 
                       borderRadius: '6px',
                       cursor: 'pointer',
                       fontWeight: 600
                     }}
                     value={optimisticStatuses[order.id] || order.status}
                     onChange={async (e) => {
                       const val = e.target.value;
                       if (val === 'failed') {
                         setFailureModal({ isOpen: true, order: order, reason: '' });
                       } else {
                         // Optimistically update the UI instantly
                         setOptimisticStatuses(prev => ({ ...prev, [order.id]: val }));
                         try {
                           await updateLogisticsStatus(order.id, val, user?.role, user?.uid);
                           showToast(`✅ Status updated to ${val === 'in_transit' ? 'In Transit' : val.replace(/_/g, ' ')}`);
                         } catch (err) {
                           console.error("Failed status update", err);
                           // Revert optimistic update on failure
                           setOptimisticStatuses(prev => {
                             const newObj = { ...prev };
                             delete newObj[order.id];
                             return newObj;
                           });
                           showToast(`❌ Error: Could not update status.`);
                         }
                       }
                     }}
                   >
                     <option value="in_transit">In Transit</option>
                     <option value="out_for_delivery">Out for Delivery</option>
                     <option value="delayed">Delayed</option>
                     <option value="cancelled">Delivery Failed</option>
                   </select>
                )}

                {order.status === 'packed' && (
                   <button className="btn btn-sm btn-outline" onClick={() => {
                     updateLogisticsStatus(order.id, 'assigned', user?.role, user?.uid);
                     alert("Assignment accepted! Please proceed to pickup the package from the store.");
                   }}>Accept Assignment</button>
                )}
                {order.status === 'assigned' && (
                   <button className="btn btn-sm btn-outline" onClick={async () => {
                     try {
                      // Find shipment ID linked to this order
                      const linkedShipment = shipments.find(s => s.orderId === order.id);
                      
                      if (linkedShipment) {
                        await updateLogisticsStatus(linkedShipment.id, 'in_transit', user?.role, user?.uid);
                      }
                      showToast('Pickup confirmed. Navigating to delivery status.');
                    } catch(e) {
                      showToast('Failed to update status', 'error');
                    }
                     alert("[MOCK SMS GATEWAY] \n\nMessage sent to customer (+91 9876543210):\n\"Your order " + order.id + " is In Transit!\"");
                   }}>Confirm Pickup</button>
                )}
                {['in_transit', 'out_for_delivery', 'delayed'].includes(order.status) && (
                   <button className="btn btn-sm" style={{ background: '#c9a84c', color: '#FFFFFF', fontWeight: 'bold' }} onClick={() => handleDeliveryClick(order)}>Verify & Deliver</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderReturnsList = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ padding: '0.75rem', background: 'rgba(230, 126, 34, 0.1)', border: '1px solid rgba(230, 126, 34, 0.3)', borderRadius: '8px', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
         <ShieldAlert size={16} color="var(--status-orange)" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
         <div style={{ fontSize: '0.75rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
           <strong>Strict Protocol:</strong> All returned and exchange items must be sealed in the tamper-evident security bags provided. Scan barcode before leaving customer premises.
         </div>
      </div>

      {assignedReturns.map(pickup => (
        <div key={pickup.id} className="admin-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--gold)' }}>{pickup.id}</span>
            <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>{pickup.type}</span>
          </div>
          
          <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.2rem' }}>{pickup.customer}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'flex-start', gap: '0.4rem', marginBottom: '1rem' }}>
            <MapPin size={14} style={{ marginTop: '0.1rem', flexShrink: 0 }} />
            <span>{pickup.address}</span>
          </div>

          <div style={{ background: 'var(--surface)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            <strong>Est Value:</strong> {pickup.estValue}<br/>
            <strong>Instruction:</strong> {pickup.instructions}
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              {photos[pickup.id] ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <img src={photos[pickup.id]} alt="Proof" style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--gold)' }} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--status-green)', fontWeight: 600 }}>Captured</span>
                </div>
              ) : (
                <button className="btn btn-sm btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }} onClick={() => setCameraModal({ isOpen: true, pickupId: pickup.id })}><Camera size={14} /> Photo Proof</button>
              )}
              <button 
                className="btn btn-sm" 
                style={{ background: '#c9a84c', color: '#FFFFFF', fontWeight: 'bold' }} 
                onClick={() => {
                  if (!pickup.isMock) {
                    updateOrderStatus(pickup.id, 'returned_to_store');
                  }
                  showToast(`📦 Return initiated for ${pickup.id}. Seal & custody transferred!`);
                }}
              >
                Seal & Collect
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderDashboard = () => {
    if (isSuperAdmin) {
      return (
        <>
          <div className="stat-grid mb-15">
            <StatCard icon={<Package size={20} />} iconClass="gold" label="Total System Orders" value={liveOrders?.length || 0} trend="Live" trendUp={true} trendNote="All orders" accentColor="var(--gold)" />
            <StatCard icon={<Truck size={20} />} iconClass="blue" label="System-wide Transits" value={liveOrders?.filter(o => ['in_transit', 'out_for_delivery'].includes(o.status)).length || 0} trend="Live" trendUp={true} trendNote="Active across all partners" accentColor="#3498db" />
            <StatCard icon={<CheckCircle size={20} />} iconClass="green" label="Global Delivered" value={liveOrders?.filter(o => o.status === 'delivered').length || 0} trend="Real-Time" trendUp={true} trendNote="Total successful handovers" accentColor="#2ecc71" />
            <StatCard icon={<XCircle size={20} />} iconClass="red" label="Global Exceptions" value={liveOrders?.filter(o => ['cancelled', 'returned'].includes(o.status)).length || 0} trend="Live" trendUp={false} trendNote="Requires admin review" accentColor="#e74c3c" />
          </div>
          
          <div className="grid-2-1 mb-15">
            <div className="admin-card">
              <div className="card-header">
                <div className="card-title">Partner Management</div>
                <span className="badge badge-success">Live Tracking Active</span>
              </div>
              <div className="admin-table-wrap">
                 <table className="admin-table" style={{ fontSize: '0.85rem' }}>
                   <thead><tr><th>Partner Name</th><th>Zone</th><th>Status</th><th>Active Deliveries</th></tr></thead>
                   <tbody>
                     <tr><td style={{ fontWeight: 600 }}>Ramesh Singh</td><td>South Mumbai</td><td><span className="badge badge-success">Online</span></td><td>4</td></tr>
                     <tr><td style={{ fontWeight: 600 }}>Suresh Kumar</td><td>Andheri East</td><td><span className="badge badge-warning">On Break</span></td><td>0</td></tr>
                     <tr><td style={{ fontWeight: 600 }}>Amit Patel</td><td>Bandra West</td><td><span className="badge badge-success">Online</span></td><td>7</td></tr>
                     <tr><td style={{ fontWeight: 600 }}>Vikram Desai</td><td>Navi Mumbai</td><td><span className="badge badge-danger">Offline</span></td><td>0</td></tr>
                   </tbody>
                 </table>
              </div>
            </div>
            <div className="admin-card">
              <div className="card-header">
                <div className="card-title">Delivery Analytics Overview</div>
              </div>
              <div style={{ padding: '1.5rem' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Detailed analytics available in Report Generation Studio.</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>System On-Time Rate</span>
                  <span style={{ fontWeight: 700, color: 'var(--status-green)' }}>94.2%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'var(--admin-border)', borderRadius: '4px', overflow: 'hidden', marginBottom: '1.5rem' }}>
                  <div style={{ width: '94.2%', height: '100%', background: 'var(--status-green)' }} />
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>System Failure Ratio</span>
                  <span style={{ fontWeight: 700, color: 'var(--status-red)' }}>{liveOrders?.length > 0 ? ((liveOrders.filter(o => ['cancelled', 'returned'].includes(o.status)).length / liveOrders.length) * 100).toFixed(1) : '0.0'}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'var(--admin-border)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: liveOrders?.length > 0 ? `${(liveOrders.filter(o => ['cancelled', 'returned'].includes(o.status)).length / liveOrders.length) * 100}%` : '0%', height: '100%', background: 'var(--status-red)' }} />
                </div>
              </div>
            </div>
          </div>
        </>
      );
    }

    return (
    <>
      <div className="stat-grid mb-15">
        <StatCard icon={<Package size={20} />} iconClass="gold" label="Total Assigned" value={totalAssigned} trend="Live" trendUp={true} trendNote="Total orders in your queue" accentColor="var(--gold)" />
        <StatCard icon={<Truck size={20} />} iconClass="blue" label="Pending Deliveries" value={pendingDeliveries} trend="Live" trendUp={true} trendNote="En route & pending pickups" accentColor="#3498db" />
        <StatCard icon={<CheckCircle size={20} />} iconClass="green" label="Delivered" value={deliveredOrders} trend="Real-Time" trendUp={true} trendNote="Successful handovers" accentColor="#2ecc71" />
        <StatCard icon={<XCircle size={20} />} iconClass="red" label="Failed / Cancelled" value={failedDeliveries} trend="Live" trendUp={false} trendNote="Needs admin review" accentColor="#e74c3c" />
      </div>
      
      <div className="grid-2-1 mb-15">
        <div className="admin-card">
          <div className="card-header">
            <div className="card-title">Earnings & Incentives</div>
          </div>
          <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--gold)', marginBottom: '1rem', textShadow: '0 0 20px rgba(201,168,76,0.2)' }}>
              ₹{earnings}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Based on {deliveredOrders} successful deliveries</div>
          </div>
        </div>
        <div className="admin-card">
          <div className="card-header">
            <div className="card-title">Active Transits</div>
            <a href="/admin/delivery?tab=status" style={{ fontSize: '0.75rem', color: 'var(--gold)', fontWeight: 600 }}>View All →</a>
          </div>
          {activeTransits.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No active transits on route.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem' }}>
              {activeTransits.slice(0,3).map((o, idx) => (
                <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: idx !== activeTransits.slice(0,3).length - 1 ? '1px solid var(--admin-border)' : 'none' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--gold)', fontSize: '0.85rem' }}>{o.id}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>{o.address}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="badge badge-shipped" style={{ textTransform: 'capitalize' }}>{o.status.replace(/_/g, ' ')}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reports & Analytics Expansion */}
      <div className="grid-2-1 mb-15">
        <div className="admin-card">
          <div className="card-header">
            <div className="card-title">Delivery Performance</div>
          </div>
          <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>On-Time Delivery Rate</span>
              <span style={{ fontWeight: 700, color: 'var(--status-green)' }}>96.5%</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'var(--admin-border)', borderRadius: '4px', overflow: 'hidden', marginBottom: '1.5rem' }}>
              <div style={{ width: '96.5%', height: '100%', background: 'var(--status-green)' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Customer Satisfaction</span>
              <span style={{ fontWeight: 700, color: 'var(--gold)' }}>4.8 / 5</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'var(--admin-border)', borderRadius: '4px', overflow: 'hidden', marginBottom: '1.5rem' }}>
              <div style={{ width: '96%', height: '100%', background: 'var(--gold)' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Failed/Returned Ratio</span>
              <span style={{ fontWeight: 700, color: 'var(--status-red)' }}>{totalAssigned > 0 ? ((failedDeliveries / totalAssigned) * 100).toFixed(1) : '0.0'}%</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'var(--admin-border)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: totalAssigned > 0 ? `${(failedDeliveries / totalAssigned) * 100}%` : '0%', height: '100%', background: 'var(--status-red)' }} />
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="card-header">
            <div className="card-title">Monthly Delivery Reports</div>
          </div>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Completed</th>
                  <th>Failed</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong style={{ color: 'var(--text-primary)' }}>May 2026</strong></td>
                  <td style={{ color: 'var(--status-green)' }}>142</td>
                  <td style={{ color: 'var(--status-red)' }}>3</td>
                </tr>
                <tr>
                  <td><strong style={{ color: 'var(--text-primary)' }}>Apr 2026</strong></td>
                  <td style={{ color: 'var(--status-green)' }}>128</td>
                  <td style={{ color: 'var(--status-red)' }}>5</td>
                </tr>
                <tr>
                  <td><strong style={{ color: 'var(--text-primary)' }}>Mar 2026</strong></td>
                  <td style={{ color: 'var(--status-green)' }}>155</td>
                  <td style={{ color: 'var(--status-red)' }}>2</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
    );
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '1.4rem' }}>
            {currentTab === 'dashboard' && (isSuperAdmin ? 'Global Logistics Overview' : 'Logistics Dashboard')}
            {currentTab === 'assigned' && 'Assigned Orders'}
            {currentTab === 'pickups' && 'Pickup Confirmation'}
            {currentTab === 'status' && 'Delivery Status Update'}
            {currentTab === 'returns' && 'Return Handling'}
            {currentTab === 'map' && 'Route Navigation'}
          </h1>
          <p className="page-subtitle" style={{ fontSize: '0.8rem' }}>
            {isSuperAdmin ? 'System-wide Logistics Tracking & Partner Management' : 'Vehicle: MH-01-AB-1234 • Mumbai South Zone'}
          </p>
        </div>
      </div>

      {currentTab === 'dashboard' && renderDashboard()}
      {currentTab === 'assigned' && renderOrderList(assignedOrders, "No orders currently assigned to you.")}
      {currentTab === 'pickups' && renderOrderList(pendingPickups, "No pending store pickups.")}
      {currentTab === 'status' && renderOrderList(activeTransits, "No active transits on route.")}
      {currentTab === 'returns' && renderReturnsList()}

      {currentTab === 'map' && (
        <LiveMapTab
          isTracking={isTracking}
          myPosition={myPosition}
          myTrail={myTrail}
          startTracking={startTracking}
          stopTracking={stopTracking}
          partnerLocations={partnerLocations}
        />
      )}

      {/* OTP Modal */}
      {showOtpModal && selectedOrder && (
        <div className="auth-modal-overlay">
          <div className="auth-modal" style={{ maxWidth: '400px', padding: '2rem' }}>
             <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <CheckCircle size={40} color="var(--gold)" style={{ margin: '0 auto 1rem' }} />
                <h3 style={{ margin: '0 0 0.5rem 0' }}>Secure Handover</h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Ask customer for the 4-digit delivery PIN sent to their phone.</p>
             </div>

             <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
               {otpInputs.map((val, i) => (
                 <input 
                   key={i}
                   type="number" 
                   value={val}
                   onChange={(e) => handleOtpChange(i, e.target.value)}
                   style={{ width: '50px', height: '60px', fontSize: '1.5rem', textAlign: 'center', background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                 />
               ))}
             </div>

             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
               <button className="btn" style={{ width: '100%', padding: '0.8rem', background: '#c9a84c', color: '#FFFFFF', fontWeight: 'bold' }} onClick={verifyOtp}>Verify & Mark Delivered</button>
               <button className="btn btn-outline" style={{ width: '100%', padding: '0.8rem', border: 'none' }} onClick={() => setShowOtpModal(false)}>Cancel</button>
             </div>
          </div>
        </div>
      )}

      {/* Camera Modal */}
      {cameraModal.isOpen && (
        <div className="auth-modal-overlay" style={{ zIndex: 9999 }}>
          <div className="auth-modal" style={{ maxWidth: '400px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: '#1e293b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: '#f8fafc' }}>Capture Photo Proof</h3>
              <button className="btn btn-icon btn-outline" style={{ border: 'none', color: '#94a3b8' }} onClick={() => setCameraModal({ isOpen: false, pickupId: null })}>X</button>
            </div>
            
            <div style={{ width: '100%', aspectRatio: '4/3', background: '#0f172a', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', inset: 0, border: '2px dashed rgba(255,255,255,0.2)', margin: '1rem', borderRadius: '8px', pointerEvents: 'none' }}></div>
            </div>
            
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#cbd5e1', textAlign: 'center' }}>
              Ensure the sealed package and barcode are clearly visible in the frame.
            </p>
            
            <button className="btn" style={{ background: '#c9a84c', color: '#FFFFFF', fontWeight: 'bold', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} onClick={capturePhoto}>
              <Camera size={20} /> Capture Image
            </button>
          </div>
        </div>
      )}

      {/* Failure Reason Modal */}
      {failureModal.isOpen && failureModal.order && (
        <div className="auth-modal-overlay">
          <div className="auth-modal" style={{ maxWidth: '400px', padding: '2rem' }}>
             <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <XCircle size={40} color="var(--status-red)" style={{ margin: '0 auto 1rem' }} />
                <h3 style={{ margin: '0 0 0.5rem 0' }}>Delivery Failed</h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Please select the reason for the failed delivery attempt.</p>
             </div>

             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.5rem' }}>
               {['Customer unavailable', 'Incorrect address', 'Customer refused delivery', 'Payment issue'].map(reason => (
                 <label key={reason} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'var(--surface)', border: failureModal.reason === reason ? '1px solid var(--gold)' : '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer' }}>
                   <input 
                     type="radio" 
                     name="failureReason" 
                     value={reason} 
                     checked={failureModal.reason === reason}
                     onChange={(e) => setFailureModal({ ...failureModal, reason: e.target.value })}
                     style={{ accentColor: 'var(--gold)' }}
                   />
                   <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{reason}</span>
                 </label>
               ))}
             </div>

             <div style={{ display: 'flex', gap: '0.5rem' }}>
               <button className="btn btn-outline" style={{ flex: 1, padding: '0.8rem' }} onClick={() => setFailureModal({ isOpen: false, order: null, reason: '' })}>Cancel</button>
               <button 
                 className="btn" 
                 style={{ flex: 1, padding: '0.8rem', background: failureModal.reason ? 'var(--status-red)' : 'var(--text-muted)', color: '#FFFFFF', fontWeight: 'bold', cursor: failureModal.reason ? 'pointer' : 'not-allowed' }} 
                 disabled={!failureModal.reason}
                 onClick={() => {
                   updateOrderStatus(failureModal.order.id, 'failed');
                   setOptimisticStatuses(prev => { const next = {...prev}; delete next[failureModal.order.id]; return next; });
                   // We would normally also save the reason to DB here, e.g. updateDoc({ failureReason: failureModal.reason })
                   showToast(`Delivery marked as failed. Order will be returned to store.`);
                   setFailureModal({ isOpen: false, order: null, reason: '' });
                 }}
               >
                 Confirm Failure
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
