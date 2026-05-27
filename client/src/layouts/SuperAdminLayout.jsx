import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import {
  LayoutDashboard, Store, Users, CreditCard,
  Settings, LogOut, Bell, Shield, BarChart3,
  ChevronLeft, Globe, MessageSquare, Activity,
  IndianRupee, FileText, Layers, Sun, Moon
} from 'lucide-react';
import { useTheme } from '../ThemeContext';
import '../admin.css';

const SA_NAV = [
  { section: 'PLATFORM', items: [
    { icon: LayoutDashboard, label: 'Overview',       path: '/super-admin'                },
    { icon: Store,           label: 'All Stores',     path: '/super-admin/stores'         },
    { icon: Users,           label: 'All Users',      path: '/super-admin/users'          },
  ]},
  { section: 'BILLING', items: [
    { icon: CreditCard,      label: 'Subscriptions',  path: '/super-admin/subscriptions'  },
    { icon: IndianRupee,     label: 'Revenue',        path: '/super-admin/revenue'        },
  ]},
  { section: 'SUPPORT', items: [
    { icon: MessageSquare,   label: 'Support Tickets',path: '/super-admin/tickets'        },
  ]},
  { section: 'SYSTEM', items: [
    { icon: Globe,           label: 'Platform Logs',  path: '/super-admin/logs'           },
    { icon: Settings,        label: 'Config & GST',   path: '/super-admin/config'         },
  ]},
];

const PAGE_TITLES = {
  '/super-admin':               { title: 'Platform Overview',  sub: 'All-business intelligence dashboard'         },
  '/super-admin/stores':        { title: 'All Stores',         sub: 'Approve, manage and deactivate businesses'   },
  '/super-admin/users':         { title: 'All Users',          sub: 'Platform-wide user management'               },
  '/super-admin/subscriptions': { title: 'Subscriptions',      sub: 'Plans, billing and upgrade/downgrade'        },
  '/super-admin/revenue':       { title: 'Platform Revenue',   sub: 'MRR, ARR, churn and financial overview'      },
  '/super-admin/tickets':       { title: 'Support Tickets',    sub: 'Customer support and issue resolution'       },
  '/super-admin/logs':          { title: 'Platform Logs',      sub: 'System audit, server health and activity'    },
  '/super-admin/config':        { title: 'Config & GST',       sub: 'System settings, GST rules, feature flags'   },
};

const SidebarItem = ({ icon: Icon, label, path, collapsed, badge }) => {
  const location = useLocation();
  const isActive = location.pathname === path;
  return (
    <Link to={path} className={`sidebar-item ${isActive ? 'active' : ''}`} style={isActive ? { color:'#a78bfa', background:'rgba(132,99,250,0.1)' } : {}} data-tooltip={collapsed ? label : undefined}>
      <span className="sidebar-item-icon"><Icon size={18} /></span>
      <span className="sidebar-item-label">{label}</span>
      {badge && !collapsed && <span className="sidebar-item-badge" style={{ background:'#a78bfa' }}>{badge}</span>}
    </Link>
  );
};

