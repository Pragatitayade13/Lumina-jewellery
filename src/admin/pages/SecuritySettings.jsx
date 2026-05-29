import { useState } from 'react';
import { Monitor, Smartphone } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function SecuritySettings() {
  const { showToast } = useApp();

  const [policies, setPolicies] = useState({
    twoFactor: true,
    ipWhitelist: false,
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

  const handleToggle = (key) => {
    setPolicies({ ...policies, [key]: !policies[key] });
    showToast(`Security policy updated successfully.`);
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
    setApiKeys(apiKeys.map(k => k.id === id ? { ...k, key: `${k.key.split('_')[0]}_live_••••••••••••${Math.floor(100 + Math.random() * 899)}` } : k));
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
            <button className="btn btn-sm btn-gold">+ Generate New Key</button>
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
    </div>
  );
}
