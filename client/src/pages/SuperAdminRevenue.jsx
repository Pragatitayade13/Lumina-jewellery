import React, { useState } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

const MRR_DATA = [
  { month:'Jan', mrr:284000, newMRR:42000, churnMRR:8000, stores:38  },
  { month:'Feb', mrr:312000, newMRR:56000, churnMRR:6000, stores:44  },
  { month:'Mar', mrr:348000, newMRR:48000, churnMRR:9000, stores:51  },
  { month:'Apr', mrr:395000, newMRR:62000, churnMRR:5000, stores:58  },
  { month:'May', mrr:440000, newMRR:58000, churnMRR:7000, stores:67  },
  { month:'Jun', mrr:520000, newMRR:92000, churnMRR:4000, stores:79  },
  { month:'Jul', mrr:580000, newMRR:72000, churnMRR:8000, stores:88  },
  { month:'Aug', mrr:640000, newMRR:80000, churnMRR:6000, stores:98  },
];

const PLAN_REV = [
  { plan:'Basic',      revenue:18000,  stores:52, avgRevenue:346   },
  { plan:'Pro',        revenue:84966,  stores:34, avgRevenue:2499  },
  { plan:'Enterprise', revenue:71988,  stores:12, avgRevenue:5999  },
];

const fmt = v => v > 1000 ? `₹${(v/1000).toFixed(0)}K` : `₹${v}`;

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'#13131a', border:'1px solid rgba(132,99,250,0.2)', borderRadius:10, padding:'0.7rem 1rem' }}>
      <p style={{ margin:'0 0 0.4rem', fontSize:'0.7rem', color:'rgba(167,139,250,0.7)', textTransform:'uppercase', letterSpacing:'0.08em' }}>{label}</p>
      {payload.map(p => <p key={p.name} style={{ margin:'0.1rem 0', color:p.color, fontSize:'0.85rem', fontWeight:700 }}>{p.name}: {fmt(p.value)}</p>)}
    </div>
  );
};

const SuperAdminRevenue = () => {
  const current = MRR_DATA[MRR_DATA.length - 1];
  const prev    = MRR_DATA[MRR_DATA.length - 2];
  const growth  = (((current.mrr - prev.mrr) / prev.mrr) * 100).toFixed(1);

  return (
    <div className="admin-fade-in">
      <div className="page-header">
        <div><h1 className="page-title">Platform Revenue</h1><p className="page-subtitle">MRR, ARR, churn and financial health</p></div>
      </div>

      <div className="kpi-grid" style={{ marginBottom:'1.5rem' }}>
        {[
          { label:'Current MRR',   value:`₹${(current.mrr/1000).toFixed(1)}K`, trend:`+${growth}%`, up:true  },
          { label:'ARR (12x MRR)', value:`₹${(current.mrr*12/100000).toFixed(1)}L`, trend:'Projected', up:true },
          { label:'New MRR (Aug)', value:`₹${(current.newMRR/1000).toFixed(0)}K`, trend:'+8.3%', up:true },
          { label:'Churn Rate',    value:'1.2%', trend:'-0.3% MoM', up:true },
        ].map(k => (
          <div key={k.label} className="kpi-card-admin">
            <p className="kpi-label-admin">{k.label}</p>
            <p className="kpi-value-admin" style={{ color:'#a78bfa' }}>{k.value}</p>
            <span className={`kpi-trend ${k.up ? 'up' : 'down'}`} style={{ background:'rgba(132,99,250,0.1)', color:'#a78bfa' }}>
              {k.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />} {k.trend}
            </span>
          </div>
        ))}
      </div>

      {/* MRR Growth Chart */}
      <div className="chart-card" style={{ marginBottom:'1.5rem', borderColor:'rgba(132,99,250,0.1)' }}>
        <div className="chart-header">
          <div><h3 className="chart-title">MRR Growth & Churn</h3><p className="chart-subtitle">Monthly recurring revenue vs churn — 2024</p></div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={MRR_DATA} margin={{ top:5, right:5, bottom:0, left:0 }}>
            <defs>
              <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8463fa" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8463fa" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="newGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4ade80" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="month" tick={{ fill:'rgba(232,224,208,0.4)', fontSize:11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill:'rgba(232,224,208,0.4)', fontSize:10 }} axisLine={false} tickLine={false} tickFormatter={fmt} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize:'0.75rem', color:'rgba(232,224,208,0.5)', paddingTop:'1rem' }} />
            <Area type="monotone" dataKey="mrr"    stroke="#8463fa" strokeWidth={2.5} fill="url(#mrrGrad)" dot={false} name="Total MRR" />
            <Area type="monotone" dataKey="newMRR" stroke="#4ade80" strokeWidth={2} fill="url(#newGrad)" dot={false} name="New MRR" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' }}>
        {/* Revenue by Plan */}
        <div className="chart-card" style={{ borderColor:'rgba(132,99,250,0.1)' }}>
          <div className="chart-header"><h3 className="chart-title">Revenue by Plan</h3></div>
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem', marginTop:'0.5rem' }}>
            {PLAN_REV.map(p => (
              <div key={p.plan}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.35rem' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                    <div style={{ width:9,height:9,borderRadius:'50%', background:p.plan==='Enterprise'?'#d4af37':p.plan==='Pro'?'#a78bfa':'#63b3ed' }} />
                    <span style={{ fontSize:'0.82rem', fontWeight:600, color:'#f0ebe0' }}>{p.plan}</span>
                    <span style={{ fontSize:'0.68rem', color:'rgba(232,224,208,0.4)' }}>{p.stores} stores</span>
                  </div>
                  <span style={{ fontSize:'0.82rem', fontWeight:700, color:'#f3d078' }}>₹{(p.revenue/1000).toFixed(0)}K/mo</span>
                </div>
                <div style={{ height:8, background:'rgba(255,255,255,0.05)', borderRadius:4, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${(p.revenue/174954)*100}%`, background:p.plan==='Enterprise'?'#d4af37':p.plan==='Pro'?'#a78bfa':'#63b3ed', borderRadius:4, opacity:0.8 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stores Added per Month */}
        <div className="chart-card" style={{ borderColor:'rgba(132,99,250,0.1)' }}>
          <div className="chart-header"><h3 className="chart-title">New Stores / Month</h3></div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={MRR_DATA} margin={{ top:5, right:5, bottom:0, left:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill:'rgba(232,224,208,0.4)', fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:'rgba(232,224,208,0.4)', fontSize:10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="stores" fill="#8463fa" radius={[4,4,0,0]} opacity={0.75} name="Stores" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminRevenue;
