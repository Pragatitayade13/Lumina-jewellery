import React, { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';

const MONTHLY_DATA = [
  { month: 'Jan', revenue: 420000, expenses: 180000, profit: 240000 },
  { month: 'Feb', revenue: 580000, expenses: 210000, profit: 370000 },
  { month: 'Mar', revenue: 510000, expenses: 195000, profit: 315000 },
  { month: 'Apr', revenue: 740000, expenses: 240000, profit: 500000 },
  { month: 'May', revenue: 690000, expenses: 225000, profit: 465000 },
  { month: 'Jun', revenue: 920000, expenses: 280000, profit: 640000 },
  { month: 'Jul', revenue: 870000, expenses: 260000, profit: 610000 },
  { month: 'Aug', revenue: 1050000, expenses: 310000, profit: 740000 },
];

const CATEGORY_PERF = [
  { category: 'Gold',     revenue: 840000, units: 42 },
  { category: 'Diamond',  revenue: 520000, units: 18 },
  { category: 'Silver',   revenue: 210000, units: 67 },
  { category: 'Platinum', revenue: 180000, units: 9  },
  { category: 'Pearls',   revenue: 95000,  units: 31 },
];

const TOP_CUSTOMERS = [
  { name: 'Priya Sharma',   orders: 14, spent: '₹8.4L', lastOrder: '2 days ago',  growth: '+22%' },
  { name: 'Rajan Mehta',    orders: 9,  spent: '₹12.1L',lastOrder: '5 days ago',  growth: '+8%'  },
  { name: 'Sunita Agarwal', orders: 21, spent: '₹4.6L', lastOrder: 'Yesterday',   growth: '+35%' },
  { name: 'Arjun Verma',    orders: 6,  spent: '₹9.8L', lastOrder: '1 week ago',  growth: '-4%'  },
  { name: 'Meera Pillai',   orders: 17, spent: '₹6.2L', lastOrder: '3 days ago',  growth: '+15%' },
];

const fmt = v => `₹${(v / 100000).toFixed(1)}L`;

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#13131a', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 12, padding: '0.75rem 1rem' }}>
      <p style={{ margin: '0 0 0.4rem', fontSize: '0.72rem', color: 'rgba(212,175,55,0.7)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ margin: '0.15rem 0', color: p.color, fontSize: '0.85rem', fontWeight: 700 }}>
          {p.name.charAt(0).toUpperCase() + p.name.slice(1)}: {typeof p.value === 'number' && p.value > 1000 ? fmt(p.value) : p.value}
        </p>
      ))}
    </div>
  );
};

const Analytics = () => {
  const [period, setPeriod] = useState('8M');

  return (
    <div className="admin-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Business intelligence & performance insights</p>
        </div>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {['3M', '6M', '8M', '1Y'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                padding: '0.4rem 0.85rem', borderRadius: 8, fontSize: '0.75rem',
                fontWeight: 600, cursor: 'pointer', border: 'none',
                background: period === p ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.04)',
                color: period === p ? '#d4af37' : 'rgba(232,224,208,0.4)',
                transition: 'all 0.2s',
              }}
            >{p}</button>
          ))}
        </div>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '1.75rem' }}>
        {[
          { label: 'Total Revenue',     value: '₹58.4L',  trend: '+18.2%', up: true  },
          { label: 'Net Profit',        value: '₹36.8L',  trend: '+22.5%', up: true  },
          { label: 'Avg. Order Value',  value: '₹62,400', trend: '-3.1%',  up: false },
        ].map(k => (
          <div key={k.label} className="kpi-card-admin">
            <p className="kpi-label-admin">{k.label}</p>
            <p className="kpi-value-admin">{k.value}</p>
            <span className={`kpi-trend ${k.up ? 'up' : 'down'}`}>
              {k.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {k.trend} vs last period
            </span>
          </div>
        ))}
      </div>

      {/* Revenue vs Profit Chart */}
      <div className="chart-card" style={{ marginBottom: '1.5rem' }}>
        <div className="chart-header">
          <div>
            <h3 className="chart-title">Revenue vs Profit</h3>
            <p className="chart-subtitle">Monthly breakdown — revenue, expenses & net profit</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={MONTHLY_DATA} margin={{ top: 5, right: 5, bottom: 0, left: 0 }} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: 'rgba(232,224,208,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'rgba(232,224,208,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fmt} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '0.75rem', color: 'rgba(232,224,208,0.5)', paddingTop: '1rem' }} />
            <Bar dataKey="revenue"  fill="#d4af37" radius={[4,4,0,0]} opacity={0.85} />
            <Bar dataKey="expenses" fill="rgba(239,68,68,0.5)" radius={[4,4,0,0]} />
            <Bar dataKey="profit"   fill="#4ade80" radius={[4,4,0,0]} opacity={0.7} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Category Performance */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Category Performance</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={CATEGORY_PERF} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
              <XAxis type="number" tick={{ fill: 'rgba(232,224,208,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fmt} />
              <YAxis dataKey="category" type="category" tick={{ fill: 'rgba(232,224,208,0.6)', fontSize: 11 }} axisLine={false} tickLine={false} width={60} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" fill="#d4af37" radius={[0,4,4,0]} opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Customers */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Top Customers</h3>
            <p className="chart-subtitle">By lifetime value</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {TOP_CUSTOMERS.map((c, i) => (
              <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.7rem 0', borderBottom: i < TOP_CUSTOMERS.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #d4af37, #aa851c)', color: '#0a0a0c', fontWeight: 800, fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: 'Playfair Display, serif' }}>
                  {c.name[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 600, color: '#f0ebe0' }}>{c.name}</p>
                  <p style={{ margin: 0, fontSize: '0.68rem', color: 'rgba(232,224,208,0.4)' }}>{c.orders} orders · {c.lastOrder}</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700, color: '#f3d078' }}>{c.spent}</p>
                  <p style={{ margin: 0, fontSize: '0.68rem', color: c.growth.startsWith('+') ? '#4ade80' : '#f87171' }}>{c.growth}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
