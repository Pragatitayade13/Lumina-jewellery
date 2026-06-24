import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function CouponFormModal({ isOpen, onClose, onSave, initialData }) {
  const { user } = useApp();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minOrderAmount: '',
    maxDiscountAmount: '',
    usageLimit: '',
    perUserLimit: '1',
    startDate: '',
    expiryDate: '',
    status: 'active',
    storeScope: 'all',
    productScope: 'all',
    customerScope: 'all',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().slice(0, 16) : '',
        expiryDate: initialData.expiryDate ? new Date(initialData.expiryDate).toISOString().slice(0, 16) : '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'code') {
      setFormData(prev => ({ ...prev, [name]: value.toUpperCase().replace(/\s/g, '') }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSave = {
        ...formData,
        discountValue: Number(formData.discountValue),
        minOrderAmount: formData.minOrderAmount ? Number(formData.minOrderAmount) : 0,
        maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
        perUserLimit: formData.perUserLimit ? Number(formData.perUserLimit) : 1,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : null,
        updatedAt: serverTimestamp(),
      };

      if (initialData) {
        await updateDoc(doc(db, 'coupons', initialData.id), dataToSave);
      } else {
        dataToSave.usedCount = 0;
        dataToSave.createdBy = user?.uid;
        dataToSave.createdAt = serverTimestamp();
        await addDoc(collection(db, 'coupons'), dataToSave);
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving coupon:', error);
      alert('Failed to save coupon: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="modal-content" style={{ background: 'var(--admin-card)', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '12px', border: '1px solid var(--admin-border)', position: 'relative', boxShadow: 'var(--shadow)' }}>
        
        <div style={{ position: 'sticky', top: 0, background: 'var(--admin-card)', padding: '1.5rem', borderBottom: '1px solid var(--admin-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
          <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>{initialData ? 'Edit Coupon' : 'Add New Coupon'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Coupon Code *</label>
              <input type="text" name="code" value={formData.code} onChange={handleChange} required placeholder="e.g. WELCOME10" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--admin-border)', background: 'var(--admin-bg)', color: 'var(--text-primary)' }} />
            </div>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Coupon Title *</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} required placeholder="e.g. Welcome Offer" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--admin-border)', background: 'var(--admin-bg)', color: 'var(--text-primary)' }} />
            </div>
          </div>

          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Optional details about this offer" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--admin-border)', background: 'var(--admin-bg)', color: 'var(--text-primary)', minHeight: '80px' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Discount Type *</label>
              <select name="discountType" value={formData.discountType} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--admin-border)', background: 'var(--admin-bg)', color: 'var(--text-primary)' }}>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Discount Value *</label>
              <input type="number" name="discountValue" value={formData.discountValue} onChange={handleChange} required min="1" max={formData.discountType === 'percentage' ? 100 : undefined} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--admin-border)', background: 'var(--admin-bg)', color: 'var(--text-primary)' }} />
            </div>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Min Order Amount (₹)</label>
              <input type="number" name="minOrderAmount" value={formData.minOrderAmount} onChange={handleChange} min="0" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--admin-border)', background: 'var(--admin-bg)', color: 'var(--text-primary)' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Max Discount (₹) {formData.discountType === 'percentage' ? '*' : ''}</label>
              <input type="number" name="maxDiscountAmount" value={formData.maxDiscountAmount} onChange={handleChange} required={formData.discountType === 'percentage'} min="1" disabled={formData.discountType === 'fixed'} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--admin-border)', background: formData.discountType === 'fixed' ? 'var(--admin-card)' : 'var(--admin-bg)', color: 'var(--text-primary)', opacity: formData.discountType === 'fixed' ? 0.5 : 1 }} />
            </div>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Total Usage Limit</label>
              <input type="number" name="usageLimit" value={formData.usageLimit} onChange={handleChange} min="1" placeholder="Leave blank for unlimited" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--admin-border)', background: 'var(--admin-bg)', color: 'var(--text-primary)' }} />
            </div>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Per User Limit *</label>
              <input type="number" name="perUserLimit" value={formData.perUserLimit} onChange={handleChange} required min="1" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--admin-border)', background: 'var(--admin-bg)', color: 'var(--text-primary)' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Start Date</label>
              <input type="datetime-local" name="startDate" value={formData.startDate} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--admin-border)', background: 'var(--admin-bg)', color: 'var(--text-primary)', colorScheme: 'dark' }} />
            </div>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Expiry Date</label>
              <input type="datetime-local" name="expiryDate" value={formData.expiryDate} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--admin-border)', background: 'var(--admin-bg)', color: 'var(--text-primary)', colorScheme: 'dark' }} />
            </div>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Status *</label>
              <select name="status" value={formData.status} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--admin-border)', background: 'var(--admin-bg)', color: 'var(--text-primary)' }}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div style={{ padding: '1.5rem', background: 'var(--admin-bg)', borderRadius: '8px', marginTop: '1rem', border: '1px solid var(--admin-border)' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>Advanced Scopes</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Store Scope</label>
                <select name="storeScope" value={formData.storeScope} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--admin-border)', background: 'var(--admin-card)', color: 'var(--text-primary)' }}>
                  <option value="all">All Stores</option>
                  <option value="specific">Specific Store (TBD)</option>
                </select>
              </div>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Product Scope</label>
                <select name="productScope" value={formData.productScope} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--admin-border)', background: 'var(--admin-card)', color: 'var(--text-primary)' }}>
                  <option value="all">All Products</option>
                  <option value="specific">Specific Categories (TBD)</option>
                </select>
              </div>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Customer Scope</label>
                <select name="customerScope" value={formData.customerScope} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--admin-border)', background: 'var(--admin-card)', color: 'var(--text-primary)' }}>
                  <option value="all">All Customers</option>
                  <option value="new">New Customers Only</option>
                  <option value="existing">Existing Customers Only</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid var(--admin-border)', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', background: 'var(--gold)', color: '#000', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 600, opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Saving...' : (initialData ? 'Update Coupon' : 'Create Coupon')}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
