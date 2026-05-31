// src/admin/pages/SystemSettings.jsx
import { useState, useEffect } from 'react';
import { AlertTriangle, Activity } from 'lucide-react';

export default function SystemSettings() {
  const [goldRate24k, setGoldRate24k] = useState(7250);
  const [goldRate22k, setGoldRate22k] = useState(6650);
  const [silverRate, setSilverRate] = useState(88);
  const [liveSyncEnabled, setLiveSyncEnabled] = useState(true);

  useEffect(() => {
    if (!liveSyncEnabled) return;
    
    const interval = setInterval(() => {
      // Simulate market fluctuations
      setGoldRate24k(prev => prev + (Math.random() > 0.5 ? 5 : -5));
      setGoldRate22k(prev => prev + (Math.random() > 0.5 ? 4 : -4));
      setSilverRate(prev => prev + (Math.random() > 0.5 ? 0.5 : -0.5));
    }, 5000);
    
    return () => clearInterval(interval);
  }, [liveSyncEnabled]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">System Settings</h1>
          <p className="page-subtitle">Configure global business rules, tax rates, and core store settings.</p>
        </div>
        <div className="page-actions">
           <button className="btn btn-outline" onClick={() => {
             showToast("Unsaved changes discarded.");
           }}>Discard Changes</button>
           <button className="btn btn-gold" style={{ color: '#FFFFFF', fontWeight: 'bold' }} onClick={() => {
             showToast("System settings saved and applied globally!");
           }}>Save All Settings</button>
        </div>
      </div>

      <div className="grid-2 mb-15">
        {/* General Store Info */}
        <div className="admin-card">
          <div className="card-header">
            <div className="card-title">Store Information</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
               <label className="form-label">Store Name</label>
               <input type="text" className="form-input" defaultValue="Lumina Jewels" />
            </div>
            <div className="form-row">
               <div className="form-group">
                 <label className="form-label">Support Email</label>
                 <input type="email" className="form-input" defaultValue="support@luminajewels.com" />
               </div>
               <div className="form-group">
                 <label className="form-label">Support Phone</label>
                 <input type="text" className="form-input" defaultValue="+91 1800-123-4567" />
               </div>
            </div>
            <div className="form-group">
               <label className="form-label">Corporate Address</label>
               <textarea className="form-input" defaultValue="Lumina Tower, Bandra Kurla Complex, Mumbai, Maharashtra 400051"></textarea>
            </div>
          </div>
        </div>

        {/* Tax & Business Rules */}
        <div className="admin-card">
          <div className="card-header">
            <div className="card-title">Tax & Business Rules</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-row">
               <div className="form-group">
                 <label className="form-label">Default GST Rate (%)</label>
                 <input type="number" className="form-input" defaultValue="3" />
                 <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Standard rate for Gold/Diamond in India</span>
               </div>
               <div className="form-group">
                 <label className="form-label">Making Charges GST (%)</label>
                 <input type="number" className="form-input" defaultValue="5" />
               </div>
            </div>
            <div className="form-group">
               <label className="form-label">Free Shipping Threshold (₹)</label>
               <input type="number" className="form-input" defaultValue="50000" />
            </div>
            <div className="form-group">
               <label className="form-label">Loyalty Point Value</label>
               <select className="form-input">
                 <option>1 Point = ₹1</option>
                 <option>1 Point = ₹0.5</option>
                 <option>10 Points = ₹1</option>
               </select>
            </div>
          </div>
        </div>
      </div>

      {/* Gold Schemes / Buyback */}
      <div className="admin-card mb-15">
         <div className="card-header">
            <div>
              <div className="card-title">Gold Schemes & Buyback Policies</div>
              <div className="card-subtitle">Configure rates for exchange and returns</div>
            </div>
         </div>
         <div className="grid-3" style={{ gap: '1rem' }}>
            <div className="form-group">
               <label className="form-label">Gold Buyback Rate (Cash)</label>
               <div style={{ position: 'relative' }}>
                 <input type="number" className="form-input" defaultValue="95" style={{ paddingRight: '2rem' }} />
                 <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>%</span>
               </div>
            </div>
            <div className="form-group">
               <label className="form-label">Gold Exchange Rate (Jewellery)</label>
               <div style={{ position: 'relative' }}>
                 <input type="number" className="form-input" defaultValue="100" style={{ paddingRight: '2rem' }} />
                 <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>%</span>
               </div>
            </div>
            <div className="form-group">
               <label className="form-label">Diamond Buyback Rate</label>
               <div style={{ position: 'relative' }}>
                 <input type="number" className="form-input" defaultValue="80" style={{ paddingRight: '2rem' }} />
                 <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>%</span>
               </div>
            </div>
         </div>
      </div>

      {/* Live Metal Rates API Configuration */}
      <div className="admin-card">
         <div className="card-header">
            <div>
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={18} color="var(--status-green)" />
                Live Metal Rates Sync
              </div>
              <div className="card-subtitle">Automatically update product prices based on live MCX rates</div>
            </div>
            <label className="toggle">
               <input 
                 type="checkbox" 
                 checked={liveSyncEnabled} 
                 onChange={(e) => setLiveSyncEnabled(e.target.checked)} 
               />
               <span className="toggle-slider"></span>
            </label>
         </div>
         
         <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'var(--admin-surface)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--admin-border)', flex: 1 }}>
               <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Gold 24K (per gram)</div>
               <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gold)' }}>₹{goldRate24k.toLocaleString('en-IN')}</div>
               <div style={{ fontSize: '0.65rem', color: liveSyncEnabled ? 'var(--status-green)' : 'var(--text-muted)', marginTop: '0.2rem' }}>{liveSyncEnabled ? 'Live updating...' : 'Paused'}</div>
            </div>
            <div style={{ background: 'var(--admin-surface)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--admin-border)', flex: 1 }}>
               <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Gold 22K (per gram)</div>
               <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>₹{goldRate22k.toLocaleString('en-IN')}</div>
               <div style={{ fontSize: '0.65rem', color: liveSyncEnabled ? 'var(--status-green)' : 'var(--text-muted)', marginTop: '0.2rem' }}>{liveSyncEnabled ? 'Live updating...' : 'Paused'}</div>
            </div>
            <div style={{ background: 'var(--admin-surface)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--admin-border)', flex: 1 }}>
               <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Silver (per gram)</div>
               <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#bdc3c7' }}>₹{silverRate.toFixed(2)}</div>
               <div style={{ fontSize: '0.65rem', color: liveSyncEnabled ? 'var(--status-green)' : 'var(--text-muted)', marginTop: '0.2rem' }}>{liveSyncEnabled ? 'Live updating...' : 'Paused'}</div>
            </div>
         </div>

         <div className="alert-banner alert-warning" style={{ marginBottom: '1.5rem' }}>
            <AlertTriangle size={16} />
            <span>Live sync adjusts the base price of all Gold products twice daily (10:00 AM & 5:00 PM).</span>
         </div>
         
         <div className="grid-2" style={{ gap: '1rem' }}>
            <div className="form-group">
               <label className="form-label">Markup over Market Rate (%)</label>
               <input type="number" className="form-input" defaultValue="2" />
            </div>
            <div className="form-group">
               <label className="form-label">Rate Provider API</label>
               <select className="form-input">
                 <option>MCX India (Primary)</option>
                 <option>Kitco (Backup)</option>
               </select>
            </div>
         </div>
      </div>
      
      {/* Super Admin Database Tools */}
      <div className="admin-card" style={{ marginTop: '1.5rem', border: '1px solid var(--status-red)' }}>
         <div className="card-header">
            <div>
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--status-red)' }}>
                <AlertTriangle size={18} />
                Super Admin Database Tools
              </div>
              <div className="card-subtitle">Danger Zone: Operations for database initialization and seeding</div>
            </div>
         </div>
         <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button className="btn btn-outline" onClick={async () => {
              try {
                const { seedOrders } = await import('../../scripts/seedERPData');
                const count = await seedOrders();
                alert(`Successfully seeded ${count} orders to Firebase!`);
              } catch (e) { alert("Error: " + e.message); }
            }}>Seed Orders DB</button>
            
            <button className="btn btn-outline" onClick={async () => {
              try {
                const { seedTransactions } = await import('../../scripts/seedERPData');
                const count = await seedTransactions();
                alert(`Successfully seeded ${count} transactions to Firebase!`);
              } catch (e) { alert("Error: " + e.message); }
            }}>Seed Finance DB</button>
            
            <button className="btn btn-outline" onClick={async () => {
              try {
                const { seedSupportTickets } = await import('../../scripts/seedERPData');
                const count = await seedSupportTickets();
                alert(`Successfully seeded ${count} support tickets to Firebase!`);
              } catch (e) { alert("Error: " + e.message); }
            }}>Seed Support Tickets DB</button>
         </div>
      </div>
    </div>
  );
}
