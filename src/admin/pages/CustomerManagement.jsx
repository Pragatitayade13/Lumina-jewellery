import { useState } from 'react';
import { Star, Search, X, Edit, Shield, Save } from 'lucide-react';
import { useCustomers } from '../../hooks/useCustomers';
import { useApp } from '../../context/AppContext';

export default function CustomerManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('Customer Type');
  const { customers, loading, updateCustomerStatus } = useCustomers();
  const { showToast } = useApp();
  
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Dynamic KPIs
  const totalCustomers = customers.length;
  const vipMembers = customers.filter(c => c.status === 'vip').length;
  
  const totalSpendSum = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
  const totalOrdersSum = customers.reduce((sum, c) => sum + (c.totalOrders || 0), 0);
  const avgOrderValue = totalOrdersSum > 0 ? (totalSpendSum / totalOrdersSum) : 0;
  
  // Format AOV for display (e.g. ₹1.2L or ₹45K)
  let aovDisplay = '₹0';
  if (avgOrderValue >= 100000) aovDisplay = `₹${(avgOrderValue/100000).toFixed(1)}L`;
  else if (avgOrderValue >= 1000) aovDisplay = `₹${(avgOrderValue/1000).toFixed(1)}K`;
  else aovDisplay = `₹${Math.round(avgOrderValue)}`;

  const filteredCustomers = customers.filter(c => {
    const searchString = searchTerm.toLowerCase();
    const matchesSearch = c.name?.toLowerCase().includes(searchString) || 
                          c.email?.toLowerCase().includes(searchString) ||
                          c.phone?.includes(searchTerm);
    let matchesType = true;
    if (typeFilter === 'VIP Members') matchesType = c.status === 'vip';
    if (typeFilter === 'Active Customers') matchesType = c.status === 'active';
    if (typeFilter === 'Inactive (90+ days)') matchesType = c.status === 'inactive';

    return matchesSearch && matchesType;
  });

  const handleSaveStatus = async () => {
    if (!selectedCustomer || !editStatus || editStatus === selectedCustomer.status) return;
    setIsSaving(true);
    try {
      await updateCustomerStatus(selectedCustomer.id, editStatus);
      showToast(`Customer status updated to ${editStatus.toUpperCase()}`);
      setSelectedCustomer(prev => ({...prev, status: editStatus}));
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
    setIsSaving(false);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Customer Relationship Management</h1>
          <p className="page-subtitle">View customer profiles, track loyalty points, and monitor purchase history.</p>
        </div>
      </div>

      <div className="stat-grid mb-15">
        <div className="stat-card">
          <div className="stat-label">Total Customers</div>
          <div className="stat-value">{totalCustomers.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">VIP Members</div>
          <div className="stat-value" style={{ color: 'var(--gold)' }}>{vipMembers}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg. Order Value</div>
          <div className="stat-value">{aovDisplay}</div>
        </div>
      </div>

      <div className="admin-card">
        <div className="filter-bar" style={{ marginBottom: '1.25rem' }}>
          <div className="filter-search" style={{ margin: 0, width: '300px' }}>
            <Search size={14} />
            <input 
              placeholder="Search by name, email, phone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select className="form-input" style={{ width: '160px', padding: '0.475rem 0.875rem' }} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option>Customer Type</option>
            <option>VIP Members</option>
            <option>Active Customers</option>
            <option>Inactive (90+ days)</option>
          </select>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Contact Info</th>
                <th>Lifetime Value</th>
                <th>Orders</th>
                <th>Loyalty Points</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>Loading customers...</td></tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No customers found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar" style={{ background: `linear-gradient(135deg, ${c.avatarColor}, #2c3e50)`, color: 'white' }}>{c.avatar}</div>
                        <div>
                          <div className="user-name">{c.name}</div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Joined {c.joinDate}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="user-email">{c.email}</div>
                      <div className="user-email">{c.phone}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--gold)' }}>₹{(c.totalSpent || 0).toLocaleString('en-IN')}</div>
                    </td>
                    <td>{c.totalOrders || 0}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Star size={12} fill="var(--gold)" color="var(--gold)" /> {(c.loyaltyPoints || 0).toLocaleString()}
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${c.status || 'active'}`}>
                        {(c.status || 'active').toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn btn-sm btn-outline" 
                        onClick={() => { setSelectedCustomer(c); setEditStatus(c.status || 'active'); }}
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Profile Modal */}
      {selectedCustomer && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-box" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Customer Profile</h3>
              <button className="modal-close" onClick={() => setSelectedCustomer(null)}><X size={16} /></button>
            </div>
            
            <div className="modal-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div className="user-avatar" style={{ width: '60px', height: '60px', fontSize: '1.5rem', background: `linear-gradient(135deg, ${selectedCustomer.avatarColor}, #2c3e50)`, color: 'white' }}>
                  {selectedCustomer.avatar}
                </div>
                <div>
                  <h2 style={{ fontSize: '1.5rem', color: 'var(--gold)', marginBottom: '0.2rem' }}>{selectedCustomer.name}</h2>
                  <div style={{ color: 'var(--text-secondary)' }}>{selectedCustomer.email} • {selectedCustomer.phone}</div>
                </div>
              </div>

              <div className="grid-2 mb-15">
                <div style={{ background: 'var(--surface-light)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Lifetime Value</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--gold)' }}>₹{(selectedCustomer.totalSpent || 0).toLocaleString('en-IN')}</div>
                </div>
                <div style={{ background: 'var(--surface-light)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Loyalty Points</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Star size={18} fill="var(--gold)" color="var(--gold)" /> {(selectedCustomer.loyaltyPoints || 0).toLocaleString()}
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                  <Shield size={16} color="var(--gold)" /> Owner Access: Manage Customer Type
                </h4>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                  <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label>Account Status / Tier</label>
                    <select 
                      className="form-input" 
                      value={editStatus} 
                      onChange={(e) => setEditStatus(e.target.value)}
                    >
                      <option value="active">Active (Standard)</option>
                      <option value="vip">VIP Member</option>
                      <option value="inactive">Inactive / Suspended</option>
                    </select>
                  </div>
                  <button 
                    className="btn btn-gold" 
                    disabled={isSaving || editStatus === selectedCustomer.status}
                    onClick={handleSaveStatus}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', height: '42px', color: '#000', fontWeight: 'bold' }}
                  >
                    <Save size={16} /> {isSaving ? 'Saving...' : 'Update Status'}
                  </button>
                </div>
                {editStatus === 'vip' && editStatus !== selectedCustomer.status && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--status-green)', marginTop: '0.5rem' }}>
                    * Upgrading to VIP will grant this customer exclusive early access to new collections.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
