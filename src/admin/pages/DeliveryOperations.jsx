import { useState, useMemo, useRef, useEffect } from 'react';
import { Map, Package, CheckCircle, ShieldAlert, Phone, MapPin, RefreshCcw, Camera } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useOrders } from '../../hooks/useOrders';

export default function DeliveryOperations() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab') || 'assigned';
  
  const { orders: liveOrders, updateOrderStatus } = useOrders();
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [otpInputs, setOtpInputs] = useState(['', '', '', '']);
  const [currentOtp, setCurrentOtp] = useState('1234');
  const [photos, setPhotos] = useState({});
  const [cameraModal, setCameraModal] = useState({ isOpen: false, pickupId: null });
  const videoRef = useRef(null);
  const streamRef = useRef(null);

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
      setCameraModal({ isOpen: false, pickupId: null });
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

  const pendingPickups = allAssigned.filter(o => o.status === 'Pending Pickup' || o.status === 'Pending');
  const activeTransits = allAssigned.filter(o => ['shipped', 'out_for_delivery', 'delayed'].includes(o.status));

  const assignedReturns = [
    { id: '#RET-4402', customer: 'Anjali Desai', address: 'Andheri East, Mumbai', type: 'Old Gold Exchange', estValue: '₹80,000', instructions: 'Verify 22k hallmark before sealing.' },
    { id: '#RET-4405', customer: 'Vikram Mehta', address: 'Colaba, Mumbai', type: 'Return', estValue: '₹35,000', instructions: 'Check for physical damage.' }
  ];

  const handleDeliveryClick = (order) => {
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setCurrentOtp(generatedOtp);
    setSelectedOrder(order);
    setShowOtpModal(true);
    setOtpInputs(['', '', '', '']);
    
    // Simulate sending an SMS to the customer's phone
    setTimeout(() => {
      alert(`[MOCK SMS GATEWAY] \n\nMessage sent to customer (+91 9876543210):\n"Your Lumina Jewels order ${order.id} is arriving. Your delivery OTP is ${generatedOtp}. Do not share this with anyone."`);
    }, 500);
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value[value.length - 1];
    const newOtp = [...otpInputs];
    newOtp[index] = value;
    setOtpInputs(newOtp);
  };

  const verifyOtp = async () => {
    if (otpInputs.join('') === currentOtp) {
      try {
        if (selectedOrder) {
          await updateOrderStatus(selectedOrder.id, 'delivered');
        }
        alert('OTP Verified! Delivery successful.');
        setShowOtpModal(false);
      } catch (err) {
        alert('Failed to update delivery status in database.');
      }
    } else {
      alert('Invalid OTP. Please try again or contact support.');
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
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Status</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: order.status === 'Pending' ? 'var(--status-orange)' : 'var(--status-green)' }}>{order.status}</div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <a href="tel:+919876543210" className="btn btn-icon btn-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }} title="Call Customer"><Phone size={14} /></a>
                
                {['shipped', 'out_for_delivery', 'delayed'].includes(order.status) && (
                   <select 
                     className="form-input" 
                     style={{ width: 'auto', padding: '0.2rem 0.5rem', fontSize: '0.75rem', height: '32px', background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '6px' }}
                     value={order.status}
                     onChange={(e) => {
                       updateOrderStatus(order.id, e.target.value);
                     }}
                   >
                     <option value="shipped">In Transit</option>
                     <option value="out_for_delivery">Out for Delivery</option>
                     <option value="delayed">Delayed</option>
                   </select>
                )}

                {(order.status === 'Pending Pickup' || order.status === 'Pending') ? (
                   <button className="btn btn-sm btn-outline" onClick={() => {
                     updateOrderStatus(order.id, 'shipped');
                     alert("Pickup confirmed! Package is now In Transit.");
                   }}>Confirm Pickup</button>
                ) : (
                   <button className="btn btn-sm" style={{ background: '#c9a84c', color: '#000', fontWeight: 'bold' }} onClick={() => handleDeliveryClick(order)}>Verify & Deliver</button>
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
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <a href="tel:+919876543210" className="btn btn-icon btn-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}><Phone size={14} /></a>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              {photos[pickup.id] ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <img src={photos[pickup.id]} alt="Proof" style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--gold)' }} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--status-green)', fontWeight: 600 }}>Captured</span>
                </div>
              ) : (
                <button className="btn btn-sm btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }} onClick={() => setCameraModal({ isOpen: true, pickupId: pickup.id })}><Camera size={14} /> Photo Proof</button>
              )}
              <button className="btn btn-sm" style={{ background: '#c9a84c', color: '#000', fontWeight: 'bold' }} onClick={() => alert("Return sealed and custody transferred!")}>Seal & Collect</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '1.4rem' }}>
            {currentTab === 'assigned' && 'Assigned Orders'}
            {currentTab === 'pickups' && 'Pickup Confirmation'}
            {currentTab === 'status' && 'Delivery Status Update'}
            {currentTab === 'returns' && 'Return Handling'}
            {currentTab === 'map' && 'Route Navigation'}
          </h1>
          <p className="page-subtitle" style={{ fontSize: '0.8rem' }}>Vehicle: MH-01-AB-1234 • Mumbai South Zone</p>
        </div>
      </div>

      {currentTab === 'assigned' && renderOrderList(allAssigned, "No orders currently assigned to you.")}
      {currentTab === 'pickups' && renderOrderList(pendingPickups, "No pending warehouse pickups.")}
      {currentTab === 'status' && renderOrderList(activeTransits, "No active transits on route.")}
      {currentTab === 'returns' && renderReturnsList()}

      {currentTab === 'map' && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', height: '450px', position: 'relative' }}>
          <iframe 
            width="100%" 
            height="100%" 
            style={{ border: 0 }}
            loading="lazy" 
            allowFullScreen 
            src="https://www.openstreetmap.org/export/embed.html?bbox=72.81,18.92,72.90,19.05&layer=mapnik"
          ></iframe>
          <div style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(0,0,0,0.8)', padding: '0.5rem 1rem', borderRadius: '8px', color: '#fff', fontSize: '0.8rem' }}>
            <MapPin size={12} color="var(--gold)" style={{ marginRight: '4px' }} /> Active Route: Mumbai South Zone
          </div>
        </div>
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
               <button className="btn" style={{ width: '100%', padding: '0.8rem', background: '#c9a84c', color: '#000', fontWeight: 'bold' }} onClick={verifyOtp}>Verify & Mark Delivered</button>
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
            
            <button className="btn" style={{ background: '#c9a84c', color: '#000', fontWeight: 'bold', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} onClick={capturePhoto}>
              <Camera size={20} /> Capture Image
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
