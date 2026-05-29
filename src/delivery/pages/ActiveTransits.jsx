import { useState } from 'react';
import { MapPin, Navigation, CheckCircle, AlertOctagon, Phone, Camera, X, ShieldCheck, MessageCircle, AlertTriangle } from 'lucide-react';

export default function ActiveTransits() {
  const [transits, setTransits] = useState([
    { id: '#PKG-8904', orderId: '#LJ-7888', customer: 'Kavya Nair', address: '45 Marine Drive, Kochi, Kerala', phone: '+91 65432 10987', trackingStatus: 'in_transit', eta: '45 mins' },
    { id: '#PKG-8905', orderId: '#LJ-7887', customer: 'Ananya Gupta', address: '12 KP Kalyani Nagar, Pune, Maharashtra', phone: '+91 54321 09876', trackingStatus: 'in_transit', eta: '2 hrs' },
  ]);

  // Modal States
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [selectedTransit, setSelectedTransit] = useState(null);
  const [otp, setOtp] = useState('');
  const [photoTaken, setPhotoTaken] = useState(false);
  const [signatureDone, setSignatureDone] = useState(false);
  const [idVerified, setIdVerified] = useState(false);

  const openVerification = (transit) => {
    setSelectedTransit(transit);
    setVerifyModalOpen(true);
    setOtp('');
    setPhotoTaken(false);
    setSignatureDone(false);
    setIdVerified(false);
  };

  const confirmDelivery = (e) => {
    e.preventDefault();
    if (!idVerified) {
      alert("SECURITY PROTOCOL FAILED: You must verify Government ID matches the order name.");
      return;
    }
    if (otp !== '1234') {
      alert("Invalid OTP! Please ask customer for correct 4-digit code (Hint: 1234).");
      return;
    }
    if (!photoTaken) {
      alert("Delivery confirmation photo is required.");
      return;
    }
    if (!signatureDone) {
      alert("Customer signature is required for high-value items.");
      return;
    }
    setTransits(transits.filter(t => t.id !== selectedTransit.id));
    setVerifyModalOpen(false);
    setSelectedTransit(null);
    alert("Handover successfully completed! Chain of custody terminated.");
  };

  const markDamaged = (id) => {
    if(window.confirm("CRITICAL: Are you sure you want to log transit damage? This will immediately alert HQ and freeze the package custody.")) {
      setTransits(transits.filter(t => t.id !== id));
      alert("Damage report filed. Please return package to HQ vault immediately.");
    }
  };

  const markOutForDelivery = (id) => {
    setTransits(transits.map(t => t.id === id ? { ...t, trackingStatus: 'out_for_delivery' } : t));
  };

  const sendETA = (customerName) => {
    alert(`Automated SMS sent to ${customerName}: "Your Lumina Jewels delivery driver is approaching and will arrive shortly."`);
  };

  const triggerSOS = (id) => {
    if(window.confirm("CRITICAL: Are you reporting suspicious activity or fraud? This will instantly abort delivery, lock the system, and alert HQ Security.")) {
      setTransits(transits.filter(t => t.id !== id));
      alert("SOS ALERT SENT. Move to a safe location. HQ Security is contacting you immediately.");
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>Active Transits</h2>
          <p style={{ margin: 0, color: '#64748b' }}>Maintain strict control and route compliance.</p>
        </div>
        <div style={{ background: '#fef3c7', padding: '0.8rem 1.5rem', borderRadius: '8px', color: '#d97706', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Navigation size={18} /> GPS Tracking Active
        </div>
      </div>

      {transits.length === 0 ? (
        <div style={{ background: '#fff', padding: '4rem', textAlign: 'center', borderRadius: '12px', color: '#94a3b8' }}>
          <MapPin size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
          <h3>No Active Transits</h3>
          <p>You have no packages currently in your vehicle.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
          {transits.map(transit => (
            <div key={transit.id} style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ background: '#0f172a', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', color: '#fff' }}>
                <span style={{ fontWeight: 'bold' }}>{transit.id}</span>
                <span style={{ color: '#fbbf24' }}>ETA: {transit.eta}</span>
              </div>
              <div style={{ padding: '1.5rem', flex: 1 }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.3rem' }}>Customer</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#0f172a' }}>{transit.customer}</div>
                </div>
                
                <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <MapPin size={20} color="#94a3b8" style={{ marginTop: '0.2rem' }} />
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.3rem' }}>Delivery Address</div>
                    <div style={{ color: '#334155', lineHeight: '1.4' }}>{transit.address}</div>
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <Phone size={20} color="#94a3b8" />
                  <a href={`tel:${transit.phone}`} style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '500' }}>{transit.phone}</a>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => sendETA(transit.customer)} style={{ flex: 1, padding: '0.5rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', cursor: 'pointer' }}>
                    <MessageCircle size={14} /> Send ETA
                  </button>
                  <button onClick={() => triggerSOS(transit.id)} style={{ flex: 1, padding: '0.5rem', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '4px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', cursor: 'pointer' }}>
                    <AlertTriangle size={14} /> Report Suspicious
                  </button>
                </div>
              </div>
              
              <div style={{ padding: '1rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '1rem' }}>
                {transit.trackingStatus === 'in_transit' ? (
                  <button 
                    onClick={() => markOutForDelivery(transit.id)}
                    style={{ flex: 1, padding: '0.8rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                  >
                    <Navigation size={18} /> Mark "Out for Delivery"
                  </button>
                ) : (
                  <button 
                    onClick={() => openVerification(transit)}
                    style={{ flex: 1, padding: '0.8rem', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                  >
                    <CheckCircle size={18} /> Deliver Order
                  </button>
                )}
                
                <button  
                  onClick={() => markDamaged(transit.id)}
                  style={{ padding: '0.8rem', background: 'transparent', color: '#ef4444', border: '1px solid #fca5a5', borderRadius: '6px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}
                  title="Report Damage"
                >
                  <AlertOctagon size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delivery Verification Modal */}
      {verifyModalOpen && selectedTransit && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '500px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
            <div style={{ padding: '1.5rem', background: '#1e293b', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={20} color="var(--gold)" /> Secure Handover Protocol
              </h3>
              <button onClick={() => setVerifyModalOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={confirmDelivery} style={{ padding: '2rem' }}>
              <div style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Delivering to:</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#0f172a' }}>{selectedTransit.customer}</div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>ID: {selectedTransit.id}</div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#334155' }}>1. Government ID Verification</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '1px solid #cbd5e1', borderRadius: '6px', background: idVerified ? '#f0fdf4' : '#fff', cursor: 'pointer' }}>
                  <input type="checkbox" checked={idVerified} onChange={e => setIdVerified(e.target.checked)} style={{ width: '20px', height: '20px', accentColor: '#16a34a' }} />
                  <div>
                    <strong style={{ color: '#0f172a', display: 'block' }}>Verify Physical ID Matches</strong>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Check Aadhar/PAN against order name: {selectedTransit.customer}</span>
                  </div>
                </label>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#334155' }}>2. Customer OTP Verification</label>
                <input 
                  type="text" 
                  required
                  placeholder="Enter 4-digit OTP provided by customer"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  style={{ width: '100%', padding: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '1rem', letterSpacing: '2px' }}
                  maxLength={4}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#334155' }}>3. Photographic Evidence</label>
                {!photoTaken ? (
                  <button type="button" onClick={() => setPhotoTaken(true)} style={{ width: '100%', padding: '1rem', border: '2px dashed #cbd5e1', borderRadius: '6px', background: '#f8fafc', color: '#64748b', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <Camera size={24} /> Take Photo of Handover
                  </button>
                ) : (
                  <div style={{ width: '100%', padding: '1rem', border: '1px solid #16a34a', borderRadius: '6px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle size={20} /> Photo Captured Successfully
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#334155' }}>4. Customer Signature</label>
                {!signatureDone ? (
                  <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', cursor: 'pointer' }} onClick={() => setSignatureDone(true)}>
                    <span style={{ color: '#94a3b8' }}>Tap here to open Signature Pad</span>
                  </div>
                ) : (
                  <div style={{ width: '100%', padding: '1rem', border: '1px solid #16a34a', borderRadius: '6px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle size={20} /> Signature Collected
                  </div>
                )}
              </div>

              <button type="submit" style={{ width: '100%', padding: '1rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>
                Confirm Final Handover
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
