import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Store, MapPin, ArrowRight, Globe, X, CheckCircle, Search } from 'lucide-react';
import './CustomerStoreSelector.css';

export default function CustomerStoreSelector() {
  const {
    isCustomerStorePromptOpen,
    setIsCustomerStorePromptOpen,
    allPublicStores,
    setAllPublicStores,
    customerSelectedStore,
    setCustomerSelectedStore,
  } = useApp();

  const [search, setSearch] = useState('');

  // Fetch active stores if empty when selector modal is opened
  useEffect(() => {
    if (isCustomerStorePromptOpen && allPublicStores.length === 0) {
      import('../../config/firebase').then(async ({ db }) => {
        if (!db) return;
        try {
          const { query, collection, where, getDocs } = await import('firebase/firestore');
          const storesQ = query(collection(db, 'stores'), where('status', '==', 'active'));
          const snapshot = await getDocs(storesQ);
          const stores = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          console.log('[CustomerStoreSelector] Lazy-loaded public stores:', stores.length);
          setAllPublicStores(stores);
        } catch (err) {
          console.error('[CustomerStoreSelector] Lazy loading stores failed:', err);
        }
      }).catch(() => {});
    }
  }, [isCustomerStorePromptOpen, allPublicStores.length, setAllPublicStores]);

  if (!isCustomerStorePromptOpen) return null;

  const filtered = allPublicStores.filter(s =>
    !search ||
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.address?.toLowerCase().includes(search.toLowerCase()) ||
    s.city?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (storeId) => {
    setCustomerSelectedStore(storeId);
    setIsCustomerStorePromptOpen(false);
    setSearch('');
  };

  const canDismiss = !!customerSelectedStore; // Allow closing only if a store was already selected

  return (
    <div className="css-overlay" data-lenis-prevent="true">
      <div className="css-modal" data-lenis-prevent="true">

        {/* Header */}
        <div className="css-header">
          <div className="css-logo-wrap">
            <div className="css-logo-icon">
              <Store size={28} color="var(--gold)" />
            </div>
          </div>
          <h2 className="css-title">WHERE WOULD YOU LIKE TO SHOP?</h2>
          <p className="css-subtitle">
            Select a store to browse its exclusive collection, check live availability, and enjoy faster local delivery.
          </p>
          {canDismiss && (
            <button className="css-close-btn" onClick={() => setIsCustomerStorePromptOpen(false)} title="Close">
              <X size={18} />
            </button>
          )}
        </div>

        {/* Search */}
        {allPublicStores.length > 3 && (
          <div className="css-search-wrap">
            <Search size={15} className="css-search-icon" />
            <input
              className="css-search-input"
              type="text"
              placeholder="Search by store name or city…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
          </div>
        )}

        {/* Store List */}
        <div className="css-store-list">
          {filtered.map(store => {
            const isActive = customerSelectedStore === store.id;
            return (
              <div
                key={store.id}
                className={`css-store-card${isActive ? ' active' : ''}`}
                onClick={() => handleSelect(store.id)}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && handleSelect(store.id)}
              >
                <div className="css-store-icon-col">
                  <div className="css-store-dot" />
                </div>
                <div className="css-store-info">
                  <div className="css-store-name">{store.name}</div>
                  <div className="css-store-meta">
                    <MapPin size={12} />
                    <span>{store.address || store.city || 'Location N/A'}</span>
                    {store.code && <span className="css-store-code">{store.code}</span>}
                  </div>
                  {store.phone && (
                    <div className="css-store-phone">{store.phone}</div>
                  )}
                </div>
                <div className="css-store-action">
                  {isActive ? (
                    <CheckCircle size={20} color="var(--gold)" />
                  ) : (
                    <ArrowRight size={20} />
                  )}
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="css-no-results">No stores match your search.</div>
          )}

          {/* Shop All Stores option */}
          <div
            className={`css-store-card css-all-stores${!customerSelectedStore && !isCustomerStorePromptOpen ? ' active' : ''}`}
            onClick={() => handleSelect(null)}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && handleSelect(null)}
          >
            <div className="css-store-icon-col">
              <Globe size={20} color="var(--text-muted)" />
            </div>
            <div className="css-store-info">
              <div className="css-store-name" style={{ color: 'var(--text-muted)' }}>Browse All Stores</div>
              <div className="css-store-meta">
                <span>View products from all locations</span>
              </div>
            </div>
            <div className="css-store-action">
              <ArrowRight size={20} />
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div className="css-footer-note">
          ✦ You can always change your store from the navigation bar
        </div>
      </div>
    </div>
  );
}
