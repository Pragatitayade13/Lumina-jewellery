import { useState } from 'react';
import { Monitor, Smartphone, X, Key, ShieldAlert } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function SecuritySettings() {
  const { showToast } = useApp();

  const [policies, setPolicies] = useState({
    twoFactor: true,
    ipWhitelist: true,
    sessionTimeout: true
  });

  const [sessions, setSessions] = useState([
    { id: 1, name: 'iPhone 14 Pro — Safari', meta: 'IP: 117.204.x.x • Delhi', icon: Smartphone }
  ]);

  const [apiKeys, setApiKeys] = useState([
    { id: 'rzp', name: 'Razorpay Payment Gateway', env: 'Production', key: 'rzp_live_••••••••••••x89', lastUsed: '2 mins ago' },
    { id: 'twl', name: 'Twilio SMS Auth', env: 'Production', key: 'twl_live_••••••••••••a21', lastUsed: '15 mins ago' },
    { id: 'sg', name: 'SendGrid Email API', env: 'Production', key: 'sg_live_••••••••••••p09', lastUsed: '1 hr ago' }
  ]);

  const [newKeyModal, setNewKeyModal] = useState({ isOpen: false, service: '', env: 'Production' });
  const [ipModal, setIpModal] = useState({ isOpen: false, ip: '' });

  const handleToggle = (key) => {
    if (key === 'ipWhitelist' && !policies.ipWhitelist) {
      setIpModal({ isOpen: true, ip: '' });
      return; // Will be toggled on save
    }
    setPolicies({ ...policies, [key]: !policies[key] });
    showToast(`Security policy updated successfully.`);
  };

  const handleSaveIp = () => {
    if (!ipModal.ip) return;
    setPolicies({ ...policies, ipWhitelist: true });
    setIpModal({ isOpen: false, ip: '' });
    showToast(`IP ${ipModal.ip} has been whitelisted.`);
  };

  const handleGenerateKey = (e) => {
    e.preventDefault();
    if (!newKeyModal.service) return;
    const prefix = newKeyModal.service.substring(0,3).toLowerCase();
    const envStr = newKeyModal.env === 'Production' ? 'live' : 'test';
    const newKey = {
      id: Date.now().toString(),
      name: newKeyModal.service,
      env: newKeyModal.env,
      key: `${prefix}_${envStr}_••••••••••••${Math.floor(100 + Math.random() * 899)}`,
      lastUsed: 'Never'
    };
    setApiKeys([newKey, ...apiKeys]);
    showToast(`New API Key generated for ${newKeyModal.service}`);
    setNewKeyModal({ isOpen: false, service: '', env: 'Production' });
  };

  const handleForceLogout = () => {
    setSessions([]);
    showToast("All active sessions have been forced logged out.", "error");
  };

  const handleRevoke = (id) => {
    setSessions(sessions.filter(s => s.id !== id));
    showToast("Session revoked successfully.");
  };

  const handleRotateKey = (id) => {
    setApiKeys(apiKeys.map(k => {
      if (k.id === id) {
        const prefix = k.key.split('_')[0] || k.id;
        const envStr = k.env === 'Production' ? 'live' : 'test';
        return { 
          ...k, 
          key: `${prefix}_${envStr}_••••••••••••${Math.floor(100 + Math.random() * 899)}`,
          lastUsed: 'Never'
        };
      }
      return k;
    }));
    showToast("API Key rotated securely.");
  };
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Security & Access Control</h1>
          <p className="page-subtitle">Manage API keys, active sessions, and system security policies.</p>
        </div>
        <div className="page-actions">
           <button className="btn btn-danger" onClick={handleForceLogout}>Force Logout All</button>
        </div>
      </div>

      <div className="grid-2-1 mb-15">
         <div className="admin-card" style={{ gridColumn: 'span 2' }}>
           <div className="card-header">
             <div className="card-title">Security Policies</div>
           </div>
           
           <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="toggle-wrap">
                 <div className="toggle-info">
                   <div className="toggle-label">Two-Factor Authentication (2FA)</div>
                   <div className="toggle-desc">Require 2FA for all admin and staff accounts</div>
                 </div>
                 <label className="toggle">
                   <input type="checkbox" checked={policies.twoFactor} onChange={() => handleToggle('twoFactor')} />
                   <span className="toggle-slider"></span>
                 </label>
              </div>

              <div className="toggle-wrap">
                 <div className="toggle-info">
                   <div className="toggle-label">IP Whitelisting</div>
                   <div className="toggle-desc">Restrict admin access to specific office IPs</div>
                 </div>
                 <label className="toggle">
                   <input type="checkbox" checked={policies.ipWhitelist} onChange={() => handleToggle('ipWhitelist')} />
                   <span className="toggle-slider"></span>
                 </label>
              </div>

              <div className="toggle-wrap">
                 <div className="toggle-info">
                   <div className="toggle-label">Session Timeout</div>
                   <div className="toggle-desc">Automatically log out inactive users after 30 minutes</div>
                 </div>
                 <label className="toggle">
                   <input type="checkbox" checked={policies.sessionTimeout} onChange={() => handleToggle('sessionTimeout')} />
                   <span className="toggle-slider"></span>
                 </label>
              </div>
           </div>
         </div>

         <div className="admin-card">
           <div className="card-header">
             <div className="card-title">Active Sessions (Super Admin)</div>
           </div>
                      <div className="session-item">
             <div className="session-device"><Monitor size={20} color="var(--text-secondary)" /></div>
             <div className="session-info">
               <div className="session-name">Windows PC — Chrome</div>
               <div className="session-meta">IP: 192.168.1.105 • Mumbai</div>
             </div>
             <span className="badge badge-active">Current</span>
            </div>

            {sessions.map(s => (
              <div className="session-item" key={s.id}>
                <div className="session-device"><s.icon size={20} color="var(--text-secondary)" /></div>
                <div className="session-info">
                  <div className="session-name">{s.name}</div>
                  <div className="session-meta">{s.meta}</div>
                </div>
                <button className="btn btn-sm btn-outline" onClick={() => handleRevoke(s.id)}>Revoke</button>
              </div>
            ))}
         </div>
      </div>

      <div className="admin-card">
         <div className="card-header">
            <div>
              <div className="card-title">API Keys & Integrations</div>
              <div className="card-subtitle">Keys for payment gateways, SMS providers, and external services</div>
            </div>
         </div>

         <div className="admin-table-wrap">
            <table className="admin-table">
               <thead>
                 <tr>
                   <th>Service</th>
                   <th>Environment</th>
                   <th>Key (Masked)</th>
                   <th>Last Used</th>
                   <th>Status</th>
                   <th>Action</th>
                 </tr>
               </thead>
               <tbody>
                 {apiKeys.map(k => (
                   <tr key={k.id}>
                     <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{k.name}</td>
                     <td><span className="badge badge-superadmin">{k.env}</span></td>
                     <td style={{ fontFamily: 'monospace' }}>{k.key}</td>
                     <td>{k.lastUsed}</td>
                     <td><span className="badge badge-active">Active</span></td>
                     <td><button className="btn btn-sm btn-outline" onClick={() => handleRotateKey(k.id)}>Rotate</button></td>
                   </tr>
                 ))}
               </tbody>
            </table>
         </div>
      </div>

      {newKeyModal.isOpen && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-box" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Key size={18} color="var(--gold)" /> Generate API Key</h3>
              <button className="modal-close" onClick={() => setNewKeyModal({ isOpen: false, service: '', env: 'Production' })}><X size={16} /></button>
            </div>
            <form onSubmit={handleGenerateKey}>
              <div className="modal-body">
                <div className="form-group mb-1">
                  <label>Service Name / Identifier</label>
                  <input type="text" className="form-input" required placeholder="e.g. Analytics Webhook" value={newKeyModal.service} onChange={e => setNewKeyModal({...newKeyModal, service: e.target.value})} />
                </div>
                <div className="form-group mb-1">
                  <label>Environment</label>
                  <select className="form-input" value={newKeyModal.env} onChange={e => setNewKeyModal({...newKeyModal, env: e.target.value})}>
                    <option value="Production">Production (Live)</option>
                    <option value="Development">Development (Test)</option>
                  </select>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
                  Warning: The raw key will only be shown once upon generation. Please store it securely in your secrets manager.
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setNewKeyModal({ isOpen: false, service: '', env: 'Production' })}>Cancel</button>
                  <button type="submit" className="btn btn-gold" style={{ color: '#000', fontWeight: 'bold' }}>Generate Key</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {ipModal.isOpen && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-box" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ShieldAlert size={18} color="var(--status-green)" /> Configure IP Whitelist</h3>
              <button className="modal-close" onClick={() => setIpModal({ isOpen: false, ip: '' })}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Authorized Office IP Address</label>
                <input type="text" className="form-input" placeholder="e.g. 192.168.1.1" value={ipModal.ip} onChange={e => setIpModal({...ipModal, ip: e.target.value})} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button className="btn btn-outline" onClick={() => setIpModal({ isOpen: false, ip: '' })}>Cancel</button>
                <button className="btn btn-gold" onClick={handleSaveIp} style={{ color: '#000', fontWeight: 'bold' }}>Enable Whitelist</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
