import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import AdminLayout from './AdminLayout';
import './admin.css';

// Lazy loading all admin pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const StaffManagement = lazy(() => import('./pages/UserManagement'));
const ProductManagement = lazy(() => import('./pages/ProductManagement'));
const OrderManagement = lazy(() => import('./pages/OrderManagement'));
const CustomerManagement = lazy(() => import('./pages/CustomerManagement'));
const InventoryManagement = lazy(() => import('./pages/InventoryManagement'));
const PaymentManagement = lazy(() => import('./pages/PaymentManagement'));
const Analytics = lazy(() => import('./pages/Analytics'));
const ContentManagement = lazy(() => import('./pages/ContentManagement'));
const LandingPageCMS = lazy(() => import('./pages/LandingPageCMS'));
const SocialMediaSettings = lazy(() => import('./pages/SocialMediaSettings'));
const SecuritySettings = lazy(() => import('./pages/SecuritySettings'));
const SystemSettings = lazy(() => import('./pages/SystemSettings'));
const CommunicationManagement = lazy(() => import('./pages/CommunicationManagement'));
const StoreAppointments = lazy(() => import('./pages/StoreAppointments'));
const SchemesAndBuybacks = lazy(() => import('./pages/SchemesAndBuybacks'));
const SupportManagement = lazy(() => import('./pages/SupportManagement'));
const TaxManagement = lazy(() => import('./pages/TaxManagement'));
const GoldRateDashboard = lazy(() => import('./pages/GoldRateDashboard'));
const DeliveryOperations = lazy(() => import('./pages/DeliveryOperations'));
const StaffProfile = lazy(() => import('./pages/StaffProfile'));
const VendorManagement = lazy(() => import('./pages/VendorManagement'));
const InvoiceBilling = lazy(() => import('./pages/InvoiceBilling'));
const FinanceDashboard = lazy(() => import('./pages/FinanceDashboard'));
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
  const { user } = useApp();
  const role = user?.role || 'superadmin';

  return (
    <div className="admin-root">
      <AdminLayout>
        <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading module...</div>}>
          <Routes>
            <Route index element={role === 'delivery' ? <Navigate to="/admin/delivery" replace /> : <Dashboard />} />
            
            {/* Superadmin, Admin & Manager routes */}
            <Route path="users" element={<ProtectedRoute allowedRoles={['superadmin', 'manager', 'admin']}><StaffManagement /></ProtectedRoute>} />
            
            {/* Logistics routes */}
            <Route path="delivery" element={<ProtectedRoute allowedRoles={['superadmin', 'delivery']}><DeliveryOperations /></ProtectedRoute>} />
            
            {/* Profile route for all roles */}
            <Route path="profile" element={<ProtectedRoute allowedRoles={['superadmin', 'admin', 'staff', 'manager', 'finance', 'delivery']}><StaffProfile /></ProtectedRoute>} />

            {/* Superadmin only routes */}
            <Route path="settings" element={<ProtectedRoute allowedRoles={['superadmin']}><SystemSettings /></ProtectedRoute>} />
            <Route path="landing-cms" element={<ProtectedRoute allowedRoles={['superadmin']}><LandingPageCMS /></ProtectedRoute>} />
            <Route path="social-media" element={<ProtectedRoute allowedRoles={['superadmin']}><SocialMediaSettings /></ProtectedRoute>} />
            
            {/* Shared routes (including staff and manager where applicable) */}
            <Route path="products" element={<ProtectedRoute allowedRoles={['superadmin', 'admin', 'staff', 'manager']}><ProductManagement /></ProtectedRoute>} />
            <Route path="orders" element={<ProtectedRoute allowedRoles={['superadmin', 'admin', 'staff', 'manager']}><OrderManagement /></ProtectedRoute>} />
            <Route path="inventory" element={<ProtectedRoute allowedRoles={['superadmin', 'admin', 'staff', 'manager']}><InventoryManagement /></ProtectedRoute>} />
            <Route path="support" element={<ProtectedRoute allowedRoles={['superadmin', 'admin', 'staff', 'manager']}><SupportManagement /></ProtectedRoute>} />
            
            {/* Admin & Manager only routes */}
            <Route path="customers" element={<ProtectedRoute allowedRoles={['superadmin', 'admin', 'manager', 'staff']}><CustomerManagement /></ProtectedRoute>} />
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
        </Suspense>
      </AdminLayout>
    </div>
  );
}
