import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Package, Truck, LayoutDashboard, LogOut, Bell, RotateCcw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAudit } from '../hooks/useAudit';
import './DeliveryLayout.css';

export default function DeliveryLayout() {
  const { user, setUser, currentStore, setCurrentStore, assignedStores } = useApp();
  const { logAudit } = useAudit();
  const navigate = useNavigate();

  const activeStoreObj = assignedStores?.find(s => s.id === currentStore);
  const activeStoreName = activeStoreObj?.name || activeStoreObj?.storeName || null;
  const storeNameDisplay = currentStore && currentStore !== 'GLOBAL' && currentStore !== 'NONE' && activeStoreName 
    ? activeStoreName 
    : 'Lumina Logistics';

  const handleLogout = async () => {
    if (user?.uid) {
      try {
        const { auth, db } = await import('../config/firebase');
        const { updateDoc, doc, serverTimestamp } = await import('firebase/firestore');
        const { signOut } = await import('firebase/auth');
        
        if (db) {
           await updateDoc(doc(db, 'users', user.uid), {
             lastCheckOut: serverTimestamp(),
             status: 'offline'
           });
           await logAudit('USER_LOGOUT', 'Auth', user.uid, null, null, currentStore);
        }
        if (auth) await signOut(auth);
      } catch (e) { console.error("Logout error", e); }
    }
    localStorage.removeItem('jw_currentStore'); // Force prompt on next login
    setCurrentStore(null);
    setUser(null);
    navigate('/');
  };

  return (
    <div className="delivery-layout">
      {/* Mobile-friendly Sidebar */}
      <aside className="delivery-sidebar">
        <div className="delivery-brand">
          <Truck size={28} color="var(--gold)" />
          <span style={{ fontSize: '0.95rem' }}>{storeNameDisplay}</span>
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
            <div className="del-avatar">{(user?.name || 'Driver').substring(0, 2).toUpperCase()}</div>
            <div>
              <div className="del-name">{user?.name || 'Rahul Kumar'}</div>
              <div className="del-role">{user?.role === 'delivery' ? 'Delivery Partner' : 'Senior Partner'}</div>
            </div>
          </div>
          <button className="del-logout" onClick={handleLogout}>
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
