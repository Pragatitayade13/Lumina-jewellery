import React, { useState } from 'react';
import { CreditCard, Plus, Edit2, CheckCircle, X, TrendingUp } from 'lucide-react';

const PLANS = [
  { id:'basic',      name:'Basic',       price:999,   annually:9990,   stores:18, color:'#63b3ed', features:['Up to 500 inventory items','1 user','Basic reports','Email support'] },
  { id:'pro',        name:'Pro',         price:2499,  annually:24990,  stores:34, color:'#a78bfa', features:['Unlimited inventory','5 users','Advanced analytics','POS & Billing','GST reports','Priority support'] },
  { id:'enterprise', name:'Enterprise',  price:5999,  annually:59990,  stores:12, color:'#d4af37', features:['Everything in Pro','Unlimited users','Multi-location','API access','Custom integrations','Dedicated account manager'] },
];

const RECENT_SUBS = [
  { store:'Maison Auriel',    plan:'Enterprise', amount:'₹5,999', date:'2024-08-01', status:'Active',  next:'2024-09-01' },
  { store:'Heritage Gems',    plan:'Pro',        amount:'₹2,499', date:'2024-08-05', status:'Active',  next:'2024-09-05' },
  { store:'Solitaire Studio', plan:'Basic',      amount:'₹0',     date:'2024-08-01', status:'Trial',   next:'2024-08-31' },
  { store:'Navratna Jewels',  plan:'Basic',      amount:'₹999',   date:'2024-07-01', status:'Expired', next:'Expired'    },
  { store:'Zaveri Palace',    plan:'Pro',        amount:'₹2,499', date:'2024-07-15', status:'Active',  next:'2024-09-15' },
];

