import { NavLink, Outlet } from 'react-router-dom';
import { Package, Truck, LayoutDashboard, LogOut, Bell, RotateCcw } from 'lucide-react';
import './DeliveryLayout.css';

export default function DeliveryLayout() {
  return (
    <div className="delivery-layout">
      {/* Mobile-friendly Sidebar */}
      <aside className="delivery-sidebar">
        <div className="delivery-brand">
          <Truck size={28} color="var(--gold)" />
          <span>Lumina Logistics</span>
        </div>
        
        <nav className="delivery-nav">
          <NavLink to="/delivery" end className={({isActive}) => isActive ? 'del-nav-item active' : 'del-nav-item'}>
            <LayoutDashboard size={20} /> Dashboard
          </NavLink>
          <NavLink to="/delivery/pickups" className={({isActive}) => isActive ? 'del-nav-item active' : 'del-nav-item'}>
            <Package size={20} /> Warehouse Pickups
          </NavLink>
          <NavLink to="/delivery/transit" className={({isActive}) => isActive ? 'del-nav-item active' : 'del-nav-item'}>
            <Truck size={20} /> Active Transit
          </NavLink>
          <NavLink to="/delivery/returns" className={({isActive}) => isActive ? 'del-nav-item active' : 'del-nav-item'}>
            <RotateCcw size={20} /> Reverse Logistics
          </NavLink>
        </nav>

        <div className="delivery-user-section">
          <div className="del-user-info">
            <div className="del-avatar">RK</div>
            <div>
              <div className="del-name">Rahul Kumar</div>
              <div className="del-role">Senior Partner</div>
            </div>
          </div>
          <button className="del-logout">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      <div className="delivery-main">
        <header className="delivery-topbar">
          <h2>Driver Portal</h2>
          <div className="del-topbar-actions">
            <button className="icon-btn" style={{ position: 'relative' }}>
              <Bell size={20} />
              <span className="del-badge">3</span>
            </button>
          </div>
        </header>

        <div className="delivery-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
