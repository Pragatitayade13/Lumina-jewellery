// src/context/AppContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

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
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('jw_theme') || 'dark'; }
    catch { return 'dark'; }
  });
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [vtoProduct, setVtoProduct] = useState(null);

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
            const { doc, getDoc } = await import('firebase/firestore');
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (userDoc.exists()) {
              setUser({ uid: firebaseUser.uid, email: firebaseUser.email, ...userDoc.data() });
            } else {
              // Fallback if document doesn't exist yet
              setUser({ uid: firebaseUser.uid, email: firebaseUser.email, role: 'customer', name: firebaseUser.displayName || 'Customer' });
            }
          } catch (err) {
            console.error("Error fetching user role", err);
            setUser({ uid: firebaseUser.uid, email: firebaseUser.email, role: 'customer', name: 'Customer' });
          }
        } else {
          setUser(null);
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
      isAuthOpen, setIsAuthOpen,
      isSupportOpen, setIsSupportOpen,
      theme, toggleTheme,
      quickViewProduct, setQuickViewProduct,
      vtoProduct, setVtoProduct,
      addToCart, removeFromCart, updateQuantity, clearCart, toggleWishlist, isWishlisted,
      cartCount, wishlistCount, showToast
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
