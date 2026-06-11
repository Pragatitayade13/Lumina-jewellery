import { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Store, ChevronDown, Check, Globe } from 'lucide-react';

export default function StoreSwitcherDropdown() {
  const { currentStore, assignedStores, setCurrentStore, user } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isSuperAdmin = user?.role === 'superadmin';

  // Only render if there are multiple assigned stores
  if (!assignedStores || assignedStores.length <= 1) {
    return null;
  }

  // If not superadmin and no current store, do not render switcher (forces modal selection)
  if (!currentStore && !isSuperAdmin) {
    return null;
  }

  const activeStoreObj = assignedStores.find(s => s.id === currentStore);
  const activeStoreName = activeStoreObj ? activeStoreObj.name : (isSuperAdmin && !currentStore ? 'All Stores (Global)' : 'Unknown Store');

  return (
    <div className="store-switcher" ref={dropdownRef} style={{ position: 'relative' }}>
      <button 
        className="topbar-btn store-switcher-btn" 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          width: 'auto', 
          padding: '0 12px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          background: isOpen ? 'rgba(201,168,76,0.1)' : 'transparent',
          border: '1px solid rgba(255,255,255,0.05)'
        }}
      >
        {activeStoreName === 'All Stores (Global)' ? <Globe size={16} color="var(--gold)" /> : <Store size={16} color="var(--gold)" />}
        <span className="store-switcher-text" style={{ fontSize: '0.85rem', fontWeight: 500 }}>{activeStoreName}</span>
        <ChevronDown size={14} className="store-switcher-chevron" style={{ color: 'var(--text-muted)', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {isOpen && (
        <div 
          className="store-switcher-menu" 
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '240px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            padding: '0.5rem',
            zIndex: 100,
            animation: 'adm-scale 0.2s ease'
          }}
        >
          <div style={{ padding: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
            Switch Store Context
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', maxHeight: '300px', overflowY: 'auto' }}>
            {isSuperAdmin && (
              <button
                onClick={() => {
                  setCurrentStore(null);
                  setIsOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  background: !currentStore ? 'rgba(201,168,76,0.1)' : 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  color: !currentStore ? 'var(--gold)' : 'var(--text-primary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={e => {
                  if (currentStore) e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                }}
                onMouseOut={e => {
                  if (currentStore) e.currentTarget.style.background = 'transparent';
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: !currentStore ? 600 : 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    All Stores (Global)
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Cross-store view</span>
                </div>
                {!currentStore && <Check size={14} color="var(--gold)" style={{ flexShrink: 0 }} />}
              </button>
            )}
            {assignedStores.map(store => {
              const isActive = store.id === currentStore;
              return (
                <button
                  key={store.id}
                  onClick={() => {
                    setCurrentStore(store.id);
                    setIsOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    background: isActive ? 'rgba(201,168,76,0.1)' : 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    color: isActive ? 'var(--gold)' : 'var(--text-primary)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={e => {
                    if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  }}
                  onMouseOut={e => {
                    if (!isActive) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: isActive ? 600 : 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {store.name}
                    </span>
                    {store.code && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{store.code}</span>
                    )}
                  </div>
                  {isActive && <Check size={14} color="var(--gold)" style={{ flexShrink: 0 }} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
