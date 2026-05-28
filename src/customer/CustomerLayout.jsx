import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, User, Package, Heart, LifeBuoy, 
  Calendar, RefreshCcw, Calculator, Sparkles, LogOut, Diamond, Sun, Moon
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import NotificationDropdown from '../components/NotificationDropdown/NotificationDropdown';

const navItems = [
  { path: '/account', label: 'Dashboard', icon: <LayoutDashboard size={18} />, exact: true },
  { path: '/account/orders', label: 'My Orders', icon: <Package size={18} /> },
  { path: '/account/profile', label: 'Profile Settings', icon: <User size={18} /> },
  { path: '/account/wishlist', label: 'Wishlist', icon: <Heart size={18} /> },
  { section: 'Lumina Experiences' },
  { path: '/account/schemes', label: 'My Gold Schemes', icon: <RefreshCcw size={18} /> },
  { path: '/account/appointments', label: 'Store Appointments', icon: <Calendar size={18} /> },
  { path: '/account/planner', label: 'Bridal Planner', icon: <Sparkles size={18} /> },
  { path: '/account/buyback', label: 'Buyback Calculator', icon: <Calculator size={18} /> },
  { section: 'Help' },
  { path: '/account/support', label: 'Customer Support', icon: <LifeBuoy size={18} /> },
];

const pageTitles = {
  '/account': 'My Dashboard',
  '/account/orders': 'Order History',
  '/account/profile': 'Profile & Preferences',
  '/account/wishlist': 'My Wishlist',
  '/account/schemes': 'Gold Schemes Enrollment',
  '/account/appointments': 'My Appointments',
  '/account/planner': 'Bridal Planner Studio',
  '/account/buyback': 'Buyback Exchange Calculator',
  '/account/support': 'Support & Tickets',
};

export default function CustomerLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, setUser, theme, toggleTheme } = useApp();
  
  const pageTitle = pageTitles[location.pathname] || 'My Account';

  const handleLogout = () => {
    setUser(null);
    navigate('/');
  };

  return (
    <div className="customer-wrapper">
      {/* ─── Sidebar ─── */}
      <aside className="customer-sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon"><Diamond size={24} color="#0D0800" /></div>
          <div>
            <div className="sidebar-logo-name">Lumina Jewels</div>
            <div className="sidebar-logo-tag">My Account</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item, i) => {
            if (item.section) {
              return <div key={`sec-${i}`} className="nav-section-label">{item.section}</div>;
            }
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-customer-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div className="customer-avatar">{user?.name ? user.name.substring(0, 2).toUpperCase() : 'CU'}</div>
              <div>
                <div className="customer-name">{user?.name || 'Customer'}</div>
                <div className="customer-role-badge">VIP Member</div>
              </div>
            </div>
            <button onClick={handleLogout} className="btn btn-icon btn-outline" style={{ border: 'none', color: 'var(--text-muted)' }} title="Logout">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ─── Main Content Area ─── */}
      <div className="customer-main-area">
        <header className="customer-topbar">
          <div>
            <div className="topbar-page-title">{pageTitle}</div>
            <div className="topbar-breadcrumb">Home › Account › {pageTitle}</div>
          </div>
          <div className="topbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="btn btn-icon btn-outline" style={{ border: 'none', color: 'var(--text-primary)' }} title="Toggle Theme" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <NotificationDropdown userRole="customer" />
            <button className="btn btn-primary" onClick={() => navigate('/')}>Continue Shopping</button>
          </div>
        </header>

        <main className="customer-main">
          <div className="customer-content">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
