import { useApp } from '../../context/AppContext';
import { Store, MapPin, ArrowRight, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function StoreSelectionModal() {
  const { isStoreSelectionOpen, setIsStoreSelectionOpen, assignedStores, setCurrentStore, user } = useApp();
  const navigate = useNavigate();

  if (!isStoreSelectionOpen) return null;

  const handleSelectStore = (storeId) => {
    setCurrentStore(storeId);
    setIsStoreSelectionOpen(false);
    navigate('/admin'); // Force navigate to dashboard
  };

  return (
    <div className="auth-page-container" style={{ zIndex: 9999, background: 'rgba(0,0,0,0.85)' }} data-lenis-prevent="true">
      <div className="auth-glass-modal" onClick={e => e.stopPropagation()} data-lenis-prevent="true" style={{ maxWidth: '600px' }}>
        
        <div className="auth-glass-header" style={{ marginBottom: '2rem' }}>
          <div className="auth-logo-brand" style={{ marginBottom: '1rem' }}>
            <Store size={32} className="auth-logo-icon" color="var(--gold)" />
          </div>
          <h2 className="auth-glass-title" style={{ fontSize: '1.5rem' }}>SELECT YOUR STORE</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', marginTop: '0.5rem' }}>
            You have access to multiple stores. Please select the store context you wish to manage.
          </p>
        </div>
        
        <div className="auth-modal-body" data-lenis-prevent style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {assignedStores.map(store => (
              <div 
                key={store.id} 
                onClick={() => handleSelectStore(store.id)}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.background = 'rgba(201, 168, 76, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(201, 168, 76, 0.3)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    {store.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <MapPin size={14} />
                    {store.address || 'Location N/A'}
                    {store.code && <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>{store.code}</span>}
                  </div>
                </div>
                <div style={{ color: 'var(--gold)' }}>
                  <ArrowRight size={20} />
                </div>
              </div>
            ))}

            {user?.role === 'superadmin' && (
              <>
                <div 
                  onClick={() => handleSelectStore(null)}
                  style={{
                    background: 'rgba(201, 168, 76, 0.05)',
                    border: '1px solid rgba(201, 168, 76, 0.3)',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    marginTop: '0.5rem'
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.background = 'rgba(201, 168, 76, 0.15)';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.background = 'rgba(201, 168, 76, 0.05)';
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--gold)', marginBottom: '0.25rem' }}>
                      All Stores (Global View)
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Access comprehensive dashboard and manage all locations
                    </div>
                  </div>
                  <div style={{ color: 'var(--gold)' }}>
                    <ArrowRight size={20} />
                  </div>
                </div>
                <div style={{ 
                  marginTop: '1rem', 
                  padding: '1rem', 
                  background: 'rgba(231, 76, 60, 0.05)', 
                  border: '1px dashed rgba(231, 76, 60, 0.3)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem'
                }}>
                  <ShieldAlert size={18} color="#e74c3c" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ fontSize: '0.85rem', color: '#e74c3c' }}>
                    <strong>Super Admin Access:</strong> You can select a specific store context or manage all stores globally.
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
