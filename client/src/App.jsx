import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store } from './redux/store';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { setCredentials, setAuthLoading, logout } from './redux/slices/authSlice';
import { ThemeProvider } from './ThemeContext';
import axios from 'axios';

// Public Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Security from './pages/Security';

// Business Owner Layout & Pages
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Analytics from './pages/Analytics';
import Customers from './pages/Customers';
import Staff from './pages/Staff';
import Settings from './pages/Settings';
import POS from './pages/POS';
import Reports from './pages/Reports';
import Orders from './pages/Orders';
import Finance from './pages/Finance';

// Super Admin Layout & Pages
import SuperAdminLayout from './layouts/SuperAdminLayout';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import SuperAdminStores from './pages/SuperAdminStores';
import SuperAdminSubscriptions from './pages/SuperAdminSubscriptions';
import SuperAdminRevenue from './pages/SuperAdminRevenue';
import SuperAdminTickets from './pages/SuperAdminTickets';
import SuperAdminLogs from './pages/SuperAdminLogs';
import SuperAdminConfig from './pages/SuperAdminConfig';

// Auth Guard Component
const RequireAuth = ({ children }) => {
  const { isAuthenticated, loading } = useSelector(state => state.auth);
  
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ width: 40, height: 40, border: '3px solid rgba(212,175,55,0.2)', borderTop: '3px solid #d4af37', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: 'rgba(212,175,55,0.6)', fontSize: '0.85rem', fontFamily: 'Poppins, sans-serif' }}>Loading LuxeOrbit…</p>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const AuthObserver = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setAuthLoading(true));
    
    // Check if we have mock or persisted credentials in localStorage
    const savedUser = localStorage.getItem('luxeorbit_user');
    const savedBusiness = localStorage.getItem('luxeorbit_business');
    const savedToken = localStorage.getItem('luxeorbit_token');
    
    if (savedUser) {
      try {
        dispatch(setCredentials({
          user: JSON.parse(savedUser),
          business: savedBusiness ? JSON.parse(savedBusiness) : null,
          token: savedToken || 'mock-token'
        }));
        dispatch(setAuthLoading(false));
        return; // Skip Firebase check since we are using local session
      } catch (e) {
        console.error("Failed to parse saved credentials", e);
      }
    }

    const isMockConfig = import.meta.env.VITE_FIREBASE_API_KEY === 'mock-api-key' || !import.meta.env.VITE_FIREBASE_API_KEY;
    if (isMockConfig) {
      dispatch(setAuthLoading(false));
      return; // Skip onAuthStateChanged as it will crash with invalid api key
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          const response = await axios.post('http://localhost:5000/api/auth/login', {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          dispatch(setCredentials({
            user: response.data.user,
            business: response.data.business,
            token
          }));
        } catch (error) {
          console.error("Failed to sync auth with backend", error);
          dispatch(logout());
        }
      } else {
        dispatch(logout());
      }
      dispatch(setAuthLoading(false));
    });

    return () => unsubscribe();
  }, [dispatch]);

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public landing page */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/security" element={<Security />} />
      
      {/* Protected Business Admin Panel Routes */}
      <Route path="/" element={<RequireAuth><DashboardLayout /></RequireAuth>}>
        <Route path="dashboard"  element={<Dashboard />} />
        <Route path="inventory"  element={<Inventory />} />
        <Route path="pos"        element={<POS />} />
        <Route path="orders"     element={<Orders />} />
        <Route path="analytics"  element={<Analytics />} />
        <Route path="finance"    element={<Finance />} />
        <Route path="reports"    element={<Reports />} />
        <Route path="customers"  element={<Customers />} />
        <Route path="staff"      element={<Staff />} />
        <Route path="settings"   element={<Settings />} />
      </Route>

      {/* Protected Super Admin Panel Routes */}
      <Route path="/super-admin" element={<RequireAuth><SuperAdminLayout /></RequireAuth>}>
        <Route index element={<SuperAdminDashboard />} />
        <Route path="stores"        element={<SuperAdminStores />} />
        <Route path="subscriptions" element={<SuperAdminSubscriptions />} />
        <Route path="revenue"       element={<SuperAdminRevenue />} />
        {/* Users route skipped for brevity; redirecting to stores to prevent crash */}
        <Route path="users"         element={<Navigate to="/super-admin/stores" replace />} />
        <Route path="tickets"       element={<SuperAdminTickets />} />
        <Route path="logs"          element={<SuperAdminLogs />} />
        <Route path="config"        element={<SuperAdminConfig />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <BrowserRouter>
          <AuthObserver>
            <AppRoutes />
          </AuthObserver>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
