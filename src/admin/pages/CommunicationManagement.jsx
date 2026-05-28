import { useState } from 'react';
import { communications } from '../data/mockData';
import { Mail, MessageSquare, Send, Bell, Filter, Search } from 'lucide-react';

export default function CommunicationManagement() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredComms = communications.filter(c => 
    c.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.target.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Communication Management</h1>
          <p className="page-subtitle">Manage customer emails, SMS alerts, and automated notifications.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline">Template Library</button>
          <button className="btn btn-gold">+ New Campaign</button>
        </div>
      </div>

      <div className="grid-3 mb-15">
        <div className="admin-card text-center" style={{ padding: '2rem 1rem' }}>
          <div className="icon-wrapper" style={{ margin: '0 auto 1rem', background: 'var(--gold-light)' }}>
            <Mail color="var(--gold)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>45.2K</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Emails Sent (This Month)</div>
        </div>
        <div className="admin-card text-center" style={{ padding: '2rem 1rem' }}>
          <div className="icon-wrapper" style={{ margin: '0 auto 1rem', background: 'var(--gold-light)' }}>
            <MessageSquare color="var(--gold)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>12.4K</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>SMS Delivered</div>
        </div>
        <div className="admin-card text-center" style={{ padding: '2rem 1rem' }}>
          <div className="icon-wrapper" style={{ margin: '0 auto 1rem', background: 'var(--gold-light)' }}>
            <Bell color="var(--gold)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>98.5%</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Delivery Rate</div>
        </div>
      </div>

      <div className="admin-card">
        <div className="card-header">
          <div className="card-title">Recent Campaigns & Alerts</div>
          <div className="filter-search" style={{ margin: 0, width: '250px' }}>
            <Search size={14} />
            <input 
              placeholder="Search communications..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Subject</th>
                <th>Target Audience</th>
                <th>Sent Date</th>
                <th>Performance</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredComms.map((comm) => (
                <tr key={comm.id}>
                  <td style={{ fontFamily: 'Inter, monospace', fontSize: '0.85rem' }}>{comm.id}</td>
                  <td>{comm.type}</td>
                  <td style={{ fontWeight: 600 }}>{comm.subject}</td>
                  <td>{comm.target}</td>
                  <td style={{ fontSize: '0.85rem' }}>{comm.sentDate}</td>
                  <td style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>{comm.performance}</td>
                  <td>
                    <span className={`badge badge-${comm.status === 'completed' ? 'active' : 'superadmin'}`}>
                      {comm.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                     <button className="btn btn-sm btn-outline" title="View Report"><Send size={12} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
