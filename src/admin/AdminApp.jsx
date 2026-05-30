import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import AdminLayout from './AdminLayout';
import AdminBackground from './components/AdminBackground';
import Dashboard from './pages/Dashboard';
import StaffManagement from './pages/UserManagement';
import ProductManagement from './pages/ProductManagement';
import OrderManagement from './pages/OrderManagement';
import CustomerManagement from './pages/CustomerManagement';
import InventoryManagement from './pages/InventoryManagement';
import PaymentManagement from './pages/PaymentManagement';
import Analytics from './pages/Analytics';
import ContentManagement from './pages/ContentManagement';
import SecuritySettings from './pages/SecuritySettings';
import SystemSettings from './pages/SystemSettings';
import CommunicationManagement from './pages/CommunicationManagement';
import StoreAppointments from './pages/StoreAppointments';
import SchemesAndBuybacks from './pages/SchemesAndBuybacks';
import SupportManagement from './pages/SupportManagement';
import TaxManagement from './pages/TaxManagement';
import GoldRateDashboard from './pages/GoldRateDashboard';
import DeliveryOperations from './pages/DeliveryOperations';
import StaffProfile from './pages/StaffProfile';
import VendorManagement from './pages/VendorManagement';
import InvoiceBilling from './pages/InvoiceBilling';
import FinanceDashboard from './pages/FinanceDashboard';
import './admin.css';

// A simple protective wrapper for roles
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useApp();
  // Allow superadmin fallback for dev purposes if no user is set
  const role = user?.role || 'superadmin';
  
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/admin" replace />;
  }
  return children;
};

export default function AdminApp() {
  const { user, theme } = useApp();
  const role = user?.role || 'superadmin';
  const lenisRef = useRef(null);

  useEffect(() => {
    // Initialize Lenis for the admin dashboard
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      smoothTouch: false,
      touchMultiplier: 2,
    });
    lenisRef.current = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div className={`admin-root ${theme === 'dark' ? 'dark' : ''}`} data-theme={theme} style={{ position: 'relative', minHeight: '100vh', zIndex: 1 }}>
      <AdminBackground />
      <div style={{ position: 'relative', zIndex: 10 }}>
        <AdminLayout>
        <Routes>
          <Route index element={role === 'delivery' ? <Navigate to="/admin/delivery" replace /> : <Dashboard />} />
          
          {/* Superadmin & Manager only routes */}
          <Route path="users" element={<ProtectedRoute allowedRoles={['superadmin', 'manager']}><StaffManagement /></ProtectedRoute>} />
          
          {/* Logistics routes */}
          <Route path="delivery" element={<ProtectedRoute allowedRoles={['superadmin', 'delivery']}><DeliveryOperations /></ProtectedRoute>} />
          
          {/* Profile route for all roles */}
          <Route path="profile" element={<ProtectedRoute allowedRoles={['superadmin', 'admin', 'staff', 'manager', 'finance', 'delivery']}><StaffProfile /></ProtectedRoute>} />

          {/* Superadmin only routes */}
          <Route path="settings" element={<ProtectedRoute allowedRoles={['superadmin']}><SystemSettings /></ProtectedRoute>} />
          
          {/* Shared routes (including staff and manager where applicable) */}
          <Route path="products" element={<ProtectedRoute allowedRoles={['superadmin', 'admin', 'staff', 'manager']}><ProductManagement /></ProtectedRoute>} />
          <Route path="orders" element={<ProtectedRoute allowedRoles={['superadmin', 'admin', 'staff', 'manager']}><OrderManagement /></ProtectedRoute>} />
          <Route path="inventory" element={<ProtectedRoute allowedRoles={['superadmin', 'admin', 'staff', 'manager']}><InventoryManagement /></ProtectedRoute>} />
          <Route path="support" element={<ProtectedRoute allowedRoles={['superadmin', 'admin', 'staff', 'manager']}><SupportManagement /></ProtectedRoute>} />
          
          {/* Admin & Manager only routes */}
          <Route path="customers" element={<ProtectedRoute allowedRoles={['superadmin', 'admin', 'manager']}><CustomerManagement /></ProtectedRoute>} />
          <Route path="communications" element={<ProtectedRoute allowedRoles={['superadmin', 'admin', 'manager']}><CommunicationManagement /></ProtectedRoute>} />
          <Route path="appointments" element={<ProtectedRoute allowedRoles={['superadmin', 'admin', 'manager']}><StoreAppointments /></ProtectedRoute>} />
          <Route path="schemes" element={<ProtectedRoute allowedRoles={['superadmin', 'admin', 'manager', 'finance']}><SchemesAndBuybacks /></ProtectedRoute>} />
          <Route path="content" element={<ProtectedRoute allowedRoles={['superadmin', 'admin']}><ContentManagement /></ProtectedRoute>} />
          <Route path="security" element={<ProtectedRoute allowedRoles={['superadmin', 'admin']}><SecuritySettings /></ProtectedRoute>} />
          
          {/* Finance & Manager routes */}
          <Route path="payments" element={<ProtectedRoute allowedRoles={['superadmin', 'admin', 'finance', 'manager']}><PaymentManagement /></ProtectedRoute>} />
          <Route path="tax" element={<ProtectedRoute allowedRoles={['superadmin', 'finance']}><TaxManagement /></ProtectedRoute>} />
          <Route path="gold-rates" element={<ProtectedRoute allowedRoles={['superadmin', 'finance', 'manager']}><GoldRateDashboard /></ProtectedRoute>} />
          <Route path="analytics" element={<ProtectedRoute allowedRoles={['superadmin', 'admin', 'finance', 'manager', 'staff']}><Analytics /></ProtectedRoute>} />
          <Route path="vendors" element={<ProtectedRoute allowedRoles={['superadmin', 'admin', 'finance', 'manager']}><VendorManagement /></ProtectedRoute>} />
          <Route path="invoices" element={<ProtectedRoute allowedRoles={['superadmin', 'admin', 'finance', 'manager']}><InvoiceBilling /></ProtectedRoute>} />
          <Route path="finance" element={<ProtectedRoute allowedRoles={['superadmin', 'admin', 'finance', 'manager']}><FinanceDashboard /></ProtectedRoute>} />
          
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </AdminLayout>
      </div>
    </div>
  );
}
