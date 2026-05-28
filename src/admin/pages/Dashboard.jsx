// src/admin/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { revenueData, orders, orderStatusData, activities as initialActivities, categoryRevenue } from '../data/mockData';
import { 
  IndianRupee, Package, Users, Gem, Bot, TrendingUp, Lightbulb, AlertTriangle, Target,
  Smartphone, CreditCard, Landmark, Wallet, Home, Bell
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useRates } from '../../hooks/useRates';

function StatCard({ icon, iconClass, label, value, trend, trendUp, trendNote, accentColor }) {
  return (
    <div className="stat-card" style={{ '--card-accent': accentColor }}>
      <div className="stat-row">
        <div className={`stat-icon ${iconClass}`}>{icon}</div>
        <div className={`stat-trend ${trendUp ? 'up' : 'down'}`} style={{ marginLeft: 'auto' }}>
          {trendUp ? '↑' : '↓'} {trend}
        </div>
      </div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{trendNote}</div>
    </div>
  );
}

function BarChart({ data }) {
  const max = Math.max(...data.map(d => d.revenue));
  return (
    <div className="chart-bar-wrap">
      {data.map(d => (
        <div key={d.month} className="chart-bar-col">
          <div
            className="chart-bar"
            style={{ height: `${(d.revenue / max) * 100}%` }}
            title={`₹${(d.revenue / 100000).toFixed(1)}L`}
          />
          <div className="chart-bar-label">{d.month}</div>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ data }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const r = 68, circumference = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="donut-wrap">
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <svg width={176} height={176} viewBox="0 0 176 176" className="donut-svg">
          <circle cx={88} cy={88} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={22} />
          {data.map((d, i) => {
            const len = (d.value / total) * circumference;
            const da = `${len} ${circumference - len}`;
            const do_ = -offset;
            offset += len;
            return (
              <circle key={i} cx={88} cy={88} r={r} fill="none"
                stroke={d.color} strokeWidth={22}
                strokeDasharray={da} strokeDashoffset={do_}
                strokeLinecap="butt"
              />
            );
          })}
        </svg>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
          <div style={{ fontFamily: 'Playfair Display,serif', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>74</div>
          <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Today</div>
        </div>
      </div>
      <div className="donut-legend">
        {data.map((d, i) => (
          <div key={i} className="donut-legend-item">
            <div className="donut-dot" style={{ background: d.color }} />
            <span className="donut-legend-label">{d.label}</span>
            <span className="donut-legend-val">{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const statusClass = { delivered: 'badge-delivered', shipped: 'badge-shipped', confirmed: 'badge-confirmed', pending: 'badge-pending', cancelled: 'badge-cancelled' };

const aiInsights = [
  { icon: <TrendingUp size={16} />, text: '<strong>Sales Forecast:</strong> December projected at ₹4.8 Cr — 17% above last year' },
  { icon: <Lightbulb size={16} />, text: '<strong>Demand Spike:</strong> Diamond Rings +42% — restock within 3 days recommended' },
  { icon: <Users size={16} />, text: '<strong>Customer Alert:</strong> 23% of VIP customers inactive — re-engagement needed' },
  { icon: <AlertTriangle size={16} />, text: '<strong>Inventory Risk:</strong> 6 SKUs below critical threshold — ₹8.4L at risk' },
  { icon: <Target size={16} />, text: '<strong>Upsell Opportunity:</strong> 145 ring buyers → bridal sets — ₹2.1 Cr potential' },
];

const paymentMethods = [
  { em: <Smartphone size={18} />, m: 'UPI', p: '42%' },
  { em: <CreditCard size={18} />, m: 'Card', p: '28%' },
  { em: <Landmark size={18} />, m: 'NetBank', p: '18%' },
  { em: <Wallet size={18} />, m: 'Wallet', p: '8%' },
  { em: <Home size={18} />, m: 'COD', p: '4%' },
];

export default function Dashboard() {
  const { user, showToast } = useApp();
  const [liveOrders, setLiveOrders] = useState(74);
  const [liveCustomers, setLiveCustomers] = useState(12847);
  const [liveActivities, setLiveActivities] = useState(initialActivities);
  const [chartData, setChartData] = useState(revenueData);
  const { rates } = useRates();

  useEffect(() => {
    const orderInterval = setInterval(() => {
      setLiveOrders(prev => prev + (Math.random() > 0.7 ? 1 : 0));
    }, 4000);
    
    const customerInterval = setInterval(() => {
      setLiveCustomers(prev => prev + (Math.random() > 0.8 ? 1 : 0));
    }, 6000);

    const activityInterval = setInterval(() => {
      if (Math.random() > 0.8) {
        const newAct = {
          icon: <Bell size={16} />,
          color: 'rgba(52,152,219,0.15)',
          text: `<strong>Live Event:</strong> User viewed Polki Kundan Choker`,
          time: 'Just now'
        };
        setLiveActivities(prev => [newAct, ...prev.slice(0, 5)]);
      }
    }, 8000);

    const liveDataInterval = setInterval(() => {
      // Simulate live chart fluctuations
      setChartData(prev => prev.map(d => ({
        ...d,
        revenue: d.revenue + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 50000)
      })));
    }, 5000);

    return () => {
      clearInterval(orderInterval);
      clearInterval(customerInterval);
      clearInterval(activityInterval);
      clearInterval(liveDataInterval);
    };
  }, []);

  const handleExport = () => {
    if (user?.role !== 'superadmin') {
      showToast('Error: Only Super Admin can export overall reports.');
      return;
    }
    
    // Simulate generating and downloading report
    showToast('Preparing Overall Report...');
    setTimeout(() => {
      const csvHeader = "Month,Revenue (₹)\n";
      const csvContent = chartData.map(d => `"${d.month}","${d.revenue}"`).join("\n");
      const blob = new Blob([csvHeader + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "Lumina_Jewels_Overall_Report_2026.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Overall Report exported successfully!');
    }, 1000);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard Overview</h1>
          <p className="page-subtitle">Welcome back — Here's what's happening at Lumina Jewels today</p>
        </div>
        <div className="page-actions">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--status-green)', fontSize: '0.75rem', fontWeight: 600 }}>
            <span className="live-dot" /> Live Monitoring Active
          </div>
          <div style={{ background: 'rgba(201,168,76,0.1)', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid var(--gold)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Live Gold Rate (24K)</span>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--gold)' }}>₹{rates?.gold24k || 7250}/g</span>
          </div>
          {(!user || user.role === 'superadmin') && (
            <button className="btn btn-outline" onClick={handleExport}>📥 Export Overall Report</button>
          )}
          <Link to="/admin/products" className="btn btn-gold" style={{ background: 'var(--gold)', color: '#000', fontWeight: 'bold' }}>+ Quick Add</Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stat-grid mb-15">
        <StatCard icon={<IndianRupee size={20} />} iconClass="gold" label="Revenue — May 2026" value="₹2.18 Cr" trend="23.5%" trendUp={true} trendNote="vs April 2026" accentColor="var(--gold)" />
        <StatCard icon={<Package size={20} />} iconClass="blue" label="Orders Today" value={liveOrders} trend="12.8%" trendUp={true} trendNote="vs yesterday (66)" accentColor="#3498db" />
        <StatCard icon={<Users size={20} />} iconClass="green" label="Active Customers" value={liveCustomers.toLocaleString()} trend="5.2%" trendUp={true} trendNote="+642 new this month" accentColor="#2ecc71" />
        <StatCard icon={<Gem size={20} />} iconClass="purple" label="Total Products" value="1,284" trend="3" trendUp={true} trendNote="added today" accentColor="#9b59b6" />
      </div>

      {/* Revenue Chart + AI Insights */}
      <div className="grid-2-1 mb-15">
        <div className="admin-card">
          <div className="card-header">
            <div>
              <div className="card-title">Revenue Trend — FY 2026</div>
              <div className="card-subtitle">Monthly revenue performance</div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gold)' }}>₹25.8 Cr</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--status-green)', fontWeight: 700 }}>↑ 28.4%</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '2rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {[{ l: 'Avg Monthly', v: '₹2.15 Cr' }, { l: 'Peak Month', v: 'December' }, { l: 'Best Growth', v: '+42% Oct' }, { l: 'YoY Growth', v: '+28.4%' }].map(s => (
              <div key={s.l}>
                <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.l}</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.15rem' }}>{s.v}</div>
              </div>
            ))}
          </div>
          <BarChart data={chartData} />
        </div>

        <div className="ai-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="ai-header">
            <Bot size={20} color="var(--gold)" />
            <div>
              <div className="ai-badge">AI Business Intelligence</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Powered by Lumina AI Engine</div>
            </div>
          </div>
          {aiInsights.map((insight, i) => (
            <div key={i} className="ai-insight">
              <span className="ai-insight-icon" style={{ color: 'var(--text-muted)' }}>{insight.icon}</span>
              <div className="ai-insight-text" dangerouslySetInnerHTML={{ __html: insight.text }} />
            </div>
          ))}
        </div>
      </div>

      {/* Recent Orders + Activity Feed */}
      <div className="grid-2-1 mb-15">
        <div className="admin-card">
          <div className="card-header">
            <div className="card-title">Recent Orders</div>
            <a href="/admin/orders" style={{ fontSize: '0.75rem', color: 'var(--gold)', fontWeight: 600 }}>View All Orders →</a>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Order ID</th><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                {orders.slice(0, 6).map(o => (
                  <tr key={o.id}>
                    <td style={{ color: 'var(--gold)', fontWeight: 700, fontFamily: 'monospace', fontSize: '0.78rem' }}>{o.id}</td>
                    <td>{o.customer}</td>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>₹{o.amount.toLocaleString('en-IN')}</td>
                    <td><span className={`badge ${statusClass[o.status]}`}>{o.status}</span></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{o.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="admin-card">
          <div className="card-header">
            <div className="card-title">Live Activity</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', color: 'var(--status-green)', fontWeight: 700 }}>
              <span className="live-dot" /> Monitoring
            </div>
          </div>
          <div className="activity-feed">
            {liveActivities.map((a, i) => (
              <div key={i} className="activity-item">
                <div className="activity-icon" style={{ background: a.color }}>
                  {typeof a.icon === 'string' ? <Bell size={16} color="var(--text-primary)" /> : a.icon}
                </div>
                <div>
                  <div className="activity-text" dangerouslySetInnerHTML={{ __html: a.text }} />
                  <div className="activity-time">{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Order Status Donut + Category Revenue */}
      <div className="grid-2 mb-15">
        <div className="admin-card">
          <div className="card-header"><div className="card-title">Order Status Distribution</div></div>
          <DonutChart data={orderStatusData} />
        </div>

        <div className="admin-card">
          <div className="card-header"><div className="card-title">Revenue by Category</div><span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>May 2026</span></div>
          <div className="progress-bar-wrap mb-1" style={{ marginBottom: '1.25rem' }}>
            {categoryRevenue.map(cat => (
              <div key={cat.name} className="progress-item">
                <div className="progress-label-row">
                  <span className="progress-name">{cat.name}</span>
                  <span className="progress-val">{cat.value}%</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${cat.value}%`, background: cat.color }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid var(--admin-border)', paddingTop: '1rem' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.625rem' }}>Payment Methods</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '0.5rem' }}>
              {paymentMethods.map(pm => (
                <div key={pm.m} style={{ textAlign: 'center', padding: '0.5rem', background: 'rgba(201,168,76,0.05)', borderRadius: 8, border: '1px solid var(--admin-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.3rem', color: 'var(--text-secondary)' }}>{pm.em}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{pm.m}</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--gold)' }}>{pm.p}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
