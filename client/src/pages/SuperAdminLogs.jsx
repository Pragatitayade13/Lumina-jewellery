import React, { useState } from 'react';
import { Activity, Server, Cpu, HardDrive, Clock, Search, RefreshCw } from 'lucide-react';

const LOGS = [
  { time:'16:47:02', level:'INFO',    service:'API',      msg:'POST /api/auth/login — STR-002 — 201 OK (124ms)',       ip:'192.168.1.42'  },
  { time:'16:46:55', level:'WARNING', service:'DB',       msg:'Slow query detected: inventory.findAll (1842ms)',         ip:'Internal'      },
  { time:'16:45:30', level:'INFO',    service:'Billing',  msg:'Subscription renewed: STR-004 (Pro) ₹2,499',            ip:'System'        },
  { time:'16:44:12', level:'ERROR',   service:'PDF',      msg:'Invoice generation failed — STR-001 — timeout after 30s',ip:'192.168.1.5'   },
  { time:'16:43:01', level:'INFO',    service:'API',      msg:'GET /api/inventory — STR-006 — 200 OK (48ms)',           ip:'103.55.22.11'  },
  { time:'16:42:44', level:'INFO',    service:'Auth',     msg:'New user registered: STR-008 Diamond Palace',            ip:'115.99.12.33'  },
  { time:'16:41:17', level:'WARNING', service:'Email',    msg:'SMS delivery failed for order notification ORD-0821',    ip:'System'        },
  { time:'16:40:03', level:'INFO',    service:'API',      msg:'DELETE /api/items/44 — STR-001 — 204 No Content',        ip:'192.168.1.42'  },
  { time:'16:39:55', level:'ERROR',   service:'Auth',     msg:'Failed login attempt (3rd) — suspicious IP flagged',     ip:'196.23.11.4'   },
  { time:'16:38:22', level:'INFO',    service:'Backup',   msg:'Daily database backup completed — 2.3GB → S3',           ip:'System'        },
];

const levelColor = { INFO:'rgba(99,179,237,0.9)', WARNING:'#facc15', ERROR:'#f87171' };
const levelBg    = { INFO:'rgba(99,179,237,0.08)', WARNING:'rgba(250,204,21,0.08)', ERROR:'rgba(239,68,68,0.08)' };

const HEALTH = [
  { label:'API Server',    status:'Healthy', uptime:'99.98%', latency:'48ms',   load:'23%'  },
  { label:'Database',      status:'Healthy', uptime:'99.95%', latency:'12ms',   load:'41%'  },
  { label:'Redis Cache',   status:'Healthy', uptime:'100%',   latency:'2ms',    load:'15%'  },
  { label:'File Storage',  status:'Warning', uptime:'99.2%',  latency:'120ms',  load:'78%'  },
  { label:'Email Service', status:'Warning', uptime:'97.8%',  latency:'—',      load:'—'    },
  { label:'SMS Gateway',   status:'Healthy', uptime:'99.5%',  latency:'—',      load:'—'    },
];

