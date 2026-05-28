import { revenueData } from '../data/mockData';
import { Calendar, Cpu, Download, DownloadCloud, FileText, FileSpreadsheet, TrendingUp, RefreshCcw, Store, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

function SimpleBarChart({ data }) {
  const max = Math.max(...data.map(d => d.revenue));
  return (
    <div className="chart-bar-wrap" style={{ height: '250px' }}>
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

export default function Analytics() {
  const { user } = useApp();
  const isManagerOrAbove = ['manager', 'superadmin', 'admin'].includes(user?.role);

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">Analytics & AI Reports</h1>
          <p className="page-subtitle">Deep dive into sales performance, customer behavior, and predictive insights.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Calendar size={14} /> Last 12 Months
          </button>
        </div>
      </div>

      {isManagerOrAbove && (
        <div className="admin-card" style={{ marginBottom: '1.5rem', background: 'linear-gradient(90deg, var(--surface), rgba(201,168,76,0.05))' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <div>
               <h3 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                 <DownloadCloud size={18} color="var(--gold)" /> Report Generation Studio
               </h3>
               <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Export critical business data in CSV or PDF formats.</p>
             </div>
             <div style={{ display: 'flex', gap: '1rem' }}>
               <button className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><FileText size={14} /> Sales Report</button>
               <button className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><FileSpreadsheet size={14} /> Revenue Report</button>
               <button className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Download size={14} /> Inventory Report</button>
             </div>
          </div>
        </div>
      )}

      {isManagerOrAbove && (
        <div className="grid-4 mb-15">
          <div className="admin-card text-center" style={{ padding: '1.5rem' }}>
             <div className="icon-wrapper" style={{ margin: '0 auto 1rem', background: 'rgba(201,168,76,0.1)' }}>
               <TrendingUp color="var(--gold)" />
             </div>
             <div style={{ fontSize: '1.5rem', fontWeight: 600, fontFamily: 'Inter' }}>₹1.2Cr</div>
             <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Scheme Enrollments (YTD)</div>
          </div>
          <div className="admin-card text-center" style={{ padding: '1.5rem' }}>
             <div className="icon-wrapper" style={{ margin: '0 auto 1rem', background: 'rgba(201,168,76,0.1)' }}>
               <RefreshCcw color="var(--gold)" />
             </div>
             <div style={{ fontSize: '1.5rem', fontWeight: 600, fontFamily: 'Inter' }}>850g</div>
             <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Buyback Volume (Last 30 Days)</div>
          </div>
          <div className="admin-card text-center" style={{ padding: '1.5rem' }}>
             <div className="icon-wrapper" style={{ margin: '0 auto 1rem', background: 'rgba(46, 204, 113, 0.1)' }}>
               <Store color="#2ecc71" />
             </div>
             <div style={{ fontSize: '1.5rem', fontWeight: 600, fontFamily: 'Inter' }}>+12.4%</div>
             <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Store Walk-ins vs Last Month</div>
          </div>
          <div className="admin-card text-center" style={{ padding: '1.5rem' }}>
             <div className="icon-wrapper" style={{ margin: '0 auto 1rem', background: 'rgba(155, 89, 182, 0.1)' }}>
               <Sparkles color="#9b59b6" />
             </div>
             <div style={{ fontSize: '1.5rem', fontWeight: 600, fontFamily: 'Inter' }}>₹4.5Cr</div>
             <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Bridal Sales Analytics (Q2)</div>
          </div>
        </div>
      )}

      <div className="grid-2-1 mb-15">
        <div className="admin-card" style={{ gridColumn: 'span 2' }}>
          <div className="card-header">
            <div>
              <div className="card-title">Comprehensive Revenue Analysis</div>
              <div className="card-subtitle">Monthly breakdown including tax and shipping</div>
            </div>
          </div>
          <SimpleBarChart data={revenueData} />
        </div>

        <div className="admin-card">
          <div className="card-header">
            <div className="card-title">Top Selling Products</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { n: 'Royal Diamond Necklace Set', v: '₹85.5L', p: '24 units' },
              { n: 'Solitaire Diamond Ring 1.5ct', v: '₹42.9L', p: '22 units' },
              { n: 'Polki Kundan Bridal Choker', v: '₹33.0L', p: '20 units' },
              { n: 'Platinum Solitaire Ring', v: '₹26.1L', p: '18 units' },
              { n: 'Gold Jhumka Earrings 22KT', v: '₹19.3L', p: '43 units' }
            ].map((p, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{i+1}. {p.n}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{p.p}</div>
                </div>
                <div style={{ fontWeight: 700, color: 'var(--gold)', fontSize: '0.85rem' }}>{p.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-2 mb-15">
         <div className="ai-panel" style={{ height: '100%' }}>
          <div className="ai-header" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Cpu size={24} color="var(--gold)" />
            <div>
              <div className="ai-badge">Predictive Analytics</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>AI-driven forecasts for Q3</div>
            </div>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
            Based on historical data and current market trends, our AI model predicts a <strong>15% surge</strong> in Bridal Collection sales starting next month. 
          </p>
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
             <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Recommended Actions:</div>
             <ul style={{ fontSize: '0.75rem', color: 'var(--text-primary)', paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li style={{ listStyleType: 'disc' }}>Increase inventory for <strong>Polki Kundan</strong> sets by 20%.</li>
                <li style={{ listStyleType: 'disc' }}>Launch targeted email campaign for customers who bought engagement rings 6-12 months ago.</li>
                <li style={{ listStyleType: 'disc' }}>Optimize homepage banner for Bridal Collections.</li>
             </ul>
          </div>
        </div>

        <div className="admin-card">
          <div className="card-header">
            <div className="card-title">Customer Acquisition Cost (CAC)</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, fontFamily: 'Inter, sans-serif', color: 'var(--text-primary)', lineHeight: 1 }}>₹1,240</div>
            <div style={{ color: 'var(--status-green)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.4rem' }}>↓ 8.5% from last month</div>
          </div>
          <div className="progress-bar-wrap">
            <div className="progress-item">
               <div className="progress-label-row">
                 <span className="progress-name">Organic Search (SEO)</span>
                 <span className="progress-val">₹450 / user</span>
               </div>
               <div className="progress-track"><div className="progress-fill" style={{ width: '80%', background: '#2ecc71' }}></div></div>
            </div>
            <div className="progress-item">
               <div className="progress-label-row">
                 <span className="progress-name">Social Media Ads</span>
                 <span className="progress-val">₹1,800 / user</span>
               </div>
               <div className="progress-track"><div className="progress-fill" style={{ width: '45%', background: '#3498db' }}></div></div>
            </div>
             <div className="progress-item">
               <div className="progress-label-row">
                 <span className="progress-name">Google Ads (PPC)</span>
                 <span className="progress-val">₹2,100 / user</span>
               </div>
               <div className="progress-track"><div className="progress-fill" style={{ width: '30%', background: '#e74c3c' }}></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
