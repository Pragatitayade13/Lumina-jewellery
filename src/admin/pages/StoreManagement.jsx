import { useState, useMemo } from 'react';
import { useStores } from '../../hooks/useStores';
import { useCustomers } from '../../hooks/useCustomers'; // For staff dropdown
import { useApp } from '../../context/AppContext';
import { Plus, Search, Edit, Power, Store, MapPin, Users, Check, X } from 'lucide-react';

export default function StoreManagement() {
  const { showToast, user, currentStore } = useApp();
  const activeStoreId = currentStore || (user?.role === 'superadmin' ? 'GLOBAL' : 'NONE');
  const { stores, loading, error, addStore, updateStore, toggleStoreStatus, userStores, assignUserToStore, removeUserFromStore } = useStores();
  const { customers } = useCustomers('GLOBAL'); // fetch all users for staff assignment

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    contactPhone: '',
    contactEmail: ''
  });

  const [assignData, setAssignData] = useState({
    storeId: '',
    userId: '',
    role: 'staff' // store_manager, staff
  });

  const staffUsers = useMemo(() => {
    return customers.filter(u => u.role !== 'customer');
  }, [customers]);

  const filteredStores = stores.filter(store => 
    String(store.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(store.code || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (store = null) => {
    if (store) {
      setEditingStore(store);
      setFormData({
        name: store.name || '',
        code: store.code || '',
        address: store.address || '',
        contactPhone: store.contactPhone || '',
        contactEmail: store.contactEmail || ''
      });
    } else {
      setEditingStore(null);
      setFormData({ name: '', code: '', address: '', contactPhone: '', contactEmail: '' });
    }
    setIsModalOpen(true);
  };

  const handleOpenAssignModal = (storeId) => {
    setAssignData({ storeId, userId: '', role: 'staff' });
    setIsAssignModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStore) {
        await updateStore(editingStore.id, formData);
        showToast('Store updated successfully');
      } else {
        await addStore(formData);
        showToast('Store created successfully');
      }
      setIsModalOpen(false);
    } catch (err) {
      showToast('Failed to save store', 'error');
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!assignData.userId) {
      showToast('Please select a user', 'error');
      return;
    }
    try {
      await assignUserToStore(assignData.userId, assignData.storeId, assignData.role);
      showToast('User assigned successfully');
      setIsAssignModalOpen(false);
    } catch (err) {
      showToast('Failed to assign user', 'error');
    }
  };

  const handleToggleStatus = async (store) => {
    try {
      await toggleStoreStatus(store.id, store.status);
      showToast(`Store ${store.status === 'active' ? 'deactivated' : 'activated'} successfully`);
    } catch (err) {
      showToast('Failed to toggle status', 'error');
    }
  };

  const getStoreUsersCount = (storeId) => {
    return userStores.filter(us => us.storeId === storeId).length;
  };

  if (loading) return <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Loading stores...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'red' }}>Error loading stores: {error.message}</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Store Management</h1>
          <p className="page-subtitle">Manage physical stores, branches, and store assignments.</p>
        </div>
      </div>

      <div className="admin-card">
        <div className="card-header">
          <div className="card-title">All Stores</div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div className="filter-search" style={{ margin: 0, width: '250px' }}>
              <Search size={14} />
              <input 
                placeholder="Search stores..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>
            <button className="btn btn-gold" style={{ background: 'var(--gold)', color: '#000', fontWeight: 'bold' }} onClick={() => handleOpenModal()}>
              <Plus size={16} style={{ marginRight: '4px' }}/> Add Store
            </button>
          </div>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Store Details</th>
                <th>Location</th>
                <th>Contact</th>
                <th>Staff</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStores.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    <Store size={32} style={{ opacity: 0.2, display: 'block', margin: '0 auto 1rem' }} />
                    No stores found.
                  </td>
                </tr>
              ) : (
                filteredStores.map(store => (
                  <tr key={store.id} style={{ opacity: store.status === 'inactive' ? 0.6 : 1 }}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{store.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Code: {store.code}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                        <MapPin size={14} style={{ color: 'var(--text-muted)' }} />
                        {store.address || 'N/A'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>{store.contactPhone || 'N/A'}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{store.contactEmail || 'N/A'}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Users size={14} style={{ color: 'var(--gold)' }} />
                        <span>{getStoreUsersCount(store.id)} Assigned</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${store.status === 'active' ? 'active' : 'danger'}`}>
                        {store.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className="btn btn-icon btn-outline" title="Edit Store" onClick={() => handleOpenModal(store)}>
                          <Edit size={14} />
                        </button>
                        <button className="btn btn-icon btn-outline" title="Assign Staff" onClick={() => handleOpenAssignModal(store.id)}>
                          <Users size={14} />
                        </button>
                        <button 
                          className={`btn btn-icon ${store.status === 'active' ? 'btn-danger' : 'btn-outline'}`} 
                          title={store.status === 'active' ? 'Deactivate Store' : 'Activate Store'} 
                          onClick={() => handleToggleStatus(store)}
                        >
                          <Power size={14} />
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

      {/* Create/Edit Store Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2 className="modal-title">{editingStore ? 'Edit Store' : 'Add New Store'}</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group mb-1">
                  <label className="form-label">Store Name</label>
                  <input type="text" className="form-input" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Downtown Flagship" />
                </div>
                <div className="form-group mb-1">
                  <label className="form-label">Store Code</label>
                  <input type="text" className="form-input" required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} placeholder="e.g. DT-01" />
                </div>
                <div className="form-group mb-1">
                  <label className="form-label">Address</label>
                  <textarea className="form-input" required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Full physical address" rows={3}></textarea>
                </div>
                <div className="form-row mb-1">
                  <div className="form-group">
                    <label className="form-label">Contact Phone</label>
                    <input type="tel" className="form-input" value={formData.contactPhone} onChange={e => setFormData({...formData, contactPhone: e.target.value})} placeholder="e.g. +91 9876543210" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contact Email</label>
                    <input type="email" className="form-input" value={formData.contactEmail} onChange={e => setFormData({...formData, contactEmail: e.target.value})} placeholder="e.g. store@example.com" />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-gold" style={{ background: 'var(--gold)', color: '#000', fontWeight: 'bold' }}>
                  {editingStore ? 'Save Changes' : 'Create Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Staff Modal */}
      {isAssignModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAssignModalOpen(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Assign Staff to Store</h2>
              <button className="modal-close" onClick={() => setIsAssignModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAssignSubmit}>
              <div className="modal-body">
                <div className="form-group mb-1">
                  <label className="form-label">Select Staff Member</label>
                  <select className="form-input" required value={assignData.userId} onChange={e => setAssignData({...assignData, userId: e.target.value})}>
                    <option value="">-- Choose User --</option>
                    {staffUsers.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group mb-1">
                  <label className="form-label">Store Role</label>
                  <select className="form-input" value={assignData.role} onChange={e => setAssignData({...assignData, role: e.target.value})}>
                    <option value="store_manager">Store Manager</option>
                    <option value="staff">Sales Staff</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setIsAssignModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-gold" style={{ background: 'var(--gold)', color: '#000', fontWeight: 'bold' }}>
                  Assign User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
