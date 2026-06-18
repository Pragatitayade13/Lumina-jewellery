import { useState, useEffect } from 'react';
import { User, MapPin, Lock, Save, Plus, X, Trash2, Edit2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { auth, db } from '../../config/firebase';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import '../customer.css'; // Assuming styles might be used

export default function Profile() {
  const { user, setUser, showToast } = useApp();
  const [activeTab, setActiveTab] = useState('personal');
  
  // Personal Info State
  const [personalForm, setPersonalForm] = useState({ name: '', phone: '' });
  const [isSavingPersonal, setIsSavingPersonal] = useState(false);

  // Security State
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [isSavingSecurity, setIsSavingSecurity] = useState(false);

  // Address State
  const [addresses, setAddresses] = useState([]);
  const [addressModal, setAddressModal] = useState({ isOpen: false, index: -1, data: { title: 'Home', addressLine: '', city: '', state: '', pincode: '', isDefault: false }});

  useEffect(() => {
    if (user) {
      setPersonalForm({ name: user.name || '', phone: user.phone || '' });
      setAddresses(user.addresses || []);
    }
  }, [user]);

  const handleSavePersonal = async (e) => {
    e.preventDefault();
    if (!user) return;
    setIsSavingPersonal(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { name: personalForm.name, phone: personalForm.phone });
      setUser({ ...user, name: personalForm.name, phone: personalForm.phone });
      showToast('Personal info updated successfully!');
    } catch (err) {
      showToast('Failed to update personal info', 'error');
    }
    setIsSavingPersonal(false);
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      return showToast('New passwords do not match', 'error');
    }
    setIsSavingSecurity(true);
    try {
      if (auth.currentUser && user?.email) {
        const cred = EmailAuthProvider.credential(user.email, passwords.current);
        await reauthenticateWithCredential(auth.currentUser, cred);
        await updatePassword(auth.currentUser, passwords.new);
        showToast('Password updated successfully!');
        setPasswords({ current: '', new: '', confirm: '' });
      }
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        showToast('Incorrect current password', 'error');
      } else {
        showToast('Failed to update password', 'error');
      }
    }
    setIsSavingSecurity(false);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!user) return;
    try {
      let newAddresses = [...addresses];
      
      // If setting as default, remove default from others
      if (addressModal.data.isDefault) {
        newAddresses = newAddresses.map(a => ({ ...a, isDefault: false }));
      }

      if (addressModal.index >= 0) {
        newAddresses[addressModal.index] = addressModal.data;
      } else {
        // If it's the first address, make it default automatically
        if (newAddresses.length === 0) addressModal.data.isDefault = true;
        newAddresses.push(addressModal.data);
      }

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { addresses: newAddresses });
      setUser({ ...user, addresses: newAddresses });
      setAddresses(newAddresses);
      showToast('Address saved successfully!');
      setAddressModal({ isOpen: false, index: -1, data: null });
    } catch (err) {
      showToast('Failed to save address', 'error');
    }
  };

  const handleDeleteAddress = async (index) => {
    if (!user) return;
    try {
      const newAddresses = addresses.filter((_, i) => i !== index);
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { addresses: newAddresses });
      setUser({ ...user, addresses: newAddresses });
      setAddresses(newAddresses);
      showToast('Address deleted');
    } catch (err) {
      showToast('Failed to delete address', 'error');
    }
  };

  if (!user) return <div style={{ padding: '2rem', textAlign: 'center' }}>Please log in to view your profile.</div>;

  return (
    <div>
      <div className="customer-card">
        <h2 className="card-title"><User /> Profile & Preferences</h2>
        <p style={{ color: 'var(--text-muted)' }}>Manage your personal details, shipping addresses, and security settings.</p>
      </div>

      <div className="customer-tabs" style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button 
          className={`tab-btn ${activeTab === 'personal' ? 'active' : ''}`}
          onClick={() => setActiveTab('personal')}
          style={{ background: 'none', border: 'none', fontSize: '1rem', fontWeight: 600, color: activeTab === 'personal' ? 'var(--gold)' : 'var(--text-muted)', cursor: 'pointer', borderBottom: activeTab === 'personal' ? '2px solid var(--gold)' : 'none', paddingBottom: '0.5rem' }}
        >
          <User size={16} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
          Personal Info
        </button>
        <button 
          className={`tab-btn ${activeTab === 'addresses' ? 'active' : ''}`}
          onClick={() => setActiveTab('addresses')}
          style={{ background: 'none', border: 'none', fontSize: '1rem', fontWeight: 600, color: activeTab === 'addresses' ? 'var(--gold)' : 'var(--text-muted)', cursor: 'pointer', borderBottom: activeTab === 'addresses' ? '2px solid var(--gold)' : 'none', paddingBottom: '0.5rem' }}
        >
          <MapPin size={16} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
          Addresses
        </button>
        <button 
          className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
          style={{ background: 'none', border: 'none', fontSize: '1rem', fontWeight: 600, color: activeTab === 'security' ? 'var(--gold)' : 'var(--text-muted)', cursor: 'pointer', borderBottom: activeTab === 'security' ? '2px solid var(--gold)' : 'none', paddingBottom: '0.5rem' }}
        >
          <Lock size={16} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
          Security
        </button>
      </div>

      <div className="customer-card">
        {activeTab === 'personal' && (
          <form style={{ maxWidth: '600px' }} onSubmit={handleSavePersonal}>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Full Name</label>
              <input type="text" required className="form-input" style={{ width: '100%', padding: '0.8rem', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '4px' }} 
                     value={personalForm.name} onChange={e => setPersonalForm({...personalForm, name: e.target.value})} />
            </div>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Email Address (Read-only)</label>
              <input type="email" disabled className="form-input" style={{ width: '100%', padding: '0.8rem', background: 'var(--surface-light)', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: '4px' }} 
                     value={user.email} />
            </div>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Contact Number</label>
              <input type="tel" className="form-input" style={{ width: '100%', padding: '0.8rem', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '4px' }} 
                     value={personalForm.phone} onChange={e => setPersonalForm({...personalForm, phone: e.target.value})} />
            </div>
            <button type="submit" disabled={isSavingPersonal} className="btn btn-gold" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Save size={16} /> {isSavingPersonal ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        )}

        {activeTab === 'addresses' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {addresses.map((address, idx) => (
                <div key={idx} style={{ border: address.isDefault ? '1px solid var(--gold)' : '1px solid var(--border-color)', padding: '1.5rem', borderRadius: '8px', position: 'relative', background: 'var(--surface)' }}>
                  {address.isDefault && <span className="badge badge-gold" style={{ position: 'absolute', top: '1rem', right: '1rem' }}>DEFAULT</span>}
                  <h4 style={{ margin: '0 0 0.5rem 0', fontFamily: 'Inter', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={16} color="var(--gold)" /> {address.title}
                  </h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                    {address.addressLine}<br />
                    {address.city}, {address.state}<br />
                    {address.pincode}
                  </p>
                  <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-sm btn-outline" onClick={() => setAddressModal({ isOpen: true, index: idx, data: address })} style={{ padding: '0.3rem 0.6rem' }}><Edit2 size={14} /> Edit</button>
                    <button className="btn btn-sm btn-outline" onClick={() => handleDeleteAddress(idx)} style={{ color: 'var(--status-red)', borderColor: 'var(--status-red)', padding: '0.3rem 0.6rem' }}><Trash2 size={14} /> Delete</button>
                  </div>
                </div>
              ))}

              <div 
                onClick={() => setAddressModal({ isOpen: true, index: -1, data: { title: 'Home', addressLine: '', city: '', state: '', pincode: '', isDefault: addresses.length === 0 }})}
                style={{ border: '1px dashed var(--border-color)', padding: '1.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', minHeight: '180px', transition: '0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--gold)'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
              >
                <div style={{ textAlign: 'center', color: 'var(--gold)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}><Plus size={32} /></div>
                  <div>Add New Address</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <form style={{ maxWidth: '600px' }} onSubmit={handleUpdatePassword}>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Current Password</label>
              <input type="password" required className="form-input" style={{ width: '100%', padding: '0.8rem', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '4px' }} 
                     value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} />
            </div>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>New Password</label>
              <input type="password" required minLength="6" className="form-input" style={{ width: '100%', padding: '0.8rem', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '4px' }} 
                     value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} />
            </div>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Confirm New Password</label>
              <input type="password" required minLength="6" className="form-input" style={{ width: '100%', padding: '0.8rem', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '4px' }} 
                     value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} />
            </div>
            <button type="submit" disabled={isSavingSecurity} className="btn btn-gold">
              {isSavingSecurity ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}
      </div>

      {/* Address Modal */}
      {addressModal.isOpen && (
        <div className="modal-overlay" style={{ zIndex: 9999, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-box" style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '500px', border: '1px solid var(--border-color)' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ color: 'var(--gold)' }}>{addressModal.index >= 0 ? 'Edit Address' : 'Add New Address'}</h3>
              <button onClick={() => setAddressModal({ isOpen: false, index: -1, data: null })} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20}/></button>
            </div>
            <form onSubmit={handleSaveAddress}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Address Title (e.g., Home, Office)</label>
                <input type="text" required className="form-input" style={{ width: '100%', padding: '0.8rem', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '4px' }} 
                       value={addressModal.data.title} onChange={e => setAddressModal({...addressModal, data: {...addressModal.data, title: e.target.value}})} />
              </div>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Address Line (Flat, Street, Area)</label>
                <textarea required className="form-input" style={{ width: '100%', padding: '0.8rem', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '4px', resize: 'none', height: '80px' }} 
                          value={addressModal.data.addressLine} onChange={e => setAddressModal({...addressModal, data: {...addressModal.data, addressLine: e.target.value}})}></textarea>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>City</label>
                  <input type="text" required className="form-input" style={{ width: '100%', padding: '0.8rem', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '4px' }} 
                         value={addressModal.data.city} onChange={e => setAddressModal({...addressModal, data: {...addressModal.data, city: e.target.value}})} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>State</label>
                  <input type="text" required className="form-input" style={{ width: '100%', padding: '0.8rem', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '4px' }} 
                         value={addressModal.data.state} onChange={e => setAddressModal({...addressModal, data: {...addressModal.data, state: e.target.value}})} />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Pincode / Zip</label>
                <input type="text" required className="form-input" style={{ width: '100%', padding: '0.8rem', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '4px' }} 
                       value={addressModal.data.pincode} onChange={e => setAddressModal({...addressModal, data: {...addressModal.data, pincode: e.target.value}})} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
                <input type="checkbox" id="isDefault" checked={addressModal.data.isDefault} 
                       onChange={e => setAddressModal({...addressModal, data: {...addressModal.data, isDefault: e.target.checked}})} 
                       style={{ width: '16px', height: '16px', accentColor: 'var(--gold)' }} />
                <label htmlFor="isDefault">Set as default address</label>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setAddressModal({ isOpen: false, index: -1, data: null })}>Cancel</button>
                <button type="submit" className="btn btn-gold">Save Address</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
