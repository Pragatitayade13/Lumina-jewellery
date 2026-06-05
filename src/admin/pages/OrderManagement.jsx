import { useState, useMemo } from 'react';
import { PackageOpen, Eye, FileText, Search, X, CheckCircle, Truck, AlertTriangle, Check, XCircle } from 'lucide-react';
import { useOrders } from '../../hooks/useOrders';
import { useApp } from '../../context/AppContext';
import { useCustomers } from '../../hooks/useCustomers';

const statusClass = { assigned: 'badge-new', delivered: 'badge-delivered', shipped: 'badge-shipped', processing: 'badge-pending', confirmed: 'badge-confirmed', pending: 'badge-pending', cancelled: 'badge-cancelled', refund_pending: 'badge-orange' };

export default function OrderManagement() {
  const { orders: liveOrders, loading, updateOrderStatus, assignOrderToPartner } = useOrders();
  const { customers: allUsers } = useCustomers();
  const { showToast } = useApp();
  
  const [activeTab, setActiveTab] = useState('All Orders');
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('Payment Method');
  const [sortOrder, setSortOrder] = useState('Date: Newest');
  
  const [selectedOrder, setSelectedOrder] = useState(null); // For details modal
  const [viewInvoice, setViewInvoice] = useState(null); // For invoice modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [orderToAssign, setOrderToAssign] = useState(null);
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  
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

  const handleBulkGenerateInvoices = async () => {
    if (!filteredAndSortedOrders || filteredAndSortedOrders.length === 0) {
      showToast("No orders available to generate invoices.");
      return;
    }
    showToast(`Initiating invoice generation for ${filteredAndSortedOrders.length} orders...`);
    
    try {
      const printWindow = window.open('', '_blank');
      let invoicesHtml = '';
      
      filteredAndSortedOrders.forEach((order, index) => {
        invoicesHtml += `
          <div class="invoice-container" style="${index < filteredAndSortedOrders.length - 1 ? 'page-break-after: always; margin-bottom: 4rem;' : ''}">
            <div class="header">
              <div>
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <h2 style="font-size: 2rem; letter-spacing: 1px; color: #1a1a1a;">LUMINA JEWELS</h2>
                </div>
                <div style="font-size: 0.85rem; color: #666; letter-spacing: 0.5px; padding-left: 2.25rem;">TAX INVOICE / BILL OF SUPPLY</div>
              </div>
              <div style="text-align: right;">
                <strong style="font-size: 1.2rem;">${order.id}</strong><br/>
                <span style="font-size: 0.8rem; color: #555;">Date: ${order.date}</span>
              </div>
            </div>
            
            <div class="details">
              <div>
                <strong style="text-transform: uppercase; color: #888; font-size: 0.7rem;">Billed To:</strong><br/>
                <strong>${order.customer}</strong><br/>
                ${order.city}<br/>
                India
              </div>
              <div>
                <strong style="text-transform: uppercase; color: #888; font-size: 0.7rem;">Payment Status:</strong><br/>
                <strong>${order.paymentMethod}</strong><br/>
                ${order.status === 'delivered' ? 'Paid in Full' : 'Pending Authorization'}
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
                  <td style="padding: 1rem 0.5rem;">
                    <strong style="color: #1a1a1a; font-size: 0.9rem;">${order.product}</strong><br/>
                    <span style="color: #888; font-size: 0.75rem;">HSN Code: 7113</span>
                  </td>
                  <td style="text-align: center; padding: 1rem 0.5rem;">1</td>
                  <td style="text-align: right; padding: 1rem 0.5rem; font-weight: 600;">₹${(order.subtotal || order.amount * 0.97).toLocaleString('en-IN')}</td>
                </tr>
                ${order.igst > 0 ? `
                <tr>
                  <td colspan="2" style="text-align: right; color: #666;">IGST</td>
                  <td style="text-align: right;">₹${order.igst.toLocaleString('en-IN')}</td>
                </tr>
                ` : ''}
                ${order.cgst > 0 ? `
                <tr>
                  <td colspan="2" style="text-align: right; color: #666;">CGST</td>
                  <td style="text-align: right;">₹${order.cgst.toLocaleString('en-IN')}</td>
                </tr>
                ` : ''}
                ${order.sgst > 0 ? `
                <tr>
                  <td colspan="2" style="text-align: right; color: #666;">SGST</td>
                  <td style="text-align: right;">₹${order.sgst.toLocaleString('en-IN')}</td>
                </tr>
                ` : ''}
                ${!order.igst && !order.cgst && !order.sgst ? `
                <tr>
                  <td colspan="2" style="text-align: right; color: #666;">GST</td>
                  <td style="text-align: right;">₹${(order.gstAmt || order.amount * 0.03).toLocaleString('en-IN')}</td>
                </tr>
                ` : ''}
                <tr style="border-top: 2px solid #1a1a1a; background-color: #fafafa;">
                  <td colspan="2" style="text-align: right; font-weight: bold; padding: 1rem 0.5rem; color: #1a1a1a; text-transform: uppercase; letter-spacing: 0.5px;">Grand Total</td>
                  <td style="text-align: right; font-weight: bold; font-size: 1.2rem; padding: 1rem 0.5rem; color: #1a1a1a;">₹${order.amount?.toLocaleString('en-IN')}</td>
                </tr>
              </tbody>
            </table>
            
            <div class="footer">
              This is a computer generated invoice and does not require a physical signature.<br/>
              Lumina Jewels, Mumbai, Maharashtra 400001
            </div>
          </div>
        `;
      });

      printWindow.document.write(`
        <html>
          <head>
            <title>Bulk Invoices - ${filteredAndSortedOrders.length} Orders</title>
            <style>
              body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #333; padding: 3rem 2rem; max-width: 800px; margin: 0 auto; line-height: 1.6; }
              h2 { margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 1.8rem; }
              .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #1a1a1a; padding-bottom: 1.5rem; margin-bottom: 2.5rem; }
              .details { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 3rem; font-size: 0.9rem; background: #fcfcfc; padding: 1.5rem; border-radius: 8px; border: 1px solid #f0f0f0; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 2rem; font-size: 0.9rem; }
              th, td { padding: 0.75rem 0.5rem; text-align: left; }
              th { background: #f9f9f9; border-bottom: 2px solid #eee; color: #666; font-weight: 600; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.5px; }
              td { border-bottom: 1px solid #f0f0f0; }
              .footer { text-align: center; color: #888; font-size: 0.8rem; margin-top: 4rem; border-top: 1px solid #eee; padding-top: 1.5rem; }
            </style>
          </head>
          <body>
            ${invoicesHtml}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      
      // Allow time for rendering before printing
      setTimeout(() => {
        printWindow.print();
        showToast(`Successfully generated and opened ${filteredAndSortedOrders.length} invoices.`);
      }, 500);
      
    } catch (error) {
      showToast("Failed to generate invoices.");
    }
  };

  const handleDownloadPDF = () => {
    if (!viewInvoice) return;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${viewInvoice.id}</title>
          <style>
            body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #333; padding: 3rem 2rem; max-width: 800px; margin: 0 auto; line-height: 1.6; }
            h2 { margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 1.8rem; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #1a1a1a; padding-bottom: 1.5rem; margin-bottom: 2.5rem; }
            .details { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 3rem; font-size: 0.9rem; background: #fcfcfc; padding: 1.5rem; border-radius: 8px; border: 1px solid #f0f0f0; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 2rem; font-size: 0.9rem; }
            th, td { padding: 0.75rem 0.5rem; text-align: left; }
            th { background: #f9f9f9; border-bottom: 2px solid #eee; color: #666; font-weight: 600; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.5px; }
            td { border-bottom: 1px solid #f0f0f0; }
            .footer { text-align: center; color: #888; font-size: 0.8rem; margin-top: 4rem; border-top: 1px solid #eee; padding-top: 1.5rem; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <h2 style="font-size: 2rem; letter-spacing: 1px; color: #1a1a1a;">LUMINA JEWELS</h2>
              </div>
              <div style="font-size: 0.85rem; color: #666; letter-spacing: 0.5px; padding-left: 2.25rem;">TAX INVOICE / BILL OF SUPPLY</div>
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
                <td style="padding: 1rem 0.5rem;">
                  <strong style="color: #1a1a1a; font-size: 0.9rem;">${viewInvoice.product}</strong><br/>
                  <span style="color: #888; font-size: 0.75rem;">HSN Code: 7113</span>
                </td>
                <td style="text-align: center; padding: 1rem 0.5rem;">1</td>
                <td style="text-align: right; padding: 1rem 0.5rem; font-weight: 600;">₹${(viewInvoice.subtotal || viewInvoice.amount * 0.97).toLocaleString('en-IN')}</td>
              </tr>
              ${viewInvoice.igst > 0 ? `
              <tr>
                <td colspan="2" style="text-align: right; color: #666;">IGST</td>
                <td style="text-align: right;">₹${viewInvoice.igst.toLocaleString('en-IN')}</td>
              </tr>
              ` : ''}
              ${viewInvoice.cgst > 0 ? `
              <tr>
                <td colspan="2" style="text-align: right; color: #666;">CGST</td>
                <td style="text-align: right;">₹${viewInvoice.cgst.toLocaleString('en-IN')}</td>
              </tr>
              ` : ''}
              ${viewInvoice.sgst > 0 ? `
              <tr>
                <td colspan="2" style="text-align: right; color: #666;">SGST</td>
                <td style="text-align: right;">₹${viewInvoice.sgst.toLocaleString('en-IN')}</td>
              </tr>
              ` : ''}
              ${!viewInvoice.igst && !viewInvoice.cgst && !viewInvoice.sgst ? `
              <tr>
                <td colspan="2" style="text-align: right; color: #666;">GST</td>
                <td style="text-align: right;">₹${(viewInvoice.gstAmt || viewInvoice.amount * 0.03).toLocaleString('en-IN')}</td>
              </tr>
              ` : ''}
              <tr style="border-top: 2px solid #1a1a1a; background-color: #fafafa;">
                <td colspan="2" style="text-align: right; font-weight: bold; padding: 1rem 0.5rem; color: #1a1a1a; text-transform: uppercase; letter-spacing: 0.5px;">Grand Total</td>
                <td style="text-align: right; font-weight: bold; font-size: 1.2rem; padding: 1rem 0.5rem; color: #1a1a1a;">₹${viewInvoice.amount?.toLocaleString('en-IN')}</td>
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
          <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={handleBulkGenerateInvoices}>
            <FileText size={16} /> Generate Invoices
          </button>
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

            {/* Tracking Link */}
            <div style={{ background: 'rgba(201,168,76,0.07)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.82rem' }}>
              <span style={{ color: 'var(--gold)' }}>📦</span>
              <span style={{ color: 'var(--text-secondary)', flex: 1 }}>Customer tracking link:</span>
              <a
                href={`/track/${selectedOrder.id}`}
                target="_blank"
                rel="noreferrer"
                style={{ color: 'var(--gold)', fontWeight: 600, fontFamily: 'monospace', fontSize: '0.78rem', textDecoration: 'none' }}
              >
                /track/{selectedOrder.id} ↗
              </a>
              <button
                onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/track/${selectedOrder.id}`); showToast('Tracking link copied!'); }}
                style={{ background: 'none', border: '1px solid var(--admin-border)', borderRadius: '6px', padding: '0.2rem 0.5rem', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.7rem' }}
              >Copy</button>
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
                  setOrderToAssign(selectedOrder);
                  setAssignModalOpen(true);
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
          <div className="auth-modal" style={{ maxWidth: '700px', padding: '3rem 2rem', background: '#fff', color: '#333', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", lineHeight: 1.6 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', borderBottom: '2px solid #1a1a1a', paddingBottom: '1.5rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <h2 style={{ margin: 0, color: '#1a1a1a', fontFamily: "'Playfair Display', Georgia, serif", fontSize: '2rem', letterSpacing: '1px' }}>LUMINA JEWELS</h2>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#666', letterSpacing: '0.5px', paddingLeft: '2.25rem' }}>TAX INVOICE / BILL OF SUPPLY</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <strong style={{ fontSize: '1.2rem', color: '#1a1a1a' }}>{viewInvoice.id}</strong><br/>
                <span style={{ fontSize: '0.85rem', color: '#555' }}>Date: {viewInvoice.date}</span>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem', fontSize: '0.9rem', background: '#fcfcfc', padding: '1.5rem', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
              <div>
                <strong style={{ textTransform: 'uppercase', color: '#888', fontSize: '0.7rem', letterSpacing: '0.5px' }}>Billed To:</strong><br/>
                <strong style={{ color: '#1a1a1a' }}>{viewInvoice.customer}</strong><br/>
                {viewInvoice.city}<br/>
                India
              </div>
              <div>
                <strong style={{ textTransform: 'uppercase', color: '#888', fontSize: '0.7rem', letterSpacing: '0.5px' }}>Payment Status:</strong><br/>
                <strong style={{ color: '#1a1a1a' }}>{viewInvoice.paymentMethod}</strong><br/>
                {viewInvoice.status === 'delivered' ? 'Paid in Full' : 'Pending Authorization'}
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f9f9f9', borderBottom: '2px solid #eee' }}>
                  <th style={{ padding: '0.75rem 0.5rem', textAlign: 'left', color: '#666', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>Item Description</th>
                  <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center', color: '#666', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>Qty</th>
                  <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: '#666', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>Total (INR)</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '1rem 0.5rem' }}>
                    <strong style={{ color: '#1a1a1a', fontSize: '0.9rem' }}>{viewInvoice.product}</strong><br/>
                    <span style={{ color: '#888', fontSize: '0.75rem' }}>HSN Code: 7113</span>
                  </td>
                  <td style={{ padding: '1rem 0.5rem', textAlign: 'center' }}>1</td>
                  <td style={{ padding: '1rem 0.5rem', textAlign: 'right', fontWeight: 600 }}>₹{(viewInvoice.subtotal || viewInvoice.amount * 0.97).toLocaleString('en-IN')}</td>
                </tr>
                {viewInvoice.igst > 0 && (
                  <tr>
                    <td colSpan="2" style={{ padding: '1rem 0.5rem', textAlign: 'right', color: '#666' }}>IGST</td>
                    <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>₹{viewInvoice.igst.toLocaleString('en-IN')}</td>
                  </tr>
                )}
                {viewInvoice.cgst > 0 && (
                  <tr>
                    <td colSpan="2" style={{ padding: '1rem 0.5rem', textAlign: 'right', color: '#666' }}>CGST</td>
                    <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>₹{viewInvoice.cgst.toLocaleString('en-IN')}</td>
                  </tr>
                )}
                {viewInvoice.sgst > 0 && (
                  <tr>
                    <td colSpan="2" style={{ padding: '1rem 0.5rem', textAlign: 'right', color: '#666' }}>SGST</td>
                    <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>₹{viewInvoice.sgst.toLocaleString('en-IN')}</td>
                  </tr>
                )}
                {!viewInvoice.igst && !viewInvoice.cgst && !viewInvoice.sgst && (
                  <tr>
                    <td colSpan="2" style={{ padding: '1rem 0.5rem', textAlign: 'right', color: '#666' }}>GST</td>
                    <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>₹{(viewInvoice.gstAmt || viewInvoice.amount * 0.03).toLocaleString('en-IN')}</td>
                  </tr>
                )}
                <tr style={{ background: '#fafafa', borderTop: '2px solid #1a1a1a' }}>
                  <td colSpan="2" style={{ padding: '1rem 0.5rem', textAlign: 'right', fontWeight: 'bold', color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Grand Total</td>
                  <td style={{ padding: '1rem 0.5rem', textAlign: 'right', fontWeight: 'bold', fontSize: '1.2rem', color: '#1a1a1a' }}>₹{viewInvoice.amount?.toLocaleString('en-IN')}</td>
                </tr>
              </tbody>
            </table>
            
            <div style={{ textAlign: 'center', color: '#888', fontSize: '0.8rem', marginTop: '4rem', borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
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

      {/* Assign Partner Modal */}
      {assignModalOpen && orderToAssign && (
        <div className="auth-modal-overlay">
          <div className="auth-modal" style={{ maxWidth: '400px', padding: '2rem', background: 'var(--surface)' }}>
            <h3 style={{ margin: '0 0 1.5rem 0' }}>Assign Delivery Partner</h3>
            <div className="form-group mb-1">
              <label className="form-label">Select Partner</label>
              <select 
                className="form-input" 
                value={selectedPartnerId} 
                onChange={e => setSelectedPartnerId(e.target.value)}
              >
                <option value="">-- Choose Partner --</option>
                {allUsers?.filter(u => u.role === 'delivery' || u.department === 'Delivery Partner').map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => { setAssignModalOpen(false); setOrderToAssign(null); }}>Cancel</button>
              <button 
                className="btn btn-gold" 
                style={{ flex: 1, background: 'var(--gold)', color: '#000' }} 
                disabled={!selectedPartnerId}
                onClick={async () => {
                  const partner = allUsers.find(u => u.id === selectedPartnerId);
                  if (partner) {
                    try {
                      await assignOrderToPartner(orderToAssign.id, partner.id, partner.name);
                      showToast(`Order assigned to ${partner.name}`);
                      setAssignModalOpen(false);
                      setOrderToAssign(null);
                    } catch (err) {
                      showToast("Error assigning order");
                    }
                  }
                }}
              >Assign Order</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
