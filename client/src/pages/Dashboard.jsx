import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  TrendingUp, TrendingDown, Package, AlertTriangle,
  ShoppingCart, Users, IndianRupee, Plus, FileText,
  BarChart3, Bell, ArrowUpRight, Zap, Clock
} from 'lucide-react';

// ── Demo Data ────────────────────────────────────────────────────────────────
const REVENUE_DATA = [
  { month: 'Jan', revenue: 420000, orders: 38 },
  { month: 'Feb', revenue: 580000, orders: 52 },
  { month: 'Mar', revenue: 510000, orders: 44 },
  { month: 'Apr', revenue: 740000, orders: 67 },
  { month: 'May', revenue: 690000, orders: 61 },
  { month: 'Jun', revenue: 920000, orders: 83 },
  { month: 'Jul', revenue: 870000, orders: 79 },
  { month: 'Aug', revenue: 1050000, orders: 95 },
];

const CATEGORY_DATA = [
  { name: 'Gold',     value: 42, color: '#d4af37' },
  { name: 'Diamond',  value: 28, color: '#93c5fd' },
  { name: 'Silver',   value: 18, color: '#a1a1aa' },
  { name: 'Platinum', value: 12, color: '#e2e8f0' },
];

const LIVE_TRANSACTIONS = [
  { id: 'ORD-8821', customer: 'Priya Sharma',    item: '22K Gold Necklace',  amount: 84500,  status: 'Completed', time: '2 min ago',  color: '#4ade80' },
  { id: 'ORD-8820', customer: 'Rajan Mehta',     item: 'Diamond Ring 0.5ct', amount: 135000, status: 'Processing',time: '15 min ago', color: '#facc15' },
  { id: 'ORD-8819', customer: 'Sunita Agarwal',  item: 'Pearl Earrings Set',  amount: 22000,  status: 'Completed', time: '31 min ago', color: '#4ade80' },
  { id: 'ORD-8818', customer: 'Arjun Verma',     item: 'Platinum Band',       amount: 48000,  status: 'Completed', time: '52 min ago', color: '#4ade80' },
  { id: 'ORD-8817', customer: 'Meera Pillai',    item: 'Emerald Pendant',     amount: 67000,  status: 'Refunded',  time: '1 hr ago',   color: '#f87171' },
];

const TOP_ITEMS = [
  { name: '22K Bridal Necklace Set', category: 'Gold',    sold: 14, revenue: '₹11.8L', stock: 3, trend: 'up'   },
  { name: 'Solitaire Diamond Ring',  category: 'Diamond', sold: 9,  revenue: '₹12.2L', stock: 7, trend: 'up'   },
  { name: 'Antique Jhumka Earrings', category: 'Gold',    sold: 22, revenue: '₹5.5L',  stock: 12, trend: 'up'  },
  { name: 'Silver Kada Set',         category: 'Silver',  sold: 31, revenue: '₹3.1L',  stock: 24, trend: 'down' },
  { name: 'Platinum Wedding Band',   category: 'Platinum',sold: 6,  revenue: '₹2.9L',  stock: 5, trend: 'up'   },
];

// ── Custom Tooltip ────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#13131a', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 12, padding: '0.75rem 1rem' }}>
      <p style={{ margin: '0 0 0.4rem', fontSize: '0.72rem', color: 'rgba(212,175,55,0.7)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ margin: 0, color: p.color, fontSize: '0.9rem', fontWeight: 700 }}>
          {p.name === 'revenue' ? `₹${(p.value/100000).toFixed(1)}L` : p.value}
        </p>
      ))}
    </div>
  );
};

