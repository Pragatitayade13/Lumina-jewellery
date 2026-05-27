import React, { useState } from 'react';
import { IndianRupee, TrendingUp, TrendingDown, FileText, Download, Filter, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';

const FINANCE_DATA = [
  { month: 'Jan', revenue: 1450000, expenses: 980000, profit: 470000 },
  { month: 'Feb', revenue: 1620000, expenses: 1050000, profit: 570000 },
  { month: 'Mar', revenue: 1850000, expenses: 1120000, profit: 730000 },
  { month: 'Apr', revenue: 1540000, expenses: 1010000, profit: 530000 },
  { month: 'May', revenue: 2100000, expenses: 1250000, profit: 850000 },
  { month: 'Jun', revenue: 1980000, expenses: 1180000, profit: 800000 },
];

const TRANSACTIONS = [
  { id: 'TRX-001', date: '2024-08-12', desc: 'Raw Gold Purchase (100g)', type: 'Expense', amount: 625000, category: 'Raw Materials', status: 'Completed' },
  { id: 'TRX-002', date: '2024-08-11', desc: 'Sales - Invoice #INV-1042', type: 'Income', amount: 145000, category: 'Sales', status: 'Completed' },
  { id: 'TRX-003', date: '2024-08-10', desc: 'Staff Salary - August', type: 'Expense', amount: 125000, category: 'Payroll', status: 'Completed' },
  { id: 'TRX-004', date: '2024-08-09', desc: 'Sales - Invoice #INV-1041', type: 'Income', amount: 280000, category: 'Sales', status: 'Completed' },
  { id: 'TRX-005', date: '2024-08-08', desc: 'Marketing - Facebook Ads', type: 'Expense', amount: 45000, category: 'Marketing', status: 'Completed' },
  { id: 'TRX-006', date: '2024-08-07', desc: 'Store Rent', type: 'Expense', amount: 150000, category: 'Rent', status: 'Completed' },
  { id: 'TRX-007', date: '2024-08-06', desc: 'Sales - Invoice #INV-1040', type: 'Income', amount: 320000, category: 'Sales', status: 'Pending' },
];

const GST_DATA = [
  { period: 'July 2024', totalSales: 2100000, gstCollected: 63000, status: 'Filed', dueDate: '2024-08-20' },
  { period: 'August 2024', totalSales: 1540000, gstCollected: 46200, status: 'Pending', dueDate: '2024-09-20' },
];

const fmt = (v) => `₹${(v / 100000).toFixed(2)}L`;
const fmtFull = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#13131a', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 10, padding: '0.7rem 1rem' }}>
      <p style={{ margin: '0 0 0.4rem', fontSize: '0.7rem', color: 'rgba(232,224,208,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ margin: '0.1rem 0', color: p.color, fontSize: '0.85rem', fontWeight: 700 }}>
          {p.name}: {fmtFull(p.value)}
        </p>
      ))}
    </div>
  );
};

