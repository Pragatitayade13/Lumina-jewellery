import { useState } from 'react';
import { LifeBuoy, MessageSquare, AlertTriangle, X, Send } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useCustomerSupport } from '../../hooks/useCustomerSupport';

export default function CustomerSupport() {
  const { user, showToast } = useApp();
  const { tickets, loading, createTicket } = useCustomerSupport(user?.uid);
  const [modalOpen, setModalOpen] = useState(false);
  const [ticketForm, setTicketForm] = useState({ subject: '', category: 'General Inquiry', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return showToast("Please login first", "error");
    
    setIsSubmitting(true);
    try {
      await createTicket({
        subject: ticketForm.subject,
        category: ticketForm.category,
        message: ticketForm.message,
        customerName: user.name || 'Customer'
      });
      showToast("Support ticket raised successfully!");
      setModalOpen(false);
      setTicketForm({ subject: '', category: 'General Inquiry', message: '' });
    } catch (err) {
      showToast("Failed to raise ticket", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="customer-card">
        <h2 className="card-title"><LifeBuoy /> Customer Support</h2>
        <p style={{ color: 'var(--text-muted)' }}>Need help? Raise a support ticket, submit complaints, or request product returns.</p>
        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
          <button className="btn btn-gold" onClick={() => { setTicketForm({...ticketForm, category: 'General Inquiry'}); setModalOpen(true); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageSquare size={16} /> New Support Ticket
          </button>
          <button className="btn btn-outline" onClick={() => { setTicketForm({...ticketForm, category: 'Returns & Refunds'}); setModalOpen(true); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--status-red)', borderColor: 'var(--status-red)' }}>
            <AlertTriangle size={16} /> Request Return
          </button>
        </div>
      </div>

      <div className="customer-card">
        <h3 className="card-title" style={{ fontSize: '1.1rem' }}>Your Support Tickets</h3>
        <div className="customer-table-wrap">
          <table className="customer-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Category</th>
                <th>Subject</th>
                <th>Submitted Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>Loading tickets...</td></tr>
              ) : tickets.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No support tickets found.</td></tr>
              ) : (
                tickets.map(tkt => (
                  <tr key={tkt.id}>
                    <td style={{ fontFamily: 'monospace', color: 'var(--gold)' }}>#{tkt.id.slice(0,6).toUpperCase()}</td>
                    <td>{tkt.category}</td>
                    <td style={{ fontWeight: 500 }}>{tkt.subject}</td>
                    <td>{tkt.date}</td>
                    <td>
                      <span className={`badge badge-${tkt.status === 'open' ? 'warning' : tkt.status === 'resolved' ? 'success' : 'info'}`}>
                        {tkt.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="modal-overlay" style={{ zIndex: 9999, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-box" style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '500px', border: '1px solid var(--border-color)' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ color: 'var(--gold)', margin: 0 }}>Raise a Ticket</h3>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Category</label>
                <select className="form-input" style={{ width: '100%', padding: '0.8rem', background: 'var(--surface)', border: '1px solid var(--border-color)', color: '#fff', borderRadius: '4px' }} value={ticketForm.category} onChange={e => setTicketForm({...ticketForm, category: e.target.value})}>
                  <option>General Inquiry</option>
                  <option>Returns & Refunds</option>
                  <option>Order Status</option>
                  <option>Product Quality / Complaints</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Subject</label>
                <input type="text" required className="form-input" style={{ width: '100%', padding: '0.8rem', background: 'var(--surface)', border: '1px solid var(--border-color)', color: '#fff', borderRadius: '4px' }} value={ticketForm.subject} onChange={e => setTicketForm({...ticketForm, subject: e.target.value})} placeholder="E.g., Damaged item received" />
              </div>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Message Details</label>
                <textarea required className="form-input" style={{ width: '100%', padding: '0.8rem', background: 'var(--surface)', border: '1px solid var(--border-color)', color: '#fff', borderRadius: '4px', height: '120px', resize: 'none' }} value={ticketForm.message} onChange={e => setTicketForm({...ticketForm, message: e.target.value})} placeholder="Please describe your issue in detail..."></textarea>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-gold" disabled={isSubmitting} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Send size={16} /> {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
