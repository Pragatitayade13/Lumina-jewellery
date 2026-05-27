import React, { useState } from 'react';
import { Search, Plus, Eye, CheckCircle, XCircle, Clock, Store, Filter } from 'lucide-react';

const ALL_STORES = [
  { id:'STR-001', name:'Maison Auriel',       owner:'Amara Singh',    email:'amara@maisonauriel.com',  phone:'+91 98765 11111', plan:'Enterprise', status:'Active',   revenue:'₹42.5L', users:12, joined:'2024-01-12', city:'Mumbai'    },
  { id:'STR-002', name:'Heritage Gems Co.',   owner:'Rajveer Mehra',  email:'raj@heritagegems.com',    phone:'+91 98765 22222', plan:'Pro',        status:'Active',   revenue:'₹18.2L', users:5,  joined:'2024-02-28', city:'Delhi'     },
  { id:'STR-003', name:'Solitaire Studio',    owner:'Priya Nambiar',  email:'priya@solitaire.in',      phone:'+91 98765 33333', plan:'Basic',      status:'Trial',    revenue:'₹3.1L',  users:2,  joined:'2024-08-01', city:'Kochi'     },
  { id:'STR-004', name:'Zaveri Palace',       owner:'Mahesh Shah',    email:'mahesh@zaveri.in',        phone:'+91 98765 44444', plan:'Pro',        status:'Active',   revenue:'₹22.8L', users:8,  joined:'2024-03-15', city:'Surat'     },
  { id:'STR-005', name:'Navratna Jewels',     owner:'Kavita Rao',     email:'kavita@navratna.com',     phone:'+91 98765 55555', plan:'Basic',      status:'Expired',  revenue:'₹1.8L',  users:1,  joined:'2024-05-20', city:'Hyderabad' },
  { id:'STR-006', name:'Royal Gem House',     owner:'Arjun Sethi',    email:'arjun@royalgem.in',       phone:'+91 98765 66666', plan:'Enterprise', status:'Active',   revenue:'₹38.1L', users:15, joined:'2023-11-01', city:'Chennai'   },
  { id:'STR-007', name:'Kalash Jewellery',    owner:'Sunita Verma',   email:'sunita@kalash.in',        phone:'+91 98765 77777', plan:'Pro',        status:'Active',   revenue:'₹9.4L',  users:4,  joined:'2024-04-10', city:'Jaipur'    },
  { id:'STR-008', name:'Diamond Palace',      owner:'Ravi Kumar',     email:'ravi@diamondpalace.com',  phone:'+91 98765 88888', plan:'Basic',      status:'Pending',  revenue:'₹0',     users:1,  joined:'2024-08-12', city:'Bengaluru' },
];

const planBadge   = { Enterprise:'badge-gold',   Pro:'badge-blue',   Basic:'badge-gray'  };
const statusBadge = { Active:'badge-green', Trial:'badge-yellow', Expired:'badge-red', Pending:'badge-blue' };

const StoreDetailModal = ({ store, onClose }) => (
  <div className="admin-modal-overlay" onClick={onClose}>
    <div className="admin-modal" style={{ maxWidth:580 }} onClick={e => e.stopPropagation()}>
      <div className="admin-modal-header">
        <h2 className="admin-modal-title">{store.name}</h2>
        <button onClick={onClose} style={{ background:'none',border:'none',color:'rgba(232,224,208,0.5)',cursor:'pointer' }}>✕</button>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1.5rem' }}>
        {[
          { label:'Store ID',   value:store.id       },
          { label:'Plan',       value:store.plan      },
          { label:'Owner',      value:store.owner     },
          { label:'City',       value:store.city      },
          { label:'Email',      value:store.email     },
          { label:'Phone',      value:store.phone     },
          { label:'Revenue',    value:store.revenue   },
          { label:'Team Size',  value:`${store.users} users` },
        ].map(f => (
          <div key={f.label} className="admin-card" style={{ padding:'0.85rem 1rem' }}>
            <p className="kpi-label-admin">{f.label}</p>
            <p style={{ margin:0, color:'#f0ebe0', fontWeight:600, fontSize:'0.9rem' }}>{f.value}</p>
          </div>
        ))}
      </div>
      <div style={{ display:'flex', gap:'0.75rem' }}>
        {store.status !== 'Active' && (
          <button className="admin-btn admin-btn-gold" style={{ flex:1, justifyContent:'center' }}>
            <CheckCircle size={14} /> Activate Store
          </button>
        )}
        {store.status === 'Active' && (
          <button className="admin-btn admin-btn-danger" style={{ flex:1, justifyContent:'center' }}>
            <XCircle size={14} /> Deactivate
          </button>
        )}
        <button className="admin-btn admin-btn-outline" style={{ flex:1, justifyContent:'center' }}>
          Impersonate Admin →
        </button>
      </div>
    </div>
  </div>
);

