import { useApp } from '../../context/AppContext';
import { Package, Heart, CreditCard, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../../hooks/useOrders';
import { useMemo } from 'react';

export default function Dashboard() {
  const { user, wishlist } = useApp();
  const navigate = useNavigate();
  const { orders, loading } = useOrders();

  const customerOrders = useMemo(() => {
    if (!user) return [];
    return orders.filter(o => o.customerId === user.uid).slice(0, 3); // Get 3 most recent
  }, [orders, user]);

  const activeOrdersCount = useMemo(() => {
    if (!user) return 0;
    return orders.filter(o => o.customerId === user.uid && o.status !== 'delivered' && o.status !== 'cancelled').length;
  }, [orders, user]);

  return (
    <div>
      <div className="customer-card">
        <h2 className="card-title">Welcome back, {user?.name || 'Valued Customer'}!</h2>
        <p style={{ color: 'var(--text-muted)' }}>Manage your recent orders, track your wishlist, and explore your Lumina benefits from your dashboard.</p>
      </div>

      <div className="stat-grid">
        <div className="stat-box">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className="stat-value">{activeOrdersCount}</div>
            <Package color="var(--gold)" size={28} />
          </div>
          <div className="stat-label">Active Orders</div>
        </div>
        <div className="stat-box">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className="stat-value">{wishlist.length}</div>
            <Heart color="var(--status-red)" size={28} />
          </div>
          <div className="stat-label">Wishlist Items</div>
        </div>
        <div className="stat-box">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className="stat-value">₹45k</div>
            <CreditCard color="#3498db" size={28} />
          </div>
          <div className="stat-label">Scheme Balance</div>
        </div>
        <div className="stat-box">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className="stat-value">1,250</div>
            <Gift color="#9b59b6" size={28} />
          </div>
          <div className="stat-label">Lumina Points</div>
        </div>
      </div>

      <div className="customer-card" style={{ marginTop: '2rem' }}>
        <h3 className="card-title">Recent Orders</h3>
        <div className="customer-table-wrap">
          <table className="customer-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '1rem' }}>Loading recent orders...</td></tr>
              ) : customerOrders.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)' }}>No recent orders.</td></tr>
              ) : (
                customerOrders.map(order => (
                  <tr key={order.id}>
                    <td style={{ fontFamily: 'monospace', color: 'var(--gold)' }}>{order.id.slice(0, 8).toUpperCase()}</td>
                    <td>{order.date}</td>
                    <td style={{ maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{order.product}</td>
                    <td style={{ fontWeight: 600 }}>₹{order.amount.toLocaleString()}</td>
                    <td>
                      <span className={`badge badge-${order.status === 'delivered' ? 'success' : order.status === 'cancelled' ? 'danger' : 'info'}`}>
                        {order.status.toUpperCase()}
                      </span>
                    </td>
                    <td><button className="btn btn-outline btn-sm" onClick={() => navigate('/account/orders')}>View</button></td>
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
