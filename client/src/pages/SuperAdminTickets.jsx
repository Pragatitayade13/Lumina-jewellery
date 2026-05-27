import React, { useState } from 'react';
import { MessageSquare, Clock, CheckCircle, AlertTriangle, Search, Eye, X, Send } from 'lucide-react';

const TICKETS = [
  { id:'TKT-001', store:'Maison Auriel',    user:'Amara Singh',   subject:'Invoice PDF not generating',          priority:'High',   status:'Open',       created:'2024-08-12', category:'Billing'     },
  { id:'TKT-002', store:'Heritage Gems',    user:'Rajveer Mehra', subject:'GST report showing incorrect totals',  priority:'Medium', status:'In Progress', created:'2024-08-11', category:'Reports'     },
  { id:'TKT-003', store:'Solitaire Studio', user:'Priya Nambiar', subject:'Cannot add more than 100 items',       priority:'Low',    status:'Open',        created:'2024-08-10', category:'Inventory'   },
  { id:'TKT-004', store:'Zaveri Palace',    user:'Mahesh Shah',   subject:'Payment failed but amount deducted',   priority:'High',   status:'Resolved',    created:'2024-08-09', category:'Payment'     },
  { id:'TKT-005', store:'Kalash Jewellery', user:'Sunita Verma',  subject:'Staff unable to login after role change',priority:'High',  status:'In Progress', created:'2024-08-08', category:'Access'      },
  { id:'TKT-006', store:'Royal Gem House',  user:'Arjun Sethi',   subject:'Request to upgrade to Enterprise plan', priority:'Low',   status:'Resolved',    created:'2024-08-07', category:'Subscription'},
];

const priorityBadge = { High:'badge-red', Medium:'badge-yellow', Low:'badge-gray' };
const statusBadge   = { Open:'badge-blue', 'In Progress':'badge-yellow', Resolved:'badge-green' };
const catColor = { Billing:'#d4af37', Reports:'#a78bfa', Inventory:'#63b3ed', Payment:'#f87171', Access:'#fb923c', Subscription:'#4ade80' };

const TicketModal = ({ ticket, onClose }) => {
  const [reply, setReply] = useState('');
  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" style={{ maxWidth:600 }} onClick={e => e.stopPropagation()}>
        <div className="admin-modal-header">
          <div>
            <h2 className="admin-modal-title" style={{ fontSize:'1rem' }}>{ticket.subject}</h2>
            <div style={{ display:'flex', gap:'0.5rem', marginTop:'0.4rem' }}>
              <span className={`badge ${priorityBadge[ticket.priority]}`}>{ticket.priority}</span>
              <span className={`badge ${statusBadge[ticket.status]}`}>{ticket.status}</span>
              <span className="badge badge-gray">{ticket.category}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background:'none',border:'none',color:'rgba(232,224,208,0.5)',cursor:'pointer' }}><X size={18} /></button>
        </div>
        <div className="admin-card" style={{ marginBottom:'1rem', padding:'1rem' }}>
          <p style={{ margin:'0 0 0.25rem', fontSize:'0.75rem', color:'rgba(232,224,208,0.4)' }}>{ticket.id} · {ticket.store} · {ticket.user} · {ticket.created}</p>
          <p style={{ margin:0, color:'rgba(232,224,208,0.75)', fontSize:'0.875rem', lineHeight:1.6 }}>
            User reported: {ticket.subject}. This issue has been escalated for immediate review. The support team is currently investigating the root cause and will provide an update within 24 hours.
          </p>
        </div>
        <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:10, padding:'0.75rem', marginBottom:'1rem' }}>
          <p style={{ margin:'0 0 0.3rem', fontSize:'0.65rem', color:'rgba(232,224,208,0.35)', textTransform:'uppercase', letterSpacing:'0.1em' }}>Support Reply</p>
          <textarea className="admin-form-input" style={{ height:100, resize:'vertical', border:'none', background:'transparent', padding:0, fontSize:'0.875rem' }} placeholder="Type your response..." value={reply} onChange={e => setReply(e.target.value)} />
        </div>
        <div style={{ display:'flex', gap:'0.75rem' }}>
          <button className="admin-btn" style={{ flex:1, justifyContent:'center', background:'linear-gradient(135deg,#8463fa,#5b3fd4)', color:'#fff' }}>
            <Send size={13} /> Send Reply
          </button>
          <button className="admin-btn admin-btn-outline" style={{ justifyContent:'center' }} onClick={onClose}>
            <CheckCircle size={13} /> Mark Resolved
          </button>
        </div>
      </div>
    </div>
  );
};

