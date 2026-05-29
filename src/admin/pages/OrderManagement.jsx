import { useState, useMemo } from 'react';
import { PackageOpen, Eye, FileText, Search, X, CheckCircle, Truck, AlertTriangle, Check, XCircle } from 'lucide-react';
import { useOrders } from '../../hooks/useOrders';
import { useApp } from '../../context/AppContext';

const statusClass = { delivered: 'badge-delivered', shipped: 'badge-shipped', processing: 'badge-pending', confirmed: 'badge-confirmed', pending: 'badge-pending', cancelled: 'badge-cancelled', refund_pending: 'badge-orange' };

export default function OrderManagement() {
  const { orders: liveOrders, loading, updateOrderStatus } = useOrders();
  const { showToast } = useApp();
  
  const [activeTab, setActiveTab] = useState('All Orders');
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('Payment Method');
  const [sortOrder, setSortOrder] = useState('Date: Newest');
  
  const [selectedOrder, setSelectedOrder] = useState(null); // For details modal
  const [viewInvoice, setViewInvoice] = useState(null); // For invoice modal
  
  const tabs = ['All Orders', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returns/Refunds'];
  
  const filteredAndSortedOrders = useMemo(() => {
    if (!liveOrders) return [];
    
    let result = activeTab === 'All Orders' 
      ? liveOrders 
      : activeTab === 'Returns/Refunds' 
        ? liveOrders.filter(o => o.status === 'refund_pending')
        : liveOrders.filter(o => o.status && o.status.toLowerCase() === activeTab.toLowerCase());

    if (searchTerm) {
      result = result.filter(o => 
        (o.id && o.id.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (o.customer && o.customer.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (paymentFilter !== 'Payment Method') {
      result = result.filter(o => o.paymentMethod && o.paymentMethod.toLowerCase() === paymentFilter.toLowerCase());
    }

    result = [...result].sort((a, b) => {
      if (sortOrder === 'Amount: High to Low') return (b.amount || 0) - (a.amount || 0);
      
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
      
      if (sortOrder === 'Date: Oldest') return timeA - timeB;
      return timeB - timeA; // Default to Newest
    });

    return result;
  }, [liveOrders, activeTab, searchTerm, paymentFilter, sortOrder]);

  const handleStatusChange = async (orderId, newStatus) => {
    if (!newStatus) return;
    try {
      showToast(`Updating order ${orderId}...`);
      await updateOrderStatus(orderId, newStatus);
      showToast(`Order ${orderId} status successfully updated to ${newStatus.toUpperCase()}!`);
    } catch (e) {
      showToast(`Error updating order: ${e.message}`);
    }
  };

  const handleExportCSV = () => {
    if (!filteredAndSortedOrders || filteredAndSortedOrders.length === 0) {
      showToast("No orders to export.");
      return;
    }
    showToast("Preparing CSV for export...");
    setTimeout(() => {
      const csvHeader = "Order ID,Date,Customer Info,Items,Amount,Payment,Status\n";
      const csvContent = filteredAndSortedOrders.map(o => 
        `"${o.id}","${o.date}","${o.customer}","${o.product}","${o.amount}","${o.paymentMethod}","${o.status}"`
      ).join("\n");
      const blob = new Blob([csvHeader + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "Orders_Export.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Orders successfully exported to CSV!');
    }, 800);
  };

  const handleDownloadPDF = () => {
    if (!viewInvoice) return;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${viewInvoice.id}</title>
          <style>
            body { font-family: monospace; color: #000; padding: 2rem; max-width: 600px; margin: 0 auto; }
            h2 { margin: 0; font-family: 'Playfair Display', serif; font-size: 1.8rem; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 1rem; margin-bottom: 2rem; }
            .details { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem; font-size: 0.85rem; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 2rem; font-size: 0.85rem; }
            th, td { padding: 0.5rem; text-align: left; }
            th { background: #f5f5f5; border-bottom: 1px solid #ddd; }
            td { border-bottom: 1px solid #eee; }
            .footer { text-align: center; color: #888; font-size: 0.7rem; margin-top: 3rem; border-top: 1px solid #ddd; padding-top: 1rem; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h2>LUMINA JEWELS</h2>
              <div style="font-size: 0.8rem; color: #555;">Tax Invoice / Bill of Supply</div>
            </div>
            <div style="text-align: right;">
              <strong style="font-size: 1.2rem;">${viewInvoice.id}</strong><br/>
              <span style="font-size: 0.8rem; color: #555;">Date: ${viewInvoice.date}</span>
            </div>
          </div>
          
          <div class="details">
            <div>
              <strong style="text-transform: uppercase; color: #888; font-size: 0.7rem;">Billed To:</strong><br/>
              <strong>${viewInvoice.customer}</strong><br/>
              ${viewInvoice.city}<br/>
              India
            </div>
            <div>
              <strong style="text-transform: uppercase; color: #888; font-size: 0.7rem;">Payment Status:</strong><br/>
              <strong>${viewInvoice.paymentMethod}</strong><br/>
              ${viewInvoice.status === 'delivered' ? 'Paid in Full' : 'Pending Authorization'}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item Description</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Total (INR)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>${viewInvoice.product}</strong><br/><span style="color: #666; font-size: 0.75rem;">HSN Code: 7113</span></td>
                <td style="text-align: center;">1</td>
                <td style="text-align: right;">₹${(viewInvoice.amount * 0.97).toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td colspan="2" style="text-align: right; color: #666;">GST (3%)</td>
                <td style="text-align: right;">₹${(viewInvoice.amount * 0.03).toLocaleString('en-IN')}</td>
              </tr>
              <tr style="border-top: 2px solid #000;">
                <td colspan="2" style="text-align: right; font-weight: bold; padding: 0.75rem 0.5rem;">Grand Total</td>
                <td style="text-align: right; font-weight: bold; font-size: 1.1rem; padding: 0.75rem 0.5rem;">₹${viewInvoice.amount?.toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>
          
          <div class="footer">
            This is a computer generated invoice and does not require a physical signature.<br/>
            Lumina Jewels, Mumbai, Maharashtra 400001
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    showToast("Generating PDF Invoice...");
    setTimeout(() => setViewInvoice(null), 1000);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Order Management</h1>
          <p className="page-subtitle">Track, update, and manage customer orders and shipments.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline" onClick={handleExportCSV}>📥 Export CSV</button>
        </div>
      </div>

      <div className="tab-nav">
        {tabs.map(tab => (
          <button 
            key={tab} 
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="admin-card">
        <div className="filter-bar" style={{ marginBottom: '1.25rem' }}>
          <div className="filter-search" style={{ margin: 0, width: '300px' }}>
            <Search size={14} />
            <input 
              placeholder="Search by Order ID, Customer Name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select className="form-input" style={{ width: '180px', padding: '0.475rem 0.875rem' }} value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)}>
            <option>Payment Method</option>
            <option>UPI</option>
            <option>Credit Card</option>
            <option>Net Banking</option>
            <option>COD</option>
          </select>
          <select className="form-input" style={{ width: '160px', padding: '0.475rem 0.875rem' }} value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
            <option>Sort By</option>
            <option>Date: Newest</option>
            <option>Date: Oldest</option>
            <option>Amount: High to Low</option>
          </select>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID & Date</th>
                <th>Customer Info</th>
                <th>Items Ordered</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: 'var(--text-muted)' }}><PackageOpen size={48} /></div>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>No orders found</div>
                    <div style={{ color: 'var(--text-muted)' }}>There are no orders matching this filter.</div>
                  </td>
                </tr>
              ) : (
                filteredAndSortedOrders.map((o, idx) => (
                  <tr key={`${o.id}-${idx}`} style={{ background: o.hasIssue ? 'rgba(255,0,0,0.03)' : 'transparent' }}>
                    <td>
                      <div style={{ color: 'var(--gold)', fontWeight: 700, fontFamily: 'monospace', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {o.id}
                        {o.hasIssue && <AlertTriangle size={14} color="var(--status-red)" title="Order Issue Reported" />}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{o.date}</div>
                    </td>
                    <td>
                      <div className="user-name">{o.customer}</div>
                      <div className="user-email">{o.city}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.8rem' }}>{o.product}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>1 Item</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>₹{o.amount.toLocaleString('en-IN')}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{o.paymentMethod}</div>
                    </td>
                    <td>
                      <span className={`badge ${statusClass[o.status]}`}>{o.status.toUpperCase()}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className="btn btn-icon btn-outline" title="Verify Order Details" onClick={() => setSelectedOrder(o)}><Eye size={14} /></button>
                        <button className="btn btn-icon btn-outline" title="View/Download Invoice" onClick={() => setViewInvoice(o)}><FileText size={14} /></button>
                        <select 
                          className="form-input" 
                          style={{ width: 'auto', padding: '0.2rem 1.5rem 0.2rem 0.5rem', fontSize: '0.7rem', height: '26px' }} 
                          value={o.status}
                          onChange={(e) => handleStatusChange(o.id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="refund_pending">Refund Pending</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details & Processing Modal */}
      {selectedOrder && (
        <div className="auth-modal-overlay">
          <div className="auth-modal" style={{ maxWidth: '600px', padding: '2rem', background: 'var(--surface)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--admin-border)', paddingBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Order Processing: {selectedOrder.id}</h3>
                <span className={`badge ${statusClass[selectedOrder.status] || 'badge-pending'}`} style={{ marginTop: '0.5rem', display: 'inline-block' }}>{selectedOrder.status.toUpperCase()}</span>
              </div>
              <button className="btn-icon btn-outline" onClick={() => setSelectedOrder(null)} style={{ border: 'none' }}><X size={18} /></button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
              <div>
                <h4 style={{ color: 'var(--gold)', marginBottom: '0.5rem' }}>Customer Details</h4>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <strong>Name:</strong> {selectedOrder.customer}<br/>
                  <strong>Location:</strong> {selectedOrder.city}<br/>
                  <strong>Date:</strong> {selectedOrder.date}
                </div>
              </div>
              <div>
                <h4 style={{ color: 'var(--gold)', marginBottom: '0.5rem' }}>Product Details</h4>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <strong>Item:</strong> {selectedOrder.product}<br/>
                  <strong>Amount:</strong> ₹{selectedOrder.amount?.toLocaleString('en-IN')}<br/>
                  <strong>Payment:</strong> {selectedOrder.paymentMethod}
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--admin-border)', paddingTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              {selectedOrder.hasIssue && (
                <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderColor: 'var(--status-red)', color: 'var(--status-red)' }} onClick={() => {
                   showToast("Issue Marked as Resolved.");
                   setSelectedOrder(null);
                }}>
                  <CheckCircle size={16} /> Mark Issue Resolved
                </button>
              )}

              {selectedOrder.status === 'refund_pending' && (
                <>
                  <button className="btn btn-outline" style={{ borderColor: 'var(--status-green)', color: 'var(--status-green)', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => {
                    handleStatusChange(selectedOrder.id, 'cancelled');
                    setSelectedOrder(null);
                  }}>
                    <Check size={16} /> Approve Refund
                  </button>
                  <button className="btn btn-outline" style={{ borderColor: 'var(--status-red)', color: 'var(--status-red)', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => {
                    handleStatusChange(selectedOrder.id, 'processing');
                    setSelectedOrder(null);
                  }}>
                    <XCircle size={16} /> Reject Request
                  </button>
                </>
              )}

              {selectedOrder.status === 'pending' && (
                <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => {
                  handleStatusChange(selectedOrder.id, 'processing');
                  setSelectedOrder(null);
                }}>
                  <PackageOpen size={16} /> Process Order
                </button>
              )}
              {selectedOrder.status === 'processing' && (
                <button className="btn btn-gold" style={{ background: 'var(--gold)', color: '#000', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => {
                  handleStatusChange(selectedOrder.id, 'shipped');
                  setSelectedOrder(null);
                }}>
                  <Truck size={16} /> Coordinate Delivery (Assign)
                </button>
              )}
              <button className="btn btn-outline" onClick={() => setSelectedOrder(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {viewInvoice && (
        <div className="auth-modal-overlay" onClick={() => setViewInvoice(null)}>
          <div className="auth-modal" style={{ maxWidth: '600px', padding: '2rem', background: '#fff', color: '#000', fontFamily: 'monospace' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', borderBottom: '2px solid #000', paddingBottom: '1rem' }}>
              <div>
                <h2 style={{ margin: 0, color: '#000', fontFamily: 'Playfair Display, serif', fontSize: '1.8rem' }}>LUMINA JEWELS</h2>
                <div style={{ fontSize: '0.8rem', color: '#555' }}>Tax Invoice / Bill of Supply</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <strong style={{ fontSize: '1.2rem' }}>{viewInvoice.id}</strong><br/>
                <span style={{ fontSize: '0.8rem', color: '#555' }}>Date: {viewInvoice.date}</span>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem', fontSize: '0.85rem' }}>
              <div>
                <strong style={{ textTransform: 'uppercase', color: '#888', fontSize: '0.7rem' }}>Billed To:</strong><br/>
                <strong>{viewInvoice.customer}</strong><br/>
                {viewInvoice.city}<br/>
                India
              </div>
              <div>
                <strong style={{ textTransform: 'uppercase', color: '#888', fontSize: '0.7rem' }}>Payment Status:</strong><br/>
                <strong>{viewInvoice.paymentMethod}</strong><br/>
                {viewInvoice.status === 'delivered' ? 'Paid in Full' : 'Pending Authorization'}
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Item Description</th>
                  <th style={{ padding: '0.5rem', textAlign: 'center' }}>Qty</th>
                  <th style={{ padding: '0.5rem', textAlign: 'right' }}>Total (INR)</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '1rem 0.5rem' }}>
                    <strong>{viewInvoice.product}</strong><br/>
                    <span style={{ color: '#666', fontSize: '0.75rem' }}>HSN Code: 7113</span>
                  </td>
                  <td style={{ padding: '1rem 0.5rem', textAlign: 'center' }}>1</td>
                  <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>₹{(viewInvoice.amount * 0.97).toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td colSpan="2" style={{ padding: '0.5rem', textAlign: 'right', color: '#666' }}>GST (3%)</td>
                  <td style={{ padding: '0.5rem', textAlign: 'right' }}>₹{(viewInvoice.amount * 0.03).toLocaleString('en-IN')}</td>
                </tr>
                <tr style={{ background: '#fafafa', borderTop: '2px solid #000' }}>
                  <td colSpan="2" style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontWeight: 'bold' }}>Grand Total</td>
                  <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontWeight: 'bold', fontSize: '1.1rem' }}>₹{viewInvoice.amount?.toLocaleString('en-IN')}</td>
                </tr>
              </tbody>
            </table>
            
            <div style={{ textAlign: 'center', color: '#888', fontSize: '0.7rem', marginTop: '3rem', borderTop: '1px solid #ddd', paddingTop: '1rem' }}>
              This is a computer generated invoice and does not require a physical signature.<br/>
              Lumina Jewels, Mumbai, Maharashtra 400001
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
              <button className="btn btn-outline" style={{ borderColor: '#000', color: '#000' }} onClick={() => setViewInvoice(null)}>Close View</button>
              <button className="btn btn-gold" style={{ background: 'var(--gold)', color: '#000' }} onClick={handleDownloadPDF}>Download PDF</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
