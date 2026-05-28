import { useState } from 'react';
import { transactions } from '../data/mockData';
import { Search, ShieldAlert, FileText, CheckCircle, Clock } from 'lucide-react';

export default function PaymentManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Status: All');
  const [methodFilter, setMethodFilter] = useState('Method: All');

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.customer.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter !== 'Status: All') matchesStatus = t.status.toLowerCase() === statusFilter.toLowerCase();

    let matchesMethod = true;
    if (methodFilter !== 'Method: All') matchesMethod = t.method.toLowerCase() === methodFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesMethod;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Payments & Financial Control</h1>
          <p className="page-subtitle">Monitor online payments, detect fraud, handle refunds, and manage vendor payouts.</p>
        </div>
      </div>

      <div className="grid-4 mb-15">
        <div className="stat-card">
          <div className="stat-label">Today's Collections</div>
          <div className="stat-value" style={{ color: 'var(--status-green)' }}>₹14.5L</div>
          <div className="stat-trend up" style={{ marginTop: '0.5rem' }}>↑ 12% vs yesterday</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending Settlements</div>
          <div className="stat-value" style={{ color: 'var(--status-orange)' }}>₹2.8L</div>
          <div className="stat-trend" style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>from Razorpay & Stripe</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Refunds Processed</div>
          <div className="stat-value" style={{ color: 'var(--status-purple)' }}>₹4.2L</div>
          <div className="stat-trend" style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>14 transactions (May)</div>
        </div>
        <div className="stat-card" style={{ background: 'var(--status-red-bg)', border: '1px solid var(--status-red)' }}>
          <div className="stat-label" style={{ color: 'var(--status-red)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShieldAlert size={14} /> Suspicious Activity
          </div>
          <div className="stat-value" style={{ color: 'var(--status-red)' }}>2 Alerts</div>
          <div className="stat-trend" style={{ marginTop: '0.5rem', color: 'var(--text-primary)', fontSize: '0.75rem' }}>Requires manual verification</div>
        </div>
      </div>

      <div className="grid-2 mb-15">
        <div className="admin-card">
           <h3 className="card-title" style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <ShieldAlert size={18} color="var(--status-red)" /> Fraud Detection Queue
           </h3>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             <div style={{ padding: '1rem', background: 'var(--surface)', borderRadius: '8px', borderLeft: '3px solid var(--status-red)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>TXN-999823</span>
                  <span className="badge badge-danger">High Risk</span>
                </div>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Multiple failed high-value credit card attempts from IP address outside India.</p>
                <button className="btn btn-sm btn-outline">Review Transaction</button>
             </div>
             <div style={{ padding: '1rem', background: 'var(--surface)', borderRadius: '8px', borderLeft: '3px solid var(--status-orange)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>TXN-999845</span>
                  <span className="badge badge-warning">Medium Risk</span>
                </div>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Unusual refund pattern detected for customer ID #CU-881.</p>
                <button className="btn btn-sm btn-outline">Review Activity</button>
             </div>
           </div>
        </div>

        <div className="admin-card">
           <h3 className="card-title" style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <Clock size={18} color="var(--gold)" /> Vendor Commissions & Payouts
           </h3>
           <div className="admin-table-wrap">
             <table className="admin-table" style={{ fontSize: '0.85rem' }}>
               <thead>
                 <tr>
                   <th>Vendor</th>
                   <th>Due Amount</th>
                   <th>Status</th>
                   <th>Action</th>
                 </tr>
               </thead>
               <tbody>
                 <tr>
                   <td style={{ fontWeight: 600 }}>Aura Diamonds</td>
                   <td style={{ fontFamily: 'Inter', fontWeight: 600 }}>₹1.2L</td>
                   <td><span className="badge badge-warning">Pending</span></td>
                   <td><button className="btn btn-sm btn-gold">Release</button></td>
                 </tr>
                 <tr>
                   <td style={{ fontWeight: 600 }}>Heritage Silvers</td>
                   <td style={{ fontFamily: 'Inter', fontWeight: 600 }}>₹45,000</td>
                   <td><span className="badge badge-success">Paid</span></td>
                   <td><span style={{ color: 'var(--text-muted)' }}>Settled</span></td>
                 </tr>
               </tbody>
             </table>
           </div>
        </div>
      </div>

      <div className="admin-card">
        <div className="card-header">
          <div className="card-title">Transaction Ledger & Billing</div>
        </div>

        <div className="filter-bar" style={{ marginBottom: '1.25rem' }}>
          <div className="filter-search" style={{ margin: 0, width: '250px' }}>
            <Search size={14} />
            <input 
              placeholder="Search TXN ID, Order ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select className="form-input" style={{ width: '150px', padding: '0.475rem 0.875rem' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option>Status: All</option>
            <option>Success</option>
            <option>Pending</option>
            <option>Failed</option>
            <option>Refunded</option>
          </select>
          <select className="form-input" style={{ width: '150px', padding: '0.475rem 0.875rem' }} value={methodFilter} onChange={e => setMethodFilter(e.target.value)}>
            <option>Method: All</option>
            <option>UPI</option>
            <option>Credit Card</option>
            <option>Net Banking</option>
            <option>EMI</option>
          </select>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Order ID & Customer</th>
                <th>Amount & Method</th>
                <th>Gateway</th>
                <th>Status</th>
                <th>Action</th>
                <th>Billing</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No transactions found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map(t => (
                  <tr key={t.id}>
                    <td style={{ color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: '0.8rem' }}>{t.id}</td>
                    <td>
                      <div style={{ color: 'var(--gold)', fontWeight: 700, fontFamily: 'monospace', fontSize: '0.8rem' }}>{t.orderId}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.customer}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>₹{t.amount.toLocaleString('en-IN')}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t.method}</div>
                    </td>
                    <td>{t.gateway}</td>
                    <td>
                      <span className={`badge badge-${t.status}`}>
                        {t.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {t.status === 'success' && <button className="btn btn-sm btn-outline">Process Refund</button>}
                      {t.status === 'failed' && <button className="btn btn-sm btn-outline">Check Logs</button>}
                      {t.status === 'pending' && <button className="btn btn-sm btn-outline">Verify</button>}
                      {t.status === 'refunded' && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><CheckCircle size={12} /> Settled</span>}
                    </td>
                    <td>
                      {(t.status === 'success' || t.status === 'refunded') && (
                        <button className="btn btn-sm btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--gold)', borderColor: 'var(--border-color)' }}>
                          <FileText size={12} /> PDF
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
