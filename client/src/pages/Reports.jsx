import React from 'react';
import { FileText, Download, Calendar } from 'lucide-react';

const REPORTS = [
  { title: 'Daily Sales Report',       desc: 'Complete breakdown of today\'s transactions',  period: 'Today',      icon: '📊', ready: true  },
  { title: 'Monthly Revenue Summary',  desc: 'Revenue, expenses and profit for this month',  period: 'This Month', icon: '📈', ready: true  },
  { title: 'Inventory Valuation',      desc: 'Current gold weight, gem grades & valuations', period: 'Real-time',  icon: '💎', ready: true  },
  { title: 'Low Stock Alert Report',   desc: 'Items approaching reorder threshold',           period: 'Real-time',  icon: '⚠️',  ready: true  },
  { title: 'Top Customers Report',     desc: 'Customer ranking by lifetime value',            period: 'All time',   icon: '👥', ready: false },
  { title: 'GST Filing Report',        desc: 'GST-ready sales summary for filing',            period: 'Quarterly',  icon: '📋', ready: false },
];

const Reports = () => (
  <div className="admin-fade-in">
    <div className="page-header">
      <div>
        <h1 className="page-title">Reports</h1>
        <p className="page-subtitle">Export and review performance reports</p>
      </div>
      <button className="admin-btn admin-btn-gold">
        <Calendar size={14} /> Schedule Report
      </button>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
      {REPORTS.map(r => (
        <div key={r.title} className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
              {r.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontWeight: 700, color: '#f0ebe0', fontSize: '0.875rem' }}>{r.title}</p>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: 'rgba(232,224,208,0.45)', lineHeight: 1.5 }}>{r.desc}</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="badge badge-gray" style={{ fontSize: '0.65rem' }}>
              <Calendar size={9} style={{ display: 'inline' }} /> {r.period}
            </span>
            <button
              className={`admin-btn ${r.ready ? 'admin-btn-outline' : 'admin-btn-ghost'}`}
              style={{ fontSize: '0.75rem', padding: '0.4rem 0.85rem', gap: '0.35rem' }}
              disabled={!r.ready}
            >
              <Download size={12} /> {r.ready ? 'Export CSV' : 'Coming Soon'}
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default Reports;
