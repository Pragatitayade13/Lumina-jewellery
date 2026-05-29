import { useState } from 'react';
import { communications } from '../data/mockData';
import { Mail, MessageSquare, Send, Bell, Filter, Search, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function CommunicationManagement() {
  const { showToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewReport, setViewReport] = useState(null);
  const [newCampaignOpen, setNewCampaignOpen] = useState(false);
  const [commsList, setCommsList] = useState(communications);
  const [newCampaignData, setNewCampaignData] = useState({ subject: '', type: 'Email', target: 'All Customers', content: '' });

  const filteredComms = commsList.filter(c => 
    c.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.target.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendCampaign = (e) => {
    e.preventDefault();
    const newCampaign = {
      id: `CMP-${Math.floor(1000 + Math.random() * 9000)}`,
      type: newCampaignData.type,
      subject: newCampaignData.subject,
      target: newCampaignData.target,
      sentDate: new Date().toLocaleDateString('en-GB'),
      performance: 'Pending...',
      status: 'active'
    };
    setCommsList([newCampaign, ...commsList]);
    showToast('New campaign successfully dispatched to targets!');
    setNewCampaignOpen(false);
    setNewCampaignData({ subject: '', type: 'Email', target: 'All Customers', content: '' });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Communication Management</h1>
          <p className="page-subtitle">Manage customer emails, SMS alerts, and automated notifications.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline" onClick={() => showToast('Template library is currently empty.', 'error')}>Template Library</button>
          <button className="btn btn-gold" onClick={() => setNewCampaignOpen(true)}>+ New Campaign</button>
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
                     <button className="btn btn-sm btn-outline" title="View Report" onClick={() => setViewReport(comm)}>
                       <Send size={12} />
                     </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Report Modal */}
      {viewReport && (
        <div className="modal-overlay" onClick={() => setViewReport(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>Campaign Report: {viewReport.id}</h3>
              <button className="modal-close" onClick={() => setViewReport(null)}><X size={20} /></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Subject</p>
                <p style={{ fontWeight: 600, fontSize: '1rem' }}>{viewReport.subject}</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Type</p>
                  <p>{viewReport.type}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Target</p>
                  <p>{viewReport.target}</p>
                </div>
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Sent Date</p>
                <p>{viewReport.sentDate}</p>
              </div>
              <div style={{ background: 'var(--bg-card-hover)', padding: '1rem', borderRadius: '8px' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Performance</p>
                <h2 style={{ color: 'var(--gold)' }}>{viewReport.performance}</h2>
              </div>
              <button className="btn btn-gold" style={{ width: '100%', justifyContent: 'center' }} onClick={() => { showToast('Detailed report downloading...'); setViewReport(null); }}>Download Detailed Report</button>
            </div>
          </div>
        </div>
      )}

      {/* New Campaign Modal */}
      {newCampaignOpen && (
        <div className="modal-overlay" onClick={() => setNewCampaignOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>Create New Campaign</h3>
              <button className="modal-close" onClick={() => setNewCampaignOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSendCampaign} className="modal-body">
              <div className="form-group">
                <label>Campaign Subject</label>
                <input type="text" className="form-input" placeholder="e.g. Diwali Special Offer" required value={newCampaignData.subject} onChange={e => setNewCampaignData({...newCampaignData, subject: e.target.value})} />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Type</label>
                  <select className="form-select" value={newCampaignData.type} onChange={e => setNewCampaignData({...newCampaignData, type: e.target.value})}>
                    <option>Email</option>
                    <option>SMS</option>
                    <option>Push Notification</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Target Audience</label>
                  <select className="form-select" value={newCampaignData.target} onChange={e => setNewCampaignData({...newCampaignData, target: e.target.value})}>
                    <option>All Customers</option>
                    <option>VIP Members</option>
                    <option>Inactive (6+ months)</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Message Content</label>
                <textarea className="form-input" rows="4" placeholder="Write your message here..." required value={newCampaignData.content} onChange={e => setNewCampaignData({...newCampaignData, content: e.target.value})}></textarea>
              </div>
              <div className="modal-actions" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setNewCampaignOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-gold">Send Campaign</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
