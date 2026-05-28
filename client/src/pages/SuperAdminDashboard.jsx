import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Store, Users, CreditCard, TrendingUp, AlertTriangle,
  CheckCircle, XCircle, Search, Plus, Eye, BarChart3,
  IndianRupee, Globe, Activity
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

// ── Demo Platform Data ────────────────────────────────────────────────────────
const PLATFORM_REVENUE = [
  { month: 'Jan', mrr: 284000, stores: 38 },
  { month: 'Feb', mrr: 312000, stores: 44 },
  { month: 'Mar', mrr: 348000, stores: 51 },
  { month: 'Apr', mrr: 395000, stores: 58 },
  { month: 'May', mrr: 440000, stores: 67 },
  { month: 'Jun', mrr: 520000, stores: 79 },
  { month: 'Jul', mrr: 580000, stores: 88 },
  { month: 'Aug', mrr: 640000, stores: 98 },
];

const RECENT_STORES = [
  { id: 'STR-001', name: 'Maison Auriel',     owner: 'Amara Singh',   plan: 'Enterprise', status: 'Active',  revenue: '₹42.5L',  joined: '2024-01-12' },
  { id: 'STR-002', name: 'Heritage Gems Co.', owner: 'Rajveer Mehra', plan: 'Pro',        status: 'Active',  revenue: '₹18.2L',  joined: '2024-02-28' },
  { id: 'STR-003', name: 'Solitaire Studio',  owner: 'Priya Nambiar', plan: 'Basic',      status: 'Trial',   revenue: '₹3.1L',   joined: '2024-08-01' },
  { id: 'STR-004', name: 'Zaveri Palace',     owner: 'Mahesh Shah',   plan: 'Pro',        status: 'Active',  revenue: '₹22.8L',  joined: '2024-03-15' },
  { id: 'STR-005', name: 'Navratna Jewels',   owner: 'Kavita Rao',    plan: 'Basic',      status: 'Expired', revenue: '₹1.8L',   joined: '2024-05-20' },
];

const PLAN_DATA = [
  { name: 'Enterprise', count: 12, revenue: '₹3.2L/mo', color: '#d4af37' },
  { name: 'Pro',        count: 34, revenue: '₹1.4L/mo', color: '#a78bfa' },
  { name: 'Basic',      count: 52, revenue: '₹0.8L/mo', color: '#63b3ed' },
];

const ALERTS = [
  { type: 'warning', msg: 'STR-005 subscription expired 3 days ago' },
  { type: 'info',    msg: '3 new store registrations pending approval' },
  { type: 'success', msg: 'Platform uptime: 99.97% this month' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#13131a', border: '1px solid rgba(132,99,250,0.2)', borderRadius: 10, padding: '0.7rem 1rem' }}>
      <p style={{ margin: '0 0 0.4rem', fontSize: '0.7rem', color: 'rgba(167,139,250,0.7)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ margin: '0.1rem 0', color: p.color, fontSize: '0.85rem', fontWeight: 700 }}>
          {p.name === 'mrr' ? `₹${(p.value / 1000).toFixed(0)}K` : p.value}
        </p>
      ))}
    </div>
  );
};

const planBadge = { Enterprise: 'badge-gold', Pro: 'badge-blue', Basic: 'badge-gray' };
const statusBadge = { Active: 'badge-green', Trial: 'badge-yellow', Expired: 'badge-red' };

