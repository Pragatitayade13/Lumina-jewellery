import React, { useState } from 'react';
import { Plus, Search, Eye, Edit2, X, ChevronRight, Clock, CheckCircle, Truck } from 'lucide-react';

const STAGES = ['Enquiry', 'Design', 'Manufacturing', 'Quality Check', 'Ready', 'Delivered'];

const ORDERS = [
  { id:'ORD-001', customer:'Kavya Reddy',   phone:'+91 98765 11111', item:'Bridal Gold Set (22K)',      weight:'82g',  advance:'₹80,000', total:'₹2,40,000', balance:'₹1,60,000', stage:4, created:'2024-07-15', due:'2024-09-01', notes:'Design approved. Hallmarking pending.', designer:'Ravi Kumar' },
  { id:'ORD-002', customer:'Arun Nair',     phone:'+91 98765 22222', item:'Diamond Solitaire Ring',     weight:'4.5g', advance:'₹50,000', total:'₹1,85,000', balance:'₹1,35,000', stage:2, created:'2024-08-01', due:'2024-09-15', notes:'Customer approved sketch.',             designer:'Meena S'    },
  { id:'ORD-003', customer:'Pooja Mehta',   phone:'+91 98765 33333', item:'Gold Chain Necklace (18K)',  weight:'35g',  advance:'₹25,000', total:'₹68,000',   balance:'₹43,000',   stage:5, created:'2024-07-20', due:'2024-08-25', notes:'Ready for delivery.',                   designer:'Vijay P'    },
  { id:'ORD-004', customer:'Sanjay Gupta',  phone:'+91 98765 44444', item:'Silver Temple Jewellery',   weight:'120g', advance:'₹10,000', total:'₹32,000',   balance:'₹22,000',   stage:1, created:'2024-08-10', due:'2024-09-30', notes:'Design consultation in progress.',      designer:'Meena S'    },
  { id:'ORD-005', customer:'Lakshmi Iyer',  phone:'+91 98765 55555', item:'Emerald Pendant (22K)',      weight:'8g',   advance:'₹30,000', total:'₹95,000',   balance:'₹65,000',   stage:3, created:'2024-08-05', due:'2024-09-10', notes:'Stone sourced. Setting in progress.',   designer:'Ravi Kumar' },
];

const stageColor = ['#63b3ed','#a78bfa','#facc15','#fb923c','#4ade80','#d4af37'];
const stageIcon  = [Clock, Edit2, Truck, Eye, CheckCircle, CheckCircle];

