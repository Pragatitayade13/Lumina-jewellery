import { Routes, Route } from 'react-router-dom';
import DeliveryLayout from './DeliveryLayout';
import Dashboard from './pages/Dashboard';
import PickupTasks from './pages/PickupTasks';
import ActiveTransits from './pages/ActiveTransits';
import ReverseLogistics from './pages/ReverseLogistics';

export default function DeliveryApp() {
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
