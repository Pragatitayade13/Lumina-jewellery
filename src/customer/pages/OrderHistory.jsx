import { useState, useMemo } from 'react';
import { Package, Download, Truck, Edit2, X, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLogistics, LOGISTICS_STATES } from '../../hooks/useLogistics';
import { useApp } from '../../context/AppContext';
import { useOrders } from '../../hooks/useOrders';

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
    showToast(`Generating invoice for ${order.id}...`);
    
    const orderDate = order.createdAt ? new Date(order.createdAt?.seconds * 1000).toLocaleDateString() : 'Recent';
    const totalAmount = order.total?.toLocaleString() || order.amount?.toLocaleString() || 0;
    const isPaid = order.paymentStatus === 'paid' || order.status === 'delivered' || order.paymentMethod?.toLowerCase() === 'card' || order.paymentMethod?.toLowerCase() === 'upi' || order.paymentMethod?.toLowerCase() === 'online';
    
    const invoiceHtml = `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; color: #333; width: 100%; padding: 40px; box-sizing: border-box; background: white;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #c9a84c; padding-bottom: 20px; margin-bottom: 30px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 32px; height: 32px; stroke: #c9a84c;">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <h1 style="font-size: 24px; margin: 0; letter-spacing: 2px; text-transform: uppercase; color: #111;">Lumina Jewels</h1>
          </div>
          <div style="text-align: right;">
            <h2 style="font-size: 28px; margin: 0; color: #666; font-weight: 300;">TAX INVOICE</h2>
            <p style="margin: 5px 0 0 0; color: #888; font-family: system-ui, sans-serif;">#${order.id}</p>
            <p style="margin: 5px 0 0 0; color: #888; font-family: system-ui, sans-serif;">Date: ${orderDate}</p>
          </div>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 40px;">
          <div>
            <h3 style="font-size: 12px; text-transform: uppercase; color: #888; letter-spacing: 1px; margin-bottom: 5px;">Billed To</h3>
            <p style="margin: 0 0 5px 0; line-height: 1.5;"><strong>${order.customerName || user?.name || 'Valued Customer'}</strong></p>
            <p style="margin: 0 0 5px 0; line-height: 1.5;">${order.shippingAddress || order.address || 'Address pending'}</p>
            <p style="margin: 0 0 5px 0; line-height: 1.5;">${order.customerEmail || user?.email || ''}</p>
          </div>
          <div style="text-align: right;">
            <h3 style="font-size: 12px; text-transform: uppercase; color: #888; letter-spacing: 1px; margin-bottom: 5px;">Payment Info</h3>
            <p style="margin: 0 0 5px 0; line-height: 1.5;">Method: ${order.paymentMethod || 'Online'}</p>
            <p style="margin-top: 10px;">
              <span style="display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; text-transform: uppercase; ${isPaid ? 'background: #e8f5e9; color: #2e7d32; border: 1px solid #c8e6c9;' : 'background: #fff3e0; color: #e65100; border: 1px solid #ffe0b2;'}">
                ${isPaid ? 'PAID' : 'PENDING'}
              </span>
            </p>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
          <thead>
            <tr>
              <th style="text-align: left; padding: 12px; border-bottom: 1px solid #ddd; font-weight: 600; text-transform: uppercase; font-size: 12px; color: #888;">Item Description</th>
              <th style="text-align: center; padding: 12px; border-bottom: 1px solid #ddd; font-weight: 600; text-transform: uppercase; font-size: 12px; color: #888;">Qty</th>
              <th style="text-align: right; padding: 12px; border-bottom: 1px solid #ddd; font-weight: 600; text-transform: uppercase; font-size: 12px; color: #888;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${(order.items || [{ name: order.product || 'Jewellery Item', quantity: 1, price: order.amount || order.total }]).map(item => `
              <tr>
                <td style="padding: 15px 12px; border-bottom: 1px solid #eee;"><strong>${item.name}</strong></td>
                <td style="text-align: center; padding: 15px 12px; border-bottom: 1px solid #eee; font-family: system-ui, sans-serif;">${item.quantity || 1}</td>
                <td style="text-align: right; padding: 15px 12px; border-bottom: 1px solid #eee; font-family: system-ui, sans-serif;">₹${(item.price * (item.quantity || 1))?.toLocaleString() || totalAmount}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="width: 300px; margin-left: auto;">
          <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; font-family: system-ui, sans-serif;">
            <span>Subtotal</span>
            <span>₹${totalAmount}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; font-family: system-ui, sans-serif;">
            <span>Taxes (Included)</span>
            <span>₹0</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; font-family: system-ui, sans-serif;">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 10px 0; border-top: 2px solid #333; border-bottom: 2px solid #333; margin-top: 10px; font-size: 18px; font-weight: bold; font-family: system-ui, sans-serif;">
            <span>Total Amount</span>
            <span>₹${totalAmount}</span>
          </div>
        </div>

        <div style="margin-top: 60px; text-align: center; color: #888; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px;">
          <p style="margin: 0 0 5px 0;">Thank you for choosing Lumina Jewels!</p>
          <p style="margin: 0 0 5px 0;">If you have any questions about this invoice, please contact care@luminajewels.com</p>
          <p style="margin: 10px 0 0 0;">This is a computer-generated document. No signature is required.</p>
        </div>
      </div>
    `;
    
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = document.createElement('div');
      element.innerHTML = invoiceHtml;
      const opt = {
        margin:       0,
        filename:     `Lumina_Invoice_${order.id.slice(0,8)}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      
      html2pdf().set(opt).from(element).save().then(() => {
        showToast('Invoice downloaded successfully!');
      });
    } catch (e) {
      console.error('Failed to generate PDF', e);
      showToast('Error generating PDF. Download fallback as HTML.', 'error');
      // Fallback
      const blob = new Blob([invoiceHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice_${order.id}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleCancelOrder = async (order) => {
    if (!window.confirm(`Are you sure you want to cancel order ${order.id}?`)) return;
    try {
      const shipment = shipments?.find(s => s.orderId === order.id);
      if (shipment) {
        await updateStatus(shipment.id, LOGISTICS_STATES.CANCELLED, 'customer', 'customer-self', { action: 'customer_cancellation' }, true);
        showToast('Order cancelled successfully.');
      } else {
        // If there's no shipment yet, we should at least update the orders collection!
        const { db } = await import('../../config/firebase');
        const { updateDoc, doc, serverTimestamp } = await import('firebase/firestore');
        await updateDoc(doc(db, 'orders', order.id), {
          status: 'cancelled',
          updatedAt: serverTimestamp()
        });
        showToast('Order cancelled successfully.');
      }
    } catch (err) {
      console.error(err);
      showToast('Error cancelling order. It may have already been processed.');
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
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', gap: '1rem', fontFamily: 'system-ui, sans-serif' }}>
                    <span>Order ID: {order.id.slice(0, 8).toUpperCase()}</span>
                    <span>•</span>
                    <span>{order.createdAt ? new Date(order.createdAt?.seconds * 1000).toLocaleDateString() : 'Recent'}</span>
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
                {(order.status?.toLowerCase() === 'pending' || order.status?.toUpperCase() === 'PENDING') && (
                  <button className="btn btn-outline" style={{ color: 'var(--status-red)', borderColor: 'var(--status-red)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }} onClick={() => handleCancelOrder(order)}>
                    Cancel Order
                  </button>
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