const SuperAdminDashboard = () => {
  const [search, setSearch] = useState('');

  const kpis = [
    { label: 'Total Stores',     value: '98',     icon: Store,         iconBg: 'rgba(212,175,55,0.1)',  trend: '+8 this month',   up: true  },
    { label: 'Platform MRR',     value: '₹6.4L',  icon: IndianRupee,   iconBg: 'rgba(132,99,250,0.1)', trend: '+18.4% MoM',     up: true  },
    { label: 'Total Users',      value: '1,247',  icon: Users,         iconBg: 'rgba(99,179,237,0.1)', trend: '+12% this month',  up: true  },
    { label: 'Churn Rate',       value: '1.2%',   icon: TrendingUp,    iconBg: 'rgba(74,222,128,0.1)', trend: '-0.3% vs last mo', up: true  },
  ];

  const filteredStores = RECENT_STORES.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.owner.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-fade-in">
      {/* Alerts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {ALERTS.map((a, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0.7rem 1.1rem', borderRadius: 10,
            background: a.type === 'warning' ? 'rgba(250,204,21,0.07)' : a.type === 'success' ? 'rgba(74,222,128,0.07)' : 'rgba(99,179,237,0.07)',
            border: `1px solid ${a.type === 'warning' ? 'rgba(250,204,21,0.2)' : a.type === 'success' ? 'rgba(74,222,128,0.15)' : 'rgba(99,179,237,0.15)'}`,
          }}>
            {a.type === 'warning' ? <AlertTriangle size={14} style={{ color: '#facc15', flexShrink: 0 }} />
             : a.type === 'success' ? <CheckCircle size={14} style={{ color: '#4ade80', flexShrink: 0 }} />
             : <Activity size={14} style={{ color: '#63b3ed', flexShrink: 0 }} />}
            <span style={{ fontSize: '0.82rem', color: 'rgba(232,224,208,0.75)' }}>{a.msg}</span>
          </div>
        ))}
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid" style={{ marginBottom: '1.5rem' }}>
        {kpis.map((k, i) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="kpi-card-admin" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="kpi-icon-wrap" style={{ background: k.iconBg }}>
                <Icon size={18} style={{ color: i === 1 ? '#a78bfa' : '#d4af37' }} />
              </div>
              <p className="kpi-label-admin">{k.label}</p>
              <p className="kpi-value-admin">{k.value}</p>
              <span className={`kpi-trend ${k.up ? 'up' : 'down'}`} style={i === 1 ? { background: 'rgba(132,99,250,0.1)', color: '#a78bfa' } : {}}>
                <TrendingUp size={11} /> {k.trend}
              </span>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* MRR Chart */}
        <div className="chart-card" style={{ borderColor: 'rgba(132,99,250,0.1)' }}>
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Monthly Recurring Revenue</h3>
              <p className="chart-subtitle">Platform MRR & store growth — 2024</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={PLATFORM_REVENUE} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8463fa" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8463fa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: 'rgba(232,224,208,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(232,224,208,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="mrr" stroke="#8463fa" strokeWidth={2.5} fill="url(#purpleGrad)" dot={false} activeDot={{ r: 5, fill: '#a78bfa', strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Plans Breakdown */}
        <div className="chart-card" style={{ borderColor: 'rgba(132,99,250,0.1)' }}>
          <div className="chart-header">
            <h3 className="chart-title">Plan Distribution</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.5rem' }}>
            {PLAN_DATA.map(p => (
              <div key={p.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: p.color }} />
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f0ebe0' }}>{p.name}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: p.color }}>{p.count} stores</span>
                    <span style={{ fontSize: '0.65rem', color: 'rgba(232,224,208,0.4)', marginLeft: '0.5rem' }}>{p.revenue}</span>
                  </div>
                </div>
                <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(p.count / 98) * 100}%`, background: p.color, borderRadius: 3, opacity: 0.75 }} />
                </div>
              </div>
            ))}
          </div>
          <div className="admin-divider" />
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '0.68rem', color: 'rgba(232,224,208,0.35)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total Active Stores</p>
            <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', fontWeight: 800, color: '#a78bfa', margin: '0.2rem 0 0' }}>98</p>
          </div>
        </div>
      </div>

      {/* Stores Table */}
      <div className="chart-card" style={{ borderColor: 'rgba(132,99,250,0.1)' }}>
        <div className="chart-header">
          <div>
            <h3 className="chart-title">Registered Stores</h3>
            <p className="chart-subtitle">All businesses on the platform</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div className="admin-search">
              <Search size={13} style={{ color: 'rgba(232,224,208,0.35)', flexShrink: 0 }} />
              <input placeholder="Search stores…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Link to="/super-admin/stores" className="admin-btn admin-btn-outline" style={{ fontSize: '0.72rem', padding: '0.4rem 0.9rem', textDecoration: 'none' }}>
              View All →
            </Link>
          </div>
        </div>

        <div className="admin-table-wrap" style={{ border: 'none' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Store ID</th>
                <th>Business</th>
                <th>Owner</th>
                <th>Plan</th>
                <th>Revenue</th>
                <th>Joined</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredStores.map(s => (
                <tr key={s.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'rgba(167,139,250,0.7)' }}>{s.id}</td>
                  <td style={{ fontWeight: 700, color: '#f0ebe0' }}>{s.name}</td>
                  <td style={{ color: 'rgba(232,224,208,0.65)', fontSize: '0.82rem' }}>{s.owner}</td>
                  <td><span className={`badge ${planBadge[s.plan]}`}>{s.plan}</span></td>
                  <td style={{ fontWeight: 700, color: '#f3d078' }}>{s.revenue}</td>
                  <td style={{ fontSize: '0.75rem', color: 'rgba(232,224,208,0.4)' }}>{s.joined}</td>
                  <td><span className={`badge ${statusBadge[s.status]}`}>{s.status}</span></td>
                  <td>
                    <button style={{ background: 'none', border: 'none', color: 'rgba(167,139,250,0.6)', cursor: 'pointer', padding: 4, borderRadius: 6 }}>
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
