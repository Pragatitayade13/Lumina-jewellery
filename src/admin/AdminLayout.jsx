import { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Gem, Package, UsersRound, 
  Store, CreditCard, BarChart3, BarChart2, FileText, Shield, 
  Settings, Bell, Zap, Globe, Diamond, Mail, Calendar, RefreshCcw, LogOut, LifeBuoy, Receipt, Coins, Map, Sun, Moon, Menu, CheckCircle, MapPin, User, ChevronUp
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import NotificationDropdown from '../components/NotificationDropdown/NotificationDropdown';
import ProfileDropdown from '../components/ProfileDropdown/ProfileDropdown';
import QuickActionsDropdown from '../components/QuickActionsDropdown/QuickActionsDropdown';
import LanguageSwitcher from '../components/LanguageSwitcher/LanguageSwitcher';
import { useCMS } from '../context/CMSContext';

const allNavItems = [
  { path: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={18} />, exact: true, roles: ['superadmin', 'admin', 'staff', 'finance', 'manager'] },
  
  { section: 'Logistics', roles: ['superadmin', 'delivery'] },
  { path: '/admin/delivery?tab=dashboard', label: 'Logistics Dashboard', icon: <LayoutDashboard size={18} />, roles: ['superadmin', 'delivery'] },
  { path: '/admin/delivery?tab=assigned', label: 'Assigned Orders', icon: <Package size={18} />, roles: ['superadmin', 'delivery'] },
  { path: '/admin/delivery?tab=pickups', label: 'Pickup Confirmation', icon: <CheckCircle size={18} />, roles: ['superadmin', 'delivery'] },
  { path: '/admin/delivery?tab=status', label: 'Delivery Status Update', icon: <RefreshCcw size={18} />, roles: ['superadmin', 'delivery'] },
  { path: '/admin/delivery?tab=map', label: 'Route Navigation', icon: <MapPin size={18} />, roles: ['superadmin', 'delivery'] },
  { path: '/admin/delivery?tab=returns', label: 'Return Handling', icon: <RefreshCcw size={18} />, roles: ['superadmin', 'delivery'] },

  { section: 'Management', roles: ['superadmin', 'admin', 'staff', 'manager'] },
  { path: '/admin/users', label: 'Staff Management', icon: <Users size={18} />, badge: '2', roles: ['superadmin', 'manager', 'admin'] },
  { path: '/admin/products', label: 'Product Supervision', icon: <Gem size={18} />, roles: ['superadmin', 'admin', 'staff', 'manager'] },
  { path: '/admin/orders', label: 'Order Management', icon: <Package size={18} />, badge: '5', badgeType: 'danger', roles: ['superadmin', 'admin', 'staff', 'manager'] },
  { path: '/admin/customers', label: 'Customers', icon: <UsersRound size={18} />, roles: ['superadmin', 'admin', 'manager', 'staff'] },
  { path: '/admin/inventory', label: 'Inventory', icon: <Store size={18} />, badge: '3', badgeType: 'danger', roles: ['superadmin', 'admin', 'staff', 'manager'] },
  
  { section: 'Customer Services', roles: ['superadmin', 'admin', 'staff', 'manager', 'finance'] },
  { path: '/admin/support', label: 'Customer Support', icon: <LifeBuoy size={18} />, badge: 'new', badgeType: 'danger', roles: ['superadmin', 'admin', 'staff', 'manager'] },
  { path: '/admin/communications', label: 'Communications', icon: <Mail size={18} />, roles: ['superadmin', 'admin', 'manager'] },
  { path: '/admin/appointments', label: 'Appointments', icon: <Calendar size={18} />, roles: ['superadmin', 'admin', 'manager'] },
  { path: '/admin/schemes', label: 'Schemes & Buybacks', icon: <RefreshCcw size={18} />, roles: ['superadmin', 'admin', 'manager', 'finance'] },
  
  { section: 'Finance & Reports', roles: ['superadmin', 'admin', 'finance', 'manager'] },
  { path: '/admin/payments', label: 'Payments & Transactions', icon: <CreditCard size={18} />, roles: ['superadmin', 'admin', 'finance', 'manager'] },
  { path: '/admin/tax', label: 'Tax Management', icon: <Receipt size={18} />, roles: ['superadmin', 'finance'] },
  { path: '/admin/gold-rates', label: 'Gold Rate & Pricing', icon: <Coins size={18} />, roles: ['superadmin', 'finance', 'manager'] },
  { path: '/admin/analytics', label: 'Analytics & Reports', icon: <BarChart3 size={18} />, roles: ['superadmin', 'admin', 'finance', 'manager', 'staff'] },
  { path: '/admin/vendors', label: 'Vendor & Commissions', icon: <Store size={18} />, roles: ['superadmin', 'admin', 'finance', 'manager'] },
  { path: '/admin/invoices', label: 'Invoice & Billing', icon: <FileText size={18} />, roles: ['superadmin', 'admin', 'finance', 'manager'] },
  
  { section: 'System', roles: ['superadmin', 'admin'] },
  { path: '/admin/content', label: 'Content Management', icon: <FileText size={18} />, roles: ['superadmin', 'admin'] },
  { path: '/admin/security', label: 'Security & Access', icon: <Shield size={18} />, roles: ['superadmin', 'admin'] },
  { path: '/admin/login-activity', label: 'Security Logs', icon: <Shield size={18} />, roles: ['superadmin'] },
  { path: '/admin/settings', label: 'System Settings', icon: <Settings size={18} />, roles: ['superadmin'] },

  { section: 'CMS & Branding', roles: ['superadmin'] },
  { path: '/admin/landing-cms', label: 'Landing Page CMS', icon: <FileText size={18} />, roles: ['superadmin'] },
  { path: '/admin/social-media', label: 'Social Media Settings', icon: <Globe size={18} />, roles: ['superadmin'] },
];

const pageTitles = {
  '/admin': 'Dashboard Overview',
  '/admin/delivery': 'Active Delivery Routes',
  '/admin/users': 'Staff Management',
  '/admin/products': 'Product Management',
  '/admin/orders': 'Order Management',
  '/admin/customers': 'Customer Management',
  '/admin/inventory': 'Inventory Management',
  '/admin/support': 'Support Management',
  '/admin/communications': 'Communication Management',
  '/admin/appointments': 'Store Appointments',
  '/admin/schemes': 'Schemes & Buybacks',
  '/admin/payments': 'Payments & Transactions',
  '/admin/tax': 'Tax & Compliance Management',
  '/admin/gold-rates': 'Gold Rate & Pricing Dashboard',
  '/admin/analytics': 'Analytics & AI Reports',
  '/admin/vendors': 'Vendor & Commission Management',
  '/admin/invoices': 'Invoice & Billing System',
  '/admin/content': 'Content Management',
  '/admin/security': 'Security & Access Control',
  '/admin/settings': 'System Settings',
  '/admin/landing-cms': 'Landing Page CMS',
  '/admin/social-media': 'Social Media Settings',
};

export default function AdminLayout({ children }) {
  const { user, setUser, theme, toggleTheme } = useApp();
  const { systemSettingsData } = useCMS();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarHidden, setIsSidebarHidden] = useState(false);
  const [isSidebarMenuOpen, setIsSidebarMenuOpen] = useState(false);
  const sidebarAvatarRef = useRef(null);

  const storeName = systemSettingsData?.storeName || 'Lumina Jewels';

  // Close sidebar avatar dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (sidebarAvatarRef.current && !sidebarAvatarRef.current.contains(e.target)) {
        setIsSidebarMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const userRole = user?.role || 'superadmin'; 
  const isSuperAdmin = userRole === 'superadmin';
  const isStaff = userRole === 'staff';
  const isManager = userRole === 'manager';
  const isFinance = userRole === 'finance';
  const isDelivery = userRole === 'delivery';
  
  let portalName = 'Admin';
  if (isSuperAdmin) portalName = 'Super Admin';
  if (isStaff) portalName = 'Staff';
  if (isManager) portalName = 'Manager';
  if (isFinance) portalName = 'Finance';
  if (isDelivery) portalName = 'Logistics';

  let panelName = 'Store Admin Panel';
  if (isSuperAdmin) panelName = 'Super Admin Panel';
  if (isStaff) panelName = 'Staff Portal';
  if (isManager) panelName = 'Manager Portal';
  if (isFinance) panelName = 'Finance Portal';
  if (isDelivery) panelName = 'Logistics Portal';

  let badgeName = 'Admin Access';
  if (isSuperAdmin) badgeName = 'Master Key Access';
  if (isStaff) badgeName = 'Warehouse & Support Access';
  if (isManager) badgeName = 'Supervisory Access';
  if (isFinance) badgeName = 'Financial Controller Access';
  if (isDelivery) badgeName = 'Secure Transit Access';

  const pageTitle = pageTitles[location.pathname] || portalName;

  // Filter navigation items based on user role
  const navItems = allNavItems.filter(item => {
    if (item.roles && !item.roles.includes(userRole)) return false;
    return true;
  });

  const handleLogout = async () => {
    if (user?.uid) {
      try {
        const { auth, db } = await import('../config/firebase');
        const { updateDoc, doc, serverTimestamp, collection, query, where, orderBy, limit, getDocs } = await import('firebase/firestore');
        const { signOut } = await import('firebase/auth');
        
        if (db) {
           await updateDoc(doc(db, 'users', user.uid), {
             lastCheckOut: serverTimestamp(),
             status: 'offline'
           });

           // Update login activity record
           try {
             const q = query(
               collection(db, 'loginActivity'), 
               where('userId', '==', user.uid),
               orderBy('loginTime', 'desc'),
               limit(1)
             );
             const snapshot = await getDocs(q);
             if (!snapshot.empty) {
               await updateDoc(doc(db, 'loginActivity', snapshot.docs[0].id), {
                 logoutTime: new Date().toISOString(),
                 status: 'completed'
               });
             }
           } catch (err) {
             console.error("Error closing login session", err);
           }
        }
        if (auth) await signOut(auth);
      } catch (e) { console.error("Logout error", e); }
    }
    setUser(null);
    navigate('/');
  };

  return (
    <div className={`admin-wrapper${isSidebarHidden ? ' sidebar-hidden' : ''}`}>
      {/* ─── Sidebar ─── */}
      <aside className="admin-sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon"><Diamond size={24} color="#0D0800" /></div>
          <div>
            <div className="sidebar-logo-name">{storeName}</div>
            <div className="sidebar-logo-tag">{panelName}</div>
          </div>
        </div>

        <nav className="sidebar-nav" style={{ overflowY: 'auto', overflowX: 'hidden' }}>
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
                {item.badge && (
                  <span className={`nav-badge${item.badgeType === 'danger' ? ' danger' : ''}`}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div ref={sidebarAvatarRef} style={{ position: 'relative' }}>

            {/* ── Profile / Signout Popup ── */}
            {isSidebarMenuOpen && (
              <div style={{
                position: 'absolute', bottom: 'calc(100% + 10px)', left: 0, right: 0,
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: '12px', overflow: 'hidden',
                boxShadow: '0 -8px 32px rgba(0,0,0,0.5)',
                animation: 'adm-scale 0.2s ease',
                zIndex: 200,
              }}>
                {/* User info header */}
                <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', background: 'rgba(201,168,76,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div className="admin-avatar" style={{ width: 38, height: 38, flexShrink: 0 }}>
                      {(user?.name || portalName).substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{user?.name || `${portalName} User`}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--gold)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{badgeName}</div>
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div style={{ padding: '0.5rem' }}>
                  <button
                    onClick={() => { setIsSidebarMenuOpen(false); navigate('/admin/profile'); }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
                      padding: '0.75rem', borderRadius: '8px', background: 'none', border: 'none',
                      color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 500,
                      cursor: 'pointer', transition: 'background 0.15s',
                    }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(201,168,76,0.1)'}
                    onMouseOut={e => e.currentTarget.style.background = 'none'}
                  >
                    <User size={16} color="var(--gold)" /> My Profile
                  </button>

                  {isSuperAdmin && (
                    <button
                      onClick={() => { setIsSidebarMenuOpen(false); navigate('/admin/settings'); }}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
                        padding: '0.75rem', borderRadius: '8px', background: 'none', border: 'none',
                        color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 500,
                        cursor: 'pointer', transition: 'background 0.15s',
                      }}
                      onMouseOver={e => e.currentTarget.style.background = 'rgba(201,168,76,0.1)'}
                      onMouseOut={e => e.currentTarget.style.background = 'none'}
                    >
                      <Settings size={16} color="var(--gold)" /> System Settings
                    </button>
                  )}

                  <div style={{ height: '1px', background: 'var(--border)', margin: '0.3rem 0' }} />

                  <button
                    onClick={() => { setIsSidebarMenuOpen(false); handleLogout(); }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
                      padding: '0.75rem', borderRadius: '8px', background: 'none', border: 'none',
                      color: '#e74c3c', fontSize: '0.85rem', fontWeight: 600,
                      cursor: 'pointer', transition: 'background 0.15s',
                    }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(231,76,60,0.1)'}
                    onMouseOut={e => e.currentTarget.style.background = 'none'}
                  >
                    <LogOut size={16} color="#e74c3c" /> Sign Out
                  </button>
                </div>
              </div>
            )}

            {/* ── Avatar Card ── */}
            <div
              className="sidebar-admin-card"
              style={{ cursor: 'pointer', userSelect: 'none' }}
              onClick={() => setIsSidebarMenuOpen(prev => !prev)}
              title="Account Menu"
            >
              <div className="admin-avatar" title={user?.name || `${portalName} User`}>
                {(user?.name || portalName).substring(0, 2).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="admin-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || `${portalName} User`}</div>
                <div className="admin-role-badge" style={{ display: 'flex', alignItems: 'center' }}>
                  <Diamond size={10} style={{ marginRight: 4 }} />
                  {badgeName}
                </div>
              </div>
              <ChevronUp size={14} style={{ color: 'var(--text-muted)', flexShrink: 0, transform: isSidebarMenuOpen ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.2s' }} />
            </div>
          </div>
        </div>
      </aside>

      {/* ─── Topbar ─── */}
      <header className="admin-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            className="topbar-btn" 
            onClick={() => setIsSidebarHidden(!isSidebarHidden)}
            title="Toggle Sidebar"
          >
            <Menu size={18} />
          </button>
          <div>
            <div className="topbar-page-title">{pageTitle}</div>
            <div className="topbar-breadcrumb">{storeName} {portalName} › {pageTitle}</div>
          </div>
        </div>

        <div className="topbar-search">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input placeholder="Search products, orders, customers…" />
        </div>

        <div className="topbar-actions">
          <NotificationDropdown userRole={userRole} />
          <QuickActionsDropdown userRole={userRole} />
          <a href="/" className="topbar-btn" title="View Live Site" target="_blank" rel="noreferrer"><Globe size={18} /></a>

          <ProfileDropdown userRole={userRole} userName={user?.name || `${portalName} User`} onLogout={handleLogout} isSuperAdmin={isSuperAdmin} />
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <main className="admin-main">
        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  );
}
