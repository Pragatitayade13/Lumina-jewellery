// src/admin/pages/SecuritySettings.jsx
import { Monitor, Smartphone } from 'lucide-react';

export default function SecuritySettings() {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Security & Access Control</h1>
          <p className="page-subtitle">Manage API keys, active sessions, and system security policies.</p>
        </div>
        <div className="page-actions">
           <button className="btn btn-danger">Force Logout All</button>
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
                   <input type="checkbox" defaultChecked />
                   <span className="toggle-slider"></span>
                 </label>
              </div>

              <div className="toggle-wrap">
                 <div className="toggle-info">
                   <div className="toggle-label">IP Whitelisting</div>
                   <div className="toggle-desc">Restrict admin access to specific office IPs</div>
                 </div>
                 <label className="toggle">
                   <input type="checkbox" />
                   <span className="toggle-slider"></span>
                 </label>
              </div>

              <div className="toggle-wrap">
                 <div className="toggle-info">
                   <div className="toggle-label">Session Timeout</div>
                   <div className="toggle-desc">Automatically log out inactive users after 30 minutes</div>
                 </div>
                 <label className="toggle">
                   <input type="checkbox" defaultChecked />
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

           <div className="session-item">
             <div className="session-device"><Smartphone size={20} color="var(--text-secondary)" /></div>
             <div className="session-info">
               <div className="session-name">iPhone 14 Pro — Safari</div>
               <div className="session-meta">IP: 117.204.x.x • Delhi</div>
             </div>
             <button className="btn btn-sm btn-outline">Revoke</button>
           </div>
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
                 <tr>
                   <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Razorpay Payment Gateway</td>
                   <td><span className="badge badge-superadmin">Production</span></td>
                   <td style={{ fontFamily: 'monospace' }}>rzp_live_••••••••••••x89</td>
                   <td>2 mins ago</td>
                   <td><span className="badge badge-active">Active</span></td>
                   <td><button className="btn btn-sm btn-outline">Rotate</button></td>
                 </tr>
                 <tr>
                   <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Twilio SMS Auth</td>
                   <td><span className="badge badge-superadmin">Production</span></td>
                   <td style={{ fontFamily: 'monospace' }}>twl_live_••••••••••••a21</td>
                   <td>15 mins ago</td>
                   <td><span className="badge badge-active">Active</span></td>
                   <td><button className="btn btn-sm btn-outline">Rotate</button></td>
                 </tr>
                 <tr>
                   <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>SendGrid Email API</td>
                   <td><span className="badge badge-superadmin">Production</span></td>
                   <td style={{ fontFamily: 'monospace' }}>sg_live_••••••••••••p09</td>
                   <td>1 hr ago</td>
                   <td><span className="badge badge-active">Active</span></td>
                   <td><button className="btn btn-sm btn-outline">Rotate</button></td>
                 </tr>
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