const SuperAdminLayout = () => {
  const { user } = useSelector(state => state.auth);
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const pageInfo = PAGE_TITLES[location.pathname] || { title: 'Super Admin', sub: '' };

  const handleLogout = async () => {
    try {
      const isMockConfig = import.meta.env.VITE_FIREBASE_API_KEY === 'mock-api-key' || !import.meta.env.VITE_FIREBASE_API_KEY;
      if (!isMockConfig) {
        await signOut(auth);
      }
    } catch (err) {
      console.error("Firebase signOut error:", err);
    } finally {
      dispatch(logout());
      navigate('/login');
    }
  };

  return (
    <div className="admin-root">
      <aside className={`admin-sidebar super-admin-sidebar ${collapsed ? 'collapsed' : ''}`} style={{ borderRight:'1px solid rgba(132,99,250,0.12)', background:'linear-gradient(180deg, #0c0c18 0%, #0a0a12 100%)' }}>
        <div className="sidebar-logo" style={{ borderBottom:'1px solid rgba(132,99,250,0.08)' }}>
          <div className="sidebar-logo-icon" style={{ background:'linear-gradient(135deg, #8463fa, #5b3fd4)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Shield size={16} />
          </div>
          <div className="sidebar-logo-text">
            <h2 style={{ color:'#a78bfa' }}>LuxeOrbit</h2>
            <p style={{ color:'rgba(167,139,250,0.4)' }}>Super Admin Console</p>
          </div>
        </div>

        <button className="sidebar-collapse-btn" onClick={() => setCollapsed(p => !p)} style={{ borderColor:'rgba(132,99,250,0.3)', color:'#a78bfa' }}>
          <ChevronLeft size={12} />
        </button>

        <nav className="sidebar-nav">
          {SA_NAV.map(({ section, items }) => (
            <div key={section}>
              <div className="sidebar-section-label">{section}</div>
              {items.map(item => <SidebarItem key={item.path} {...item} collapsed={collapsed} />)}
            </div>
          ))}
          <div className="sidebar-section-label">SWITCH ROLE</div>
          <Link to="/dashboard" className="sidebar-item">
            <span className="sidebar-item-icon"><Store size={18} /></span>
            <span className="sidebar-item-label" style={{ color:'rgba(212,175,55,0.7)' }}>My Store Admin</span>
          </Link>
        </nav>

        <div className="sidebar-user">
          <div className="sidebar-user-inner">
            <div className="user-avatar" style={{ background:'linear-gradient(135deg, #8463fa, #5b3fd4)', color:'#fff' }}>
              {(user?.name || user?.email || 'S')[0].toUpperCase()}
            </div>
            <div className="user-info">
              <p className="user-name">{user?.name || user?.email?.split('@')[0] || 'Super Admin'}</p>
              <p className="user-role" style={{ color:'rgba(167,139,250,0.6)' }}>Platform Owner</p>
            </div>
          </div>
          <button onClick={handleLogout} className="sidebar-item" style={{ width:'100%',background:'none',border:'none',marginTop:4,color:'rgba(248,113,113,0.7)' }}>
            <span className="sidebar-item-icon"><LogOut size={16} /></span>
            <span className="sidebar-item-label">Logout</span>
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar" style={{ borderBottom:'1px solid rgba(132,99,250,0.1)', background:'rgba(10,10,18,0.9)' }}>
          <div className="topbar-left" style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
            <div style={{ width:8,height:8,borderRadius:'50%',background:'#a78bfa',animation:'pulse-live 2s ease-in-out infinite',flexShrink:0 }} />
            <div>
              <h1 style={{ color:'#f0ebe0' }}>{pageInfo.title}</h1>
              <p>{pageInfo.sub}</p>
            </div>
          </div>
          <div className="topbar-right">
            <button
              className="topbar-icon-btn"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              style={{ borderColor:'rgba(132,99,250,0.2)', color:'rgba(167,139,250,0.7)' }}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button className="topbar-icon-btn" style={{ borderColor:'rgba(132,99,250,0.2)', color:'rgba(167,139,250,0.6)' }}>
              <Bell size={16} /><span className="notif-dot" style={{ background:'#a78bfa' }} />
            </button>
            <div style={{ background:'rgba(132,99,250,0.12)', border:'1px solid rgba(132,99,250,0.25)', borderRadius:99, padding:'0.3rem 0.9rem', fontSize:'0.65rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#a78bfa', display:'flex', alignItems:'center', gap:'0.4rem' }}>
              <Shield size={11} /> SUPER ADMIN
            </div>
          </div>
        </header>
        <main className="admin-page"><Outlet /></main>
      </div>
    </div>
  );
};

export default SuperAdminLayout;
