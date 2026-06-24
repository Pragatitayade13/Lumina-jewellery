import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Plus, Edit2, Trash2, Search, Filter } from 'lucide-react';
import CouponFormModal from '../components/CouponFormModal';

export default function CouponManagement() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'coupons'));
      const couponsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCoupons(couponsData);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      alert('Failed to fetch coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this coupon? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'coupons', id));
        setCoupons(prev => prev.filter(c => c.id !== id));
      } catch (error) {
        console.error('Error deleting coupon:', error);
        alert('Failed to delete coupon');
      }
    }
  };

  const toggleStatus = async (coupon) => {
    const newStatus = coupon.status === 'active' ? 'inactive' : 'active';
    try {
      await updateDoc(doc(db, 'coupons', coupon.id), { status: newStatus });
      setCoupons(prev => prev.map(c => c.id === coupon.id ? { ...c, status: newStatus } : c));
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const filteredCoupons = coupons.filter(c => {
    const matchesSearch = c.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesFilter = true;
    const now = new Date();
    const isExpired = c.expiryDate && new Date(c.expiryDate) < now;
    const isUpcoming = c.startDate && new Date(c.startDate) > now;
    
    if (statusFilter === 'active') matchesFilter = c.status === 'active' && !isExpired && !isUpcoming;
    if (statusFilter === 'inactive') matchesFilter = c.status === 'inactive';
    if (statusFilter === 'expired') matchesFilter = isExpired;
    if (statusFilter === 'upcoming') matchesFilter = isUpcoming;

    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (coupon) => {
    const now = new Date();
    if (coupon.expiryDate && new Date(coupon.expiryDate) < now) return <span className="badge badge-error">Expired</span>;
    if (coupon.startDate && new Date(coupon.startDate) > now) return <span className="badge badge-info">Upcoming</span>;
    if (coupon.status === 'active') return <span className="badge badge-success">Active</span>;
    return <span className="badge badge-neutral">Inactive</span>;
  };

  return (
    <div className="admin-page-container">
      <div className="admin-card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <div className="card-title">Coupon Management</div>
            <p className="page-subtitle" style={{ margin: 0 }}>Create and manage discount codes for customers.</p>
          </div>
          <button 
            className="btn btn-primary" 
            onClick={() => { setEditingCoupon(null); setIsModalOpen(true); }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', fontWeight: 600, color: '#ffffff' }}
          >
            <Plus size={18} /> Add New Coupon
          </button>
        </div>

        <div className="filters-bar" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="search-box" style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search by code or title..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid var(--admin-border)', background: 'var(--admin-bg)', color: 'var(--text-primary)' }}
            />
          </div>
          <div className="filter-dropdown" style={{ position: 'relative' }}>
            <Filter size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <select 
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{ padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid var(--admin-border)', background: 'var(--admin-bg)', color: 'var(--text-primary)', appearance: 'none', minWidth: '150px' }}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="upcoming">Upcoming</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--admin-border)' }}>
                <th style={{ padding: '1rem' }}>Code</th>
                <th style={{ padding: '1rem' }}>Title</th>
                <th style={{ padding: '1rem' }}>Discount</th>
                <th style={{ padding: '1rem' }}>Usage Limit</th>
                <th style={{ padding: '1rem' }}>Used</th>
                <th style={{ padding: '1rem' }}>Dates</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>Loading coupons...</td></tr>
              ) : filteredCoupons.length === 0 ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>No coupons found.</td></tr>
              ) : (
                filteredCoupons.map(coupon => (
                  <tr key={coupon.id} style={{ borderBottom: '1px solid var(--admin-border)' }}>
                    <td style={{ padding: '1rem' }}><strong style={{ color: 'var(--gold)', letterSpacing: '1px' }}>{coupon.code}</strong></td>
                    <td style={{ padding: '1rem' }}>{coupon.title}</td>
                    <td style={{ padding: '1rem' }}>{coupon.discountType === 'fixed' ? `₹${coupon.discountValue}` : `${coupon.discountValue}%`}</td>
                    <td style={{ padding: '1rem' }}>{coupon.usageLimit || 'Unlimited'}</td>
                    <td style={{ padding: '1rem' }}>{coupon.usedCount || 0}</td>
                    <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {coupon.startDate ? new Date(coupon.startDate).toLocaleDateString() : 'N/A'} - <br/>
                      {coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td style={{ padding: '1rem' }}>{getStatusBadge(coupon)}</td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button onClick={() => toggleStatus(coupon)} title="Toggle Status" style={{ background: 'none', border: `1px solid var(--admin-border)`, padding: '0.4rem', borderRadius: '6px', cursor: 'pointer', color: 'var(--text-primary)' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{coupon.status === 'active' ? 'Deactivate' : 'Activate'}</span>
                        </button>
                        <button onClick={() => { setEditingCoupon(coupon); setIsModalOpen(true); }} style={{ background: 'none', border: 'none', padding: '0.4rem', color: 'var(--text-muted)', cursor: 'pointer' }}><Edit2 size={18} /></button>
                        <button onClick={() => handleDelete(coupon.id)} style={{ background: 'none', border: 'none', padding: '0.4rem', color: 'var(--status-red)', cursor: 'pointer' }}><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <CouponFormModal 
          isOpen={isModalOpen} 
          onClose={() => { setIsModalOpen(false); setEditingCoupon(null); }} 
          onSave={fetchCoupons} 
          initialData={editingCoupon} 
        />
      )}
    </div>
  );
}
