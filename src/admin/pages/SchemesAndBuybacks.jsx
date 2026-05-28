import { useState } from 'react';
import { schemes, exchangeRequests } from '../data/mockData';
import { IndianRupee, RefreshCw, CheckCircle, Search } from 'lucide-react';

export default function SchemesAndBuybacks() {
  const [activeTab, setActiveTab] = useState('schemes');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSchemes = schemes.filter(s => 
    s.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredExchanges = exchangeRequests.filter(e => 
    e.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Schemes & Buybacks</h1>
          <p className="page-subtitle">Manage customer gold savings schemes, old gold exchanges, and buyback evaluations.</p>
        </div>
        <div className="page-actions">
           {activeTab === 'schemes' ? (
             <button className="btn btn-gold">+ New Scheme Enrollment</button>
           ) : (
             <button className="btn btn-gold">+ New Exchange Request</button>
           )}
        </div>
      </div>

      <div className="admin-tabs" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button 
          className={`tab-btn ${activeTab === 'schemes' ? 'active' : ''}`}
          onClick={() => setActiveTab('schemes')}
          style={{ background: 'none', border: 'none', fontSize: '1rem', fontWeight: 600, color: activeTab === 'schemes' ? 'var(--gold)' : 'var(--text-muted)', cursor: 'pointer', borderBottom: activeTab === 'schemes' ? '2px solid var(--gold)' : 'none', paddingBottom: '0.5rem' }}
        >
          Savings Schemes
        </button>
        <button 
          className={`tab-btn ${activeTab === 'exchanges' ? 'active' : ''}`}
          onClick={() => setActiveTab('exchanges')}
          style={{ background: 'none', border: 'none', fontSize: '1rem', fontWeight: 600, color: activeTab === 'exchanges' ? 'var(--gold)' : 'var(--text-muted)', cursor: 'pointer', borderBottom: activeTab === 'exchanges' ? '2px solid var(--gold)' : 'none', paddingBottom: '0.5rem' }}
        >
          Exchange / Buyback
        </button>
      </div>

      <div className="admin-card">
        <div className="card-header">
          <div className="card-title">{activeTab === 'schemes' ? 'Active Schemes' : 'Exchange Requests'}</div>
          <div className="filter-search" style={{ margin: 0, width: '250px' }}>
            <Search size={14} />
            <input 
              placeholder="Search by ID or customer..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            {activeTab === 'schemes' ? (
              <>
                <thead>
                  <tr>
                    <th>Scheme ID</th>
                    <th>Customer Name</th>
                    <th>Plan Name</th>
                    <th>Start Date</th>
                    <th>Installment</th>
                    <th>Progress</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSchemes.map((scheme) => (
                    <tr key={scheme.id}>
                      <td style={{ fontFamily: 'Inter, monospace', fontSize: '0.85rem' }}>{scheme.id}</td>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{scheme.customer}</td>
                      <td>{scheme.plan}</td>
                      <td style={{ fontSize: '0.85rem' }}>{scheme.startDate}</td>
                      <td style={{ fontFamily: 'Inter, sans-serif' }}>₹{scheme.installment.toLocaleString()}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                           <div style={{ width: '80px', height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ width: `${(scheme.monthsPaid / 11) * 100}%`, height: '100%', background: 'var(--gold)' }}></div>
                           </div>
                           <span style={{ fontSize: '0.75rem', fontFamily: 'Inter, sans-serif' }}>{scheme.monthsPaid}/11</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge badge-${scheme.status === 'active' ? 'active' : 'superadmin'}`}>
                          {scheme.status.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-outline">Manage</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </>
            ) : (
              <>
                <thead>
                  <tr>
                    <th>Request ID</th>
                    <th>Customer Name</th>
                    <th>Item Description</th>
                    <th>Approx Weight</th>
                    <th>Requested Date</th>
                    <th>Offer Amount</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExchanges.map((exc) => (
                    <tr key={exc.id}>
                      <td style={{ fontFamily: 'Inter, monospace', fontSize: '0.85rem' }}>{exc.id}</td>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{exc.customer}</td>
                      <td>{exc.item}</td>
                      <td style={{ fontFamily: 'Inter, sans-serif' }}>{exc.approxWeight}</td>
                      <td style={{ fontSize: '0.85rem' }}>{exc.requestedDate}</td>
                      <td style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, color: exc.offerAmount ? 'var(--status-green)' : 'inherit' }}>
                        {exc.offerAmount ? `₹${exc.offerAmount.toLocaleString()}` : '-'}
                      </td>
                      <td>
                        <span className={`badge badge-${exc.status === 'offer_made' ? 'active' : 'pending'}`}>
                          {exc.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-outline">Evaluate</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