const SuperAdminLogs = () => {
  const [search, setSearch] = useState('');
  const [level, setLevel]   = useState('All');

  const filtered = LOGS.filter(l => {
    const matchSearch = l.msg.toLowerCase().includes(search.toLowerCase()) || l.service.toLowerCase().includes(search.toLowerCase());
    const matchLevel  = level === 'All' || l.level === level;
    return matchSearch && matchLevel;
  });

  return (
    <div className="admin-fade-in">
      <div className="page-header">
        <div><h1 className="page-title">Platform Logs</h1><p className="page-subtitle">System audit, server health and real-time activity</p></div>
        <button className="admin-btn admin-btn-outline" style={{ gap:'0.5rem' }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Server Health */}
      <div style={{ marginBottom:'1.5rem' }}>
        <h3 style={{ fontFamily:'Playfair Display,serif', fontSize:'0.95rem', color:'#f0ebe0', margin:'0 0 1rem' }}>
          <Server size={15} style={{ display:'inline', marginRight:6 }} /> Service Health
        </h3>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem' }}>
          {HEALTH.map(h => (
            <div key={h.label} className="admin-card" style={{ padding:'1rem 1.25rem', borderColor:h.status==='Warning'?'rgba(250,204,21,0.2)':'rgba(74,222,128,0.1)' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.75rem' }}>
                <span style={{ fontSize:'0.82rem', fontWeight:700, color:'#f0ebe0' }}>{h.label}</span>
                <span className={`badge ${h.status==='Healthy'?'badge-green':'badge-yellow'}`}>{h.status}</span>
              </div>
              <div style={{ display:'flex', gap:'1rem' }}>
                <div><p style={{ margin:0, fontSize:'0.65rem', color:'rgba(232,224,208,0.35)', textTransform:'uppercase', letterSpacing:'0.08em' }}>Uptime</p><p style={{ margin:0, fontWeight:700, color:'#f3d078', fontSize:'0.85rem' }}>{h.uptime}</p></div>
                <div><p style={{ margin:0, fontSize:'0.65rem', color:'rgba(232,224,208,0.35)', textTransform:'uppercase', letterSpacing:'0.08em' }}>Latency</p><p style={{ margin:0, fontWeight:700, color:'#f0ebe0', fontSize:'0.85rem' }}>{h.latency}</p></div>
                <div><p style={{ margin:0, fontSize:'0.65rem', color:'rgba(232,224,208,0.35)', textTransform:'uppercase', letterSpacing:'0.08em' }}>Load</p><p style={{ margin:0, fontWeight:700, color:h.load>'70%'?'#f87171':'#4ade80', fontSize:'0.85rem' }}>{h.load}</p></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Logs */}
      <div className="chart-card" style={{ borderColor:'rgba(132,99,250,0.1)' }}>
        <div className="chart-header">
          <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
            <span className="pulse-live" style={{ display:'inline-block', width:7, height:7, borderRadius:'50%', background:'#a78bfa' }} />
            <h3 className="chart-title">Live System Logs</h3>
          </div>
          <div style={{ display:'flex', gap:'0.75rem', alignItems:'center' }}>
            <div className="admin-search">
              <Search size={13} style={{ color:'rgba(232,224,208,0.35)',flexShrink:0 }} />
              <input placeholder="Filter logs…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div style={{ display:'flex', gap:'0.4rem' }}>
              {['All','INFO','WARNING','ERROR'].map(l => (
                <button key={l} onClick={() => setLevel(l)} style={{ padding:'0.35rem 0.7rem', borderRadius:7, fontSize:'0.68rem', fontWeight:700, cursor:'pointer', border:'none', background:level===l?levelBg[l]||'rgba(132,99,250,0.15)':'rgba(255,255,255,0.03)', color:level===l?levelColor[l]||'#a78bfa':'rgba(232,224,208,0.4)', transition:'all 0.2s' }}>{l}</button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ fontFamily:'monospace', fontSize:'0.78rem', display:'flex', flexDirection:'column', gap:'2px', background:'rgba(0,0,0,0.2)', borderRadius:10, padding:'0.75rem', maxHeight:440, overflowY:'auto' }}>
          {filtered.map((log, i) => (
            <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:'0.75rem', padding:'0.4rem 0.5rem', borderRadius:6, background:levelBg[log.level], transition:'background 0.15s' }}>
              <span style={{ color:'rgba(232,224,208,0.35)', flexShrink:0, fontSize:'0.72rem' }}>{log.time}</span>
              <span style={{ color:levelColor[log.level], fontWeight:700, flexShrink:0, minWidth:60, fontSize:'0.68rem' }}>[{log.level}]</span>
              <span style={{ color:'rgba(167,139,250,0.8)', flexShrink:0, minWidth:55, fontSize:'0.7rem' }}>[{log.service}]</span>
              <span style={{ color:'rgba(232,224,208,0.75)', flex:1 }}>{log.msg}</span>
              <span style={{ color:'rgba(232,224,208,0.25)', flexShrink:0, fontSize:'0.65rem' }}>{log.ip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminLogs;
