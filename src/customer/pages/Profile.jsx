import { useState } from 'react';
import { User, MapPin, Lock, Save } from 'lucide-react';

export default function Profile() {
  const [activeTab, setActiveTab] = useState('personal');

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
          <form style={{ maxWidth: '600px' }} onSubmit={e => e.preventDefault()}>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Full Name</label>
              <input type="text" className="form-input" style={{ width: '100%', padding: '0.8rem', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '4px' }} defaultValue="Meera Krishnan" />
            </div>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Email Address</label>
              <input type="email" className="form-input" style={{ width: '100%', padding: '0.8rem', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '4px' }} defaultValue="meera@email.com" />
            </div>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Contact Number</label>
              <input type="tel" className="form-input" style={{ width: '100%', padding: '0.8rem', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '4px' }} defaultValue="+91 98765 43210" />
            </div>
            <button className="btn btn-gold" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Save size={16} /> Save Changes</button>
          </form>
        )}

        {activeTab === 'addresses' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={{ border: '1px solid var(--gold)', padding: '1.5rem', borderRadius: '8px', position: 'relative' }}>
                <span className="badge badge-gold" style={{ position: 'absolute', top: '1rem', right: '1rem' }}>DEFAULT</span>
                <h4 style={{ margin: '0 0 0.5rem 0', fontFamily: 'Inter' }}>Home</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>123, Marine Drive<br />Churchgate<br />Mumbai, Maharashtra 400020<br />India</p>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                  <button className="btn btn-sm btn-outline">Edit</button>
                  <button className="btn btn-sm btn-outline" style={{ color: 'var(--status-red)', borderColor: 'var(--status-red)' }}>Delete</button>
                </div>
              </div>
              <div style={{ border: '1px dashed var(--border-color)', padding: '1.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <div style={{ textAlign: 'center', color: 'var(--gold)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>+</div>
                  <div>Add New Address</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <form style={{ maxWidth: '600px' }} onSubmit={e => e.preventDefault()}>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Current Password</label>
              <input type="password" className="form-input" style={{ width: '100%', padding: '0.8rem', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '4px' }} />
            </div>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>New Password</label>
              <input type="password" className="form-input" style={{ width: '100%', padding: '0.8rem', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '4px' }} />
            </div>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Confirm New Password</label>
              <input type="password" className="form-input" style={{ width: '100%', padding: '0.8rem', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '4px' }} />
            </div>
            <button className="btn btn-gold">Update Password</button>
          </form>
        )}
      </div>
    </div>
  );
}
