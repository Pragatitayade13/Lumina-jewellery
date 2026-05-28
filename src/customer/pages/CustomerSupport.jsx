import { LifeBuoy, MessageSquare, AlertTriangle } from 'lucide-react';

export default function CustomerSupport() {
  const tickets = [
    { id: '#TKT-1024', subject: 'Order delivery delay', status: 'open', date: '27 May 2026' },
    { id: '#TKT-998', subject: 'Ring sizing query', status: 'resolved', date: '10 May 2026' },
  ];

  return (
    <div>
      <div className="customer-card">
        <h2 className="card-title"><LifeBuoy /> Customer Support</h2>
        <p style={{ color: 'var(--text-muted)' }}>Need help? Raise a support ticket, submit complaints, or request product returns.</p>
        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
          <button className="btn btn-gold" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MessageSquare size={16} /> New Support Ticket</button>
          <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--status-red)', borderColor: 'var(--status-red)' }}><AlertTriangle size={16} /> Request Return</button>
        </div>
      </div>

      <div className="customer-card">
        <h3 className="card-title" style={{ fontSize: '1.1rem' }}>Your Support Tickets</h3>
        <div className="customer-table-wrap">
          <table className="customer-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Subject</th>
                <th>Submitted Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map(tkt => (
                <tr key={tkt.id}>
                  <td style={{ fontFamily: 'monospace' }}>{tkt.id}</td>
                  <td style={{ fontWeight: 500 }}>{tkt.subject}</td>
                  <td>{tkt.date}</td>
                  <td>
                    <span className={`badge badge-${tkt.status === 'open' ? 'warning' : 'success'}`}>
                      {tkt.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-outline">View Thread</button>
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