const SuperAdminStores = () => {
  const [search, setSearch]   = useState('');
  const [status, setStatus]   = useState('All');
  const [plan,   setPlan]     = useState('All');
  const [selected, setSelected] = useState(null);

  const filtered = ALL_STORES.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.owner.toLowerCase().includes(search.toLowerCase()) || s.city.toLowerCase().includes(search.toLowerCase());
    const matchStatus = status === 'All' || s.status === status;
    const matchPlan   = plan   === 'All' || s.plan   === plan;
    return matchSearch && matchStatus && matchPlan;
  });

  const counts = { total: ALL_STORES.length, active: ALL_STORES.filter(s=>s.status==='Active').length, trial: ALL_STORES.filter(s=>s.status==='Trial').length, pending: ALL_STORES.filter(s=>s.status==='Pending').length };

  return (
    <div className="admin-fade-in">
      <div className="page-header">
        <div><h1 className="page-title">All Stores</h1><p className="page-subtitle">Manage registered jewellery businesses on the platform</p></div>
        <button className="admin-btn" style={{ background:'linear-gradient(135deg,#8463fa,#5b3fd4)', color:'#fff' }}>
          <Plus size={14} /> Register Store
        </button>
      </div>

      <div className="kpi-grid" style={{ marginBottom:'1.5rem' }}>
        {[
          { label:'Total Stores', value:counts.total,   color:'#a78bfa' },
          { label:'Active',       value:counts.active,  color:'#4ade80' },
          { label:'On Trial',     value:counts.trial,   color:'#facc15' },
          { label:'Pending Approval', value:counts.pending, color:'#63b3ed' },
        ].map(k => (
          <div key={k.label} className="kpi-card-admin">
            <p className="kpi-label-admin">{k.label}</p>
            <p className="kpi-value-admin" style={{ color:k.color }}>{k.value}</p>
          </div>
        ))}
      </div>

      <div style={{ display:'flex', gap:'0.75rem', marginBottom:'1.25rem', flexWrap:'wrap', alignItems:'center' }}>
        <div className="admin-search">
          <Search size={13} style={{ color:'rgba(232,224,208,0.35)',flexShrink:0 }} />
          <input placeholder="Search by name, owner, city…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display:'flex', gap:'0.4rem' }}>
          {['All','Active','Trial','Expired','Pending'].map(s => (
            <button key={s} onClick={() => setStatus(s)} style={{ padding:'0.4rem 0.8rem', borderRadius:8, fontSize:'0.72rem', fontWeight:600, cursor:'pointer', border:'none', background:status===s?'rgba(132,99,250,0.15)':'rgba(255,255,255,0.04)', color:status===s?'#a78bfa':'rgba(232,224,208,0.4)', transition:'all 0.2s' }}>{s}</button>
          ))}
        </div>
        <div style={{ display:'flex', gap:'0.4rem' }}>
          {['All','Enterprise','Pro','Basic'].map(p => (
            <button key={p} onClick={() => setPlan(p)} style={{ padding:'0.4rem 0.8rem', borderRadius:8, fontSize:'0.72rem', fontWeight:600, cursor:'pointer', border:'none', background:plan===p?'rgba(212,175,55,0.15)':'rgba(255,255,255,0.04)', color:plan===p?'#d4af37':'rgba(232,224,208,0.4)', transition:'all 0.2s' }}>{p}</button>
          ))}
        </div>
        <span style={{ marginLeft:'auto', fontSize:'0.78rem', color:'rgba(232,224,208,0.35)' }}>{filtered.length} stores</span>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>Store ID</th><th>Business</th><th>Owner</th><th>City</th><th>Plan</th><th>Revenue</th><th>Team</th><th>Joined</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id} style={{ cursor:'pointer' }} onClick={() => setSelected(s)}>
                <td style={{ fontFamily:'monospace', fontSize:'0.75rem', color:'rgba(167,139,250,0.7)' }}>{s.id}</td>
                <td style={{ fontWeight:700, color:'#f0ebe0' }}>{s.name}</td>
                <td style={{ fontSize:'0.82rem' }}>{s.owner}</td>
                <td style={{ fontSize:'0.8rem', color:'rgba(232,224,208,0.5)' }}>{s.city}</td>
                <td><span className={`badge ${planBadge[s.plan]}`}>{s.plan}</span></td>
                <td style={{ fontWeight:700, color:'#f3d078' }}>{s.revenue}</td>
                <td style={{ fontSize:'0.82rem' }}>{s.users}</td>
                <td style={{ fontSize:'0.75rem', color:'rgba(232,224,208,0.4)' }}>{s.joined}</td>
                <td><span className={`badge ${statusBadge[s.status]}`}>{s.status}</span></td>
                <td>
                  <div style={{ display:'flex', gap:'0.4rem' }}>
                    <button onClick={e=>{e.stopPropagation();setSelected(s)}} style={{ background:'none', border:'none', color:'rgba(167,139,250,0.6)', cursor:'pointer', padding:4, borderRadius:6 }}><Eye size={14} /></button>
                    {s.status === 'Pending' && (
                      <button onClick={e=>e.stopPropagation()} style={{ background:'rgba(74,222,128,0.1)', border:'1px solid rgba(74,222,128,0.2)', color:'#4ade80', cursor:'pointer', padding:'0.2rem 0.6rem', borderRadius:6, fontSize:'0.65rem', fontWeight:700 }}>Approve</button>
                    )}
                    {s.status === 'Active' && (
                      <button onClick={e=>e.stopPropagation()} style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.15)', color:'#f87171', cursor:'pointer', padding:'0.2rem 0.6rem', borderRadius:6, fontSize:'0.65rem', fontWeight:700 }}>Deactivate</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selected && <StoreDetailModal store={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

export default SuperAdminStores;
