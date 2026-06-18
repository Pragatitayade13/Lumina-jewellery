import { useState, useMemo } from 'react';
import { MapPin, Navigation, CheckCircle, AlertOctagon, Phone, Camera, X, ShieldCheck, MessageCircle, AlertTriangle } from 'lucide-react';
import { useLogistics, LOGISTICS_STATES } from '../../hooks/useLogistics';
import { useApp } from '../../context/AppContext';

export default function ActiveTransits() {
  const { user, showToast, currentStore } = useApp();
  const { shipments, updateStatus, verifyDeliveryOTP, sendDeliveryOTP, loading } = useLogistics(user?.uid, currentStore);

  // Modal States
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [selectedTransit, setSelectedTransit] = useState(null);
  const [otp, setOtp] = useState('');
  const [photoTaken, setPhotoTaken] = useState(false);
  const [signatureDone, setSignatureDone] = useState(false);
  const [idVerified, setIdVerified] = useState(false);
  
  // Filter active transits for this driver
  const activeTransits = useMemo(() => {
    return shipments.filter(s => 
      s.status === LOGISTICS_STATES.IN_TRANSIT || 
      s.status === LOGISTICS_STATES.OUT_FOR_DELIVERY
    ).map(s => ({
      id: s.id,
      orderId: s.orderId,
      customer: s.orderDetails?.customerName || s.orderDetails?.customer || s.customerName || 'Customer',
      address: s.orderDetails?.shippingAddress?.address || s.orderDetails?.address || 'Address hidden',
      phone: s.orderDetails?.phone || '+91 00000 00000',
      trackingStatus: s.status,
      eta: 'Calculating...',
      ...s
    }));
  }, [shipments]);

  const openVerification = (transit) => {
    setSelectedTransit(transit);
    setVerifyModalOpen(true);
    setOtp('');
    setPhotoTaken(false);
    setSignatureDone(false);
    setIdVerified(false);
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    try {
      showToast('Generating and sending OTP...', 'info');
      const generatedOtp = await sendDeliveryOTP(selectedTransit.id);
      showToast(`OTP Sent to customer! (For demo, OTP is: ${generatedOtp})`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to send OTP.', 'error');
    }
  };

  const confirmDelivery = async (e) => {
    e.preventDefault();
    if (!idVerified) {
      alert("SECURITY PROTOCOL FAILED: You must verify Government ID matches the order name.");
      return;
    }
    if (otp.length !== 6) {
      alert("Invalid OTP format. Please enter the 6-digit code.");
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
    
    try {
      const success = await verifyDeliveryOTP(selectedTransit.id, otp, user?.role, user?.uid);
      if (success) {
        setVerifyModalOpen(false);
        setSelectedTransit(null);
        showToast("Handover successfully completed! Chain of custody terminated.", "success");
      }
    } catch (err) {
      console.error(err);
      alert("Invalid OTP or verification failed. Please try again.");
    }
  };

  const markDamaged = async (id) => {
    if(window.confirm("CRITICAL: Are you sure you want to log transit damage? This will immediately alert HQ and freeze the package custody.")) {
      try {
        await updateStatus(id, LOGISTICS_STATES.FAILED, user?.role, user?.uid, { reason: 'transit_damage' });
        showToast("Damage report filed. Please return package to HQ vault immediately.", "error");
      } catch (err) {
        console.error(err);
        showToast("Failed to report damage.", "error");
      }
    }
  };

  const markOutForDelivery = async (id) => {
    try {
      await updateStatus(id, LOGISTICS_STATES.OUT_FOR_DELIVERY, user?.role, user?.uid);
      showToast("Marked as out for delivery. OTP has been generated.", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to update status.", "error");
    }
  };

  const sendETA = (customerName) => {
    alert(`Automated SMS sent to ${customerName}: "Your Lumina Jewels delivery driver is approaching and will arrive shortly."`);
  };

  const triggerSOS = async (id) => {
    if(window.confirm("CRITICAL: Are you reporting suspicious activity or fraud? This will instantly abort delivery, lock the system, and alert HQ Security.")) {
      try {
        await updateStatus(id, LOGISTICS_STATES.FAILED, user?.role, user?.uid, { reason: 'sos_alert' });
        alert("SOS ALERT SENT. Move to a safe location. HQ Security is contacting you immediately.");
      } catch (err) {
        console.error(err);
        showToast("Failed to send SOS.", "error");
      }
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading active routes...</div>;
  }

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

      {activeTransits.length === 0 ? (
        <div style={{ background: '#fff', padding: '4rem', textAlign: 'center', borderRadius: '12px', color: '#94a3b8' }}>
          <MapPin size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
          <h3>No Active Transits</h3>
          <p>You have no packages currently in your vehicle.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
          {activeTransits.map(transit => (
            <div key={transit.id} style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ background: '#0f172a', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', color: '#fff' }}>
                <span style={{ fontWeight: 'bold' }}>{transit.id.substring(0, 8).toUpperCase()}</span>
                <span style={{ color: '#fbbf24' }}>{transit.trackingStatus === LOGISTICS_STATES.OUT_FOR_DELIVERY ? 'Out for Delivery' : 'In Transit'}</span>
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
                {transit.trackingStatus === LOGISTICS_STATES.IN_TRANSIT ? (
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
                    <CheckCircle size={18} /> Verify Delivery
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
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>ID: {selectedTransit.id.substring(0, 8)}</div>
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
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: '500', color: '#334155' }}>2. Customer OTP Verification</span>
                  <button type="button" onClick={handleSendOTP} style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.85rem', cursor: 'pointer', fontWeight: '600' }}>
                    Send / Resend OTP
                  </button>
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="Enter 6-digit OTP provided by customer"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  style={{ width: '100%', padding: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '1rem', letterSpacing: '2px' }}
                  maxLength={6}
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
