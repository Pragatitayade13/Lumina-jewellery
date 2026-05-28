import { useState, useMemo } from 'react';
import { PackageOpen, Eye, FileText, Search } from 'lucide-react';
import { useOrders } from '../../hooks/useOrders';
import { useApp } from '../../context/AppContext';

const statusClass = { delivered: 'badge-delivered', shipped: 'badge-shipped', confirmed: 'badge-confirmed', pending: 'badge-pending', cancelled: 'badge-cancelled' };

export default function OrderManagement() {
  const { orders: liveOrders, loading, updateOrderStatus } = useOrders();
  const { showToast } = useApp();
  
  const [activeTab, setActiveTab] = useState('All Orders');
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('Payment Method');
  const [sortOrder, setSortOrder] = useState('Date: Newest');
  
  const tabs = ['All Orders', 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled', 'Returns/Refunds'];
  
  const filteredAndSortedOrders = useMemo(() => {
    if (!liveOrders) return [];
    
    let result = activeTab === 'All Orders' 
      ? liveOrders 
      : activeTab === 'Returns/Refunds' 
        ? [] 
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
                  <tr key={`${o.id}-${idx}`}>
                    <td>
                      <div style={{ color: 'var(--gold)', fontWeight: 700, fontFamily: 'monospace', fontSize: '0.85rem' }}>{o.id}</div>
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
                        <button className="btn btn-icon btn-outline" title="View Details" onClick={() => showToast(`Viewing details for ${o.id}...`)}><Eye size={14} /></button>
                        <button className="btn btn-icon btn-outline" title="Download Invoice" onClick={() => showToast(`Downloading invoice for ${o.id}...`)}><FileText size={14} /></button>
                        <select 
                          className="form-input" 
                          style={{ width: 'auto', padding: '0.2rem 1.5rem 0.2rem 0.5rem', fontSize: '0.7rem', height: '26px' }} 
                          value=""
                          onChange={(e) => handleStatusChange(o.id, e.target.value)}
                        >
                          <option value="" disabled>Update...</option>
                          <option value="confirmed">Confirm</option>
                          <option value="shipped">Ship</option>
                          <option value="delivered">Deliver</option>
                          <option value="cancelled">Cancel</option>
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
    </div>
  );
}
