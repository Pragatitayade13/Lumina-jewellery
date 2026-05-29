import { useState, useMemo } from 'react';
import { Package, Download, Truck, Edit2, X, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useOrders } from '../../hooks/useOrders';

export default function OrderHistory() {
  const { showToast, user } = useApp();
  const { orders, loading } = useOrders();
  const [customizeModal, setCustomizeModal] = useState({ isOpen: false, orderId: null, note: '' });

  // Filter orders for the logged-in customer
  const customerOrders = useMemo(() => {
    if (!user) return [];
    return orders.filter(o => o.customerId === user.uid);
  }, [orders, user]);

  const handleCustomizeSubmit = (e) => {
    e.preventDefault();
    showToast(`Customization request sent for order ${customizeModal.orderId}`);
    setCustomizeModal({ isOpen: false, orderId: null, note: '' });
  };

  const handleDownloadInvoice = (order) => {
    const invoiceContent = `=======================================
LUMINA JEWELS - OFFICIAL INVOICE
=======================================
Order ID:      ${order.id}
Date:          ${order.date}
Status:        ${order.status.toUpperCase()}
Tracking AWB:  ${order.tracking || 'Pending Generation'}
---------------------------------------
Customer:      ${order.customer}
Email:         ${order.email || 'N/A'}
Phone:         ${order.phone || 'N/A'}
Shipping To:   ${order.address || 'N/A'}, ${order.city || 'N/A'}
---------------------------------------
Products:
${order.product}

Subtotal:      ₹${(order.subtotal || order.amount).toLocaleString()}
Discount:      -₹${(order.discount || 0).toLocaleString()}
Delivery Fee:  ₹${(order.deliveryFee || 0).toLocaleString()}
Total Amount:  ₹${order.amount.toLocaleString()}
Payment Via:   ${order.paymentMethod || 'Credit Card'}
---------------------------------------
Thank you for choosing Lumina Jewels!
For support, contact care@luminajewels.com
=======================================`;

    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice_${order.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast(`Downloading invoice for ${order.id}`);
  };

  return (
    <div>
      <div className="customer-card">
        <h2 className="card-title"><Package /> Order History & Tracking</h2>
        <p style={{ color: 'var(--text-muted)' }}>View your past purchases, download invoices, and track active shipments.</p>
      </div>

      <div className="customer-card">
        <div className="customer-table-wrap">
          <table className="customer-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Order Date</th>
                <th>Product Summary</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading orders...</td>
                </tr>
              ) : customerOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>You have no orders yet.</td>
                </tr>
              ) : (
                customerOrders.map(order => (
                  <tr key={order.id}>
                    <td style={{ fontFamily: 'monospace', color: 'var(--gold)' }}>{order.id.slice(0, 8).toUpperCase()}</td>
                    <td>{order.date}</td>
                    <td style={{ fontWeight: 500, maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{order.product}</td>
                    <td style={{ fontWeight: 600 }}>₹{order.amount.toLocaleString()}</td>
                    <td>
                      <span className={`badge badge-${order.status === 'delivered' ? 'success' : order.status === 'cancelled' ? 'danger' : 'info'}`}>
                        {order.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {(order.status === 'shipped' || order.status === 'delivered') && (
                          <Link to={`/account/track/${order.id}`} className="btn btn-icon btn-outline" title="Track Order">
                            <Truck size={14} />
                          </Link>
                        )}
                        {(order.status === 'shipped' || order.status === 'processing' || order.status === 'pending') && (
                          <button className="btn btn-icon btn-outline" title="Customize Order" onClick={() => setCustomizeModal({ isOpen: true, orderId: order.id, note: '' })}>
                            <Edit2 size={14} />
                          </button>
                        )}
                        <button className="btn btn-icon btn-outline" title="Download Invoice" onClick={() => handleDownloadInvoice(order)}>
                          <Download size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customize Modal */}
      {customizeModal.isOpen && (
        <div className="modal-overlay" style={{ zIndex: 9999, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-box" style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '500px', border: '1px solid var(--border-color)' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ color: 'var(--gold)', margin: 0 }}>Customize Order</h3>
              <button onClick={() => setCustomizeModal({ isOpen: false, orderId: null, note: '' })} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20}/></button>
            </div>
            <form onSubmit={handleCustomizeSubmit}>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Add Customization Note (Engraving, Ring Size, etc.)</label>
                <textarea 
                  required 
                  className="form-input" 
                  style={{ width: '100%', padding: '0.8rem', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '4px', resize: 'none', height: '120px' }} 
                  placeholder="E.g., Please engrave 'Forever' on the inside of the ring..."
                  value={customizeModal.note}
                  onChange={e => setCustomizeModal({...customizeModal, note: e.target.value})}
                ></textarea>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setCustomizeModal({ isOpen: false, orderId: null, note: '' })}>Cancel</button>
                <button type="submit" className="btn btn-gold" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Send size={16} /> Send Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
