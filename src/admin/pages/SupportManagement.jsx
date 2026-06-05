import { useState } from 'react';
import { LifeBuoy, Search, Reply, CheckCircle, Clock, X, Send, Package, Gem, RotateCcw, MapPin } from 'lucide-react';
import { useSupportTickets } from '../../hooks/useSupportTickets';
import { useOrders } from '../../hooks/useOrders';
import { useProducts } from '../../hooks/useProducts';
import { useApp } from '../../context/AppContext';

export default function SupportManagement() {
  const [activeTab, setActiveTab] = useState('Tickets');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { tickets, loading: ticketsLoading, updateTicket, addTicket } = useSupportTickets();
  const { orders, updateOrderStatus } = useOrders();
  const { products } = useProducts();
  const { showToast } = useApp();
  
  const [respondModal, setRespondModal] = useState({ isOpen: false, ticket: null, message: '' });
  const [createModal, setCreateModal] = useState(false);
  const [newTicket, setNewTicket] = useState({ customer: '', email: '', subject: '', priority: 'normal', message: '' });
  const [isSending, setIsSending] = useState(false);

  const [reviews, setReviews] = useState([
    { id: 'REV-1', customer: 'Aman Singh', product: 'Diamond Solitaire Ring', rating: 5, review: 'Absolutely stunning! The packaging was premium.', date: '29 May 2026', replied: false, hidden: false },
    { id: 'REV-2', customer: 'Priya Sharma', product: 'Gold Antique Bangle', rating: 4, review: 'Beautiful design, but delivery was delayed by a day.', date: '28 May 2026', replied: false, hidden: false },
    { id: 'REV-3', customer: 'Raj Patel', product: 'Silver Chain', rating: 2, review: 'The clasp broke after two days of use. Need a replacement.', date: '25 May 2026', replied: false, hidden: false },
  ]);
  const [reviewModal, setReviewModal] = useState({ isOpen: false, review: null, message: '' });
  const [trackModal, setTrackModal] = useState({ isOpen: false, orderId: null });

  const handleReplyReview = (e) => {
    e.preventDefault();
    if (!reviewModal.review) return;
    setReviews(reviews.map(r => r.id === reviewModal.review.id ? { ...r, replied: true } : r));
    showToast(`Response posted to ${reviewModal.review.customer}'s review!`);
    setReviewModal({ isOpen: false, review: null, message: '' });
  };

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
      let emailData = null;
      let emailSuccess = false;
      
      try {
        const emailRes = await fetch('/api/support-reply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: respondModal.ticket.email,
            customer: respondModal.ticket.customer,
            subject: respondModal.ticket.subject,
            message: respondModal.message,
            originalMessage: respondModal.ticket.message
          })
        });
        
        emailData = await emailRes.json();
        if (emailRes.ok) {
          emailSuccess = true;
        } else {
          console.warn("Email dispatch failed:", emailData.error);
        }
      } catch (networkErr) {
        console.warn("Backend server is offline. Email not sent, but ticket will be resolved locally.", networkErr);
      }

      await updateTicket(respondModal.ticket.firebaseId, {
        status: 'resolved',
        adminResponse: respondModal.message,
      });
      
      if (emailSuccess && emailData?.previewUrl) {
        showToast("Ticket resolved! (Test Email opened in new tab)", "success");
        window.open(emailData.previewUrl, '_blank');
      } else if (emailSuccess) {
        showToast("Ticket resolved and email dispatched successfully!", "success");
      } else {
        showToast("Ticket resolved! (Note: Email service offline)", "success");
      }
      
      setRespondModal({ isOpen: false, ticket: null, message: '' });
    } catch (err) {
      showToast("Failed to update ticket", "error");
      console.error(err);
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
          <button className="btn btn-gold" onClick={() => setCreateModal(true)} style={{ color: '#FFFFFF', fontWeight: 'bold' }}>+ Create Ticket</button>
        </div>
      </div>

      <div className="tab-nav">
        {['Tickets', 'Order Tracking', 'Returns (RMA)', 'Product Lookup', 'Feedback & Reviews'].map(tab => (
          <button 
            key={tab} 
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => { setActiveTab(tab); setSearchTerm(''); }}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Tickets' && (
        <>
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
              {ticketsLoading ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>Loading live tickets...</td></tr>
              ) : filteredTickets.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>No active tickets found.</td></tr>
              ) : filteredTickets.map((tkt) => (
                <tr key={tkt.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--gold)' }}>#{tkt.id.substring(0,6).toUpperCase()}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{tkt.customer}</div>
                    <div style={{ fontSize: '0.75rem' }}>
                      <a href={`mailto:${tkt.email}`} style={{ color: 'var(--gold)', textDecoration: 'none' }} title={`Send email to ${tkt.email}`}>
                        {tkt.email}
                      </a>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{tkt.subject}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {tkt.message || 'No message content provided.'}
                    </div>
                  </td>
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
                      style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderColor: 'var(--admin-border-bright)', color: 'var(--text-primary)' }}
                      onClick={() => setRespondModal({ isOpen: true, ticket: tkt, message: '' })}
                    >
                      <Reply size={12} /> {tkt.status === 'resolved' ? 'View Thread' : 'Respond'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}

      {/* OTHER TABS */}
      {activeTab === 'Order Tracking' && (
        <div className="admin-card">
          <div className="card-header">
            <div className="card-title">Track Customer Orders</div>
            <div className="filter-search" style={{ margin: 0, width: '350px' }}>
              <Search size={14} />
              <input 
                placeholder="Lookup by Order ID or Customer Name..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <table className="admin-table">
            <thead>
              <tr><th>Order ID</th><th>Customer</th><th>Product</th><th>Status</th><th>ETA / Date</th><th>Action</th></tr>
            </thead>
            <tbody>
              {orders.filter(o => o.id.toLowerCase().includes(searchTerm.toLowerCase()) || o.customer.toLowerCase().includes(searchTerm.toLowerCase())).map(o => (
                <tr key={o.id}>
                  <td style={{ fontFamily: 'monospace', color: 'var(--gold)' }}>{o.id}</td>
                  <td>{o.customer}</td>
                  <td>{o.product}</td>
                  <td><span className={`badge ${o.status === 'delivered' ? 'badge-delivered' : 'badge-pending'}`}>{o.status.toUpperCase()}</span></td>
                  <td>{o.date}</td>
                  <td>
                    <button 
                      className="btn btn-sm btn-outline" 
                      style={{ borderColor: 'var(--gold)', color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                      onClick={() => setTrackModal({ isOpen: true, orderId: o.id })}
                    >
                      <MapPin size={12} /> Live Track
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'Returns (RMA)' && (
        <div className="admin-card">
          <div className="card-header"><div className="card-title">Pending Return Requests (RMA)</div></div>
          <table className="admin-table">
            <thead>
              <tr><th>Order ID</th><th>Customer</th><th>Reason</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {orders.filter(o => o.status === 'return_requested' || o.status === 'Return Pending').map(o => (
                <tr key={o.id}>
                  <td style={{ fontFamily: 'monospace', color: 'var(--gold)' }}>{o.id}</td>
                  <td>{o.customer}</td>
                  <td>"Size does not fit"</td>
                  <td><span className="badge badge-warning">Awaiting Approval</span></td>
                  <td>
                    <button className="btn btn-sm btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderColor: 'var(--admin-border-bright)', color: 'var(--text-primary)' }} onClick={() => {
                      updateOrderStatus(o.id, 'Return Pending');
                      showToast(`Return for ${o.id} approved. Alerting logistics for pickup!`);
                    }}><RotateCcw size={12} /> Approve Return (Alert Logistics)</button>
                  </td>
                </tr>
              ))}
              {orders.filter(o => o.status === 'return_requested' || o.status === 'Return Pending').length === 0 && (
                 <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No pending return requests.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'Product Lookup' && (
        <div className="admin-card">
          <div className="card-header">
            <div className="card-title">Quick Catalog Lookup</div>
            <div className="filter-search" style={{ margin: 0, width: '350px' }}>
              <Search size={14} />
              <input 
                placeholder="Search Product Name, SKU, or Category..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <table className="admin-table">
            <thead>
              <tr><th>Product Info</th><th>SKU / Details</th><th>Stock</th><th>Price (₹)</th></tr>
            </thead>
            <tbody>
              {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.category}</div>
                  </td>
                  <td>
                    <div style={{ fontFamily: 'monospace', color: 'var(--gold)' }}>{p.sku}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.purity} • {p.weight}</div>
                  </td>
                  <td><span className={`badge ${p.status === 'active' ? 'badge-active' : 'badge-cancelled'}`}>{p.stock} Left</span></td>
                  <td style={{ fontWeight: 'bold' }}>₹{p.price.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'Feedback & Reviews' && (
        <div className="admin-card">
          <div className="card-header">
            <div className="card-title">Customer Feedback & Reviews</div>
            <div className="filter-search" style={{ margin: 0, width: '350px' }}>
              <Search size={14} />
              <input 
                placeholder="Search by Product or Customer..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <table className="admin-table">
            <thead>
              <tr><th>Customer</th><th>Product</th><th>Rating</th><th>Review</th><th>Date</th><th>Action</th></tr>
            </thead>
            <tbody>
              {reviews.filter(r => !r.hidden && (r.customer.toLowerCase().includes(searchTerm.toLowerCase()) || r.product.toLowerCase().includes(searchTerm.toLowerCase()))).map(r => (
                <tr key={r.id}>
                  <td>{r.customer}</td>
                  <td>{r.product}</td>
                  <td><span style={{ color: 'var(--gold)', fontWeight: 'bold' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</span></td>
                  <td><span style={{ fontSize: '0.85rem' }}>{r.review}</span></td>
                  <td>{r.date}</td>
                  <td>
                    {r.replied ? (
                      <span className="badge badge-active">Replied</span>
                    ) : (
                      <button className="btn btn-sm btn-outline" onClick={() => setReviewModal({ isOpen: true, review: r, message: '' })}>Reply</button>
                    )}
                    {r.rating <= 3 && <button className="btn btn-sm btn-danger" style={{ marginLeft: '0.5rem' }} onClick={() => { setReviews(reviews.map(x => x.id === r.id ? { ...x, hidden: true } : x)); showToast("Review Hidden"); }}>Hide</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Respond Modal */}
      {respondModal.isOpen && respondModal.ticket && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-box" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Ticket #{respondModal.ticket.id.substring(0,6).toUpperCase()}</h3>
              <button className="modal-close" onClick={() => setRespondModal({ isOpen: false, ticket: null, message: '' })}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 'bold' }}>{respondModal.ticket.customer}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{respondModal.ticket.date}</span>
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{respondModal.ticket.message}</div>
              </div>
              
              {respondModal.ticket.status === 'resolved' && respondModal.ticket.adminResponse && (
                <div style={{ background: 'rgba(201,168,76,0.05)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--gold)', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 'bold', color: 'var(--gold)' }}>Support Team</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Resolved</span>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{respondModal.ticket.adminResponse}</div>
                </div>
              )}

              {respondModal.ticket.status !== 'resolved' && (
                <form onSubmit={handleRespond}>
                  <div className="form-group">
                    <label>Your Response (Will be emailed to {respondModal.ticket.email})</label>
                    <textarea 
                      className="form-input" 
                      rows="5" 
                      placeholder="Type your response here..."
                      value={respondModal.message}
                      onChange={(e) => setRespondModal({ ...respondModal, message: e.target.value })}
                      required
                    ></textarea>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                    <button type="button" className="btn btn-outline" onClick={() => setRespondModal({ isOpen: false, ticket: null, message: '' })}>Cancel</button>
                    <button type="submit" className="btn btn-gold" disabled={isSending} style={{ color: '#000', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Send size={14} /> {isSending ? 'Sending...' : 'Send Resolution'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Review Reply Modal */}
      {reviewModal.isOpen && reviewModal.review && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-box" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Reply to Review</h3>
              <button className="modal-close" onClick={() => setReviewModal({ isOpen: false, review: null, message: '' })}><X size={16} /></button>
            </div>
            
            <div className="modal-body">
              <div style={{ background: 'var(--surface-light)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 600 }}>{reviewModal.review.customer}</span>
                  <span style={{ color: 'var(--gold)' }}>{'★'.repeat(reviewModal.review.rating)}{'☆'.repeat(5-reviewModal.review.rating)}</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  <strong>Product:</strong> {reviewModal.review.product}
                </div>
                <div style={{ marginTop: '1rem', color: 'var(--text-primary)', lineHeight: 1.5, fontSize: '0.95rem', fontStyle: 'italic' }}>
                  "{reviewModal.review.review}"
                </div>
              </div>
              
              <form onSubmit={handleReplyReview}>
                <div className="form-group">
                  <label>Your Public Response</label>
                  <textarea 
                    className="form-input" 
                    rows="4" 
                    placeholder="Type your public response..."
                    required
                    value={reviewModal.message}
                    onChange={(e) => setReviewModal(prev => ({ ...prev, message: e.target.value }))}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setReviewModal({ isOpen: false, review: null, message: '' })}>Cancel</button>
                  <button type="submit" className="btn btn-gold" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#000', fontWeight: 'bold' }}>
                    <Send size={14} /> Post Reply
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create Ticket Modal */}
      {createModal && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-box" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Create New Support Ticket</h3>
              <button className="modal-close" onClick={() => setCreateModal(false)}><X size={16} /></button>
            </div>
            
            <div className="modal-body">
              <form onSubmit={async (e) => {
                e.preventDefault();
                setIsSending(true);
                try {
                  const tkt = {
                    ...newTicket,
                    id: `TKT-${Math.floor(100000 + Math.random() * 900000)}`,
                    status: 'open',
                    date: new Date().toLocaleDateString('en-GB')
                  };
                  await addTicket(tkt);
                  showToast("Ticket created successfully!");
                  setCreateModal(false);
                  setNewTicket({ customer: '', email: '', subject: '', priority: 'normal', message: '' });
                } catch (err) {
                  showToast("Failed to create ticket locally.", "error");
                }
                setIsSending(false);
              }}>
                <div className="form-group mb-1">
                  <label>Customer Name</label>
                  <input type="text" className="form-input" required value={newTicket.customer} onChange={(e) => setNewTicket(prev => ({...prev, customer: e.target.value}))} />
                </div>
                <div className="form-group mb-1">
                  <label>Customer Email</label>
                  <input type="email" className="form-input" required value={newTicket.email} onChange={(e) => setNewTicket(prev => ({...prev, email: e.target.value}))} />
                </div>
                <div className="form-group mb-1">
                  <label>Subject</label>
                  <input type="text" className="form-input" required value={newTicket.subject} onChange={(e) => setNewTicket(prev => ({...prev, subject: e.target.value}))} />
                </div>
                <div className="form-row mb-1">
                  <div className="form-group">
                    <label>Priority</label>
                    <select className="form-input" value={newTicket.priority} onChange={(e) => setNewTicket(prev => ({...prev, priority: e.target.value}))}>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>
                <div className="form-group mb-1">
                  <label>Message / Issue Description</label>
                  <textarea className="form-input" rows="4" required value={newTicket.message} onChange={(e) => setNewTicket(prev => ({...prev, message: e.target.value}))}></textarea>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setCreateModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-gold" disabled={isSending} style={{ color: '#FFFFFF', fontWeight: 'bold' }}>
                    {isSending ? 'Creating...' : 'Create Ticket'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Live Track Modal */}
      {trackModal.isOpen && trackModal.orderId && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-box" style={{ maxWidth: '800px', width: '100%', padding: 0, background: 'var(--bg)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid var(--admin-border)', background: 'var(--surface)' }}>
              <h3 className="modal-title" style={{ margin: 0, color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={18} /> Live Order Tracking
              </h3>
              <button className="modal-close" onClick={() => setTrackModal({ isOpen: false, orderId: null })}><X size={18} /></button>
            </div>
            <div className="modal-body" style={{ padding: 0, height: '700px', overflow: 'hidden' }}>
              <iframe 
                src={`/track/${trackModal.orderId}`} 
                width="100%" 
                height="100%" 
                style={{ border: 'none', background: 'var(--bg)' }} 
                title="Live Tracking Map"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
