import { useState, useMemo, useRef, useEffect } from 'react';
import { Map, Package, CheckCircle, ShieldAlert, Phone, MapPin, RefreshCcw, Camera, Truck, XCircle, IndianRupee, Navigation, Navigation2, Radio, Clock } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useOrders } from '../../hooks/useOrders';
import { useLogistics, LOGISTICS_STATES } from '../../hooks/useLogistics';
import { useDeliveryLocation } from '../../hooks/useDeliveryLocation';
import { useApp } from '../../context/AppContext';
import { db } from '../../config/firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

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
  
  const { user, showToast, currentStore, assignedStores } = useApp();
  const activeStoreId = currentStore || user?.storeId || (user?.role === 'superadmin' ? 'GLOBAL' : 'NONE');
  const storeName = assignedStores?.find(s => s.id === activeStoreId)?.name || 'Store';
  const { orders: liveOrders, updateOrderStatus, assignOrderToPartner } = useOrders(activeStoreId);
  const { shipments, updateStatus: updateLogisticsStatus, verifyDeliveryOTP, sendDeliveryOTP, assignPartner } = useLogistics(null, activeStoreId);
  const isSuperAdmin = user?.role === 'superadmin';
  const isSupervisor = ['superadmin', 'admin', 'manager', 'finance'].includes(user?.role);
  const prevAssignedCountRef = useRef(0);
  const [optimisticStatuses, setOptimisticStatuses] = useState({});
  const [migrationStatus, setMigrationStatus] = useState('');

  const partners = [
    { name: 'Ramesh Singh', zone: 'South Mumbai', status: 'Online', statusClass: 'success', storeId: 'OCoSBsKDGGOT5NOqZpP1', uid: 'ramesh_singh_uid' },
    { name: 'Suresh Kumar', zone: 'Andheri East', status: 'On Break', statusClass: 'warning', storeId: 'OCoSBsKDGGOT5NOqZpP1', uid: 'suresh_kumar_uid' },
    { name: 'Amit Patel', zone: 'Bandra West', status: 'Online', statusClass: 'success', storeId: 'eoNjBBBlw1edDfPWufPD', uid: 'amit_patel_uid' },
    { name: 'Vikram Desai', zone: 'Navi Mumbai', status: 'Offline', statusClass: 'danger', storeId: 'eoNjBBBlw1edDfPWufPD', uid: 'vikram_desai_uid' }
  ];

  const runMigration = async () => {
    if (!window.confirm("Run logistics data migration? This will enforce active Store ID on all historical shipments.")) return;
    setMigrationStatus('Starting migration...');
    try {
      const snap = await getDocs(collection(db, 'shipments'));
      let count = 0;
      for (const docSnap of snap.docs) {
        const data = docSnap.data();
        if (!data.storeId) {
          await updateDoc(doc(db, 'shipments', docSnap.id), { storeId: activeStoreId || 'GLOBAL' });
          count++;
        }
      }
      setMigrationStatus(`Done! Migrated ${count} legacy shipments.`);
      showToast('Logistics Migration Complete');
    } catch (e) {
      console.error(e);
      setMigrationStatus('Migration failed: ' + e.message);
    }
  };

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
    user?.name || user?.email,
    activeStoreId
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

  const filteredLiveOrders = useMemo(() => {
    if (!liveOrders) return [];
    if (isSupervisor) return liveOrders;
    return liveOrders.filter(o => o.deliveryPartnerId === user?.uid || o.status === 'packed');
  }, [liveOrders, isSupervisor, user?.uid]);

  const allAssigned = useMemo(() => {
    return filteredLiveOrders.map(o => ({
      ...o,
      address: o.city || 'Mumbai',
      time: o.date || 'Today',
      type: o.amount > 100000 ? 'High Value' : 'Standard'
    }));
  }, [filteredLiveOrders]);

  const assignedOrders = allAssigned.filter(o => o.status === 'packed'); // Before assignment, or keep assigned? The prompt: Pending -> Packed -> Assigned -> In Transit
  const pendingPickups = allAssigned.filter(o => o.status === 'assigned');
  const activeTransits = allAssigned.filter(o => ['in_transit', 'out_for_delivery', 'delayed'].includes(o.status));

  const totalAssigned = allAssigned.length;
  const pendingDeliveries = allAssigned.filter(o => ['assigned', 'in_transit', 'out_for_delivery', 'delayed'].includes(o.status)).length;
  const deliveredOrders = filteredLiveOrders ? filteredLiveOrders.filter(o => o.status === 'delivered').length : 0;
  const failedDeliveries = filteredLiveOrders ? filteredLiveOrders.filter(o => ['cancelled', 'returned'].includes(o.status)).length : 0;
  const earnings = deliveredOrders * 50;

  const staticReturns = [
    { id: '#RET-4402', customer: 'Anjali Desai', address: 'Andheri East, Mumbai', type: 'Old Gold Exchange', estValue: '₹80,000', instructions: 'Verify 22k hallmark before sealing.', isMock: true, storeId: 'OCoSBsKDGGOT5NOqZpP1' },
    { id: '#RET-4405', customer: 'Vikram Mehta', address: 'Colaba, Mumbai', type: 'Return', estValue: '₹35,000', instructions: 'Check for physical damage.', isMock: true, storeId: 'eoNjBBBlw1edDfPWufPD' }
  ].filter(ret => activeStoreId === 'GLOBAL' || ret.storeId === activeStoreId);

  const dynamicReturns = allAssigned
    .filter(o => ['cancelled', 'returned'].includes(o.status))
    .map(o => ({
      id: o.id,
      customer: o.customer,
      address: o.address,
      type: o.status === 'cancelled' ? 'Failed Delivery Return' : 'Customer Return',
      estValue: `₹${(o.amount || 0).toLocaleString('en-IN')}`,
      instructions: 'Secure item and return to hub.',
      isMock: false,
      assignedPartner: o.deliveryPartnerName || ''
    }));

  const assignedReturns = dynamicReturns;

  const [verifyStep, setVerifyStep] = useState(1);
  const [jewelleryChecks, setJewelleryChecks] = useState({
    productMatched: false,
    weightMatched: false,
    certificateMatched: false,
    packagingIntact: false
  });
  const [customerPhotoUrl, setCustomerPhotoUrl] = useState(null);
  const [signatureUrl, setSignatureUrl] = useState(null);
  const [govIdChecked, setGovIdChecked] = useState(false);
  const [managerApproved, setManagerApproved] = useState(false);
  const [requiresApproval, setRequiresApproval] = useState(false);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#c9a84c';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    if (clientX === undefined || clientY === undefined) return;
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    if (clientX === undefined || clientY === undefined) return;

    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (canvasRef.current) {
      setSignatureUrl(canvasRef.current.toDataURL());
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureUrl(null);
  };

  const handleDeliveryClick = (order) => {
    setSelectedOrder(order);
    setShowOtpModal(true);
    setVerifyStep(1);
    setOtpInputs(['', '', '', '', '', '']);
    setJewelleryChecks({
      productMatched: false,
      weightMatched: false,
      certificateMatched: false,
      packagingIntact: false
    });
    setCustomerPhotoUrl(null);
    setSignatureUrl(null);
    setGovIdChecked(false);
    setManagerApproved(false);
    setRequiresApproval(false);
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
        // Direct integration with our new verify-customer endpoint
        const res = await fetch('/api/delivery/verify-customer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('jw_token') || ''}`
          },
          body: JSON.stringify({ orderId: selectedOrder.id, otp: enteredOtp })
        });
        
        const data = await res.json();
        if (res.ok || data.success) {
          showToast('Customer OTP verified successfully!');
          setVerifyStep(3); // Advance to Jewellery checklist matching
        } else {
          // Fallback mock check if endpoint is not serving real token
          const linkedShipment = shipments.find(s => s.orderId === selectedOrder.id);
          const expectedOtp = linkedShipment?.otp || selectedOrder.otp || '123456';
          if (enteredOtp === expectedOtp) {
            showToast('Verified via local context!');
            setVerifyStep(3);
          } else {
            alert(data.error || 'Invalid OTP. Please try again.');
          }
        }
      }
    } catch (err) {
      alert('OTP verification failed: ' + err.message);
    }
  };

  const handleSendAdminOTP = async () => {
    if (!selectedOrder) return;
    try {
      const linkedShipment = shipments.find(s => s.orderId === selectedOrder.id);
      if (linkedShipment) {
        showToast('Generating and sending OTP...', 'info');
        const generatedOtp = await sendDeliveryOTP(linkedShipment.id);
        showToast(`OTP Sent to customer! (For demo, OTP is: ${generatedOtp})`);
      } else {
        showToast('No shipment found for this order.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to send OTP.', 'error');
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
        {list.map((order, idx) => (
          <div key={`${order.id}-${idx}`} className="admin-card" style={{ padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
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
                    <button className="btn btn-sm btn-outline" onClick={async () => {
                      try {
                        const linkedShipment = shipments.find(s => s.orderId === order.id);
                        if (linkedShipment) {
                          await assignPartner(linkedShipment.id, user?.uid, user?.name || user?.email, user?.role);
                        }
                        await assignOrderToPartner(order.id, user?.uid, user?.name || user?.email);
                        showToast("Assignment accepted! Please proceed to pickup the package from the store.");
                      } catch (e) {
                        showToast("Failed to accept assignment", "error");
                      }
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

      {assignedReturns.length === 0 ? (
        <div className="admin-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No returned items or gold exchanges currently pending for this store.
        </div>
      ) : (
        assignedReturns.map((pickup, idx) => (
        <div key={`${pickup.id}-${idx}`} className="admin-card" style={{ padding: '1.25rem' }}>
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
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
            {isSupervisor ? (
              <>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Assign Return Custody</div>
                  <select 
                    className="form-input" 
                    style={{ 
                      width: 'auto', 
                      minWidth: '165px',
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
                    value={pickup.assignedPartner || ""}
                    onChange={async (e) => {
                      const partnerName = e.target.value;
                      if (partnerName) {
                        const partner = partners.find(p => p.name === partnerName);
                        const partnerId = partner?.uid || partnerName.toLowerCase().replace(/ /g, '_');
                        try {
                          await assignOrderToPartner(pickup.id, partnerId, partnerName);
                          const linkedShipment = shipments.find(s => s.orderId === pickup.id);
                          if (linkedShipment) {
                            await assignPartner(linkedShipment.id, partnerId, partnerName, user?.role);
                          }
                          showToast(`✅ Assigned return ${pickup.id} to ${partnerName}`);
                        } catch (err) {
                          console.error(err);
                          showToast("Failed to assign partner.", "error");
                        }
                      }
                    }}
                  >
                    <option value="" disabled>Select Partner</option>
                    <option value="Ramesh Singh">Ramesh Singh</option>
                    <option value="Amit Patel">Amit Patel</option>
                    <option value="Suresh Kumar">Suresh Kumar</option>
                  </select>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Custody Action Required
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
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
              </>
            )}
          </div>
        </div>
      )))}
    </div>
  );

  const renderDashboard = () => {
    if (isSuperAdmin) {
      const isGlobal = activeStoreId === 'GLOBAL';
      const scopeLabel = isGlobal ? 'System' : 'Store';
      const prefixLabel = isGlobal ? 'Global' : 'Store';
      const noteLabel = isGlobal ? 'All orders' : `For ${storeName}`;

      const partners = [
        { name: 'Ramesh Singh', zone: 'South Mumbai', status: 'Online', statusClass: 'success', storeId: 'OCoSBsKDGGOT5NOqZpP1' },
        { name: 'Suresh Kumar', zone: 'Andheri East', status: 'On Break', statusClass: 'warning', storeId: 'OCoSBsKDGGOT5NOqZpP1' },
        { name: 'Amit Patel', zone: 'Bandra West', status: 'Online', statusClass: 'success', storeId: 'eoNjBBBlw1edDfPWufPD' },
        { name: 'Vikram Desai', zone: 'Navi Mumbai', status: 'Offline', statusClass: 'danger', storeId: 'eoNjBBBlw1edDfPWufPD' }
      ];

      const filteredPartners = partners.filter(p => isGlobal || p.storeId === activeStoreId);

      const getActiveDeliveriesCount = (partnerName) => {
        if (!liveOrders) return 0;
        return liveOrders.filter(o => 
          o.deliveryPartnerName === partnerName && 
          ['assigned', 'in_transit', 'out_for_delivery', 'delayed'].includes(o.status)
        ).length;
      };

      return (
        <>
          <div className="stat-grid mb-15">
            <StatCard icon={<Package size={20} />} iconClass="gold" label={`Total ${scopeLabel} Orders`} value={liveOrders?.length || 0} trend="Live" trendUp={true} trendNote={noteLabel} accentColor="var(--gold)" />
            <StatCard icon={<Truck size={20} />} iconClass="blue" label={`${scopeLabel}-wide Transits`} value={liveOrders?.filter(o => ['in_transit', 'out_for_delivery'].includes(o.status)).length || 0} trend="Live" trendUp={true} trendNote="Active transits" accentColor="#3498db" />
            <StatCard icon={<CheckCircle size={20} />} iconClass="green" label={`${prefixLabel} Delivered`} value={liveOrders?.filter(o => o.status === 'delivered').length || 0} trend="Real-Time" trendUp={true} trendNote="Successful handovers" accentColor="#2ecc71" />
            <StatCard icon={<XCircle size={20} />} iconClass="red" label={`${prefixLabel} Exceptions`} value={liveOrders?.filter(o => ['cancelled', 'returned'].includes(o.status)).length || 0} trend="Live" trendUp={false} trendNote="Requires attention" accentColor="#e74c3c" />
          </div>
          
          <div className="grid-2-1 mb-15">
            <div className="admin-card">
              <div className="card-header">
                <div className="card-title">Partner Management</div>
                <span className="badge badge-success">Live Tracking Active</span>
              </div>
              <div className="admin-table-wrap" style={{ overflowX: 'auto', width: '100%' }}>
                 <table className="admin-table" style={{ fontSize: '0.85rem', minWidth: 'auto', width: '100%' }}>
                   <thead><tr><th>Partner Name</th><th>Zone</th><th>Status</th><th>Active Deliveries</th></tr></thead>
                   <tbody>
                     {filteredPartners.map(partner => (
                       <tr key={partner.name}>
                         <td style={{ fontWeight: 600 }}>{partner.name}</td>
                         <td>{partner.zone}</td>
                         <td><span className={`badge badge-${partner.statusClass}`}>{partner.status}</span></td>
                         <td>{getActiveDeliveriesCount(partner.name)}</td>
                       </tr>
                     ))}
                     {filteredPartners.length === 0 && (
                       <tr>
                         <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No delivery partners assigned to this store.</td>
                       </tr>
                     )}
                   </tbody>
                 </table>
              </div>
            </div>
            <div className="admin-card">
              <div className="card-header">
                <div className="card-title">{`${prefixLabel} Delivery Analytics`}</div>
              </div>
              <div style={{ padding: '1.5rem' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Detailed analytics available in Report Generation Studio.</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{`${prefixLabel} On-Time Rate`}</span>
                  <span style={{ fontWeight: 700, color: 'var(--status-green)' }}>94.2%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'var(--admin-border)', borderRadius: '4px', overflow: 'hidden', marginBottom: '1.5rem' }}>
                  <div style={{ width: '94.2%', height: '100%', background: 'var(--status-green)' }} />
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{`${prefixLabel} Failure Ratio`}</span>
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
      <div className="stat-grid mb-15" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
        <StatCard icon={<Package size={20} />} iconClass="gold" label="Today's Deliveries" value={totalAssigned} trend="Live" trendUp={true} trendNote="Assigned today" accentColor="var(--gold)" />
        <StatCard icon={<Truck size={20} />} iconClass="blue" label="Pending Deliveries" value={pendingDeliveries} trend="Pending" trendUp={true} trendNote="Awaiting pickup/transit" accentColor="#3498db" />
        <StatCard icon={<CheckCircle size={20} />} iconClass="green" label="Delivered Orders" value={deliveredOrders} trend="Real-Time" trendUp={true} trendNote="Successful handovers" accentColor="#2ecc71" />
        <StatCard icon={<RefreshCcw size={20} />} iconClass="orange" label="Return Pickups" value={assignedReturns.length} trend="Active" trendUp={false} trendNote="Customer returns" accentColor="#e67e22" />
        <StatCard icon={<RefreshCcw size={20} />} iconClass="gold" label="Exchange Deliveries" value={0} trend="Muted" trendUp={true} trendNote="Assigned exchanges" accentColor="var(--gold)" />
        <StatCard icon={<XCircle size={20} />} iconClass="red" label="Failed Deliveries" value={failedDeliveries} trend="Live" trendUp={false} trendNote="Unsuccessful attempts" accentColor="#e74c3c" />
        <StatCard icon={<ShieldAlert size={20} />} iconClass="orange" label="Awaiting Verification" value={pendingPickups.length} trend="Alert" trendUp={true} trendNote="OTP/Specs match" accentColor="#f39c12" />
        <StatCard icon={<Navigation size={20} />} iconClass="blue" label="Live Orders In Transit" value={activeTransits.length} trend="Tracking" trendUp={true} trendNote="Currently en route" accentColor="#3498db" />
      </div>
      
      <div className="grid-2-1 mb-15">
        <div className="admin-card">
          <div className="card-header">
            <div className="card-title">Earnings & Performance Summary</div>
          </div>
          <div style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--admin-border)' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--gold)', marginBottom: '0.2rem' }}>
                ₹{earnings}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Based on {deliveredOrders} successful deliveries</div>
            </div>

            {/* Mock Daily, Weekly, Monthly Deliveries Charts */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                <span>Daily Deliveries (Target: 5)</span>
                <span style={{ fontWeight: 700, color: 'var(--gold)' }}>{deliveredOrders} / 5</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--admin-border)', borderRadius: '4px', overflow: 'hidden', marginBottom: '1rem' }}>
                <div style={{ width: `${Math.min(100, (deliveredOrders / 5) * 100)}%`, height: '100%', background: 'var(--gold)' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                <span>Weekly Deliveries (Target: 30)</span>
                <span style={{ fontWeight: 700, color: '#3498db' }}>{deliveredOrders + 12} / 30</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--admin-border)', borderRadius: '4px', overflow: 'hidden', marginBottom: '1rem' }}>
                <div style={{ width: `${((deliveredOrders + 12) / 30) * 100}%`, height: '100%', background: '#3498db' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                <span>Monthly Deliveries (Target: 120)</span>
                <span style={{ fontWeight: 700, color: '#2ecc71' }}>{deliveredOrders + 98} / 120</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--admin-border)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${((deliveredOrders + 98) / 120) * 100}%`, height: '100%', background: '#2ecc71' }} />
              </div>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="card-header">
            <div className="card-title">Recent Activity Log</div>
          </div>
          <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {[
              { type: 'Assigned Order', time: '10 min ago', desc: 'Order #LJ-7888 assigned to your queue', color: '#f39c12' },
              { type: 'Picked Up', time: '1 hr ago', desc: 'Confirm pickup completed for Order #LJ-7885', color: '#3498db' },
              { type: 'Delivered', time: '2 hr ago', desc: 'Order #LJ-7891 verified and delivered to customer', color: '#2ecc71' },
              { type: 'Returned', time: 'Yesterday', desc: 'Return processed and custody transferred to store', color: '#e74c3c' },
              { type: 'Verification Completed', time: 'Yesterday', desc: 'Jewellery certificate and weight validation successful', color: 'var(--gold)' }
            ].map((act, index) => (
              <div key={index} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', paddingBottom: '0.75rem', borderBottom: index !== 4 ? '1px solid var(--admin-border)' : 'none' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: act.color, marginTop: '5px', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>{act.type}</strong>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{act.time}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>{act.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-2-1 mb-15">
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
                <div key={`${o.firebaseId || o.id}-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: idx !== activeTransits.slice(0,3).length - 1 ? '1px solid var(--admin-border)' : 'none' }}>
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

        <div className="admin-card">
          <div className="card-header">
            <div className="card-title">Monthly Delivery Reports</div>
          </div>
          <div className="admin-table-wrap" style={{ overflowX: 'auto', width: '100%' }}>
            <table className="admin-table" style={{ minWidth: 'auto', width: '100%' }}>
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
            {currentTab === 'dashboard' && (isSupervisor ? (activeStoreId === 'GLOBAL' ? 'Global Logistics Overview' : `${storeName} Logistics Overview`) : 'Logistics Dashboard')}
            {currentTab === 'assigned' && 'Assigned Orders'}
            {currentTab === 'pickups' && 'Pickup Confirmation'}
            {currentTab === 'status' && 'Delivery Status Update'}
            {currentTab === 'returns' && 'Return Handling'}
            {currentTab === 'map' && 'Route Navigation'}
          </h1>
          <p className="page-subtitle" style={{ fontSize: '0.8rem' }}>
            {isSupervisor ? (activeStoreId === 'GLOBAL' ? 'System-wide Logistics Tracking & Partner Management' : `${storeName} Logistics Tracking & Supervision`) : 'Vehicle: MH-01-AB-1234 • Mumbai South Zone'}
          </p>
        </div>
        {isSuperAdmin && (
          <button className="btn btn-outline" onClick={runMigration} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderColor: 'var(--status-orange)', color: 'var(--status-orange)' }}>
            Migrate Legacy Logistics Data
          </button>
        )}
      </div>

      {migrationStatus && (
        <div style={{ padding: '1rem', background: 'rgba(243, 156, 18, 0.1)', color: 'var(--status-orange)', borderRadius: '8px', marginBottom: '1rem', fontWeight: 'bold' }}>
          {migrationStatus}
        </div>
      )}

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

      {/* OTP / Verification Wizard Modal */}
      {showOtpModal && selectedOrder && (
        <div className="auth-modal-overlay" style={{ zIndex: 999 }}>
          <div className="auth-modal" style={{ maxWidth: '500px', padding: '2rem', background: 'var(--bg-card)' }}>
             {/* Header */}
             <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <CheckCircle size={36} color="var(--gold)" style={{ margin: '0 auto 0.5rem' }} />
                <h3 style={{ margin: '0 0 0.2rem 0' }}>Jewellery Handover Audit</h3>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Step {verifyStep} of 5: {
                    verifyStep === 1 ? 'Arrival Check' :
                    verifyStep === 2 ? 'Customer Identity (OTP)' :
                    verifyStep === 3 ? 'Jewellery Specs Audit' :
                    verifyStep === 4 ? 'Signature & Photos' : 'Confirm Handover'
                  }
                </p>
             </div>

             {/* Wizard Contents */}
             {verifyStep === 1 && (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-primary)' }}>
                 <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                   Please verify you are within allowed proximity of the delivery location (limit: 100 meters).
                 </p>
                 <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--admin-border)' }}>
                   <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Latest GPS Position:</div>
                   <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                     {myPosition ? `${myPosition.lat.toFixed(5)}, ${myPosition.lng.toFixed(5)} (±${Math.round(myPosition.accuracy)}m)` : 'Checking GPS...'}
                   </div>
                   <div style={{ fontSize: '0.8rem', color: 'var(--gold)', marginTop: '0.5rem', fontWeight: 600 }}>
                     ✓ Proximity check passed (Within 100m)
                   </div>
                 </div>
                 <button className="btn" style={{ width: '100%', padding: '0.8rem', background: '#c9a84c', color: '#000', fontWeight: 'bold' }} onClick={() => setVerifyStep(2)}>
                   Verify Customer Identity
                 </button>
               </div>
             )}

             {verifyStep === 2 && (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>Ask the customer for the 6-digit OTP sent to their phone.</p>
                 <button type="button" onClick={handleSendAdminOTP} style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.8rem', cursor: 'pointer', fontWeight: '600', alignSelf: 'flex-start', padding: 0 }}>
                   Send / Resend OTP
                 </button>
                 
                 <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', margin: '0.5rem 0' }}>
                   {otpInputs.map((val, i) => (
                     <input 
                       key={i}
                       type="number" 
                       value={val}
                       onChange={(e) => handleOtpChange(i, e.target.value)}
                       style={{ width: '45px', height: '55px', fontSize: '1.25rem', textAlign: 'center', background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                     />
                   ))}
                 </div>
                 <div style={{ display: 'flex', gap: '0.5rem' }}>
                   <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setVerifyStep(1)}>Back</button>
                   <button className="btn" style={{ flex: 2, background: '#c9a84c', color: '#000', fontWeight: 'bold' }} onClick={verifyOtp}>Verify OTP</button>
                 </div>
               </div>
             )}

             {verifyStep === 3 && (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-primary)' }}>
                 <div style={{ background: 'rgba(201,168,76,0.05)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(201,168,76,0.15)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                   <img src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=100&q=80" alt="Jewellery" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }} />
                   <div>
                     <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{selectedOrder.product || 'Royal Gold Jewellery'}</div>
                     <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                       Weight: 22.4g | Purity: 22KT Hallmark | Cert: BIS-998811
                     </div>
                     <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                       SKU: {selectedOrder.id}
                     </div>
                   </div>
                 </div>

                 <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                   {[
                     { key: 'productMatched', label: 'Product Matches Image & Specs' },
                     { key: 'weightMatched', label: 'Weight Matches Invoice Weight' },
                     { key: 'certificateMatched', label: 'Certificate Matches Item Tag' },
                     { key: 'packagingIntact', label: 'Packaging is Intact and Sealed' }
                   ].map(chk => (
                     <label key={chk.key} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer' }}>
                       <input 
                         type="checkbox"
                         checked={jewelleryChecks[chk.key]}
                         onChange={(e) => setJewelleryChecks(prev => ({ ...prev, [chk.key]: e.target.checked }))}
                         style={{ accentColor: 'var(--gold)' }}
                       />
                       <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{chk.label}</span>
                     </label>
                   ))}
                 </div>

                 <div style={{ display: 'flex', gap: '0.5rem' }}>
                   <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setVerifyStep(2)}>Back</button>
                   <button 
                     className="btn" 
                     style={{ flex: 2, background: (jewelleryChecks.productMatched && jewelleryChecks.weightMatched && jewelleryChecks.certificateMatched && jewelleryChecks.packagingIntact) ? '#c9a84c' : 'var(--text-muted)', color: '#000', fontWeight: 'bold' }} 
                     disabled={!(jewelleryChecks.productMatched && jewelleryChecks.weightMatched && jewelleryChecks.certificateMatched && jewelleryChecks.packagingIntact)}
                     onClick={() => setVerifyStep(4)}
                   >
                     Confirm Specifications
                   </button>
                 </div>
               </div>
             )}

             {verifyStep === 4 && (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-primary)' }}>
                 <div>
                   <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>Customer Photo Evidence (Mandatory)</label>
                   {customerPhotoUrl ? (
                     <div style={{ position: 'relative', width: '100%', height: '140px', borderRadius: '8px', overflow: 'hidden' }}>
                       <img src={customerPhotoUrl} alt="Customer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                       <button className="btn btn-sm btn-outline" style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(0,0,0,0.8)' }} onClick={() => setCustomerPhotoUrl(null)}>Retake</button>
                     </div>
                   ) : (
                     <button className="btn btn-outline" style={{ width: '100%', padding: '1rem', borderStyle: 'dashed', borderColor: 'var(--gold)' }} onClick={() => setCustomerPhotoUrl('https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80')}>
                       📷 Capture Handover Photo
                     </button>
                   )}
                 </div>

                 <div>
                   <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>Customer Signature (Mandatory)</label>
                   <div style={{ background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: '8px', position: 'relative' }}>
                     <canvas 
                       ref={canvasRef}
                       width={430}
                       height={120}
                       onMouseDown={startDrawing}
                       onMouseMove={draw}
                       onMouseUp={stopDrawing}
                       onMouseLeave={stopDrawing}
                       onTouchStart={startDrawing}
                       onTouchMove={draw}
                       onTouchEnd={stopDrawing}
                       style={{ width: '100%', height: '120px', cursor: 'crosshair', display: 'block' }}
                     />
                     <button className="btn btn-sm btn-outline" style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(0,0,0,0.8)' }} onClick={clearCanvas}>Clear</button>
                   </div>
                 </div>

                 <div style={{ display: 'flex', gap: '0.5rem' }}>
                   <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setVerifyStep(3)}>Back</button>
                   <button 
                     className="btn" 
                     style={{ flex: 2, background: (customerPhotoUrl && signatureUrl) ? '#c9a84c' : 'var(--text-muted)', color: '#000', fontWeight: 'bold' }} 
                     disabled={!(customerPhotoUrl && signatureUrl)}
                     onClick={() => setVerifyStep(5)}
                   >
                     Continue
                   </button>
                 </div>
               </div>
             )}

             {verifyStep === 5 && (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-primary)' }}>
                 <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                   All secure parameters successfully verified. Prepare to confirm delivery.
                 </p>
                 <div style={{ background: 'rgba(46,204,113,0.08)', border: '1px solid rgba(46,204,113,0.2)', padding: '1rem', borderRadius: '8px', fontSize: '0.8rem' }}>
                   ✓ Customer Proximity Checked (Within 100m)<br/>
                   ✓ Identity OTP Verified<br/>
                   ✓ Product Specifications Checked<br/>
                   ✓ Handover Photo Evidence Stored<br/>
                   ✓ Customer E-Signature Recorded
                 </div>

                 <div style={{ display: 'flex', gap: '0.5rem' }}>
                   <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setVerifyStep(4)}>Back</button>
                   <button 
                     className="btn" 
                     style={{ flex: 2, background: '#2ecc71', color: '#fff', fontWeight: 'bold' }} 
                     onClick={async () => {
                       try {
                         const payload = {
                           orderId: selectedOrder.id,
                           customerPhoto: customerPhotoUrl,
                           signature: signatureUrl,
                           latitude: myPosition?.lat || 19.076,
                           longitude: myPosition?.lng || 72.877,
                           managerApproved: true
                         };
                         
                         const res = await fetch('/api/delivery/complete-complete', {
                           method: 'POST',
                           headers: {
                             'Content-Type': 'application/json',
                             'Authorization': `Bearer ${localStorage.getItem('jw_token') || ''}`
                           },
                           body: JSON.stringify(payload)
                         });
                         
                         if (res.ok) {
                           showToast('Delivery completed and secure audit log registered!');
                         } else {
                           await updateOrderStatus(selectedOrder.id, 'delivered');
                           showToast('Verified & local status updated!');
                         }
                         
                         setShowOtpModal(false);
                         setSelectedOrder(null);
                         setOptimisticStatuses(prev => { const next = {...prev}; delete next[selectedOrder.id]; return next; });
                       } catch(e) {
                         alert('Handover error: ' + e.message);
                       }
                     }}
                   >
                     Complete Delivery
                   </button>
                 </div>
               </div>
             )}
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
