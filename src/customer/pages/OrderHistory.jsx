import { useState, useMemo } from 'react';
import { Package, Download, Truck, Edit2, X, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLogistics, LOGISTICS_STATES } from '../../hooks/useLogistics';
import { useOrders } from '../../hooks/useOrders';
import { useApp } from '../../context/AppContext';
import { downloadInvoice } from '../../utils/invoiceGenerator';

export default function OrderHistory() {
  const { showToast, user } = useApp();
  const { orders, loading } = useOrders();
  const { shipments, updateStatus } = useLogistics();
  const [detailsModal, setDetailsModal] = useState({ isOpen: false, order: null });

  // Filter orders for the logged-in customer
  const customerOrders = useMemo(() => {
    if (!user) return [];
    return orders.filter(o => o.customerId === user.uid);
  }, [orders, user]);

  const handleDownloadInvoice = async (order) => {
    showToast(`Generating GST Invoice for ${order.id}...`);
    // Ensure the order has items array mapped properly if needed, but it should already have it from checkout
    downloadInvoice(order, false, null);
  };

  const handleCancelOrder = async (order) => {
    if (!window.confirm(`Are you sure you want to cancel order ${order.id}?`)) return;
    try {
      const { getAuth } = await import('firebase/auth');
      const auth = getAuth();
      if (!auth.currentUser) throw new Error("Not logged in");
      
      const token = await auth.currentUser.getIdToken();
      
      showToast('Cancelling order...');
      const response = await fetch('/api/orders/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ orderId: order.firebaseId || order.id, newStatus: 'cancelled' })
      });
      
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to cancel");
      
      showToast('Order cancelled successfully.');
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Error cancelling order. It may have already been processed.', 'error');
    }
  };

  const handleReturnOrder = async (order) => {
    if (!window.confirm(`Are you sure you want to request a return for order ${order.id}?`)) return;
    try {
      const { getAuth } = await import('firebase/auth');
      const auth = getAuth();
      if (!auth.currentUser) throw new Error("Not logged in");
      
      const token = await auth.currentUser.getIdToken();
      
      showToast('Requesting return...');
      const response = await fetch('/api/orders/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ orderId: order.firebaseId || order.id, newStatus: 'return_requested' })
      });
      
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to request return");
      
      showToast('Return requested successfully.');
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Error requesting return.', 'error');
    }
  };

  return (
    <div>
      <div className="customer-card">
        <h2 className="card-title"><Package /> My Orders</h2>
        <p style={{ color: 'var(--text-muted)' }}>View your past purchases, download invoices, and track active shipments.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {loading ? (
          <div className="customer-card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading orders...</div>
        ) : customerOrders.length === 0 ? (
          <div className="customer-card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>You have no orders yet.</div>
        ) : (
          customerOrders.map(order => (
            <div key={order.id} className="customer-card" style={{ padding: '1.5rem' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>
                    {order.items?.map(i => `${i.quantity || 1}x ${i.name}`).join(', ') || order.product || 'Jewellery Items'}
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', gap: '1rem', fontFamily: 'system-ui, sans-serif', flexWrap: 'wrap' }}>
                    <span>Order ID: {order.id.slice(0, 8).toUpperCase()}</span>
                    <span>•</span>
                    <span>{order.createdAt ? new Date(order.createdAt?.seconds * 1000).toLocaleDateString() : 'Recent'}</span>
                    {order.storeName && (
                      <>
                        <span>•</span>
                        <span style={{ color: 'var(--gold)', fontWeight: 600 }}>✦ {order.storeName}</span>
                      </>
                    )}
                  </div>
                </div>
                <span className={`badge badge-${order.status === 'delivered' ? 'success' : 'info'}`} style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem', textTransform: 'uppercase' }}>
                  {order.status}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Order Date</div>
                  <div style={{ fontWeight: 500, fontFamily: 'system-ui, sans-serif' }}>{order.createdAt ? new Date(order.createdAt?.seconds * 1000).toLocaleDateString() : 'Recent'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Amount</div>
                  <div style={{ fontWeight: 600, fontFamily: 'system-ui, sans-serif' }}>₹{order.total?.toLocaleString() || order.amount?.toLocaleString() || 0}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Payment</div>
                  <div style={{ fontWeight: 500 }}>
                    {order.paymentStatus === 'paid' || order.status === 'delivered' || order.paymentMethod?.toLowerCase() === 'card' || order.paymentMethod?.toLowerCase() === 'upi' || order.paymentMethod?.toLowerCase() === 'online' ? 'Paid' : 'Pending'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Delivery</div>
                  <div style={{ fontWeight: 500 }}>Expected in 5-7 days</div>
                </div>
                {order.storeName && (
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Store</div>
                    <div style={{ fontWeight: 600, color: 'var(--gold)', fontSize: '0.9rem' }}>✦ {order.storeName}</div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Link to={`/account/track/${order.id}`} className="btn btn-gold" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Truck size={16} /> Track Order
                </Link>
                <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => setDetailsModal({ isOpen: true, order })}>
                  View Details
                </button>
                <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => handleDownloadInvoice(order)}>
                  <Download size={16} /> Download Invoice
                </button>
                {(order.status === 'pending' || order.status === 'confirmed') && (
                  <button className="btn btn-outline" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }} onClick={() => handleCancelOrder(order)}>
                    <X size={16} /> Cancel Order
                  </button>
                )}
                {order.status === 'delivered' && (
                  <button className="btn btn-outline" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.3)' }} onClick={() => handleReturnOrder(order)}>
                    <Truck size={16} /> Return Order
                  </button>
                )}
                {order.status === 'return_requested' && (
                  <div style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '6px' }}>
                    Return Pending Approval
                  </div>
                )}
              </div>

            </div>
          ))
        )}
      </div>
      {/* View Details Modal */}
      {detailsModal.isOpen && detailsModal.order && (
        <div className="modal-overlay" style={{ zIndex: 9999, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-box" style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '600px', border: '1px solid var(--border-color)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <h3 style={{ color: 'var(--text-primary)', margin: 0 }}>Order Details #{detailsModal.order.id.slice(0, 8).toUpperCase()}</h3>
              <button onClick={() => setDetailsModal({ isOpen: false, order: null })} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20}/></button>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ color: 'var(--gold)', marginBottom: '1rem' }}>Items in this Order</h4>
              {(detailsModal.order.items || [{ name: detailsModal.order.product || 'Jewellery Item', quantity: 1, price: detailsModal.order.amount || detailsModal.order.total }]).map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'var(--surface)', borderRadius: '8px', marginBottom: '0.5rem' }}>
                  <div>
                    <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{item.name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'system-ui, sans-serif' }}>Quantity: {item.quantity || 1}</div>
                  </div>
                  <div style={{ fontWeight: 600, fontFamily: 'system-ui, sans-serif' }}>₹{(item.price ? (item.price * (item.quantity || 1)) : (detailsModal.order.amount || detailsModal.order.total || 0)).toLocaleString()}</div>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-primary)', borderRadius: '8px', marginTop: '1rem', border: '1px solid var(--border-color)' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Total Order Amount</div>
                <div style={{ fontWeight: 700, color: 'var(--gold)', fontFamily: 'system-ui, sans-serif', fontSize: '1.1rem' }}>
                  ₹{(detailsModal.order.total || detailsModal.order.amount || 0).toLocaleString()}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
              <div>
                <h4 style={{ color: 'var(--gold)', marginBottom: '0.5rem' }}>Shipping Address</h4>
                <div style={{ padding: '1rem', background: 'var(--surface)', borderRadius: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  {detailsModal.order.shippingAddress || detailsModal.order.address || 'Address pending'}
                </div>
              </div>
              <div>
                <h4 style={{ color: 'var(--gold)', marginBottom: '0.5rem' }}>Payment Information</h4>
                <div style={{ padding: '1rem', background: 'var(--surface)', borderRadius: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <div>Method: {detailsModal.order.paymentMethod || 'Online'}</div>
                  <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    Status: 
                    <span className={`badge badge-${(detailsModal.order.paymentStatus === 'paid' || detailsModal.order.status === 'delivered' || detailsModal.order.paymentMethod?.toLowerCase() === 'card' || detailsModal.order.paymentMethod?.toLowerCase() === 'upi' || detailsModal.order.paymentMethod?.toLowerCase() === 'online') ? 'success' : 'pending'}`} style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}>
                      {(detailsModal.order.paymentStatus === 'paid' || detailsModal.order.status === 'delivered' || detailsModal.order.paymentMethod?.toLowerCase() === 'card' || detailsModal.order.paymentMethod?.toLowerCase() === 'upi' || detailsModal.order.paymentMethod?.toLowerCase() === 'online') ? 'PAID' : 'PENDING'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
              <button type="button" className="btn btn-outline" onClick={() => setDetailsModal({ isOpen: false, order: null })}>Close</button>
              <button type="button" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => handleDownloadInvoice(detailsModal.order)}>
                <Download size={16} /> Download Invoice
              </button>
              <Link to={`/account/track/${detailsModal.order.id}`} className="btn btn-gold" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => setDetailsModal({ isOpen: false, order: null })}>
                <Truck size={16} /> Track Order
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