const SuperAdminTickets = () => {
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState('All');
  const [selected, setSelected] = useState(null);

  const filtered = TICKETS.filter(t => {
    const matchSearch = t.subject.toLowerCase().includes(search.toLowerCase()) || t.store.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' || t.status === filter || t.priority === filter;
    return matchSearch && matchFilter;
  });

  const counts = { open:TICKETS.filter(t=>t.status==='Open').length, inProgress:TICKETS.filter(t=>t.status==='In Progress').length, resolved:TICKETS.filter(t=>t.status==='Resolved').length, high:TICKETS.filter(t=>t.priority==='High').length };

  return (
    <div className="admin-fade-in">
      <div className="page-header">
        <div><h1 className="page-title">Support Tickets</h1><p className="page-subtitle">Handle customer support and issue resolution</p></div>
      </div>

      <div className="kpi-grid" style={{ marginBottom:'1.5rem' }}>
        {[
          { label:'Open Tickets',    value:counts.open,       color:'#63b3ed' },
          { label:'In Progress',     value:counts.inProgress, color:'#facc15' },
          { label:'Resolved',        value:counts.resolved,   color:'#4ade80' },
          { label:'High Priority',   value:counts.high,       color:'#f87171' },
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
          <input placeholder="Search tickets…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display:'flex', gap:'0.4rem', flexWrap:'wrap' }}>
          {['All','Open','In Progress','Resolved','High','Medium'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding:'0.4rem 0.8rem', borderRadius:8, fontSize:'0.72rem', fontWeight:600, cursor:'pointer', border:'none', background:filter===f?'rgba(132,99,250,0.15)':'rgba(255,255,255,0.04)', color:filter===f?'#a78bfa':'rgba(232,224,208,0.4)', transition:'all 0.2s' }}>{f}</button>
          ))}
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Ticket ID</th><th>Store</th><th>Subject</th><th>Category</th><th>Priority</th><th>Created</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {filtered.map(t => (
              <tr key={t.id} style={{ cursor:'pointer' }} onClick={() => setSelected(t)}>
                <td style={{ fontFamily:'monospace', fontSize:'0.75rem', color:'rgba(167,139,250,0.7)' }}>{t.id}</td>
                <td style={{ fontWeight:600, color:'#f0ebe0', fontSize:'0.82rem' }}>{t.store}</td>
                <td style={{ fontSize:'0.82rem', maxWidth:280 }}>{t.subject}</td>
                <td><span style={{ fontSize:'0.68rem', fontWeight:700, color:catColor[t.category] }}>{t.category}</span></td>
                <td><span className={`badge ${priorityBadge[t.priority]}`}>{t.priority}</span></td>
                <td style={{ fontSize:'0.75rem', color:'rgba(232,224,208,0.4)' }}>{t.created}</td>
                <td><span className={`badge ${statusBadge[t.status]}`}>{t.status}</span></td>
                <td>
                  <button onClick={e=>{e.stopPropagation();setSelected(t)}} style={{ background:'rgba(132,99,250,0.1)', border:'1px solid rgba(132,99,250,0.2)', color:'#a78bfa', cursor:'pointer', padding:'0.25rem 0.7rem', borderRadius:6, fontSize:'0.68rem', fontWeight:700 }}>
                    Reply →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selected && <TicketModal ticket={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

export default SuperAdminTickets;
