import { useState } from 'react';
import { LifeBuoy, Search, Reply, CheckCircle, Clock, X, Send } from 'lucide-react';
import { useSupportTickets } from '../../hooks/useSupportTickets';
import { useApp } from '../../context/AppContext';

export default function SupportManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const { tickets, loading, updateTicket } = useSupportTickets();
  const { showToast } = useApp();
  
  const [respondModal, setRespondModal] = useState({ isOpen: false, ticket: null, message: '' });
  const [isSending, setIsSending] = useState(false);

  // Dynamic KPIs
  const pendingCount = tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;
  const resolvedCount = tickets.filter(t => t.status === 'resolved').length;
  const avgResponseTime = resolvedCount > 0 ? '1.2h' : '0.0h'; // Mocked average

  const filteredTickets = tickets.filter(t => 
    t.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRespond = async (e) => {
    e.preventDefault();
    if (!respondModal.ticket || !respondModal.message) return;
    
    setIsSending(true);
    try {
      await updateTicket(respondModal.ticket.id, {
        status: 'resolved',
        adminResponse: respondModal.message,
      });
      showToast("Email dispatched successfully and ticket resolved!");
      setRespondModal({ isOpen: false, ticket: null, message: '' });
    } catch (err) {
      showToast("Failed to send response", "error");
    }
    setIsSending(false);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Customer Support & Assistance</h1>
          <p className="page-subtitle">Manage customer queries, track resolutions, and process return requests.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-gold">+ Create Ticket</button>
        </div>
      </div>

      <div className="grid-3 mb-15">
        <div className="admin-card text-center" style={{ padding: '2rem 1rem' }}>
          <div className="icon-wrapper" style={{ margin: '0 auto 1rem', background: 'var(--status-red-bg)' }}>
            <Clock color="var(--status-red)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 600, fontFamily: 'Inter' }}>{pendingCount}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Pending Queries</div>
        </div>
        <div className="admin-card text-center" style={{ padding: '2rem 1rem' }}>
          <div className="icon-wrapper" style={{ margin: '0 auto 1rem', background: 'var(--status-green-bg)' }}>
            <CheckCircle color="var(--status-green)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 600, fontFamily: 'Inter' }}>{resolvedCount}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Resolved Tickets</div>
        </div>
        <div className="admin-card text-center" style={{ padding: '2rem 1rem' }}>
          <div className="icon-wrapper" style={{ margin: '0 auto 1rem', background: 'var(--gold-light)' }}>
            <LifeBuoy color="var(--gold)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 600, fontFamily: 'Inter' }}>{avgResponseTime}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Avg Response Time</div>
        </div>
      </div>

      <div className="admin-card">
        <div className="card-header">
          <div className="card-title">Active Tickets</div>
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
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Customer</th>
                <th>Subject</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>Loading live tickets...</td></tr>
              ) : filteredTickets.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>No active tickets found.</td></tr>
              ) : filteredTickets.map((tkt) => (
                <tr key={tkt.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--gold)' }}>#{tkt.id.substring(0,6).toUpperCase()}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{tkt.customer}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tkt.email}</div>
                  </td>
                  <td>{tkt.subject}</td>
                  <td>
                    <span className={`badge badge-${tkt.priority === 'urgent' ? 'danger' : tkt.priority === 'high' ? 'warning' : 'superadmin'}`}>
                      {tkt.priority?.toUpperCase() || 'LOW'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${tkt.status === 'resolved' ? 'active' : tkt.status === 'open' ? 'pending' : 'superadmin'}`}>
                      {tkt.status?.replace('_', ' ').toUpperCase() || 'OPEN'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>{tkt.date}</td>
                  <td>
                    <button 
                      className="btn btn-sm btn-outline" 
                      style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                      onClick={() => setRespondModal({ isOpen: true, ticket: tkt, message: '' })}
                      disabled={tkt.status === 'resolved'}
                    >
                      <Reply size={12} /> {tkt.status === 'resolved' ? 'Responded' : 'Respond'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Internal Respond Modal */}
      {respondModal.isOpen && respondModal.ticket && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-box" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Respond to Ticket #{respondModal.ticket.id.substring(0,6).toUpperCase()}</h3>
              <button className="modal-close" onClick={() => setRespondModal({ isOpen: false, ticket: null, message: '' })}><X size={16} /></button>
            </div>
            
            <div className="modal-body">
              <div style={{ background: 'var(--surface-light)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  <strong>From:</strong> {respondModal.ticket.customer} ({respondModal.ticket.email})
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  <strong>Subject:</strong> {respondModal.ticket.subject}
                </div>
                <div style={{ marginTop: '1rem', color: 'var(--text-primary)', lineHeight: 1.5, fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>
                  {respondModal.ticket.message}
                </div>
              </div>
              
              <form onSubmit={handleRespond}>
                <div className="form-group">
                  <label>Email Reply</label>
                  <textarea 
                    className="form-input" 
                    rows="6" 
                    placeholder="Type your response to the customer..."
                    required
                    value={respondModal.message}
                    onChange={(e) => setRespondModal(prev => ({ ...prev, message: e.target.value }))}
                  />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    Note: Submitting this will simulate dispatching an email to {respondModal.ticket.email} and automatically mark the ticket as Resolved.
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setRespondModal({ isOpen: false, ticket: null, message: '' })}>Cancel</button>
                  <button type="submit" className="btn btn-gold" disabled={isSending} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#000', fontWeight: 'bold' }}>
                    <Send size={14} /> {isSending ? 'Sending...' : 'Send Response & Resolve'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
