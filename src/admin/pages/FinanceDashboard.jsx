import { useState, useEffect } from 'react';
import { IndianRupee, TrendingUp, TrendingDown, BarChart2, ArrowUpRight, ArrowDownRight, CreditCard, Clock, RefreshCw, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { useRates } from '../../hooks/useRates';
import { useOrders } from '../../hooks/useOrders';
import { useApp } from '../../context/AppContext';

// Daily revenue last 14 days (mock realistic data)
const dailyRevenue = [
  { day: '16 May', revenue: 128000, orders: 4 },
  { day: '17 May', revenue: 245000, orders: 7 },
  { day: '18 May', revenue: 182000, orders: 5 },
  { day: '19 May', revenue: 310000, orders: 9 },
  { day: '20 May', revenue: 95000, orders: 3 },
  { day: '21 May', revenue: 420000, orders: 12 },
  { day: '22 May', revenue: 355000, orders: 10 },
  { day: '23 May', revenue: 275000, orders: 8 },
  { day: '24 May', revenue: 512000, orders: 14 },
  { day: '25 May', revenue: 389000, orders: 11 },
  { day: '26 May', revenue: 445000, orders: 13 },
  { day: '27 May', revenue: 298000, orders: 9 },
  { day: '28 May', revenue: 621000, orders: 18 },
  { day: '29 May', revenue: 534000, orders: 15 },
];

const paymentStats = {
  successful: 847,
  failed: 23,
  pendingRefunds: 12,
  refundAmount: 185000,
  failureReasons: [
    { reason: 'Bank Gateway Timeout', count: 9 },
    { reason: 'Insufficient Funds', count: 7 },
    { reason: '3D Secure Failed', count: 5 },
    { reason: 'Card Expired', count: 2 },
  ]
};

function DailyBarChart({ data }) {
  const max = Math.max(...data.map(d => d.revenue));
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '160px', padding: '0.5rem 0' }}>
      {data.map((d, i) => {
        const pct = (d.revenue / max) * 100;
        const isToday = i === data.length - 1;
        return (
          <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', position: 'relative', height: '100%' }}>
            <div style={{ width: '100%', flex: 1, display: 'flex', alignItems: 'flex-end' }}>
              <div
                style={{
                  width: '100%',
                  height: `${pct}%`,
                  background: isToday ? 'var(--gold)' : 'rgba(201,168,76,0.35)',
                  borderRadius: '4px 4px 0 0',
                  transition: 'height 0.3s ease',
                  cursor: 'pointer',
                  position: 'relative',
                  minHeight: '4px'
                }}
                title={`${d.day}: ₹${d.revenue.toLocaleString('en-IN')} | ${d.orders} orders`}
              />
            </div>
            <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', textAlign: 'center', writingMode: 'vertical-lr', transform: 'rotate(180deg)', height: '32px', lineHeight: 1 }}>
              {d.day.split(' ')[0]}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SparkLine({ data, color = 'var(--gold)' }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 120, h = 36;
  const xStep = w / (data.length - 1);
  const points = data.map((v, i) => `${i * xStep},${h - ((v - min) / range) * h}`).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline fill="none" stroke={color} strokeWidth="2" points={points} />
      <circle cx={(data.length - 1) * xStep} cy={h - ((data[data.length - 1] - min) / range) * h} r="3" fill={color} />
    </svg>
  );
}

export default function FinanceDashboard() {
  const { rates } = useRates();
  const { orders: firebaseOrders } = useOrders();
  const { showToast } = useApp();
  const [activeTab, setActiveTab] = useState('revenue');
  const [chartData, setChartData] = useState(dailyRevenue);

  // Live ticking simulation for chart
  useEffect(() => {
    const iv = setInterval(() => {
      setChartData(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          revenue: updated[updated.length - 1].revenue + Math.floor(Math.random() * 5000),
        };
        return updated;
      });
    }, 6000);
    return () => clearInterval(iv);
  }, []);

  // Real revenue from firebase orders
  const realRevenue = firebaseOrders?.reduce((s, o) => s + (Number(o.amount) || 0), 0) || 0;
  const totalRevenue = realRevenue > 0 ? realRevenue : chartData.reduce((s, d) => s + d.revenue, 0);
  const cogs = totalRevenue * 0.62; // 62% cost
  const grossProfit = totalRevenue - cogs;
  const opex = totalRevenue * 0.11;
  const netProfit = grossProfit - opex;
  const margin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0;
  const todayRevenue = chartData[chartData.length - 1].revenue;
  const yesterdayRevenue = chartData[chartData.length - 2].revenue;
  const dayChange = (((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100).toFixed(1);

  const handleExport = () => {
    showToast('Generating Finance Report...');
    setTimeout(() => {
      const w = window.open('', '_blank');
      w.document.write(`<html><head><title>Finance Report</title><style>body{font-family:Arial;padding:2rem}table{width:100%;border-collapse:collapse;margin:1rem 0}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}.gold{color:#c9a84c;font-weight:bold}</style></head><body>
        <h1 style="color:#c9a84c">Lumina Jewels — Finance Dashboard Report</h1>
        <p>Generated: ${new Date().toLocaleString('en-IN')}</p>
        <h2>Revenue Summary</h2>
        <table><tr><th>Metric</th><th>Amount</th></tr>
        <tr><td>Total Revenue</td><td class="gold">₹${totalRevenue.toLocaleString('en-IN')}</td></tr>
        <tr><td>Cost of Goods (62%)</td><td>₹${cogs.toFixed(0)}</td></tr>
        <tr><td>Gross Profit</td><td>₹${grossProfit.toFixed(0)}</td></tr>
        <tr><td>Operating Expenses (11%)</td><td>₹${opex.toFixed(0)}</td></tr>
        <tr><td>Net Profit</td><td class="gold">₹${netProfit.toFixed(0)}</td></tr>
        <tr><td>Net Margin</td><td>${margin}%</td></tr>
        </table>
        <h2>Payment Monitoring</h2>
        <table><tr><th>Type</th><th>Count</th></tr>
        <tr><td>Successful Payments</td><td style="color:green">${paymentStats.successful}</td></tr>
        <tr><td>Failed Transactions</td><td style="color:red">${paymentStats.failed}</td></tr>
        <tr><td>Pending Refunds</td><td style="color:orange">${paymentStats.pendingRefunds}</td></tr>
        </table>
        <h2>Daily Revenue (Last 14 Days)</h2>
        <table><tr><th>Date</th><th>Revenue</th><th>Orders</th></tr>
        ${chartData.map(d => `<tr><td>${d.day}</td><td>₹${d.revenue.toLocaleString('en-IN')}</td><td>${d.orders}</td></tr>`).join('')}
        </table>
        <p style="text-align:center;color:#999;font-size:0.8rem;margin-top:3rem">Computer Generated — Lumina Jewels Finance</p>
      </body></html>`);
      w.document.close(); w.print();
      showToast('Finance report ready!');
    }, 600);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Finance Dashboard</h1>
          <p className="page-subtitle">Live revenue tracking, payment monitoring, and financial performance metrics.</p>
        </div>
        <div className="page-actions">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--status-green)', fontSize: '0.8rem', fontWeight: 700 }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--status-green)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            Live Data Active
          </div>
          <button className="btn btn-outline" onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Download size={14} /> Export Report
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem' }}>
        {[['revenue', 'Revenue Dashboard'], ['payments', 'Payment Monitoring']].map(([key, label]) => (
          <button key={key} onClick={() => setActiveTab(key)} style={{ padding: '0.7rem 1.5rem', background: 'none', border: 'none', borderBottom: activeTab === key ? '2px solid var(--gold)' : '2px solid transparent', color: activeTab === key ? 'var(--gold)' : 'var(--text-muted)', fontWeight: activeTab === key ? 700 : 400, cursor: 'pointer', fontSize: '0.95rem' }}>
            {label}
          </button>
        ))}
      </div>

      {/* ========= REVENUE DASHBOARD ========= */}
      {activeTab === 'revenue' && (
        <>
          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'Total Revenue', value: `₹${(totalRevenue / 100000).toFixed(1)}L`, sub: 'All-time gross', color: 'var(--gold)', border: 'var(--gold)', icon: <IndianRupee size={18} />, spark: chartData.map(d => d.revenue) },
              { label: 'Net Profit', value: `₹${(netProfit / 100000).toFixed(1)}L`, sub: `${margin}% net margin`, color: 'var(--status-green)', border: 'var(--status-green)', icon: <TrendingUp size={18} />, spark: chartData.map(d => d.revenue * 0.27) },
              { label: "Today's Revenue", value: `₹${(todayRevenue / 1000).toFixed(0)}K`, sub: `${dayChange > 0 ? '▲' : '▼'} ${Math.abs(dayChange)}% vs yesterday`, color: dayChange > 0 ? 'var(--status-green)' : 'var(--status-red)', border: 'var(--gold)', icon: <BarChart2 size={18} />, spark: chartData.slice(-7).map(d => d.revenue) },
              { label: 'Operating Expenses', value: `₹${(opex / 100000).toFixed(1)}L`, sub: '11% of revenue', color: 'var(--status-red)', border: 'var(--status-red)', icon: <TrendingDown size={18} />, spark: chartData.map(d => d.revenue * 0.11) },
            ].map(card => (
              <div key={card.label} className="admin-card" style={{ borderTop: `3px solid ${card.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                  <div style={{ padding: '0.4rem', borderRadius: '6px', background: `${card.color}22`, color: card.color }}>{card.icon}</div>
                  <SparkLine data={card.spark} color={card.color} />
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>{card.label}</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: card.color, lineHeight: 1.2 }}>{card.value}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>{card.sub}</div>
              </div>
            ))}
          </div>

          {/* Daily Revenue Chart */}
          <div className="admin-card mb-15">
            <div className="card-header" style={{ marginBottom: '0.5rem' }}>
              <div>
                <div className="card-title">Daily Revenue Chart — Last 14 Days</div>
                <div className="card-subtitle">Click bars to see order breakdown. Today updates live.</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Peak: <strong style={{ color: 'var(--gold)' }}>₹{Math.max(...chartData.map(d => d.revenue)).toLocaleString('en-IN')}</strong>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Avg: <strong style={{ color: 'var(--text-primary)' }}>₹{Math.round(chartData.reduce((s, d) => s + d.revenue, 0) / chartData.length).toLocaleString('en-IN')}</strong>
                </div>
              </div>
            </div>
            <DailyBarChart data={chartData} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>16 May 2026</span><span style={{ color: 'var(--gold)', fontWeight: 700 }}>Today (live) →</span>
            </div>
          </div>

          {/* P&L Breakdown */}
          <div className="grid-2 mb-15">
            <div className="admin-card">
              <div className="card-title" style={{ marginBottom: '1.5rem' }}>Profit & Loss Breakdown</div>
              {[
                { label: 'Gross Revenue', amount: totalRevenue, color: 'var(--gold)', isPositive: true },
                { label: 'Cost of Goods Sold (62%)', amount: -cogs, color: 'var(--status-red)', isPositive: false },
                { label: 'Gross Profit', amount: grossProfit, color: 'var(--status-green)', isPositive: true, bold: true },
                { label: 'Operating Expenses (11%)', amount: -opex, color: 'var(--status-orange)', isPositive: false },
                { label: 'Net Profit', amount: netProfit, color: 'var(--status-green)', isPositive: true, bold: true, border: true },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 0', borderBottom: row.border ? `2px solid ${row.color}` : '1px solid var(--border)', borderTop: row.border ? `2px solid ${row.color}` : undefined }}>
                  <span style={{ color: row.bold ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: row.bold ? 700 : 400 }}>{row.label}</span>
                  <span style={{ fontWeight: row.bold ? 800 : 600, fontSize: row.bold ? '1.05rem' : '0.95rem', color: row.color }}>
                    {row.isPositive ? '' : '-'}₹{Math.abs(row.amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                </div>
              ))}
              <div style={{ marginTop: '1rem', padding: '0.8rem', background: 'rgba(46,204,113,0.08)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Net Margin</span>
                <span style={{ fontWeight: 800, color: 'var(--status-green)', fontSize: '1.2rem' }}>{margin}%</span>
              </div>
            </div>

            <div className="admin-card">
              <div className="card-title" style={{ marginBottom: '1.5rem' }}>Revenue by Month — 2026</div>
              {[
                { month: 'January', revenue: 1820000, growth: 12 },
                { month: 'February', revenue: 2100000, growth: 15 },
                { month: 'March', revenue: 1950000, growth: -7 },
                { month: 'April', revenue: 2450000, growth: 26 },
                { month: 'May (YTD)', revenue: totalRevenue, growth: Number(dayChange) },
              ].map(m => {
                const maxR = 2450000;
                return (
                  <div key={m.month} style={{ marginBottom: '0.8rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{m.month}</span>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700 }}>₹{(m.revenue / 100000).toFixed(1)}L</span>
                        <span style={{ fontSize: '0.75rem', color: m.growth >= 0 ? 'var(--status-green)' : 'var(--status-red)', fontWeight: 700 }}>
                          {m.growth >= 0 ? '▲' : '▼'} {Math.abs(m.growth)}%
                        </span>
                      </div>
                    </div>
                    <div style={{ height: '6px', background: 'var(--surface)', borderRadius: '3px' }}>
                      <div style={{ width: `${Math.min((m.revenue / maxR) * 100, 100)}%`, height: '100%', background: 'linear-gradient(90deg, var(--gold), #f1c40f)', borderRadius: '3px', transition: 'width 0.4s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ========= PAYMENT MONITORING ========= */}
      {activeTab === 'payments' && (
        <>
          {/* Payment KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="admin-card" style={{ borderTop: '3px solid var(--status-green)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                <CheckCircle size={24} color="var(--status-green)" />
                <span style={{ fontSize: '0.75rem', color: 'var(--status-green)', fontWeight: 700 }}>98.3% success rate</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Successful Payments</div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--status-green)' }}>{paymentStats.successful}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total this month</div>
            </div>

            <div className="admin-card" style={{ borderTop: '3px solid var(--status-red)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                <AlertCircle size={24} color="var(--status-red)" />
                <span style={{ fontSize: '0.75rem', color: 'var(--status-red)', fontWeight: 700 }}>1.7% failure rate</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Failed Transactions</div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--status-red)' }}>{paymentStats.failed}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Requires follow-up</div>
            </div>

            <div className="admin-card" style={{ borderTop: '3px solid var(--status-orange)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                <Clock size={24} color="var(--status-orange)" />
                <span style={{ fontSize: '0.75rem', color: 'var(--status-orange)', fontWeight: 700 }}>₹{(paymentStats.refundAmount / 1000).toFixed(0)}K pending</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Pending Refunds</div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--status-orange)' }}>{paymentStats.pendingRefunds}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Avg 3–5 business days</div>
            </div>
          </div>

          <div className="grid-2 mb-15">
            {/* Transaction failure analysis */}
            <div className="admin-card">
              <div className="card-title" style={{ marginBottom: '1.5rem' }}>Failure Reason Analysis</div>
              {paymentStats.failureReasons.map(r => {
                const pct = Math.round((r.count / paymentStats.failed) * 100);
                return (
                  <div key={r.reason} style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{r.reason}</span>
                      <span style={{ fontWeight: 700, color: 'var(--status-red)' }}>{r.count} ({pct}%)</span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--surface)', borderRadius: '3px' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: 'var(--status-red)', borderRadius: '3px', opacity: 0.7 }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Payment method distribution */}
            <div className="admin-card">
              <div className="card-title" style={{ marginBottom: '1.5rem' }}>Payment Method Distribution</div>
              {[
                { method: 'UPI', pct: 42, color: '#9b59b6', count: Math.round(paymentStats.successful * 0.42) },
                { method: 'Credit Card', pct: 28, color: '#3498db', count: Math.round(paymentStats.successful * 0.28) },
                { method: 'Net Banking', pct: 18, color: 'var(--gold)', count: Math.round(paymentStats.successful * 0.18) },
                { method: 'Debit Card', pct: 8, color: '#1abc9c', count: Math.round(paymentStats.successful * 0.08) },
                { method: 'EMI / Other', pct: 4, color: 'var(--status-orange)', count: Math.round(paymentStats.successful * 0.04) },
              ].map(m => (
                <div key={m.method} style={{ marginBottom: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: m.color }} />
                      <span style={{ color: 'var(--text-secondary)' }}>{m.method}</span>
                    </div>
                    <span style={{ fontWeight: 700 }}>{m.pct}% <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({m.count} txns)</span></span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--surface)', borderRadius: '3px' }}>
                    <div style={{ width: `${m.pct}%`, height: '100%', background: m.color, borderRadius: '3px' }} />
                  </div>
                </div>
              ))}

              <div style={{ marginTop: '1.5rem', padding: '0.8rem', background: 'rgba(201,168,76,0.06)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Volume (Month)</span>
                <span style={{ fontWeight: 800, color: 'var(--gold)', fontSize: '1.1rem' }}>₹{(totalRevenue / 100000).toFixed(1)}L</span>
              </div>
            </div>
          </div>

          {/* Refund Queue */}
          <div className="admin-card">
            <div className="card-header" style={{ marginBottom: '1rem' }}>
              <div className="card-title">Pending Refund Queue</div>
              <span style={{ fontSize: '0.8rem', color: 'var(--status-orange)', fontWeight: 700 }}>{paymentStats.pendingRefunds} pending · ₹{paymentStats.refundAmount.toLocaleString('en-IN')} total</span>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table" style={{ fontSize: '0.85rem' }}>
                <thead>
                  <tr><th>Refund ID</th><th>Customer</th><th>Order</th><th>Amount</th><th>Reason</th><th>Days Pending</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {[
                    { id: 'REF-0041', customer: 'Mehta Priya', order: '#ORD-88080', amount: 95000, reason: 'Item not delivered', days: 3 },
                    { id: 'REF-0039', customer: 'Rajan Kohli', order: '#ORD-88062', amount: 45000, reason: 'Wrong item received', days: 5 },
                    { id: 'REF-0037', customer: 'Anjali Singh', order: '#ORD-88041', amount: 18500, reason: 'Cancelled order', days: 7 },
                  ].map(r => (
                    <tr key={r.id}>
                      <td style={{ fontFamily: 'monospace', color: 'var(--gold)' }}>{r.id}</td>
                      <td style={{ fontWeight: 600 }}>{r.customer}</td>
                      <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{r.order}</td>
                      <td style={{ fontWeight: 700 }}>₹{r.amount.toLocaleString('en-IN')}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{r.reason}</td>
                      <td>
                        <span style={{ color: r.days > 5 ? 'var(--status-red)' : 'var(--status-orange)', fontWeight: 700 }}>
                          {r.days}d {r.days > 5 ? '⚠️' : ''}
                        </span>
                      </td>
                      <td><span style={{ padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, background: 'rgba(231,76,60,0.12)', color: 'var(--status-orange)' }}>Processing</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