const Finance = () => {
  const [filter, setFilter] = useState('All');

  const filteredTransactions = TRANSACTIONS.filter(t => filter === 'All' || t.type === filter);

  const kpis = [
    { label: 'Total Revenue (YTD)', value: '₹1.05Cr', trend: '+12.5%', up: true, icon: IndianRupee },
    { label: 'Total Expenses (YTD)', value: '₹65.9L', trend: '+5.2%', up: false, icon: TrendingDown },
    { label: 'Net Profit (YTD)', value: '₹39.5L', trend: '+24.8%', up: true, icon: TrendingUp },
    { label: 'Current Cash Flow', value: '₹12.4L', trend: 'Healthy', up: true, icon: Wallet },
  ];

  return (
    <div className="admin-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Finance & GST</h1>
          <p className="page-subtitle">P&L, cash flow, and tax reports</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="admin-btn admin-btn-outline">
            <Filter size={14} /> Filter
          </button>
          <button className="admin-btn admin-btn-gold">
            <Download size={14} /> Export Report
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid" style={{ marginBottom: '1.5rem' }}>
        {kpis.map((k, i) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="kpi-card-admin" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="kpi-icon-wrap" style={{ background: k.up ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)' }}>
                <Icon size={18} style={{ color: k.up ? '#4ade80' : '#f87171' }} />
              </div>
              <p className="kpi-label-admin">{k.label}</p>
              <p className="kpi-value-admin">{k.value}</p>
              <span className={`kpi-trend ${k.up ? 'up' : 'down'}`}>
                {k.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />} {k.trend}
              </span>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* P&L Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Profit & Loss Overview</h3>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={FINANCE_DATA} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: 'rgba(232,224,208,0.5)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(232,224,208,0.5)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={fmt} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '0.8rem', color: 'rgba(232,224,208,0.7)' }} />
              <Bar dataKey="revenue" name="Revenue" fill="#d4af37" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" name="Expenses" fill="#f87171" radius={[4, 4, 0, 0]} />
              <Bar dataKey="profit" name="Net Profit" fill="#4ade80" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* GST Reports */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">GST Filing Status</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {GST_DATA.map(g => (
              <div key={g.period} className="admin-card" style={{ padding: '1rem', border: '1px solid rgba(212,175,55,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 700, color: '#f0ebe0' }}>{g.period}</span>
                  <span className={`badge ${g.status === 'Filed' ? 'badge-green' : 'badge-yellow'}`}>{g.status}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'rgba(232,224,208,0.6)', marginBottom: '0.2rem' }}>
                  <span>Total Sales:</span>
                  <span>{fmtFull(g.totalSales)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, color: '#d4af37' }}>
                  <span>GST Collected (3%):</span>
                  <span>{fmtFull(g.gstCollected)}</span>
                </div>
                {g.status === 'Pending' && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <button className="admin-btn admin-btn-outline" style={{ width: '100%', justifyContent: 'center', fontSize: '0.75rem', padding: '0.4rem' }}>
                      Prepare GSTR-1
                    </button>
                    <p style={{ margin: '0.4rem 0 0', fontSize: '0.65rem', color: '#f87171', textAlign: 'center' }}>Due by {g.dueDate}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="chart-card">
        <div className="chart-header">
          <h3 className="chart-title">Recent Transactions</h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
             {['All', 'Income', 'Expense'].map(type => (
               <button
                 key={type}
                 onClick={() => setFilter(type)}
                 style={{
                   padding: '0.3rem 0.75rem', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600, border: 'none', cursor: 'pointer',
                   background: filter === type ? 'rgba(212,175,55,0.15)' : 'transparent',
                   color: filter === type ? '#d4af37' : 'rgba(232,224,208,0.5)',
                 }}
               >
                 {type}
               </button>
             ))}
          </div>
        </div>
        <div className="admin-table-wrap" style={{ border: 'none' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Transaction ID</th>
                <th>Description</th>
                <th>Category</th>
                <th>Type</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map(t => (
                <tr key={t.id}>
                  <td style={{ color: 'rgba(232,224,208,0.6)', fontSize: '0.8rem' }}>{t.date}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'rgba(212,175,55,0.7)' }}>{t.id}</td>
                  <td style={{ fontWeight: 600, color: '#f0ebe0' }}>{t.desc}</td>
                  <td style={{ fontSize: '0.8rem', color: 'rgba(232,224,208,0.6)' }}>{t.category}</td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.75rem', fontWeight: 600, color: t.type === 'Income' ? '#4ade80' : '#f87171' }}>
                      {t.type === 'Income' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />} {t.type}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: t.type === 'Income' ? '#4ade80' : '#f0ebe0' }}>
                    {t.type === 'Income' ? '+' : '-'}{fmtFull(t.amount)}
                  </td>
                  <td><span className={`badge ${t.status === 'Completed' ? 'badge-green' : 'badge-yellow'}`}>{t.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Finance;
