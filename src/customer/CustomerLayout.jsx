import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, User, Package, Heart, LifeBuoy, 
  Calendar, RefreshCcw, Calculator, Sparkles, LogOut, Diamond, Sun, Moon, ShieldCheck, Store, Menu
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import NotificationDropdown from '../components/NotificationDropdown/NotificationDropdown';
import { useRates } from '../hooks/useRates';
import { useAudit } from '../hooks/useAudit';
import { useCMS } from '../context/CMSContext';

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
  { path: '/account/certificate', label: 'Certificate Verification', icon: <ShieldCheck size={18} /> },
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
  '/account/certificate': 'Certificate Verification',
  '/account/support': 'Support & Tickets',
};

export default function CustomerLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, setUser, theme, toggleTheme, customerSelectedStore, allPublicStores, setIsCustomerStorePromptOpen } = useApp();
  const { logAudit } = useAudit();
  const { systemSettingsData, landingPageData } = useCMS();
  const { rates } = useRates();
  
  const globalStoreName = landingPageData?.branding?.storeName || systemSettingsData?.storeName || 'Lumina Jewels';
  const pageTitle = pageTitles[location.pathname] || 'My Account';
  
  const activeStoreName = customerSelectedStore
    ? (allPublicStores.find(s => s.id === customerSelectedStore)?.name || 'Selected Store')
    : null;

  const storeName = customerSelectedStore && activeStoreName 
    ? activeStoreName 
    : globalStoreName;

  const handleLogout = async () => {
    if (user?.uid) {
      try {
        const { auth, db } = await import('../config/firebase');
        const { updateDoc, doc, serverTimestamp, collection, query, where, orderBy, limit, getDocs } = await import('firebase/firestore');
        const { signOut } = await import('firebase/auth');
        
        if (db) {
          try {
            await updateDoc(doc(db, 'users', user.uid), {
              lastCheckOut: serverTimestamp(),
              status: 'offline'
            });
          } catch (userDbErr) {
            console.warn("Failed to update user offline status in DB:", userDbErr);
          }

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

          try {
            await logAudit('USER_LOGOUT', 'Auth', user.uid, null, null, 'GLOBAL');
          } catch (auditErr) {
            console.warn("Failed to log logout audit:", auditErr);
          }
        }
        if (auth) await signOut(auth);
      } catch (e) { 
        console.error("Logout error during auth operations", e); 
      }
    }
    setUser(null);
    navigate('/');
  };

  return (
    <div className="customer-wrapper">
      {/* ─── Sidebar ─── */}
      <aside className={`customer-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            {landingPageData?.branding?.logoUrl ? (
              <img src={landingPageData.branding.logoUrl} alt="Store Logo" style={{ height: 24, width: 24, objectFit: 'contain' }} />
            ) : (
              <Diamond size={24} color="#0D0800" />
            )}
          </div>
          <div>
            <div className="sidebar-logo-name">{storeName}</div>
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
                onClick={() => setSidebarOpen(false)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          {/* Active store context pill */}
          <div
            onClick={() => {
              setSidebarOpen(false);
              setIsCustomerStorePromptOpen(true);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.55rem 0.85rem',
              marginBottom: '0.75rem',
              borderRadius: '8px',
              background: activeStoreName ? 'rgba(201,168,76,0.08)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${activeStoreName ? 'rgba(201,168,76,0.25)' : 'rgba(255,255,255,0.08)'}`,
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontSize: '0.8rem',
              color: activeStoreName ? 'var(--gold)' : 'var(--text-muted)',
              fontWeight: 600,
            }}
          >
            <Store size={13} />
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {activeStoreName || 'Select Store'}
            </span>
            <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>Change</span>
          </div>
          <div className="sidebar-customer-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div 
              onClick={() => {
                setSidebarOpen(false);
                navigate('/account/profile');
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }}
              title="View Profile Settings"
            >
              <div className="customer-avatar">{user?.name ? user.name.substring(0, 2).toUpperCase() : 'CU'}</div>
              <div>
                <div className="customer-name">{user?.name || 'Customer'}</div>
              </div>
            </div>
            <button onClick={handleLogout} className="btn btn-icon btn-outline" style={{ border: 'none', color: 'var(--text-muted)' }} title="Logout">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Sidebar Overlay on mobile */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ─── Main Content Area ─── */}
      <div className="customer-main-area">
        <header className="customer-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button 
              className="show-on-mobile" 
              onClick={() => setSidebarOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                display: 'none',
                padding: 0,
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Menu size={20} />
            </button>
            <div>
              <div className="topbar-page-title">{pageTitle}</div>
              <div className="topbar-breadcrumb">Home › Account › {pageTitle}</div>
            </div>
          </div>
          <div className="topbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {rates && rates.gold24k && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginRight: '1rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Live Gold (24K)</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--gold)' }}>₹{rates.gold24k.toLocaleString()}/g</span>
              </div>
            )}
            <NotificationDropdown userRole="customer" />
            <button className="btn btn-primary" onClick={() => navigate('/collections')}>Continue Shopping</button>
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
