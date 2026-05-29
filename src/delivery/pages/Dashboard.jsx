import { Truck, MapPin, CheckCircle, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', color: '#64748b' }}>Pending Pickups</h3>
            <div style={{ padding: '0.5rem', background: '#eff6ff', color: '#3b82f6', borderRadius: '8px' }}>
              <Truck size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0f172a' }}>12</div>
          <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem' }}>Ready at Warehouse HQ</div>
        </div>

        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', color: '#64748b' }}>Active Transit</h3>
            <div style={{ padding: '0.5rem', background: '#fef3c7', color: '#d97706', borderRadius: '8px' }}>
              <MapPin size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0f172a' }}>5</div>
          <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem' }}>Currently en route</div>
        </div>

        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', color: '#64748b' }}>Delivered Today</h3>
            <div style={{ padding: '0.5rem', background: '#dcfce7', color: '#16a34a', borderRadius: '8px' }}>
              <CheckCircle size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0f172a' }}>8</div>
          <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem' }}>100% success rate</div>
        </div>

      </div>

      <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <h3 style={{ margin: '0 0 1.5rem 0', color: '#0f172a' }}>Security Alerts</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b' }}>
          <AlertTriangle size={24} />
          <div>
            <strong>High-Value Transit Warning</strong>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.9rem' }}>You are scheduled to carry packages exceeding ₹5,00,000 today. Ensure GPS tracking remains active and do not deviate from approved routes.</p>
          </div>
        </div>
      </div>

      <div>
        <h3 style={{ margin: '0 0 1.5rem 0', color: '#0f172a' }}>Logistics & Delivery Operations</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.2s', ':hover': { borderColor: 'var(--gold)' } }}>
            <div style={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '0.5rem' }}>Assigned Orders List</div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>View all daily dispatch assignments</div>
          </div>
          
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.2s' }}>
            <div style={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '0.5rem' }}>Pickup Confirmation</div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Verify and accept warehouse custody</div>
          </div>
          
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.2s' }}>
            <div style={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '0.5rem' }}>Delivery Status Update</div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Update ETA and granular transit states</div>
          </div>
          
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.2s' }}>
            <div style={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '0.5rem' }}>Route Navigation System</div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Access GPS and optimal routing</div>
          </div>

          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.2s' }}>
            <div style={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '0.5rem' }}>Customer Verification</div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>OTP, Signature, and ID handover protocols</div>
          </div>

          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.2s' }}>
            <div style={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '0.5rem' }}>Return Handling Section</div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Manage reverse logistics and pickups</div>
          </div>

        </div>
      </div>
    </div>
  );
}
