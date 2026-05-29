import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, Mail, Phone, MapPin, Award, CheckCircle, Package, ShieldCheck, X } from 'lucide-react';

export default function StaffProfile() {
  const { user, showToast } = useApp();
  const [activeModal, setActiveModal] = useState(null); // 'password', 'contact', 'notifications'
  
  // Local state for edits
  const [contactInfo, setContactInfo] = useState({ phone: user?.phone || '+91 98765 43210', email: user?.email || 'driver.mumbai@luminajewels.com' });
  const [notifPrefs, setNotifPrefs] = useState({ sms: true, email: true, push: true });
  
  // Mock data for delivery partner stats
  const stats = user?.role === 'delivery' ? [
    { label: 'Total Deliveries', value: '1,432', icon: <Package size={18} /> },
    { label: 'Success Rate', value: '99.8%', icon: <CheckCircle size={18} /> },
    { label: 'Safety Rating', value: '5.0', icon: <ShieldCheck size={18} /> },
    { label: 'Zone', value: 'Mumbai South', icon: <MapPin size={18} /> }
  ] : [
    { label: 'Role', value: user?.role?.toUpperCase() || 'STAFF', icon: <Award size={18} /> }
  ];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem' }}>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage your account details and view your performance metrics.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: '1fr 2fr' }}>
        {/* Profile Card */}
        <div className="admin-card" style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--gold)', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontSize: '2.5rem', fontWeight: 'bold' }}>
            {user?.name ? user.name.substring(0, 2).toUpperCase() : 'DP'}
          </div>
          <h2 style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>{user?.name || 'Delivery Partner'}</h2>
          <div style={{ display: 'inline-block', padding: '0.2rem 0.8rem', background: 'rgba(201,168,76,0.1)', color: 'var(--gold)', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid var(--gold)', marginBottom: '1.5rem' }}>
            {user?.role ? user.role.toUpperCase() : 'LOGISTICS'}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left', borderTop: '1px solid var(--admin-border)', paddingTop: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--text-secondary)' }}>
              <Mail size={16} color="var(--text-muted)" />
              <span style={{ fontSize: '0.9rem' }}>{contactInfo.email}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--text-secondary)' }}>
              <Phone size={16} color="var(--text-muted)" />
              <span style={{ fontSize: '0.9rem' }}>{contactInfo.phone}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--text-secondary)' }}>
              <Award size={16} color="var(--text-muted)" />
              <span style={{ fontSize: '0.9rem' }}>{user?.joinDate || 'Joined Jan 2024'}</span>
            </div>
          </div>
        </div>

        {/* Stats & Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className="admin-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1.5rem', color: 'var(--text-primary)' }}>Performance Metrics</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {stats.map((stat, i) => (
                <div key={i} style={{ padding: '1.25rem', background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--admin-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                    {stat.icon} {stat.label}
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{stat.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1.5rem', color: 'var(--text-primary)' }}>Account Settings</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button className="btn btn-outline" style={{ display: 'flex', justifyContent: 'flex-start', padding: '1rem', border: '1px solid var(--admin-border)' }} onClick={() => setActiveModal('password')}>Change Password</button>
              <button className="btn btn-outline" style={{ display: 'flex', justifyContent: 'flex-start', padding: '1rem', border: '1px solid var(--admin-border)' }} onClick={() => setActiveModal('contact')}>Update Contact Information</button>
              <button className="btn btn-outline" style={{ display: 'flex', justifyContent: 'flex-start', padding: '1rem', border: '1px solid var(--admin-border)' }} onClick={() => setActiveModal('notifications')}>Notification Preferences</button>
            </div>
          </div>

        </div>
      </div>

      {/* Modals */}
      {activeModal === 'password' && (
        <div className="auth-modal-overlay">
          <div className="auth-modal" style={{ maxWidth: '400px', padding: '2rem', background: 'var(--surface)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Change Password</h3>
              <button className="btn-icon btn-outline" onClick={() => setActiveModal(null)} style={{ border: 'none' }}><X size={18} /></button>
            </div>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label>Current Password</label>
              <input type="password" placeholder="••••••••" className="form-input" />
            </div>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label>New Password</label>
              <input type="password" placeholder="••••••••" className="form-input" />
            </div>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label>Confirm New Password</label>
              <input type="password" placeholder="••••••••" className="form-input" />
            </div>
            <button className="btn btn-gold" style={{ width: '100%', background: 'var(--gold)', color: '#000' }} onClick={() => {
              showToast("Password successfully updated!");
              setActiveModal(null);
            }}>Update Password</button>
          </div>
        </div>
      )}

      {activeModal === 'contact' && (
        <div className="auth-modal-overlay">
          <div className="auth-modal" style={{ maxWidth: '400px', padding: '2rem', background: 'var(--surface)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Update Contact Info</h3>
              <button className="btn-icon btn-outline" onClick={() => setActiveModal(null)} style={{ border: 'none' }}><X size={18} /></button>
            </div>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label>Phone Number</label>
              <input type="text" value={contactInfo.phone} onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})} className="form-input" />
            </div>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label>Email Address</label>
              <input type="email" value={contactInfo.email} onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})} className="form-input" />
            </div>
            <button className="btn btn-gold" style={{ width: '100%', background: 'var(--gold)', color: '#000' }} onClick={() => {
              showToast("Contact information successfully updated!");
              setActiveModal(null);
            }}>Save Changes</button>
          </div>
        </div>
      )}

      {activeModal === 'notifications' && (
        <div className="auth-modal-overlay">
          <div className="auth-modal" style={{ maxWidth: '400px', padding: '2rem', background: 'var(--surface)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Notification Preferences</h3>
              <button className="btn-icon btn-outline" onClick={() => setActiveModal(null)} style={{ border: 'none' }}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', color: 'var(--text-primary)' }}>
                <input type="checkbox" checked={notifPrefs.sms} onChange={(e) => setNotifPrefs({...notifPrefs, sms: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                SMS Route Alerts & OTPs
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', color: 'var(--text-primary)' }}>
                <input type="checkbox" checked={notifPrefs.email} onChange={(e) => setNotifPrefs({...notifPrefs, email: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                Email Weekly Reports
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', color: 'var(--text-primary)' }}>
                <input type="checkbox" checked={notifPrefs.push} onChange={(e) => setNotifPrefs({...notifPrefs, push: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                Push Notifications for Assigned Orders
              </label>
            </div>
            <button className="btn btn-gold" style={{ width: '100%', background: 'var(--gold)', color: '#000' }} onClick={() => {
              showToast("Notification preferences saved!");
              setActiveModal(null);
            }}>Save Preferences</button>
          </div>
        </div>
      )}
    </div>
  );
}