const OrderModal = ({ order, onClose }) => {
  const [stage, setStage] = useState(order.stage);
  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" style={{ maxWidth:640 }} onClick={e => e.stopPropagation()}>
        <div className="admin-modal-header">
          <div>
            <h2 className="admin-modal-title">{order.item}</h2>
            <p style={{ margin:'0.2rem 0 0', fontSize:'0.78rem', color:'rgba(232,224,208,0.4)' }}>{order.id} · {order.customer}</p>
          </div>
          <button onClick={onClose} style={{ background:'none',border:'none',color:'rgba(232,224,208,0.5)',cursor:'pointer' }}><X size={18} /></button>
        </div>

        {/* Progress Stepper */}
        <div style={{ marginBottom:'1.5rem' }}>
          <p style={{ margin:'0 0 0.75rem', fontSize:'0.65rem', color:'rgba(232,224,208,0.35)', textTransform:'uppercase', letterSpacing:'0.1em' }}>Order Progress</p>
          <div style={{ display:'flex', alignItems:'center' }}>
            {STAGES.map((s, i) => {
              const Icon = stageIcon[i];
              const active = i === stage;
              const done   = i < stage;
              return (
                <React.Fragment key={s}>
                  <div onClick={() => setStage(i)} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'0.4rem', cursor:'pointer', flex:1 }}>
                    <div style={{ width:32, height:32, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', background:done?stageColor[i]:active?stageColor[i]:'rgba(255,255,255,0.06)', border:`2px solid ${done||active?stageColor[i]:'rgba(255,255,255,0.1)'}`, transition:'all 0.2s' }}>
                      <Icon size={13} style={{ color:done||active?'#0a0a0c':'rgba(232,224,208,0.3)' }} />
                    </div>
                    <span style={{ fontSize:'0.58rem', color:active?stageColor[i]:'rgba(232,224,208,0.3)', fontWeight:active?700:400, textAlign:'center', letterSpacing:'0.04em' }}>{s}</span>
                  </div>
                  {i < STAGES.length - 1 && <div style={{ height:2, flex:0.5, background:i < stage?stageColor[i]:'rgba(255,255,255,0.08)', transition:'background 0.3s', minWidth:10 }} />}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem' }}>
          {[
            { label:'Item',      value:order.item     },
            { label:'Weight',    value:order.weight   },
            { label:'Designer',  value:order.designer },
            { label:'Due Date',  value:order.due      },
            { label:'Total',     value:order.total    },
            { label:'Advance',   value:order.advance  },
            { label:'Balance Due',value:order.balance },
            { label:'Phone',     value:order.phone    },
          ].map(f => (
            <div key={f.label} style={{ background:'rgba(255,255,255,0.02)', borderRadius:10, padding:'0.75rem 1rem', border:'1px solid rgba(255,255,255,0.06)' }}>
              <p style={{ margin:0, fontSize:'0.65rem', color:'rgba(232,224,208,0.35)', textTransform:'uppercase', letterSpacing:'0.08em' }}>{f.label}</p>
              <p style={{ margin:'0.2rem 0 0', fontWeight:700, color:f.label.includes('Balance')?'#f87171':f.label.includes('Total')||f.label.includes('Advance')?'#f3d078':'#f0ebe0', fontSize:'0.875rem' }}>{f.value}</p>
            </div>
          ))}
        </div>

        <div className="admin-form-group" style={{ marginBottom:'1rem' }}>
          <label className="admin-form-label">Order Notes</label>
          <textarea className="admin-form-input" rows={2} defaultValue={order.notes} style={{ resize:'none' }} />
        </div>

        <div style={{ display:'flex', gap:'0.75rem' }}>
          <button className="admin-btn admin-btn-gold" style={{ flex:1, justifyContent:'center' }}>Save Progress</button>
          <button className="admin-btn admin-btn-outline" style={{ flex:1, justifyContent:'center' }}>Print Order Sheet</button>
          <button className="admin-btn admin-btn-outline" style={{ justifyContent:'center' }} onClick={onClose}>✕</button>
        </div>
      </div>
    </div>
  );
};

const Orders = () => {
  const [search,   setSearch]   = useState('');
  const [stageFilter, setStageFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);

  const filtered = ORDERS.filter(o => {
    const matchSearch = o.customer.toLowerCase().includes(search.toLowerCase()) || o.item.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase());
    const matchStage  = stageFilter === 'All' || STAGES[o.stage] === stageFilter;
    return matchSearch && matchStage;
  });

  const stageCount = STAGES.map((_, i) => ORDERS.filter(o => o.stage === i).length);
  const totalAdvance = ORDERS.reduce((s, o) => s + parseInt(o.advance.replace(/[₹,]/g, '')), 0);
  const totalBalance = ORDERS.reduce((s, o) => s + parseInt(o.balance.replace(/[₹,]/g, '')), 0);

  return (
    <div className="admin-fade-in">
      <div className="page-header">
        <div><h1 className="page-title">Custom Orders</h1><p className="page-subtitle">Track bespoke orders from design to delivery</p></div>
        <button className="admin-btn admin-btn-gold" onClick={() => setShowForm(true)}>
          <Plus size={14} /> New Order
        </button>
      </div>

      <div className="kpi-grid" style={{ marginBottom:'1.5rem' }}>
        {[
          { label:'Total Orders',    value:ORDERS.length,                      color:'#f3d078' },
          { label:'In Progress',     value:ORDERS.filter(o=>o.stage>0&&o.stage<5).length, color:'#facc15' },
          { label:'Ready/Delivered', value:ORDERS.filter(o=>o.stage>=4).length, color:'#4ade80' },
          { label:'Balance Due',     value:`₹${(totalBalance/1000).toFixed(0)}K`, color:'#f87171' },
        ].map(k => (
          <div key={k.label} className="kpi-card-admin">
            <p className="kpi-label-admin">{k.label}</p>
            <p className="kpi-value-admin" style={{ color:k.color }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Stage Filter Tabs */}
      <div style={{ display:'flex', gap:'0.4rem', marginBottom:'1.25rem', flexWrap:'wrap' }}>
        <button onClick={() => setStageFilter('All')} style={{ padding:'0.4rem 0.9rem', borderRadius:8, fontSize:'0.72rem', fontWeight:600, cursor:'pointer', border:'none', background:stageFilter==='All'?'rgba(212,175,55,0.15)':'rgba(255,255,255,0.04)', color:stageFilter==='All'?'#d4af37':'rgba(232,224,208,0.4)', transition:'all 0.2s' }}>All ({ORDERS.length})</button>
        {STAGES.map((s, i) => (
          <button key={s} onClick={() => setStageFilter(s)} style={{ padding:'0.4rem 0.9rem', borderRadius:8, fontSize:'0.72rem', fontWeight:600, cursor:'pointer', border:'none', background:stageFilter===s?`${stageColor[i]}22`:'rgba(255,255,255,0.04)', color:stageFilter===s?stageColor[i]:'rgba(232,224,208,0.4)', transition:'all 0.2s' }}>
            {s} ({stageCount[i]})
          </button>
        ))}
        <div className="admin-search" style={{ marginLeft:'auto', maxWidth:240 }}>
          <Search size={13} style={{ color:'rgba(232,224,208,0.35)',flexShrink:0 }} />
          <input placeholder="Search orders…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:'0.85rem' }}>
        {filtered.map(order => {
          const Icon = stageIcon[order.stage];
          return (
            <div key={order.id} className="admin-card" style={{ padding:'1.1rem 1.5rem', cursor:'pointer', transition:'border-color 0.2s, transform 0.2s', display:'flex', alignItems:'center', gap:'1.5rem' }} onClick={() => setSelected(order)}>
              {/* Stage badge */}
              <div style={{ width:44, height:44, borderRadius:12, background:`${stageColor[order.stage]}15`, border:`1px solid ${stageColor[order.stage]}30`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Icon size={18} style={{ color:stageColor[order.stage] }} />
              </div>

              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.35rem' }}>
                  <span style={{ fontFamily:'monospace', fontSize:'0.72rem', color:'rgba(212,175,55,0.6)' }}>{order.id}</span>
                  <span style={{ fontSize:'0.85rem', fontWeight:700, color:'#f0ebe0' }}>{order.customer}</span>
                  <span className="badge badge-gray" style={{ fontSize:'0.6rem' }}>{STAGES[order.stage]}</span>
                </div>
                <p style={{ margin:0, fontSize:'0.82rem', color:'rgba(232,224,208,0.6)' }}>{order.item} · {order.weight} · Designer: {order.designer}</p>
              </div>

              {/* Progress bar */}
              <div style={{ width:140, flexShrink:0 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.3rem' }}>
                  <span style={{ fontSize:'0.65rem', color:'rgba(232,224,208,0.35)' }}>Progress</span>
                  <span style={{ fontSize:'0.65rem', color:stageColor[order.stage] }}>{Math.round((order.stage/5)*100)}%</span>
                </div>
                <div style={{ height:5, background:'rgba(255,255,255,0.06)', borderRadius:3, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${(order.stage/5)*100}%`, background:stageColor[order.stage], borderRadius:3, transition:'width 0.5s' }} />
                </div>
              </div>

              <div style={{ textAlign:'right', flexShrink:0 }}>
                <p style={{ margin:0, fontWeight:800, color:'#f3d078', fontFamily:'Playfair Display,serif', fontSize:'1rem' }}>{order.total}</p>
                <p style={{ margin:'0.15rem 0 0', fontSize:'0.7rem', color:'#f87171' }}>Bal: {order.balance}</p>
              </div>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', flexShrink:0 }}>
                <p style={{ margin:0, fontSize:'0.7rem', color:'rgba(232,224,208,0.35)' }}>Due</p>
                <p style={{ margin:0, fontSize:'0.78rem', fontWeight:600, color:'rgba(232,224,208,0.7)' }}>{order.due}</p>
              </div>
              <ChevronRight size={16} style={{ color:'rgba(232,224,208,0.2)', flexShrink:0 }} />
            </div>
          );
        })}
      </div>

      {selected && <OrderModal order={selected} onClose={() => setSelected(null)} />}

      {showForm && (
        <div className="admin-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="admin-modal" style={{ maxWidth:580 }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">New Custom Order</h2>
              <button onClick={() => setShowForm(false)} style={{ background:'none',border:'none',color:'rgba(232,224,208,0.5)',cursor:'pointer' }}><X size={18} /></button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
              {[
                { label:'Customer Name',  ph:'Enter customer name',       type:'text'   },
                { label:'Phone Number',   ph:'+91 XXXXX XXXXX',           type:'tel'    },
                { label:'Item Description',ph:'e.g. Bridal Gold Necklace',type:'text'   },
                { label:'Metal Type',     ph:'Gold / Silver / Platinum',  type:'text'   },
                { label:'Karat/Purity',   ph:'22K / 18K / 999',           type:'text'   },
                { label:'Approx Weight',  ph:'Weight in grams',           type:'text'   },
                { label:'Estimated Total',ph:'₹',                         type:'text'   },
                { label:'Advance Paid',   ph:'₹',                         type:'text'   },
                { label:'Due Date',       ph:'',                          type:'date'   },
                { label:'Assigned Designer',ph:'Designer name',           type:'text'   },
              ].map(f => (
                <div key={f.label} className="admin-form-group" style={{ marginBottom:0 }}>
                  <label className="admin-form-label">{f.label}</label>
                  <input className="admin-form-input" type={f.type} placeholder={f.ph} />
                </div>
              ))}
            </div>
            <div className="admin-form-group" style={{ marginTop:'1rem' }}>
              <label className="admin-form-label">Special Notes / Design Instructions</label>
              <textarea className="admin-form-input" rows={3} style={{ resize:'none' }} placeholder="Describe the design requirements, customer preferences, stone specifications…" />
            </div>
            <div style={{ display:'flex', gap:'0.75rem', marginTop:'0.5rem' }}>
              <button className="admin-btn admin-btn-gold" style={{ flex:1, justifyContent:'center' }}>Create Order</button>
              <button className="admin-btn admin-btn-outline" onClick={() => setShowForm(false)} style={{ flex:1, justifyContent:'center' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
