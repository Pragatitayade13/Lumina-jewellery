import { Coins, RefreshCw, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRates } from '../../hooks/useRates';
import { useApp } from '../../context/AppContext';

// Defined OUTSIDE component — avoids hook-order / re-render issues
function HistoricalLineChart({ data, color, label }) {
  const max = Math.max(...data.map(d => d.price));
  const min = Math.min(...data.map(d => d.price)) * 0.97;
  const range = max - min || 1;
  const W = 400, H = 100;
  const xStep = W / (data.length - 1);
  const pts = data.map((d, i) => `${i * xStep},${H - ((d.price - min) / range) * H}`).join(' ');
  const gradId = `grad-${label.replace(/[\s/—₹]/g, '')}`;
  return (
    <div style={{ flex: 1 }}>
      <svg viewBox={`0 -10 ${W} ${H + 30}`} style={{ width: '100%', height: '120px', overflow: 'visible' }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25"/>
            <stop offset="100%" stopColor={color} stopOpacity="0"/>
          </linearGradient>
        </defs>
        <polygon fill={`url(#${gradId})`} points={`${pts} ${(data.length-1)*xStep},${H} 0,${H}`} />
        <polyline fill="none" stroke={color} strokeWidth="2.5" points={pts} />
        {data.map((d, i) => {
          const x = i * xStep;
          const y = H - ((d.price - min) / range) * H;
          return (
            <g key={d.month}>
              <circle cx={x} cy={y} r="4" fill={color} stroke="var(--surface)" strokeWidth="2"/>
              <text x={x} y={H + 20} fill="var(--text-muted)" fontSize="11" textAnchor="middle">{d.month}</text>
              <text x={x} y={y - 8} fill="var(--text-primary)" fontSize="10" fontWeight="bold" textAnchor="middle">
                ₹{d.price.toLocaleString('en-IN')}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function GoldRateDashboard() {
  const { rates, updateRates } = useRates();
  const { showToast } = useApp();

  const [localRates, setLocalRates] = useState(rates);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAutoPricingEnabled, setIsAutoPricingEnabled] = useState(false);
  const [localMakingCharges, setLocalMakingCharges] = useState(
    rates.makingCharges || { plain: 12, antique: 18, kundan: 22, platinum: 25 }
  );
  const [activeSection, setActiveSection] = useState('rates');

  useEffect(() => {
    setLocalRates(rates);
    if (rates.makingCharges) setLocalMakingCharges(rates.makingCharges);
  }, [rates]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateRates(localRates);
      showToast('Live rates updated successfully!');
    } catch {
      showToast('Failed to update rates.', 'error');
    }
    setIsSaving(false);
  };

  const handleForceSync = () => {
    setIsSyncing(true);
    showToast('Syncing with MCX API...');
    setTimeout(() => {
      setLocalRates(prev => ({
        ...prev,
        gold24k: Math.round(prev.gold24k * (1 + (Math.random() * 0.01 - 0.005))),
        gold22k: Math.round(prev.gold22k * (1 + (Math.random() * 0.01 - 0.005))),
        silver:  Math.round(prev.silver  * (1 + (Math.random() * 0.01 - 0.005))),
      }));
      setIsSyncing(false);
      showToast('API Sync Complete. Review new rates before publishing.');
    }, 1500);
  };

  const handleUpdateMakingCharges = async () => {
    try {
      await updateRates({ ...localRates, makingCharges: localMakingCharges });
      showToast('Global Making Charges updated and synced globally!');
    } catch {
      showToast('Failed to update global making charges.', 'error');
    }
  };

  const toggleAutoPricing = () => {
    setIsAutoPricingEnabled(v => {
      showToast(v
        ? 'Dynamic Auto-Pricing Paused. Manual sync required.'
        : 'Dynamic Auto-Pricing Engine Enabled! Prices will now sync automatically.');
      return !v;
    });
  };

  // Historical 2026 monthly data
  const historical24K = [
    { month: 'Jan', price: 6450 }, { month: 'Feb', price: 6580 },
    { month: 'Mar', price: 6720 }, { month: 'Apr', price: 6890 },
    { month: 'May', price: localRates.gold24k || 7250 },
  ];
  const historicalSilver = [
    { month: 'Jan', price: 75 }, { month: 'Feb', price: 78 },
    { month: 'Mar', price: 80 }, { month: 'Apr', price: 83 },
    { month: 'May', price: localRates.silver || 85 },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Gold Rate &amp; Pricing Engine</h1>
          <p className="page-subtitle">Configure live API multipliers, manage regional pricing, and set making charge percentages.</p>
        </div>
        <div className="page-actions">
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Last synced: Just now</span>
          <button className="btn btn-outline" onClick={handleForceSync} disabled={isSyncing}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1rem', fontWeight: 600, color: '#fff' }}>
            <RefreshCw size={14} className={isSyncing ? 'spin' : ''} />
            {isSyncing ? 'Syncing...' : 'Force Sync API'}
          </button>
          <button className="btn btn-gold" onClick={handleSave} disabled={isSaving}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fff', fontWeight: 800, padding: '0.6rem 1.2rem', fontSize: '1rem' }}>
            <Save size={16} /> {isSaving ? 'Saving...' : 'Save & Publish Rates'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem' }}>
        {[['rates', 'Live Rates & Pricing'], ['history', 'Historical Charts (2026)']].map(([key, label]) => (
          <button key={key} onClick={() => setActiveSection(key)} style={{
            padding: '0.7rem 1.5rem', background: 'none', border: 'none',
            borderBottom: activeSection === key ? '2px solid var(--gold)' : '2px solid transparent',
            color: activeSection === key ? 'var(--gold)' : 'var(--text-muted)',
            fontWeight: activeSection === key ? 700 : 400, cursor: 'pointer', fontSize: '0.95rem'
          }}>
            {label}
          </button>
        ))}
      </div>

      {/* ===== HISTORICAL CHARTS TAB ===== */}
      {activeSection === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div className="admin-card">
            <div className="card-header" style={{ marginBottom: '1.5rem' }}>
              <div>
                <div className="card-title">Gold 24K — Monthly Price 2026 (₹/g)</div>
                <div className="card-subtitle">Jan–May average closing rates</div>
              </div>
              <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem' }}>
                <div>YTD Change: <strong style={{ color: 'var(--status-green)' }}>▲ +12.4%</strong></div>
                <div>ATH: <strong style={{ color: 'var(--gold)' }}>₹{(localRates.gold24k || 7250).toLocaleString('en-IN')}/g</strong></div>
              </div>
            </div>
            <HistoricalLineChart data={historical24K} color="var(--gold)" label="24KGoldpergram2026" />
          </div>
          <div className="grid-2">
            <div className="admin-card">
              <div className="card-title" style={{ marginBottom: '1rem' }}>Silver — Monthly 2026 (₹/g)</div>
              <HistoricalLineChart data={historicalSilver} color="#c0c0c0" label="Silverpergram2026" />
            </div>
            <div className="admin-card">
              <div className="card-title" style={{ marginBottom: '1rem' }}>Rate Comparison Table — 2026</div>
              <table className="admin-table" style={{ fontSize: '0.85rem' }}>
                <thead>
                  <tr><th>Month</th><th>24K Gold (₹/g)</th><th>Silver (₹/g)</th><th>MoM Change</th></tr>
                </thead>
                <tbody>
                  {historical24K.map((h, i) => {
                    const prev = historical24K[i - 1];
                    const change = prev ? (((h.price - prev.price) / prev.price) * 100).toFixed(1) : null;
                    return (
                      <tr key={h.month}>
                        <td style={{ fontWeight: 600 }}>{h.month} 2026</td>
                        <td style={{ color: 'var(--gold)', fontWeight: 700 }}>₹{h.price.toLocaleString('en-IN')}</td>
                        <td style={{ color: '#c0c0c0' }}>₹{historicalSilver[i].price}</td>
                        <td style={{ color: change > 0 ? 'var(--status-green)' : change < 0 ? 'var(--status-red)' : 'var(--text-muted)', fontWeight: 700 }}>
                          {change !== null ? `${change > 0 ? '▲' : '▼'} ${Math.abs(change)}%` : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===== LIVE RATES TAB ===== */}
      {activeSection === 'rates' && (
        <>
          {/* Gold Karat Cards */}
          <div className="grid-3 mb-15">
            {[
              { label: '24 Karat (99.9%)', field: 'gold24k', color: 'var(--gold)', bg: 'rgba(201,168,76,0.1)', change: '▲ +₹12.50 (0.17%) Today', chColor: 'var(--status-green)' },
              { label: '22 Karat (91.6%)', field: 'gold22k', color: '#f1c40f', bg: 'rgba(241,196,15,0.05)', change: '▲ +₹9.00 (0.13%) Today', chColor: 'var(--status-green)' },
              { label: '18 Karat (75.0%)', field: 'gold18k', color: '#d4af37', bg: 'rgba(212,175,55,0.05)', change: '▲ +₹5.40 (0.10%) Today', chColor: 'var(--status-green)' },
            ].map(card => (
              <div key={card.field} className="admin-card text-center"
                style={{ padding: '2rem 1rem', background: `linear-gradient(135deg, ${card.bg}, transparent)`, borderTop: `3px solid ${card.color}`, position: 'relative' }}>
                <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', color: 'var(--status-green)', background: 'rgba(46,204,113,0.1)', padding: '0.2rem 0.5rem', borderRadius: '12px', fontWeight: 600 }}>
                  <span style={{ background: 'var(--status-green)', width: '6px', height: '6px', borderRadius: '50%', display: 'inline-block' }}></span> LIVE
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{card.label}</div>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '2rem', color: card.color }}>₹</span>
                  <input type="number" value={localRates[card.field]}
                    onChange={e => setLocalRates({ ...localRates, [card.field]: Number(e.target.value) })}
                    style={{ width: '130px', fontSize: '2.5rem', fontWeight: 800, padding: '0', background: 'transparent', border: 'none', color: card.color, textAlign: 'center', outline: 'none' }} />
                  <span style={{ fontSize: '1rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>/g</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: card.chColor }}>{card.change}</div>
              </div>
            ))}
          </div>

          {/* Silver & Diamond */}
          <div className="grid-2 mb-15">
            <div className="admin-card text-center" style={{ padding: '2rem 1rem', background: 'linear-gradient(135deg, rgba(192,192,192,0.05), transparent)', borderTop: '3px solid #c0c0c0', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', color: 'var(--status-red)', background: 'rgba(231,76,60,0.1)', padding: '0.2rem 0.5rem', borderRadius: '12px', fontWeight: 600 }}>
                <span style={{ background: 'var(--status-red)', width: '6px', height: '6px', borderRadius: '50%', display: 'inline-block' }}></span> LIVE
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Silver Rate (99.9%)</div>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '2rem', color: '#c0c0c0' }}>₹</span>
                <input type="number" value={localRates.silver} onChange={e => setLocalRates({ ...localRates, silver: Number(e.target.value) })}
                  style={{ width: '100px', fontSize: '2.5rem', fontWeight: 800, padding: '0', background: 'transparent', border: 'none', color: '#c0c0c0', textAlign: 'center', outline: 'none' }} />
                <span style={{ fontSize: '1rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>/g</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--status-red)' }}>▼ -₹0.50 (0.60%) Today</div>
            </div>

            <div className="admin-card text-center" style={{ padding: '2rem 1rem', background: 'linear-gradient(135deg, rgba(136,204,255,0.05), transparent)', borderTop: '3px solid #88ccff', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '0.7rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '12px', fontWeight: 600 }}>
                MARKET CLOSED
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Diamond Base Rate (1ct)</div>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '2rem', color: '#88ccff' }}>₹</span>
                <input type="number" value={localRates.diamond} onChange={e => setLocalRates({ ...localRates, diamond: Number(e.target.value) })}
                  style={{ width: '180px', fontSize: '2.5rem', fontWeight: 800, padding: '0', background: 'transparent', border: 'none', color: '#88ccff', textAlign: 'center', outline: 'none' }} />
                <span style={{ fontSize: '1rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>/ct</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No change (0.00%) Today</div>
            </div>
          </div>

          {/* Making Charges + API Config */}
          <div className="grid-2 mb-15">
            <div className="admin-card">
              <h3 className="card-title" style={{ marginBottom: '1.5rem' }}>Global Making Charges</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Configure the baseline making charge percentage applied across different product categories.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  ['Plain Gold Jewellery', 'plain'],
                  ['Antique & Temple Jewellery', 'antique'],
                  ['Kundan & Polki', 'kundan'],
                  ['Platinum Jewellery', 'platinum'],
                ].map(([name, key]) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ flex: 1, color: 'var(--text-secondary)' }}>{name}</div>
                    <input type="number" value={localMakingCharges[key]}
                      onChange={e => setLocalMakingCharges({ ...localMakingCharges, [key]: Number(e.target.value) })}
                      className="form-input" style={{ width: '80px', textAlign: 'right' }} />
                    <span style={{ color: 'var(--text-muted)' }}>%</span>
                  </div>
                ))}
              </div>
              <button className="btn btn-gold" onClick={handleUpdateMakingCharges}
                style={{ marginTop: '2rem', width: '100%', padding: '1rem', fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>
                Update Pricing Rules
              </button>
            </div>

            <div className="admin-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <h3 className="card-title" style={{ marginBottom: '1rem' }}>Live API Configuration</h3>
              <div style={{ padding: '1rem', background: 'var(--surface)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Current Provider</div>
                <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  MCX India (Multi Commodity Exchange) <span className="badge badge-success">Connected</span>
                </div>
              </div>
              <div style={{ padding: '1rem', background: 'var(--surface)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Retail Markup Multiplier</div>
                <div style={{ fontWeight: 600 }}>1.025x <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>(Base MCX Rate + 2.5% Retail Margin)</span></div>
              </div>
              <div style={{ marginTop: 'auto', padding: '1.5rem', background: isAutoPricingEnabled ? 'rgba(46,204,113,0.05)' : 'rgba(255,255,255,0.05)', border: `1px dashed ${isAutoPricingEnabled ? 'var(--status-green)' : 'var(--border-color)'}`, borderRadius: '8px', textAlign: 'center' }}>
                <Coins size={32} color={isAutoPricingEnabled ? 'var(--status-green)' : 'var(--text-muted)'} style={{ marginBottom: '1rem' }} />
                <h4 style={{ margin: '0 0 0.5rem 0', color: isAutoPricingEnabled ? 'var(--status-green)' : 'var(--text-primary)' }}>
                  Dynamic Auto-Pricing: {isAutoPricingEnabled ? 'ACTIVE' : 'PAUSED'}
                </h4>
                <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {isAutoPricingEnabled
                    ? 'All website product prices are recalculating automatically every 15 minutes based on these parameters.'
                    : 'Auto-recalculation is paused. Prices remain static until manually synced.'}
                </p>
                <button className={`btn ${isAutoPricingEnabled ? 'btn-outline' : 'btn-gold'}`} onClick={toggleAutoPricing}
                  style={!isAutoPricingEnabled ? { color: '#000', fontWeight: 'bold' } : {}}>
                  {isAutoPricingEnabled ? 'Pause Auto-Pricing' : 'Enable Auto-Pricing'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
