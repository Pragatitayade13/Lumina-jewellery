import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import DeliveryLayout from './DeliveryLayout';
import Dashboard from './pages/Dashboard';
import PickupTasks from './pages/PickupTasks';
import ActiveTransits from './pages/ActiveTransits';
import ReverseLogistics from './pages/ReverseLogistics';

export default function DeliveryApp() {
  const { user, authLoading } = useApp();
  
  if (authLoading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Checking authentication...</div>;
  }

  // Only allow delivery partners or admins/superadmins to view the delivery portal
  const allowedRoles = ['delivery', 'superadmin', 'admin'];
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return (
    <Routes>
      <Route path="/" element={<DeliveryLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="pickups" element={<PickupTasks />} />
        <Route path="transit" element={<ActiveTransits />} />
        <Route path="returns" element={<ReverseLogistics />} />
      </Route>
    </Routes>
  );
}
