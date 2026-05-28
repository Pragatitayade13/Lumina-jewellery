import { Coins, TrendingUp, RefreshCw, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRates } from '../../hooks/useRates';
import { useApp } from '../../context/AppContext';

export default function GoldRateDashboard() {
  const { rates, updateRates } = useRates();
  const { showToast } = useApp();
  
  const [localRates, setLocalRates] = useState(rates);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLocalRates(rates);
  }, [rates]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateRates(localRates);
      showToast("Live rates updated successfully!");
    } catch (err) {
      showToast("Failed to update rates.", "error");
    }
    setIsSaving(false);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Gold Rate & Pricing Engine</h1>
          <p className="page-subtitle">Configure live API multipliers, manage regional pricing, and set making charge percentages.</p>
        </div>
        <div className="page-actions">
           <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Last synced: Just now</span>
           <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><RefreshCw size={14} /> Force Sync API</button>
           <button className="btn btn-gold" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#000', fontWeight: 'bold' }} onClick={handleSave} disabled={isSaving}>
             <Save size={14} /> {isSaving ? 'Saving...' : 'Save & Publish Rates'}
           </button>
        </div>
      </div>

      <div className="grid-3 mb-15">
        <div className="admin-card text-center" style={{ padding: '2rem 1rem', borderTop: '3px solid var(--gold)' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>24 Karat (99.9%)</div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '2rem', color: 'var(--gold)' }}>₹</span>
            <input type="number" value={localRates.gold24k} onChange={e => setLocalRates({...localRates, gold24k: Number(e.target.value)})} className="form-input" style={{ width: '120px', fontSize: '2rem', fontWeight: 700, padding: '0.5rem', background: 'transparent', border: '1px dashed var(--gold)', color: 'var(--gold)', textAlign: 'center' }} />
            <span style={{ fontSize: '1rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>/g</span>
          </div>
        </div>
        <div className="admin-card text-center" style={{ padding: '2rem 1rem' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>22 Karat (91.6%)</div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '2rem', color: 'var(--text-primary)' }}>₹</span>
            <input type="number" value={localRates.gold22k} onChange={e => setLocalRates({...localRates, gold22k: Number(e.target.value)})} className="form-input" style={{ width: '120px', fontSize: '2rem', fontWeight: 700, padding: '0.5rem', background: 'transparent', border: '1px dashed var(--border)', color: 'var(--text-primary)', textAlign: 'center' }} />
            <span style={{ fontSize: '1rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>/g</span>
          </div>
        </div>
        <div className="admin-card text-center" style={{ padding: '2rem 1rem' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>18 Karat (75.0%)</div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '2rem', color: 'var(--text-primary)' }}>₹</span>
            <input type="number" value={localRates.gold18k} onChange={e => setLocalRates({...localRates, gold18k: Number(e.target.value)})} className="form-input" style={{ width: '120px', fontSize: '2rem', fontWeight: 700, padding: '0.5rem', background: 'transparent', border: '1px dashed var(--border)', color: 'var(--text-primary)', textAlign: 'center' }} />
            <span style={{ fontSize: '1rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>/g</span>
          </div>
        </div>
      </div>
      
      <div className="grid-2 mb-15">
        <div className="admin-card text-center" style={{ padding: '2rem 1rem' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Silver Rate (99.9%)</div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '2rem', color: '#c0c0c0' }}>₹</span>
            <input type="number" value={localRates.silver} onChange={e => setLocalRates({...localRates, silver: Number(e.target.value)})} className="form-input" style={{ width: '120px', fontSize: '2rem', fontWeight: 700, padding: '0.5rem', background: 'transparent', border: '1px dashed #c0c0c0', color: '#c0c0c0', textAlign: 'center' }} />
            <span style={{ fontSize: '1rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>/g</span>
          </div>
        </div>
        <div className="admin-card text-center" style={{ padding: '2rem 1rem' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Diamond Base Rate (1ct)</div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '2rem', color: '#88ccff' }}>₹</span>
            <input type="number" value={localRates.diamond} onChange={e => setLocalRates({...localRates, diamond: Number(e.target.value)})} className="form-input" style={{ width: '180px', fontSize: '2rem', fontWeight: 700, padding: '0.5rem', background: 'transparent', border: '1px dashed #88ccff', color: '#88ccff', textAlign: 'center' }} />
            <span style={{ fontSize: '1rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>/ct</span>
          </div>
        </div>
      </div>

      <div className="grid-2 mb-15">
        <div className="admin-card">
          <h3 className="card-title" style={{ marginBottom: '1.5rem' }}>Global Making Charges</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Configure the baseline making charge percentage applied across different product categories.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ flex: 1, color: 'var(--text-secondary)' }}>Plain Gold Jewellery</div>
              <input type="number" defaultValue={12} className="form-input" style={{ width: '80px', textAlign: 'right' }} />
              <span style={{ color: 'var(--text-muted)' }}>%</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ flex: 1, color: 'var(--text-secondary)' }}>Antique & Temple Jewellery</div>
              <input type="number" defaultValue={18} className="form-input" style={{ width: '80px', textAlign: 'right' }} />
              <span style={{ color: 'var(--text-muted)' }}>%</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ flex: 1, color: 'var(--text-secondary)' }}>Kundan & Polki</div>
              <input type="number" defaultValue={22} className="form-input" style={{ width: '80px', textAlign: 'right' }} />
              <span style={{ color: 'var(--text-muted)' }}>%</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ flex: 1, color: 'var(--text-secondary)' }}>Platinum Jewellery</div>
              <input type="number" defaultValue={25} className="form-input" style={{ width: '80px', textAlign: 'right' }} />
              <span style={{ color: 'var(--text-muted)' }}>%</span>
            </div>
          </div>
          <button className="btn btn-outline" style={{ marginTop: '2rem', width: '100%' }}>Update Pricing Rules</button>
        </div>

        <div className="admin-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 className="card-title" style={{ marginBottom: '1rem' }}>Live API Configuration</h3>
          <div style={{ padding: '1rem', background: 'var(--surface)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '1rem' }}>
             <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Current Provider</div>
             <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>MCX India (Multi Commodity Exchange) <span className="badge badge-success">Connected</span></div>
          </div>
          <div style={{ padding: '1rem', background: 'var(--surface)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '1rem' }}>
             <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Retail Markup Multiplier</div>
             <div style={{ fontWeight: 600 }}>1.025x <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>(Base MCX Rate + 2.5% Retail Margin)</span></div>
          </div>
          
          <div style={{ marginTop: 'auto', padding: '1.5rem', background: 'rgba(201,168,76,0.05)', border: '1px dashed var(--gold)', borderRadius: '8px', textAlign: 'center' }}>
            <Coins size={32} color="var(--gold)" style={{ marginBottom: '1rem' }} />
            <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--gold)' }}>Dynamic Auto-Pricing</h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>All website product prices are recalculating automatically every 15 minutes based on these parameters.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