// ── Gold Rate Ticker ──────────────────────────────────────────────────────────
const GoldTicker = () => {
  const [rate, setRate] = useState(7284);
  const [change, setChange] = useState(+12);

  useEffect(() => {
    const t = setInterval(() => {
      const delta = (Math.random() - 0.48) * 8;
      setRate(r => Math.round(r + delta));
      setChange(Math.round(delta * 10) / 10);
    }, 3000);
    return () => clearInterval(t);
  }, []);

  const isUp = change >= 0;

  return (
    <div className="gold-ticker">
      <div>
        <p className="gold-ticker-label">MCX Gold Rate (per gram)</p>
        <p className="gold-ticker-rate">₹{rate.toLocaleString('en-IN')}</p>
        <p className={`gold-ticker-change ${isUp ? '' : ''}`} style={{ color: isUp ? '#4ade80' : '#f87171', margin: '0.2rem 0 0' }}>
          {isUp ? '▲' : '▼'} ₹{Math.abs(change)} today
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
        <div style={{ background: isUp ? 'rgba(74,222,128,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${isUp ? 'rgba(74,222,128,0.2)' : 'rgba(239,68,68,0.2)'}`, borderRadius: 8, padding: '0.3rem 0.7rem', fontSize: '0.75rem', fontWeight: 700, color: isUp ? '#4ade80' : '#f87171' }}>
          {isUp ? '▲' : '▼'} LIVE
        </div>
        <span style={{ fontSize: '0.68rem', color: 'rgba(212,175,55,0.4)' }}>Updated just now</span>
      </div>
    </div>
  );
};

// ── KPI Card ──────────────────────────────────────────────────────────────────
const KpiCard = ({ label, value, icon: Icon, iconBg, trend, trendValue, trendLabel, delay = 0 }) => (
  <div className="kpi-card-admin admin-fade-in" style={{ animationDelay: `${delay}ms` }}>
    <div className="kpi-icon-wrap" style={{ background: iconBg }}>
      <Icon size={18} style={{ color: '#d4af37' }} />
    </div>
    <p className="kpi-label-admin">{label}</p>
    <p className="kpi-value-admin">{value}</p>
    <span className={`kpi-trend ${trend}`}>
      {trend === 'up' ? <TrendingUp size={11} /> : trend === 'down' ? <TrendingDown size={11} /> : null}
      {trendValue} {trendLabel || 'vs last month'}
    </span>
  </div>
);

// ── Main Dashboard ────────────────────────────────────────────────────────────
const Dashboard = () => {
  const { token, business } = useSelector(state => state.auth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('revenue');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/dashboard/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(response.data);
      } catch (error) {
        // Use demo data when backend not available
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchStats();
    else setLoading(false);
  }, [token]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ width: 40, height: 40, border: '3px solid rgba(212,175,55,0.2)', borderTop: '3px solid #d4af37', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: 'rgba(212,175,55,0.6)', fontSize: '0.85rem' }}>Loading your dashboard…</p>
      </div>
    );
  }

  return (
    <div className="admin-fade-in">
      {/* Gold Rate Ticker */}
      <div style={{ marginBottom: '1.5rem' }}>
        <GoldTicker />
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid">
        <KpiCard
          label="Today's Sales"
          value={`₹${(stats?.revenue || 284500).toLocaleString('en-IN')}`}
          icon={IndianRupee}
          iconBg="rgba(212,175,55,0.1)"
          trend="up"
          trendValue="+12.4%"
          delay={0}
        />
        <KpiCard
          label="Stock Alerts"
          value={stats?.lowStockAlerts || 8}
          icon={AlertTriangle}
          iconBg="rgba(239,68,68,0.1)"
          trend="down"
          trendValue="3 new"
          trendLabel="since yesterday"
          delay={80}
        />
        <KpiCard
          label="Total Orders"
          value={stats?.sales || 47}
          icon={ShoppingCart}
          iconBg="rgba(99,179,237,0.1)"
          trend="up"
          trendValue="+8.2%"
          delay={160}
        />
        <KpiCard
          label="Active Customers"
          value={stats?.totalCustomers || 312}
          icon={Users}
          iconBg="rgba(167,139,250,0.1)"
          trend="up"
          trendValue="+5"
          trendLabel="this week"
          delay={240}
        />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Revenue Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Revenue Overview</h3>
              <p className="chart-subtitle">Monthly revenue & order volume — FY 2024-25</p>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {['revenue', 'orders'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '0.35rem 0.8rem', borderRadius: 8, fontSize: '0.72rem', fontWeight: 600,
                    cursor: 'pointer', border: 'none', textTransform: 'capitalize',
                    background: activeTab === tab ? 'rgba(212,175,55,0.15)' : 'transparent',
                    color: activeTab === tab ? '#d4af37' : 'rgba(232,224,208,0.4)',
                    transition: 'all 0.2s',
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={REVENUE_DATA} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d4af37" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#93c5fd" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#93c5fd" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: 'rgba(232,224,208,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fill: 'rgba(232,224,208,0.4)', fontSize: 10 }}
                axisLine={false} tickLine={false}
                tickFormatter={v => activeTab === 'revenue' ? `₹${(v/100000).toFixed(0)}L` : v}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey={activeTab}
                stroke={activeTab === 'revenue' ? '#d4af37' : '#93c5fd'}
                strokeWidth={2.5}
                fill={activeTab === 'revenue' ? 'url(#goldGrad)' : 'url(#blueGrad)'}
                dot={false}
                activeDot={{ r: 5, fill: activeTab === 'revenue' ? '#d4af37' : '#93c5fd', strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Donut */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Category Mix</h3>
              <p className="chart-subtitle">Revenue by jewellery type</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={CATEGORY_DATA}
                cx="50%" cy="50%"
                innerRadius={55} outerRadius={78}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {CATEGORY_DATA.map((entry, i) => (
                  <Cell key={i} fill={entry.color} opacity={0.85} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => active && payload?.length ? (
                  <div style={{ background: '#13131a', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 10, padding: '0.6rem 0.9rem' }}>
                    <p style={{ margin: 0, color: payload[0].payload.color, fontWeight: 700 }}>{payload[0].name}: {payload[0].value}%</p>
                  </div>
                ) : null}
              />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
            {CATEGORY_DATA.map(c => (
              <div key={c.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.78rem', color: 'rgba(232,224,208,0.6)' }}>{c.name}</span>
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: c.color }}>{c.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>
        {/* Live Transactions */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3 className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="pulse-live" style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: '#4ade80' }} />
                Live Transactions
              </h3>
              <p className="chart-subtitle">Real-time sales activity</p>
            </div>
            <Link to="/pos" className="admin-btn admin-btn-outline" style={{ fontSize: '0.72rem', padding: '0.4rem 0.9rem' }}>
              Full Log →
            </Link>
          </div>

          <div className="admin-table-wrap" style={{ border: 'none' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Item</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {LIVE_TRANSACTIONS.map(tx => (
                  <tr key={tx.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'rgba(212,175,55,0.7)' }}>{tx.id}</td>
                    <td style={{ fontWeight: 600, color: '#f0ebe0' }}>{tx.customer}</td>
                    <td style={{ color: 'rgba(232,224,208,0.55)', fontSize: '0.8rem' }}>{tx.item}</td>
                    <td style={{ fontWeight: 700, color: '#f3d078' }}>₹{tx.amount.toLocaleString('en-IN')}</td>
                    <td>
                      <span className={`badge ${tx.status === 'Completed' ? 'badge-green' : tx.status === 'Processing' ? 'badge-yellow' : 'badge-red'}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.72rem', color: 'rgba(232,224,208,0.35)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Clock size={11} />{tx.time}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions + Top Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Quick Actions */}
          <div className="chart-card">
            <h3 className="chart-title" style={{ marginBottom: '1rem' }}>Quick Operations</h3>
            <div className="quick-action-grid">
              <Link to="/inventory" className="quick-action-btn" id="qa-add-item">
                <div className="quick-action-icon" style={{ background: 'rgba(212,175,55,0.12)' }}>
                  <Plus size={16} style={{ color: '#d4af37' }} />
                </div>
                Add Item
              </Link>
              <Link to="/pos" className="quick-action-btn" id="qa-new-sale">
                <div className="quick-action-icon" style={{ background: 'rgba(99,179,237,0.12)' }}>
                  <ShoppingCart size={16} style={{ color: '#93c5fd' }} />
                </div>
                New Sale
              </Link>
              <Link to="/analytics" className="quick-action-btn" id="qa-report">
                <div className="quick-action-icon" style={{ background: 'rgba(167,139,250,0.12)' }}>
                  <BarChart3 size={16} style={{ color: '#a78bfa' }} />
                </div>
                Analytics
              </Link>
              <Link to="/customers" className="quick-action-btn" id="qa-customer">
                <div className="quick-action-icon" style={{ background: 'rgba(74,222,128,0.12)' }}>
                  <Users size={16} style={{ color: '#4ade80' }} />
                </div>
                Customers
              </Link>
            </div>
          </div>

          {/* Top Selling Items */}
          <div className="chart-card" style={{ flex: 1 }}>
            <h3 className="chart-title" style={{ marginBottom: '1rem' }}>Top Sellers</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {TOP_ITEMS.slice(0, 4).map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(212,175,55,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, color: '#d4af37', flexShrink: 0 }}>
                    #{i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 600, color: '#f0ebe0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                    <p style={{ margin: 0, fontSize: '0.65rem', color: 'rgba(232,224,208,0.4)' }}>{item.sold} sold · {item.revenue}</p>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: item.trend === 'up' ? '#4ade80' : '#f87171' }}>
                    {item.trend === 'up' ? '▲' : '▼'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
