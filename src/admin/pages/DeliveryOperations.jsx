import { useState, useMemo } from 'react';
import { Map, Package, CheckCircle, ShieldAlert, Phone, MapPin, RefreshCcw, Camera } from 'lucide-react';
import { useJsApiLoader, GoogleMap, Marker } from '@react-google-maps/api';
import { useOrders } from '../../hooks/useOrders';

export default function DeliveryOperations() {
  const { orders: liveOrders, updateOrderStatus } = useOrders();
  const [activeTab, setActiveTab] = useState('deliveries'); // deliveries, pickups, map
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [otpInputs, setOtpInputs] = useState(['', '', '', '']);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY", // Replace with real key
  });

  const mapOptions = useMemo(() => ({
    disableDefaultUI: true,
    zoomControl: true,
    styles: [
      { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
      { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
      { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
      { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
      { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
      { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
      { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
      { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
      { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] }
    ]
  }), []);

  const assignedDeliveries = liveOrders 
    ? liveOrders.filter(o => o.status === 'shipped').map(o => ({
        ...o,
        address: o.city || 'Mumbai',
        time: o.date || 'Today',
        type: o.amount > 100000 ? 'High Value' : 'Standard'
      }))
    : [];

  const assignedPickups = [
    { id: '#RET-4402', customer: 'Anjali Desai', address: 'Andheri East, Mumbai', type: 'Old Gold Exchange', estValue: '₹80,000', instructions: 'Verify 22k hallmark before sealing.' },
    { id: '#RET-4405', customer: 'Vikram Mehta', address: 'Colaba, Mumbai', type: 'Return', estValue: '₹35,000', instructions: 'Check for physical damage.' }
  ];

  const handleDeliveryClick = (order) => {
    setSelectedOrder(order);
    setShowOtpModal(true);
    setOtpInputs(['', '', '', '']);
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value[value.length - 1]; // keep only last digit
    const newOtp = [...otpInputs];
    newOtp[index] = value;
    setOtpInputs(newOtp);
    // Auto-focus next logic would go here in a real app
  };

  const verifyOtp = async () => {
    if (otpInputs.join('') === '1234') {
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

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '1.4rem' }}>Active Route</h1>
          <p className="page-subtitle" style={{ fontSize: '0.8rem' }}>Vehicle: MH-01-AB-1234 • Mumbai South Zone</p>
        </div>
        <button className="btn btn-icon btn-gold" onClick={() => setActiveTab(activeTab === 'map' ? 'deliveries' : 'map')}>
          <Map size={18} />
        </button>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.4rem', borderRadius: '8px' }}>
        <button 
          className="btn" 
          style={{ flex: 1, background: activeTab === 'deliveries' ? 'var(--gold)' : 'transparent', color: activeTab === 'deliveries' ? '#000' : 'var(--text-muted)', border: 'none' }}
          onClick={() => setActiveTab('deliveries')}
        >
          Deliveries (3)
        </button>
        <button 
          className="btn" 
          style={{ flex: 1, background: activeTab === 'pickups' ? 'var(--gold)' : 'transparent', color: activeTab === 'pickups' ? '#000' : 'var(--text-muted)', border: 'none' }}
          onClick={() => setActiveTab('pickups')}
        >
          Pickups (2)
        </button>
      </div>

      {activeTab === 'deliveries' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {assignedDeliveries.map(order => (
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
              
              <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.2rem' }}>{order.customer}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'flex-start', gap: '0.4rem', marginBottom: '1rem' }}>
                <MapPin size={14} style={{ marginTop: '0.1rem', flexShrink: 0 }} />
                <span>{order.address}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Status</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: order.status === 'Pending Pickup' ? 'var(--status-orange)' : 'var(--status-green)' }}>{order.status}</div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-icon btn-outline"><Phone size={14} /></button>
                  {order.status === 'Pending Pickup' ? (
                     <button className="btn btn-sm btn-outline">Confirm Pickup</button>
                  ) : (
                     <button className="btn btn-sm btn-gold" onClick={() => handleDeliveryClick(order)}>Verify & Deliver</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'pickups' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', background: 'rgba(230, 126, 34, 0.1)', border: '1px solid rgba(230, 126, 34, 0.3)', borderRadius: '8px', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
             <ShieldAlert size={16} color="var(--status-orange)" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
             <div style={{ fontSize: '0.75rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
               <strong>Strict Protocol:</strong> All returned and exchange items must be sealed in the tamper-evident security bags provided. Scan barcode before leaving customer premises.
             </div>
          </div>

          {assignedPickups.map(pickup => (
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
                <button className="btn btn-icon btn-outline"><Phone size={14} /></button>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-sm btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Camera size={14} /> Photo Proof</button>
                  <button className="btn btn-sm btn-gold">Seal & Collect</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'map' && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', height: '450px' }}>
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={{ lat: 19.0760, lng: 72.8777 }} // Mumbai
              zoom={11}
              options={mapOptions}
            >
              {/* Delivery markers */}
              {assignedDeliveries.map((d, i) => (
                <Marker 
                  key={`del-${i}`} 
                  position={{ lat: 19.0760 + (i * 0.02), lng: 72.8777 + (i * 0.02) }} 
                  label={{ text: 'D', color: 'white', fontWeight: 'bold' }}
                  icon={{ url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png' }}
                />
              ))}
              
              {/* Pickup markers */}
              {assignedPickups.map((p, i) => (
                <Marker 
                  key={`pic-${i}`} 
                  position={{ lat: 19.0760 - (i * 0.02) - 0.02, lng: 72.8777 - (i * 0.02) - 0.02 }} 
                  label={{ text: 'P', color: 'black', fontWeight: 'bold' }}
                  icon={{ url: 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png' }}
                />
              ))}
              
              {/* Current Location */}
              <Marker 
                position={{ lat: 19.0760, lng: 72.8777 }} 
                icon={{ url: 'http://maps.google.com/mapfiles/ms/icons/truck.png', scaledSize: new window.google.maps.Size(32, 32) }}
              />
            </GoogleMap>
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)' }}>
              <p style={{ color: 'var(--text-muted)' }}>Loading Maps...</p>
            </div>
          )}
        </div>
      )}

      {/* OTP Modal */}
      {showOtpModal && selectedOrder && (
        <div className="auth-modal-overlay">
          <div className="auth-modal" style={{ maxWidth: '400px', padding: '2rem' }}>
             <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <CheckCircle size={40} color="var(--gold)" style={{ margin: '0 auto 1rem' }} />
                <h3 style={{ margin: '0 0 0.5rem 0' }}>Secure Handover</h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Ask {selectedOrder.customer} for the 4-digit delivery PIN sent to their phone.</p>
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
               <button className="btn btn-gold" style={{ width: '100%', padding: '0.8rem' }} onClick={verifyOtp}>Verify & Mark Delivered</button>
               <button className="btn btn-outline" style={{ width: '100%', padding: '0.8rem', border: 'none' }} onClick={() => setShowOtpModal(false)}>Cancel</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
