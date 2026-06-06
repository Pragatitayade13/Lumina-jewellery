import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, CheckCircle, Clock, Package, Truck, AlertCircle } from 'lucide-react';
import { useOrders } from '../../hooks/useOrders';
import { useLogistics } from '../../hooks/useLogistics';

const TIMELINE_STEPS = [
  { key: 'placed', label: 'Order Placed' },
  { key: 'payment', label: 'Payment Confirmed' },
  { key: 'PENDING', label: 'Processing' },
  { key: 'READY', label: 'Ready for Dispatch' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { key: 'DELIVERED', label: 'Delivered' }
];

export default function OrderTracking() {
  const { orderId } = useParams();
  const { orders } = useOrders();
  const { shipments, getTrackingHistory } = useLogistics();
  
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Find the order
  const order = orders?.find(o => o.id === orderId) || {
    id: orderId || '#LJ-7890',
    createdAt: { seconds: Date.now() / 1000 },
    status: 'pending',
    product: 'Jewellery Items'
  };

  const shipment = shipments?.find(s => s.orderId === order.id);

  useEffect(() => {
    async function fetchHistory() {
      if (shipment?.id) {
        try {
          const hist = await getTrackingHistory(shipment.id);
          setHistory(hist);
        } catch(e) {
          console.error(e);
        }
      }
      setLoading(false);
    }
    fetchHistory();
  }, [shipment?.id, getTrackingHistory]);

  const currentStatus = shipment?.status || 'PENDING';
  
  // Logic to determine if a step is completed or active
  const isStepCompleted = (stepKey) => {
    if (stepKey === 'placed' || stepKey === 'payment') return true;
    
    const statesMap = {
      'PENDING': 0, 'PACKED': 1, 'READY': 2, 'ASSIGNED': 3, 
      'IN_TRANSIT': 4, 'OUT_FOR_DELIVERY': 5, 'DELIVERED': 6
    };
    
    const targetMap = {
      'PENDING': 0,
      'READY': 2,
      'OUT_FOR_DELIVERY': 5,
      'DELIVERED': 6
    };
    
    return statesMap[currentStatus] >= targetMap[stepKey];
  };

  const isStepActive = (stepKey) => {
    const statesMap = {
      'PENDING': 0, 'PACKED': 1, 'READY': 2, 'ASSIGNED': 3, 
      'IN_TRANSIT': 4, 'OUT_FOR_DELIVERY': 5, 'DELIVERED': 6
    };
    
    const targetMap = {
      'PENDING': 0,
      'READY': 2,
      'OUT_FOR_DELIVERY': 5,
      'DELIVERED': 6
    };

    if (stepKey === 'placed' || stepKey === 'payment') return false;
    if (currentStatus === 'DELIVERED') return stepKey === 'DELIVERED';
    
    // Simplistic active logic: it's active if the next target hasn't been reached
    if (stepKey === 'PENDING' && statesMap[currentStatus] < targetMap['READY']) return true;
    if (stepKey === 'READY' && statesMap[currentStatus] >= targetMap['READY'] && statesMap[currentStatus] < targetMap['OUT_FOR_DELIVERY']) return true;
    if (stepKey === 'OUT_FOR_DELIVERY' && statesMap[currentStatus] >= targetMap['OUT_FOR_DELIVERY'] && statesMap[currentStatus] < targetMap['DELIVERED']) return true;
    
    return false;
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="pd-breadcrumb" style={{ marginBottom: '2rem' }}>
        <Link to="/account/orders" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>
          <ChevronLeft size={16} /> Back to My Orders
        </Link>
      </div>

      <div className="customer-card" style={{ marginBottom: '2rem', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ margin: '0 0 0.5rem 0' }}>Order <span style={{ fontFamily: 'system-ui, sans-serif' }}>#{order.id.slice(0, 8).toUpperCase()}</span></h1>
            <div style={{ color: 'var(--text-muted)' }}>Placed on <span style={{ fontFamily: 'system-ui, sans-serif' }}>{new Date(order.createdAt?.seconds * 1000).toLocaleDateString()}</span></div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className={`badge badge-info`} style={{ fontSize: '0.9rem', padding: '0.5rem 1rem', textTransform: 'uppercase' }}>
              {TIMELINE_STEPS.find(t => t.key === currentStatus)?.label || currentStatus}
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem', background: 'var(--surface)', padding: '1.5rem', borderRadius: '8px' }}>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.2rem' }}>Estimated Delivery</div>
            <div style={{ fontWeight: 600 }}>Expected in 5-7 days</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.2rem' }}>Current Location</div>
            <div style={{ fontWeight: 600 }}>{currentStatus === 'DELIVERED' ? 'Delivered' : 'Mumbai Hub'}</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.2rem' }}>Tracking Number</div>
            <div style={{ fontWeight: 600, color: 'var(--gold)', fontFamily: 'system-ui, sans-serif' }}>{shipment?.id?.slice(0, 10).toUpperCase() || 'Pending'}</div>
          </div>
        </div>

        <h3 style={{ marginBottom: '1.5rem' }}>Order Timeline</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginLeft: '1rem', borderLeft: '2px solid var(--border-color)', paddingLeft: '2rem', position: 'relative' }}>
          {TIMELINE_STEPS.map((step, idx) => {
            const isCompleted = isStepCompleted(step.key);
            const isActive = isStepActive(step.key);
            
            return (
              <div key={idx} style={{ position: 'relative' }}>
                {/* Timeline Dot */}
                <div style={{
                  position: 'absolute',
                  left: '-2.6rem',
                  top: '0',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: isActive ? 'var(--gold)' : isCompleted ? 'var(--status-green)' : 'var(--surface)',
                  border: `2px solid ${isActive ? 'var(--gold)' : isCompleted ? 'var(--status-green)' : 'var(--border-color)'}`,
                  zIndex: 2
                }}>
                  {isCompleted && !isActive && <CheckCircle size={16} color="#000" style={{ position: 'absolute', top: '0', left: '0' }} />}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.2rem 0', color: isActive ? 'var(--gold)' : isCompleted ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      {step.label}
                    </h4>
                    {isActive && <span style={{ fontSize: '0.8rem', color: 'var(--gold)' }}>Current stage</span>}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'system-ui, sans-serif' }}>
                    {isCompleted ? (step.key === 'placed' || step.key === 'payment' ? new Date(order.createdAt?.seconds * 1000).toLocaleString() : 'Done') : 'Pending'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="customer-card" style={{ padding: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Shipment Activity</h3>
        <table className="customer-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>Time</th>
              <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>Location</th>
              <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="3" style={{ padding: '1rem', textAlign: 'center' }}>Loading...</td></tr>
            ) : history.length === 0 ? (
              <tr><td colSpan="3" style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>No tracking history available yet.</td></tr>
            ) : (
              history.map((h, i) => (
                <tr key={i}>
                  <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', fontFamily: 'system-ui, sans-serif' }}>{h.timestamp ? new Date(h.timestamp.seconds * 1000).toLocaleString() : 'Just now'}</td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>{h.locationData?.city || 'Mumbai Hub'}</td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>{h.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
