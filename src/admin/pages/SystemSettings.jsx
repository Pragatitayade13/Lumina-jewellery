import { useState, useEffect } from 'react';
import { AlertTriangle, Activity, Loader, Save } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { db } from '../../config/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function SystemSettings() {
  const { showToast } = useApp();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState({
    storeName: 'Lumina Jewels',
    supportEmail: 'support@luminajewels.com',
    supportPhone: '+91 1800-123-4567',
    address: 'Lumina Tower, Bandra Kurla Complex, Mumbai, Maharashtra 400051',
    gstStandard: 3,
    gstMaking: 5,
    freeShippingThreshold: 50000,
    goldBuyback: 95,
    goldExchange: 100,
    diamondBuyback: 80,
    markup: 2,
    liveSyncEnabled: true,
    provider: 'MCX India (Primary)'
  });
  const [originalData, setOriginalData] = useState(null);

  const [goldRate24k, setGoldRate24k] = useState(7250);
  const [goldRate22k, setGoldRate22k] = useState(6650);
  const [silverRate, setSilverRate] = useState(88);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (!db) throw new Error("Database not initialized");
      const docRef = doc(db, 'cms', 'systemSettings');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const fetchedData = docSnap.data();
        setData((prev) => ({ ...prev, ...fetchedData }));
        setOriginalData((prev) => ({ ...prev, ...fetchedData }));
      } else {
        setOriginalData(data);
      }
    } catch (e) {
      console.error("Error fetching system settings:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (!db) throw new Error("Database not initialized");
      await setDoc(doc(db, 'cms', 'systemSettings'), {
        ...data,
        updatedAt: serverTimestamp()
      }, { merge: true });
      setOriginalData(data);
      showToast("System settings saved successfully!");
    } catch (e) {
      console.error("Error saving system settings:", e);
      showToast("Error saving content", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setData({ ...data, [field]: value });
  };

  useEffect(() => {
    if (!data.liveSyncEnabled) return;
    
    const interval = setInterval(() => {
      // Simulate market fluctuations
      setGoldRate24k(prev => prev + (Math.random() > 0.5 ? 5 : -5));
      setGoldRate22k(prev => prev + (Math.random() > 0.5 ? 4 : -4));
      setSilverRate(prev => prev + (Math.random() > 0.5 ? 0.5 : -0.5));
    }, 5000);
    
    return () => clearInterval(interval);
  }, [data.liveSyncEnabled]);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}><Loader className="spin" size={24} color="var(--gold)" /></div>;
  }

  const hasChanges = JSON.stringify(data) !== JSON.stringify(originalData);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">System Settings</h1>
          <p className="page-subtitle">Configure global business rules, tax rates, and core store settings.</p>
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: '1rem' }}>
           <button className="btn btn-outline" onClick={fetchData} disabled={saving || !hasChanges}>Discard Changes</button>
           <button className="btn btn-gold" style={{ color: '#FFFFFF', fontWeight: 'bold', opacity: (!hasChanges ? 0.6 : 1) }} onClick={handleSave} disabled={saving || !hasChanges}>
             {saving ? <Loader className="spin" size={16} /> : <Save size={16} />} 
             <span style={{ marginLeft: 6 }}>{saving ? 'Saving...' : 'Save All Settings'}</span>
           </button>
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
               <input type="text" className="form-input" value={data.storeName} onChange={e => handleChange('storeName', e.target.value)} />
            </div>
            <div className="form-row">
               <div className="form-group">
                 <label className="form-label">Support Email</label>
                 <input type="email" className="form-input" value={data.supportEmail} onChange={e => handleChange('supportEmail', e.target.value)} />
               </div>
               <div className="form-group">
                 <label className="form-label">Support Phone</label>
                 <input type="text" className="form-input" value={data.supportPhone} onChange={e => handleChange('supportPhone', e.target.value)} />
               </div>
            </div>
            <div className="form-group">
               <label className="form-label">Corporate Address</label>
               <textarea className="form-input" value={data.address} onChange={e => handleChange('address', e.target.value)}></textarea>
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
                 <input type="number" className="form-input" value={data.gstStandard || 3} onChange={e => handleChange('gstStandard', Number(e.target.value))} />
                 <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Standard rate for Gold/Diamond in India</span>
               </div>
               <div className="form-group">
                 <label className="form-label">Making Charges GST (%)</label>
                 <input type="number" className="form-input" value={data.gstMaking || 5} onChange={e => handleChange('gstMaking', Number(e.target.value))} />
               </div>
            </div>
            <div className="form-group">
               <label className="form-label">Free Shipping Threshold (₹)</label>
               <input type="number" className="form-input" value={data.freeShippingThreshold || 50000} onChange={e => handleChange('freeShippingThreshold', Number(e.target.value))} />
            </div>
            <div className="form-group">
               <label className="form-label">Loyalty Point Value</label>
               <select className="form-input" value={data.loyaltyValue} onChange={e => handleChange('loyaltyValue', e.target.value)}>
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
                 <input type="number" className="form-input" value={data.goldBuyback || 95} onChange={e => handleChange('goldBuyback', Number(e.target.value))} style={{ paddingRight: '2rem' }} />
                 <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>%</span>
               </div>
            </div>
            <div className="form-group">
               <label className="form-label">Gold Exchange Rate (Jewellery)</label>
               <div style={{ position: 'relative' }}>
                 <input type="number" className="form-input" value={data.goldExchange || 100} onChange={e => handleChange('goldExchange', Number(e.target.value))} style={{ paddingRight: '2rem' }} />
                 <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>%</span>
               </div>
            </div>
            <div className="form-group">
               <label className="form-label">Diamond Buyback Rate</label>
               <div style={{ position: 'relative' }}>
                 <input type="number" className="form-input" value={data.diamondBuyback || 80} onChange={e => handleChange('diamondBuyback', Number(e.target.value))} style={{ paddingRight: '2rem' }} />
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
                 checked={data.liveSyncEnabled} 
                 onChange={(e) => handleChange('liveSyncEnabled', e.target.checked)} 
               />
               <span className="toggle-slider"></span>
            </label>
         </div>
         
         <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'var(--admin-surface)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--admin-border)', flex: 1 }}>
               <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Gold 24K (per gram)</div>
               <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gold)' }}>₹{goldRate24k.toLocaleString('en-IN')}</div>
               <div style={{ fontSize: '0.65rem', color: data.liveSyncEnabled ? 'var(--status-green)' : 'var(--text-muted)', marginTop: '0.2rem' }}>{data.liveSyncEnabled ? 'Live updating...' : 'Paused'}</div>
            </div>
            <div style={{ background: 'var(--admin-surface)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--admin-border)', flex: 1 }}>
               <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Gold 22K (per gram)</div>
               <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>₹{goldRate22k.toLocaleString('en-IN')}</div>
               <div style={{ fontSize: '0.65rem', color: data.liveSyncEnabled ? 'var(--status-green)' : 'var(--text-muted)', marginTop: '0.2rem' }}>{data.liveSyncEnabled ? 'Live updating...' : 'Paused'}</div>
            </div>
            <div style={{ background: 'var(--admin-surface)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--admin-border)', flex: 1 }}>
               <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Silver (per gram)</div>
               <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#bdc3c7' }}>₹{silverRate.toFixed(2)}</div>
               <div style={{ fontSize: '0.65rem', color: data.liveSyncEnabled ? 'var(--status-green)' : 'var(--text-muted)', marginTop: '0.2rem' }}>{data.liveSyncEnabled ? 'Live updating...' : 'Paused'}</div>
            </div>
         </div>

         <div className="alert-banner alert-warning" style={{ marginBottom: '1.5rem' }}>
            <AlertTriangle size={16} />
            <span>Live sync adjusts the base price of all Gold products twice daily (10:00 AM & 5:00 PM).</span>
         </div>
         
         <div className="grid-2" style={{ gap: '1rem' }}>
            <div className="form-group">
               <label className="form-label">Markup over Market Rate (%)</label>
               <input type="number" className="form-input" value={data.markup || 2} onChange={e => handleChange('markup', Number(e.target.value))} />
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

    </div>
  );
}
