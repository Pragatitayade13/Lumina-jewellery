// src/context/AppContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, getDocs, setDoc, updateDoc, query, collection, where, addDoc, serverTimestamp } from 'firebase/firestore';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('jw_cart') || '[]'); }
    catch { return []; }
  });
  const [wishlist, setWishlist] = useState(() => {
    try { return JSON.parse(localStorage.getItem('jw_wishlist') || '[]'); }
    catch { return []; }
  });
  const [toast, setToast] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [user, setUserState] = useState(() => {
    try {
      const savedUser = localStorage.getItem('jw_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [authLoading, setAuthLoading] = useState(() => {
    try {
      return !localStorage.getItem('jw_user');
    } catch {
      return true;
    }
  });

  const setUser = (userData) => {
    setUserState(userData);
    try {
      if (userData) {
        localStorage.setItem('jw_user', JSON.stringify(userData));
      } else {
        localStorage.removeItem('jw_user');
      }
    } catch (err) {
      console.error("Failed to save user to localStorage", err);
    }
  };
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('jw_theme') || 'dark'; }
    catch { return 'dark'; }
  });
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [vtoProduct, setVtoProduct] = useState(null);
  const [globalSearch, setGlobalSearch] = useState('');

  // Admin Store Context
  const [currentStore, setCurrentStore] = useState(() => {
    try { return localStorage.getItem('jw_currentStore') || null; }
    catch { return null; }
  });
  const [assignedStores, setAssignedStores] = useState([]);
  const [isStoreSelectionOpen, setIsStoreSelectionOpen] = useState(false);

  // Customer Store Context
  const [customerSelectedStore, setCustomerSelectedStoreState] = useState(() => {
    try { return localStorage.getItem('jw_customer_store') || null; }
    catch { return null; }
  });
  const [allPublicStores, setAllPublicStores] = useState([]);
  const [isCustomerStorePromptOpen, setIsCustomerStorePromptOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  const setCustomerSelectedStore = (storeId) => {
    setCustomerSelectedStoreState(storeId);
    try {
      if (storeId) localStorage.setItem('jw_customer_store', storeId);
      else localStorage.removeItem('jw_customer_store');
    } catch {}
  };

  useEffect(() => {
    if (currentStore) {
      localStorage.setItem('jw_currentStore', currentStore);
    } else {
      localStorage.removeItem('jw_currentStore');
    }
  }, [currentStore]);

  // --- Startup: Fetch public stores WITHOUT requiring login ---
  // This covers guest users browsing the catalog before they sign in.
  useEffect(() => {
    import('../config/firebase').then(async ({ db }) => {
      if (!db) return;
      try {
        const { query, collection, where, getDocs } = await import('firebase/firestore');
        const storesQ = query(collection(db, 'stores'), where('status', '==', 'active'));
        const snapshot = await getDocs(storesQ);
        const stores = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        console.log('[AppContext] Startup: fetched', stores.length, 'public stores');
        setAllPublicStores(stores);
        
        if (stores.length === 1) {
          // Single store — auto-select silently
          const single = stores[0].id;
          setCustomerSelectedStoreState(single);
          localStorage.setItem('jw_customer_store', single);
        }
        // Note: we do NOT auto-open prompt here — that happens when user navigates
        // to catalog (Catalog.jsx handles it), or on login (auth handler handles it).
      } catch (err) {
        console.warn('[AppContext] Startup store fetch failed (security rules or no db):', err);
      }
    }).catch(() => {});
  }, []); // Run once on mount

  useEffect(() => {
    // Listen to Firebase Auth state
    import('../config/firebase').then(async ({ auth, db }) => {
      if (!auth) {
        setAuthLoading(false);
        return;
      }
      const { onAuthStateChanged } = await import('firebase/auth');
      
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            // Fetch user, userStores, and active stores in parallel to drastically minimize DB roundtrip latency
            const [userDoc, userStoresDocs, allStoresDocs] = await Promise.all([
              getDoc(doc(db, 'users', firebaseUser.uid)),
              getDocs(query(collection(db, 'userStores'), where('userId', '==', firebaseUser.uid))),
              getDocs(query(collection(db, 'stores'), where('status', '==', 'active')))
            ]);

            let userData = { uid: firebaseUser.uid, email: firebaseUser.email, role: 'customer', name: firebaseUser.displayName || 'Customer' };
            if (userDoc.exists()) {
              userData = { ...userData, ...userDoc.data() };
              
              // --- FIX: Default missing role to 'customer' (never auto-escalate) ---
              if (!userDoc.data().role) {
                console.warn("User missing role field, defaulting to 'customer'.");
                userData.role = 'customer';
                try {
                  await updateDoc(doc(db, 'users', firebaseUser.uid), { role: 'customer' });
                } catch (e) {
                  console.warn("Could not set default role in DB:", e);
                }
              }
            }

            // --- DEV BOOTSTRAP: Only in dev mode via env flag ---
            if (import.meta.env.VITE_DEV_BOOTSTRAP === 'true' && firebaseUser.email === import.meta.env.VITE_SUPERADMIN_EMAIL) {
              userData.role = 'superadmin';
              userData.permissions = ['all'];
              
              try {
                await setDoc(doc(db, 'users', firebaseUser.uid), {
                  role: 'superadmin',
                  permissions: ['all'],
                  updatedAt: new Date().toISOString()
                }, { merge: true });
              } catch (e) {
                console.warn("Bootstrap write failed:", e);
              }
            }
            // -----------------------------------------------------

            // Sync custom claims: if Firestore role differs from token claim, force refresh
            try {
              const tokenResult = await firebaseUser.getIdTokenResult();
              if (tokenResult.claims.role !== userData.role) {
                console.log('Role mismatch detected, refreshing token claims...');
                await firebaseUser.getIdToken(true); // Force refresh
              }
            } catch (err) {
              console.warn("Failed to verify token claims:", err);
            }

            // --- Multi-Store Context Initialization ---
            const assignedStoreIds = userStoresDocs.docs.map(d => d.data().storeId);
            console.log("[AppContext] Found assigned store IDs:", assignedStoreIds);

            const allStores = allStoresDocs.docs.map(d => ({ id: d.id, ...d.data() }));
            console.log(`[AppContext] Fetched ${allStores.length} active stores globally.`);

            let userAssignedStores = [];
            if (userData.role === 'superadmin') {
               userAssignedStores = allStores;
            } else if (userData.role !== 'customer') {
               userAssignedStores = allStores.filter(store => assignedStoreIds.includes(store.id));
            }
            console.log("[AppContext] Final computed assigned stores:", userAssignedStores);

            setAssignedStores(userAssignedStores);

            let activeStore = localStorage.getItem('jw_currentStore');
            console.log("[AppContext] Previous active store from localStorage:", activeStore);
            
            if (userAssignedStores.length === 1) {
               activeStore = userAssignedStores[0].id;
               setCurrentStore(activeStore);
               setIsStoreSelectionOpen(false);
            } else if (userAssignedStores.length > 1) {
               if (!userAssignedStores.find(s => s.id === activeStore)) {
                 activeStore = null; 
                 setCurrentStore(null);
                  if (userData.role !== 'customer') {
                    setIsStoreSelectionOpen(true);
                  }
               }
            } else {
               setCurrentStore(null);
               setIsStoreSelectionOpen(false);
            }
            // ------------------------------------------

            // --- Customer Store Context Initialization ---
            const isAdminRole = ['superadmin', 'admin', 'manager', 'staff', 'finance', 'logistics', 'delivery'].includes(userData.role);
            if (!isAdminRole) {
              try {
                // Reuse active stores list fetched in parallel earlier
                const publicStores = allStores;
                setAllPublicStores(publicStores);

                const savedStore = localStorage.getItem('jw_customer_store');
                const savedIsValid = savedStore && publicStores.find(s => s.id === savedStore);

                if (publicStores.length === 1) {
                  setCustomerSelectedStoreState(publicStores[0].id);
                  localStorage.setItem('jw_customer_store', publicStores[0].id);
                } else if (publicStores.length > 1 && !savedIsValid) {
                  setIsCustomerStorePromptOpen(true);
                }
              } catch (err) {
                console.warn('[AppContext] Could not configure public stores for customer:', err);
              }
            }
            // -------------------------------------------

            setUser(userData);

            // Log activity to Firestore
            try {
              const data = userDoc.exists() ? userDoc.data() : { role: 'customer', name: firebaseUser.displayName || 'Customer' };
              
              let currentIp = 'unknown';
              try {
                const ipRes = await fetch('https://api.ipify.org?format=json');
                const ipData = await ipRes.json();
                currentIp = ipData.ip;
              } catch (e) {
                console.warn('Could not fetch IP address');
              }

              const docRef = await addDoc(collection(db, 'loginActivity'), {
                userId: firebaseUser.uid,
                userName: data.name || 'Unknown',
                email: firebaseUser.email,
                role: data.role || 'customer',
                status: 'success',
                loginTime: Date.now(),
                ipAddress: currentIp,
                deviceInfo: navigator.userAgent.substring(0, 100)
              });
              sessionStorage.setItem('jw_login_activity_id', docRef.id);
            } catch (err) {
              console.warn("Failed to log activity:", err);
            }
          } catch (err) {
            if (typeof navigator !== 'undefined' && !navigator.onLine || err.code === 'unavailable' || err.message?.includes('offline')) {
              console.warn("Offline: Using cached or default user role configuration");
            } else {
              console.error("Error fetching user role", err);
            }
            setUser({ uid: firebaseUser.uid, email: firebaseUser.email, role: 'customer', name: 'Customer' });
          }
        } else {
          // If Firebase Auth returns null (no user), only log out if we don't have a mock user
          const savedUserStr = localStorage.getItem('jw_user');
          let isMock = false;
          if (savedUserStr) {
            try {
              const savedUser = JSON.parse(savedUserStr);
              if (savedUser && savedUser.uid && savedUser.uid.startsWith('mock-')) {
                isMock = true;
              }
            } catch (e) {}
          }
          if (!isMock) {
            setUser(null);
          }
        }
        setAuthLoading(false);
      });
      return () => unsubscribe();
    }).catch(err => {
      console.warn("Firebase not configured properly.", err);
      setAuthLoading(false);
    });
  }, []);

  useEffect(() => {
    localStorage.setItem('jw_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('jw_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('jw_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...product, qty: 1 }];
    });
    showToast(`✦ ${product.name} added to cart`);
    setIsCartOpen(true);
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(i => {
      if (i.id === id) {
        const newQty = Math.max(1, i.qty + delta);
        return { ...i, qty: newQty };
      }
      return i;
    }));
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleWishlist = (product) => {
    setWishlist(prev => {
      const exists = prev.find(i => i.id === product.id);
      if (exists) {
        showToast(`Removed from wishlist`);
        return prev.filter(i => i.id !== product.id);
      }
      showToast(`✦ ${product.name} added to wishlist`);
      return [...prev, product];
    });
  };

  const isWishlisted = (id) => wishlist.some(i => i.id === id);

  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);
  const wishlistCount = wishlist.length;

  return (
    <AppContext.Provider value={{
      cart, wishlist, toast, user, setUser,
      authLoading,
      isAuthOpen, setIsAuthOpen,
      isSupportOpen, setIsSupportOpen,
      isCartOpen, setIsCartOpen,
      isWishlistOpen, setIsWishlistOpen,
      theme, toggleTheme,
      quickViewProduct, setQuickViewProduct,
      vtoProduct, setVtoProduct,
      currentStore, setCurrentStore,
      assignedStores, setAssignedStores,
      isStoreSelectionOpen, setIsStoreSelectionOpen,
      // Customer store context
      customerSelectedStore, setCustomerSelectedStore,
      allPublicStores, setAllPublicStores,
      isCustomerStorePromptOpen, setIsCustomerStorePromptOpen,
      globalSearch, setGlobalSearch,
      addToCart, removeFromCart, updateQuantity, clearCart, toggleWishlist, isWishlisted,
      cartCount, wishlistCount, showToast
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
