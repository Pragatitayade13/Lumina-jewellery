import { useApp } from '../../context/AppContext';
import { Package, Heart, CreditCard, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, wishlist } = useApp();
  const navigate = useNavigate();

  return (
    <div>
      <div className="customer-card">
        <h2 className="card-title">Welcome back, {user?.name || 'Valued Customer'}!</h2>
        <p style={{ color: 'var(--text-muted)' }}>Manage your recent orders, track your wishlist, and explore your Lumina benefits from your dashboard.</p>
      </div>

      <div className="stat-grid">
        <div className="stat-box">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className="stat-value">3</div>
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
              <tr>
                <td style={{ fontFamily: 'monospace' }}>#LJ-7891</td>
                <td>27 May 2026</td>
                <td>Royal Diamond Necklace</td>
                <td style={{ fontWeight: 600 }}>₹2,85,000</td>
                <td><span className="badge badge-info">SHIPPED</span></td>
                <td><button className="btn btn-outline btn-sm" onClick={() => navigate('/account/orders')}>Track</button></td>
              </tr>
              <tr>
                <td style={{ fontFamily: 'monospace' }}>#LJ-7850</td>
                <td>15 Apr 2026</td>
                <td>Gold Jhumka Earrings</td>
                <td style={{ fontWeight: 600 }}>₹45,000</td>
                <td><span className="badge badge-success">DELIVERED</span></td>
                <td><button className="btn btn-outline btn-sm" onClick={() => navigate('/account/orders')}>View</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
