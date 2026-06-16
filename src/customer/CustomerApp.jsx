import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import CustomerLayout from './CustomerLayout';
import Dashboard from './pages/Dashboard';
import OrderHistory from './pages/OrderHistory';
import Profile from './pages/Profile';
import CustomerSupport from './pages/CustomerSupport';
import WishlistPage from './pages/WishlistPage';
import SchemesEnrollment from './pages/SchemesEnrollment';
import StoreAppointments from './pages/StoreAppointments';
import BridalPlanner from './pages/BridalPlanner';
import BuybackCalculator from './pages/BuybackCalculator';
import OrderTracking from './pages/OrderTracking';
import './customer.css';

const ProtectedCustomerRoute = ({ children }) => {
  const { user } = useApp();
  // In a real app we'd check if user.role === 'customer'
  // But for this demo, as long as they are logged in, we let them view it
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default function CustomerApp() {
  return (
    <div className="customer-root">
      <CustomerLayout>
        <Routes>
          <Route index element={<ProtectedCustomerRoute><Dashboard /></ProtectedCustomerRoute>} />
          <Route path="orders" element={<ProtectedCustomerRoute><OrderHistory /></ProtectedCustomerRoute>} />
          <Route path="profile" element={<ProtectedCustomerRoute><Profile /></ProtectedCustomerRoute>} />
          <Route path="support" element={<ProtectedCustomerRoute><CustomerSupport /></ProtectedCustomerRoute>} />
          <Route path="wishlist" element={<ProtectedCustomerRoute><WishlistPage /></ProtectedCustomerRoute>} />
          <Route path="schemes" element={<ProtectedCustomerRoute><SchemesEnrollment /></ProtectedCustomerRoute>} />
          <Route path="appointments" element={<ProtectedCustomerRoute><StoreAppointments /></ProtectedCustomerRoute>} />
          <Route path="planner" element={<ProtectedCustomerRoute><BridalPlanner /></ProtectedCustomerRoute>} />
          <Route path="buyback" element={<ProtectedCustomerRoute><BuybackCalculator /></ProtectedCustomerRoute>} />
          <Route path="track/:orderId" element={<ProtectedCustomerRoute><OrderTracking /></ProtectedCustomerRoute>} />
          <Route path="*" element={<Navigate to="/account" replace />} />
        </Routes>
      </CustomerLayout>
    </div>
  );
}
