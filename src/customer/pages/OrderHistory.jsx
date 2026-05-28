import { Package, Download, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function OrderHistory() {
  const orders = [
    { id: '#LJ-7891', date: '27 May 2026', items: 'Royal Diamond Necklace Set', amount: 285000, status: 'shipped', tracking: 'AWB123456789' },
    { id: '#LJ-7850', date: '15 Apr 2026', items: 'Gold Jhumka Earrings 22KT', amount: 45000, status: 'delivered', tracking: 'AWB987654321' },
    { id: '#LJ-7720', date: '10 Jan 2026', items: 'Platinum Solitaire Ring', amount: 145000, status: 'delivered', tracking: 'AWB456123789' },
  ];

  return (
    <div>
      <div className="customer-card">
        <h2 className="card-title"><Package /> Order History & Tracking</h2>
        <p style={{ color: 'var(--text-muted)' }}>View your past purchases, download invoices, and track active shipments.</p>
      </div>

      <div className="customer-card">
        <div className="customer-table-wrap">
          <table className="customer-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Order Date</th>
                <th>Product Summary</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td style={{ fontFamily: 'monospace', color: 'var(--gold)' }}>{order.id}</td>
                  <td>{order.date}</td>
                  <td style={{ fontWeight: 500 }}>{order.items}</td>
                  <td style={{ fontWeight: 600 }}>₹{order.amount.toLocaleString()}</td>
                  <td>
                    <span className={`badge badge-${order.status === 'delivered' ? 'success' : 'info'}`}>
                      {order.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {order.status === 'shipped' && (
                        <Link to={`/account/track/${order.id}`} className="btn btn-icon btn-outline" title="Track Order">
                          <Truck size={14} />
                        </Link>
                      )}
                      <button className="btn btn-icon btn-outline" title="Download Invoice">
                        <Download size={14} />
                      </button>
                    </div>
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