const EditPlanModal = ({ plan, onClose }) => {
  const [price, setPrice] = useState(plan.price);
  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={e => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h2 className="admin-modal-title">Edit Plan: {plan.name}</h2>
          <button onClick={onClose} style={{ background:'none',border:'none',color:'rgba(232,224,208,0.5)',cursor:'pointer' }}><X size={18} /></button>
        </div>
        <div className="admin-form-group">
          <label className="admin-form-label">Monthly Price (₹)</label>
          <input className="admin-form-input" type="number" value={price} onChange={e => setPrice(e.target.value)} />
        </div>
        <div className="admin-form-group">
          <label className="admin-form-label">Annual Price (₹)</label>
          <input className="admin-form-input" type="number" defaultValue={plan.annually} />
        </div>
        <div className="admin-form-group">
          <label className="admin-form-label">Features (one per line)</label>
          <textarea className="admin-form-input" rows={5} defaultValue={plan.features.join('\n')} style={{ resize:'vertical', fontFamily:'monospace' }} />
        </div>
        <div style={{ display:'flex', gap:'0.75rem', marginTop:'0.5rem' }}>
          <button className="admin-btn" style={{ flex:1, justifyContent:'center', background:'linear-gradient(135deg,#8463fa,#5b3fd4)', color:'#fff' }}>Save Changes</button>
          <button className="admin-btn admin-btn-outline" style={{ flex:1, justifyContent:'center' }} onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

const SuperAdminSubscriptions = () => {
  const [editPlan, setEditPlan] = useState(null);
  const mrr = PLANS.reduce((sum, p) => sum + p.price * p.stores, 0);

  return (
    <div className="admin-fade-in">
      <div className="page-header">
        <div><h1 className="page-title">Subscriptions</h1><p className="page-subtitle">Manage SaaS plans, pricing and billing</p></div>
        <button className="admin-btn" style={{ background:'linear-gradient(135deg,#8463fa,#5b3fd4)', color:'#fff' }}>
          <Plus size={14} /> Create Plan
        </button>
      </div>

      {/* MRR Summary */}
      <div className="kpi-grid" style={{ marginBottom:'1.75rem' }}>
        {[
          { label:'Total MRR',      value:`₹${(mrr/1000).toFixed(1)}K`,   sub:'Monthly recurring revenue'   },
          { label:'Annual ARR',     value:`₹${(mrr*12/100000).toFixed(1)}L`, sub:'Annualized run rate'         },
          { label:'Paying Stores',  value:`${PLANS.reduce((s,p)=>s+p.stores,0)}`, sub:'Across all plans'    },
          { label:'Avg Revenue',    value:`₹${Math.round(mrr/64).toLocaleString()}`, sub:'Per store / month' },
        ].map(k => (
          <div key={k.label} className="kpi-card-admin">
            <p className="kpi-label-admin">{k.label}</p>
            <p className="kpi-value-admin" style={{ color:'#a78bfa' }}>{k.value}</p>
            <span style={{ fontSize:'0.68rem', color:'rgba(232,224,208,0.35)' }}>{k.sub}</span>
          </div>
        ))}
      </div>

      {/* Plan Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1.5rem', marginBottom:'2rem' }}>
        {PLANS.map(plan => (
          <div key={plan.id} className="admin-card" style={{ border:`1px solid ${plan.color}22`, background:`rgba(${plan.color === '#d4af37' ? '212,175,55' : plan.color === '#a78bfa' ? '167,139,250' : '99,179,237'},0.04)` }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.25rem' }}>
              <div>
                <p style={{ margin:0, fontSize:'0.65rem', fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:plan.color }}>{plan.name}</p>
                <p style={{ margin:'0.3rem 0 0', fontFamily:'Playfair Display,serif', fontSize:'2rem', fontWeight:800, color:'#f0ebe0' }}>₹{plan.price.toLocaleString()}<span style={{ fontSize:'0.85rem', fontWeight:500, color:'rgba(232,224,208,0.4)' }}>/mo</span></p>
              </div>
              <button onClick={() => setEditPlan(plan)} style={{ background:'none', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, color:'rgba(232,224,208,0.5)', cursor:'pointer', padding:'0.4rem 0.65rem' }}>
                <Edit2 size={13} />
              </button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem', marginBottom:'1.25rem' }}>
              {plan.features.map(f => (
                <div key={f} style={{ display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'0.8rem', color:'rgba(232,224,208,0.65)' }}>
                  <CheckCircle size={12} style={{ color:plan.color, flexShrink:0 }} />{f}
                </div>
              ))}
            </div>
            <div className="admin-divider" style={{ margin:'0 0 1rem' }} />
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <p style={{ margin:0, fontSize:'0.65rem', color:'rgba(232,224,208,0.35)', textTransform:'uppercase', letterSpacing:'0.08em' }}>Active stores</p>
                <p style={{ margin:0, fontSize:'1.5rem', fontWeight:800, color:plan.color, fontFamily:'Playfair Display,serif' }}>{plan.stores}</p>
              </div>
              <div style={{ textAlign:'right' }}>
                <p style={{ margin:0, fontSize:'0.65rem', color:'rgba(232,224,208,0.35)', textTransform:'uppercase', letterSpacing:'0.08em' }}>Plan MRR</p>
                <p style={{ margin:0, fontSize:'1rem', fontWeight:700, color:'#f3d078' }}>₹{(plan.price*plan.stores).toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Subscriptions */}
      <div className="chart-card">
        <div className="chart-header">
          <h3 className="chart-title">Recent Subscription Activity</h3>
        </div>
        <div className="admin-table-wrap" style={{ border:'none' }}>
          <table className="admin-table">
            <thead><tr><th>Store</th><th>Plan</th><th>Amount</th><th>Payment Date</th><th>Next Renewal</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {RECENT_SUBS.map((s, i) => (
                <tr key={i}>
                  <td style={{ fontWeight:700, color:'#f0ebe0' }}>{s.store}</td>
                  <td><span className={`badge ${s.plan==='Enterprise'?'badge-gold':s.plan==='Pro'?'badge-blue':'badge-gray'}`}>{s.plan}</span></td>
                  <td style={{ fontWeight:700, color:'#f3d078' }}>{s.amount}</td>
                  <td style={{ fontSize:'0.8rem', color:'rgba(232,224,208,0.5)' }}>{s.date}</td>
                  <td style={{ fontSize:'0.8rem', color: s.next==='Expired'?'#f87171':'rgba(232,224,208,0.5)' }}>{s.next}</td>
                  <td><span className={`badge ${s.status==='Active'?'badge-green':s.status==='Trial'?'badge-yellow':'badge-red'}`}>{s.status}</span></td>
                  <td>
                    <div style={{ display:'flex', gap:'0.4rem' }}>
                      <button style={{ background:'rgba(132,99,250,0.1)', border:'1px solid rgba(132,99,250,0.2)', color:'#a78bfa', cursor:'pointer', padding:'0.2rem 0.6rem', borderRadius:6, fontSize:'0.65rem', fontWeight:700 }}>Upgrade</button>
                      {s.status==='Expired' && <button style={{ background:'rgba(74,222,128,0.1)', border:'1px solid rgba(74,222,128,0.2)', color:'#4ade80', cursor:'pointer', padding:'0.2rem 0.6rem', borderRadius:6, fontSize:'0.65rem', fontWeight:700 }}>Renew</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {editPlan && <EditPlanModal plan={editPlan} onClose={() => setEditPlan(null)} />}
    </div>
  );
};

export default SuperAdminSubscriptions;
