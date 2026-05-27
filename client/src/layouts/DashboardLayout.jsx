import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import {
  LayoutDashboard, Package, ShoppingCart, BarChart3,
  Users, UserCheck, Settings, LogOut, Bell,
  ChevronLeft, Menu, X, TrendingUp, FileText,
  IndianRupee, ShoppingBag, ClipboardList, Sun, Moon
} from 'lucide-react';
import { useTheme } from '../ThemeContext';
import '../admin.css';

const NAV_ITEMS = [
  { section: 'OPERATIONS', items: [
    { icon: LayoutDashboard, label: 'Dashboard',    path: '/dashboard' },
    { icon: Package,         label: 'Inventory',    path: '/inventory' },
    { icon: ShoppingCart,    label: 'POS & Billing',path: '/pos'       },
    { icon: ClipboardList,   label: 'Orders',       path: '/orders'    },
  ]},
  { section: 'INSIGHTS', items: [
    { icon: BarChart3,       label: 'Analytics',    path: '/analytics' },
    { icon: IndianRupee,     label: 'Finance',      path: '/finance'   },
    { icon: FileText,        label: 'Reports',      path: '/reports'   },
  ]},
  { section: 'PEOPLE', items: [
    { icon: Users,           label: 'Customers',    path: '/customers' },
    { icon: UserCheck,       label: 'Staff',        path: '/staff'     },
  ]},
  { section: 'SYSTEM', items: [
    { icon: Settings,        label: 'Settings',     path: '/settings'  },
  ]},
];

const PAGE_TITLES = {
  '/dashboard': { title: 'Dashboard',      sub: "Welcome back — here's your store overview"  },
  '/inventory': { title: 'Inventory',      sub: 'Manage your jewellery collection'            },
  '/pos':       { title: 'POS & Billing',  sub: 'Create GST bills and process sales'          },
  '/orders':    { title: 'Custom Orders',  sub: 'Track bespoke orders from design to delivery'},
  '/analytics': { title: 'Analytics',      sub: 'Business intelligence & insights'            },
  '/finance':   { title: 'Finance',        sub: 'P&L, GST reports & cash flow'               },
  '/reports':   { title: 'Reports',        sub: 'Export and review performance reports'       },
  '/customers': { title: 'Customers',      sub: 'Manage client relationships & loyalty'       },
  '/staff':     { title: 'Staff',          sub: 'Manage your team, roles & performance'       },
  '/settings':  { title: 'Settings',       sub: 'Configure your business profile'             },
};

const SidebarItem = ({ icon: Icon, label, path, badge, collapsed }) => {
  const location = useLocation();
  const isActive = location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path));
  return (
    <Link to={path} className={`sidebar-item ${isActive ? 'active' : ''}`} data-tooltip={collapsed ? label : undefined}>
      <span className="sidebar-item-icon"><Icon size={18} /></span>
      <span className="sidebar-item-label">{label}</span>
      {badge && !collapsed && <span className="sidebar-item-badge">{badge}</span>}
    </Link>
  );
};

const DashboardLayout = () => {
  const { business, user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const pageInfo = PAGE_TITLES[location.pathname] || { title: 'LuxeOrbit', sub: '' };

  const handleLogout = async () => {
    try {
      const isMockConfig = import.meta.env.VITE_FIREBASE_API_KEY === 'mock-api-key' || !import.meta.env.VITE_FIREBASE_API_KEY;
      if (!isMockConfig) {
        await signOut(auth);
      }
    } catch (e) {
      console.error("Firebase signOut error:", e);
    } finally {
      dispatch(logout());
      navigate('/login');
    }
  };

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  return (
    <div className="admin-root">
      {mobileOpen && (
        <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',zIndex:40,backdropFilter:'blur(4px)' }} onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">L</div>
          <div className="sidebar-logo-text">
            <h2>LuxeOrbit</h2>
            <p>{business?.businessName || 'Admin Portal'}</p>
          </div>
        </div>
        <button className="sidebar-collapse-btn" onClick={() => setCollapsed(p => !p)}><ChevronLeft size={12} /></button>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ section, items }) => (
            <div key={section}>
              <div className="sidebar-section-label">{section}</div>
              {items.map(item => <SidebarItem key={item.path} {...item} collapsed={collapsed} />)}
            </div>
          ))}
        </nav>

        <div className="sidebar-user">
          <div className="sidebar-user-inner">
            <div className="user-avatar">{(user?.name || user?.email || 'A')[0].toUpperCase()}</div>
            <div className="user-info">
              <p className="user-name">{user?.name || user?.email?.split('@')[0] || 'Admin'}</p>
              <p className="user-role">{user?.role || 'Owner'}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="sidebar-item" style={{ width:'100%',background:'none',border:'none',marginTop:4,color:'rgba(248,113,113,0.7)' }}>
            <span className="sidebar-item-icon"><LogOut size={16} /></span>
            <span className="sidebar-item-label">Logout</span>
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div style={{ display:'flex',alignItems:'center',gap:'1rem' }}>
            <button className="topbar-icon-btn" id="mobile-menu-btn" style={{ display:'none' }} onClick={() => setMobileOpen(p => !p)}>
              {mobileOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
            <div className="topbar-left"><h1>{pageInfo.title}</h1><p>{pageInfo.sub}</p></div>
          </div>
          <div className="topbar-right">
            <button className="topbar-icon-btn" onClick={toggleTheme} title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}>
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button className="topbar-icon-btn"><Bell size={16} /><span className="notif-dot" /></button>
            <div className="topbar-plan-badge">{business?.subscriptionPlan || 'Basic'}</div>
            <div style={{ display:'flex',alignItems:'center',gap:'0.6rem',paddingLeft:'1rem',borderLeft:'1px solid rgba(255,255,255,0.07)' }}>
              <div className="user-avatar" style={{ width:32,height:32,fontSize:'0.8rem' }}>{(user?.name||user?.email||'A')[0].toUpperCase()}</div>
              <div>
                <p style={{ fontSize:'0.8rem',fontWeight:600,color:'#f0ebe0',margin:0 }}>{user?.name||user?.email?.split('@')[0]||'Admin'}</p>
                <p style={{ fontSize:'0.65rem',color:'rgba(212,175,55,0.6)',textTransform:'uppercase',letterSpacing:'0.06em',margin:0 }}>{user?.role||'Owner'}</p>
              </div>
            </div>
          </div>
        </header>
        <main className="admin-page"><Outlet /></main>
      </div>
      <style>{`@media (max-width: 768px) { #mobile-menu-btn { display: flex !important; } }`}</style>
    </div>
  );
};

export default DashboardLayout;
