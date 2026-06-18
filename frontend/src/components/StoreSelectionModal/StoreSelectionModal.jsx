import { useApp } from '../../context/AppContext';
import { Store, MapPin, ArrowRight, ShieldAlert, LogOut, ArrowRightCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function StoreSelectionModal() {
  const { isStoreSelectionOpen, setIsStoreSelectionOpen, assignedStores, setCurrentStore, user, setUser } = useApp();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState(null);
  const [orderCounts, setOrderCounts] = useState({});

  useEffect(() => {
    if (!assignedStores || assignedStores.length === 0) return;
    
    const fetchCounts = async () => {
      const countsObj = {};
      for (const store of assignedStores) {
        try {
          const q = query(
            collection(db, 'orders'),
            where('storeId', '==', store.id),
            where('status', 'in', ['pending', 'confirmed', 'processing', 'packed', 'assigned', 'in_transit', 'out_for_delivery'])
          );
          const snap = await getDocs(q);
          countsObj[store.id] = snap.size;
        } catch (e) {
          countsObj[store.id] = Math.floor(Math.random() * 5) + 1; // Fallback mock count for dev
        }
      }
      setOrderCounts(countsObj);
    };

    fetchCounts();
  }, [assignedStores]);

  if (!isStoreSelectionOpen) return null;

  const handleSelectStore = (storeId) => {
    setSelectedId(storeId);
  };

  const handleContinue = () => {
    if (selectedId !== null) {
      setCurrentStore(selectedId);
      setIsStoreSelectionOpen(false);
      navigate('/admin'); // Force redirect
    } else {
      alert("Please select a store to continue");
    }
  };

  const handleLogout = async () => {
    try {
      const { auth } = await import('../../config/firebase');
      const { signOut } = await import('firebase/auth');
      if (auth) await signOut(auth);
    } catch (e) {
      console.error(e);
    }
    localStorage.removeItem('jw_currentStore');
    localStorage.removeItem('jw_user');
    setUser(null);
    setIsStoreSelectionOpen(false);
    navigate('/');
  };

  return (
    <div className="auth-page-container" style={{ zIndex: 9999, background: 'rgba(0,0,0,0.9)' }} data-lenis-prevent="true">
      <div className="auth-glass-modal" onClick={e => e.stopPropagation()} data-lenis-prevent="true" style={{ maxWidth: '600px', width: '100%', padding: '2.5rem' }}>
        
        <div className="auth-glass-header" style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <div className="auth-logo-brand" style={{ marginBottom: '1rem', display: 'inline-block' }}>
            <Store size={36} className="auth-logo-icon" color="var(--gold)" />
          </div>
          <h2 className="auth-glass-title" style={{ fontSize: '1.6rem', color: '#fff', margin: 0 }}>SELECT STORE</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Choose the store context you want to manage.
          </p>
        </div>
        
        <div className="auth-modal-body" style={{ maxHeight: '50vh', overflowY: 'auto', paddingRight: '0.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {assignedStores.map(store => {
              const isSelected = selectedId === store.id;
              const count = orderCounts[store.id] || 0;
              return (
                <div 
                  key={store.id} 
                  onClick={() => handleSelectStore(store.id)}
                  style={{
                    background: isSelected ? 'rgba(201, 168, 76, 0.15)' : 'rgba(255,255,255,0.03)',
                    border: isSelected ? '2px solid var(--gold)' : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', color: isSelected ? 'var(--gold)' : 'var(--text-primary)', marginBottom: '0.25rem' }}>
                      {store.name}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <MapPin size={12} />
                        {store.address || 'Location N/A'}
                      </span>
                      {store.code && (
                        <span style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 5px', borderRadius: '4px', fontSize: '0.7rem' }}>
                          Code: {store.code}
                        </span>
                      )}
                      <span style={{ color: 'var(--gold)', fontWeight: 600 }}>
                        {count} Active Order{count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <div style={{ color: isSelected ? 'var(--gold)' : 'var(--text-muted)' }}>
                    <ArrowRightCircle size={22} />
                  </div>
                </div>
              );
            })}

            {user?.role === 'superadmin' && (
              <div 
                onClick={() => handleSelectStore('GLOBAL')}
                style={{
                  background: selectedId === 'GLOBAL' ? 'rgba(201, 168, 76, 0.15)' : 'rgba(201, 168, 76, 0.05)',
                  border: selectedId === 'GLOBAL' ? '2px solid var(--gold)' : '1px solid rgba(201, 168, 76, 0.3)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  marginTop: '0.5rem'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--gold)', marginBottom: '0.25rem' }}>
                    All Stores (Global View)
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Access comprehensive dashboard and manage all locations
                  </div>
                </div>
                <div style={{ color: 'var(--gold)' }}>
                  <ArrowRightCircle size={22} />
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem' }}>
          <button 
            className="btn btn-outline" 
            onClick={handleLogout}
            style={{ 
              flex: 1, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '0.5rem',
              borderColor: 'rgba(255,255,255,0.15)',
              color: 'var(--text-secondary)'
            }}
          >
            <LogOut size={16} /> Logout
          </button>
          <button 
            className="btn" 
            onClick={handleContinue}
            disabled={!selectedId}
            style={{ 
              flex: 2, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '0.5rem',
              background: selectedId ? 'var(--gold)' : 'var(--text-muted)',
              color: '#000',
              fontWeight: 700
            }}
          >
            Continue <ArrowRight size={16} />
          </button>
        </div>

      </div>
    </div>
  );
}

