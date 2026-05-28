import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Building2, Phone, Mail, MapPin, Globe, Save, Shield, Bell, CreditCard, ChevronRight } from 'lucide-react';

const Settings = () => {
  const { user, business } = useSelector(state => state.auth);

  const [profile, setProfile] = useState({
    businessName: business?.businessName || 'My Jewellery Store',
    ownerName: user?.name || 'Admin',
    email: user?.email || 'admin@example.com',
    phone: '+91 98765 43210',
    address: '12, Zaveri Bazaar, Mumbai',
    gstin: 'GSTIN27AABCU9603R1ZM',
    website: 'www.myjewellery.in',
    city: 'Mumbai',
  });

  const [activeSection, setActiveSection] = useState('profile');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const sections = [
    { id: 'profile',  label: 'Business Profile', icon: Building2 },
    { id: 'security', label: 'Security',          icon: Shield     },
    { id: 'notifs',   label: 'Notifications',     icon: Bell       },
    { id: 'billing',  label: 'Subscription',      icon: CreditCard },
  ];

  return (
    <div className="admin-fade-in" style={{ maxWidth: 900, margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Configure your business profile and preferences</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '1.5rem' }}>
        {/* Section Tabs */}
        <div className="admin-card" style={{ padding: '0.5rem', height: 'fit-content' }}>
          {sections.map(s => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.75rem 1rem', borderRadius: 10, cursor: 'pointer',
                  background: activeSection === s.id ? 'rgba(212,175,55,0.1)' : 'transparent',
                  border: 'none',
                  color: activeSection === s.id ? '#d4af37' : 'rgba(232,224,208,0.55)',
                  fontSize: '0.85rem', fontWeight: 600, textAlign: 'left',
                  marginBottom: 2, transition: 'all 0.2s',
                }}
              >
                <Icon size={16} />{s.label}
                {activeSection === s.id && <ChevronRight size={14} style={{ marginLeft: 'auto' }} />}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="admin-card">
          {activeSection === 'profile' && (
            <>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', color: '#f0ebe0', margin: '0 0 1.5rem' }}>Business Profile</h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label className="admin-form-label">Business Name</label>
                  <input className="admin-form-input" value={profile.businessName} onChange={e => setProfile(p => ({ ...p, businessName: e.target.value }))} />
                </div>
                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label className="admin-form-label">Owner Name</label>
                  <input className="admin-form-input" value={profile.ownerName} onChange={e => setProfile(p => ({ ...p, ownerName: e.target.value }))} />
                </div>
              </div>

              <div className="admin-divider" />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label className="admin-form-label"><Mail size={11} style={{ display: 'inline', marginRight: 4 }} />Email</label>
                  <input className="admin-form-input" type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} />
                </div>
                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label className="admin-form-label"><Phone size={11} style={{ display: 'inline', marginRight: 4 }} />Phone</label>
                  <input className="admin-form-input" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} />
                </div>
                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label className="admin-form-label"><Globe size={11} style={{ display: 'inline', marginRight: 4 }} />Website</label>
                  <input className="admin-form-input" value={profile.website} onChange={e => setProfile(p => ({ ...p, website: e.target.value }))} />
                </div>
                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label className="admin-form-label"><MapPin size={11} style={{ display: 'inline', marginRight: 4 }} />City</label>
                  <input className="admin-form-input" value={profile.city} onChange={e => setProfile(p => ({ ...p, city: e.target.value }))} />
                </div>
              </div>

              <div className="admin-divider" />

              <div className="admin-form-group" style={{ marginBottom: '1rem' }}>
                <label className="admin-form-label"><MapPin size={11} style={{ display: 'inline', marginRight: 4 }} />Full Address</label>
                <input className="admin-form-input" value={profile.address} onChange={e => setProfile(p => ({ ...p, address: e.target.value }))} />
              </div>
              <div className="admin-form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="admin-form-label">GSTIN Number</label>
                <input className="admin-form-input" value={profile.gstin} onChange={e => setProfile(p => ({ ...p, gstin: e.target.value }))} />
              </div>

              <button className="admin-btn admin-btn-gold" onClick={handleSave} style={{ gap: '0.5rem' }}>
                <Save size={14} /> {saved ? '✓ Saved!' : 'Save Changes'}
              </button>
            </>
          )}

          {activeSection === 'security' && (
            <>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', color: '#f0ebe0', margin: '0 0 1.5rem' }}>Security Settings</h3>
              <div className="admin-form-group">
                <label className="admin-form-label">Current Password</label>
                <input className="admin-form-input" type="password" placeholder="••••••••" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label className="admin-form-label">New Password</label>
                  <input className="admin-form-input" type="password" placeholder="••••••••" />
                </div>
                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label className="admin-form-label">Confirm Password</label>
                  <input className="admin-form-input" type="password" placeholder="••••••••" />
                </div>
              </div>
              <div className="admin-divider" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { label: 'Two-Factor Authentication', desc: 'Add an extra layer of security to your account', enabled: true },
                  { label: 'Login Notifications',       desc: 'Get notified on new device sign-ins', enabled: false },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                    <div>
                      <p style={{ margin: '0 0 0.2rem', fontWeight: 600, color: '#f0ebe0', fontSize: '0.875rem' }}>{item.label}</p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(232,224,208,0.45)' }}>{item.desc}</p>
                    </div>
                    <div style={{
                      width: 40, height: 22, borderRadius: 99, flexShrink: 0, cursor: 'pointer',
                      background: item.enabled ? 'linear-gradient(135deg, #d4af37, #aa851c)' : 'rgba(255,255,255,0.1)',
                      position: 'relative', transition: 'background 0.2s',
                    }}>
                      <div style={{
                        width: 16, height: 16, borderRadius: '50%', background: 'white',
                        position: 'absolute', top: 3, left: item.enabled ? 21 : 3, transition: 'left 0.2s',
                      }} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '1.5rem' }}>
                <button className="admin-btn admin-btn-gold"><Save size={14} /> Update Password</button>
              </div>
            </>
          )}

          {activeSection === 'notifs' && (
            <>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', color: '#f0ebe0', margin: '0 0 1.5rem' }}>Notification Preferences</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {[
                  { label: 'Low Stock Alerts',       desc: 'Get notified when items fall below minimum stock',  enabled: true  },
                  { label: 'New Order Notifications', desc: 'Instant alerts for each new sale or order',         enabled: true  },
                  { label: 'Daily Sales Summary',     desc: 'End-of-day summary sent to your email',             enabled: false },
                  { label: 'Monthly Reports',         desc: 'Automated monthly performance report',              enabled: true  },
                  { label: 'Staff Activity Alerts',   desc: 'Notifications when staff make high-value changes',  enabled: false },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', paddingBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div>
                      <p style={{ margin: '0 0 0.2rem', fontWeight: 600, color: '#f0ebe0', fontSize: '0.875rem' }}>{item.label}</p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(232,224,208,0.45)' }}>{item.desc}</p>
                    </div>
                    <div style={{
                      width: 40, height: 22, borderRadius: 99, flexShrink: 0, cursor: 'pointer',
                      background: item.enabled ? 'linear-gradient(135deg, #d4af37, #aa851c)' : 'rgba(255,255,255,0.1)',
                      position: 'relative',
                    }}>
                      <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: item.enabled ? 21 : 3, transition: 'left 0.2s' }} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeSection === 'billing' && (
            <>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', color: '#f0ebe0', margin: '0 0 1.5rem' }}>Subscription Plan</h3>
              <div style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.08), rgba(170,133,28,0.04))', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 14, padding: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.65rem', color: 'rgba(212,175,55,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Current Plan</p>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '1.5rem', fontFamily: 'Playfair Display, serif', fontWeight: 800, color: '#f3d078' }}>{business?.subscriptionPlan || 'Basic'}</p>
                  </div>
                  <span className="badge badge-gold" style={{ fontSize: '0.75rem', padding: '0.4rem 1rem' }}>Active</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {['Unlimited inventory items', 'Multi-user access', 'Advanced analytics', 'Priority support'].map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'rgba(232,224,208,0.65)' }}>
                      <span style={{ color: '#4ade80' }}>✓</span>{f}
                    </div>
                  ))}
                </div>
              </div>
              <button className="admin-btn admin-btn-gold">Upgrade Plan</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
