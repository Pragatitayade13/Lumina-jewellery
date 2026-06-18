import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Bell, Package, Tag, AlertCircle, Info, X, Calendar, HelpCircle, Star } from 'lucide-react';
import { useInventory } from '../../hooks/useInventory';
import { useOrders } from '../../hooks/useOrders';
import { useLogistics } from '../../hooks/useLogistics';
import { useAppointments } from '../../hooks/useAppointments';
import { useSchemes } from '../../hooks/useSchemes';
import { useCustomerSupport } from '../../hooks/useCustomerSupport';
import './NotificationDropdown.css';
import { useApp } from '../../context/AppContext';

const getInitialNotifications = (userRole) => {
  if (userRole === 'customer') {
    return [
      { id: 'static-1', title: 'Price Drop Alert', desc: '22k Gold price dropped by ₹145/g today!', time: '2 hours ago', icon: <Tag size={16} />, unread: true },
      { id: 'static-2', title: 'Scheme Maturity', desc: 'Your Golden Harvest scheme matures next week.', time: '1 day ago', icon: <Info size={16} />, unread: false }
    ];
  }
  if (userRole === 'delivery') {
    return [
      { id: 1, title: 'New Route Assigned', desc: 'You have 3 new deliveries in Bandra West.', time: 'Just now', icon: <Package size={16} />, unread: true },
      { id: 2, title: 'High Value Alert', desc: 'Pickup #RET-4402 requires OTP and Photo Proof.', time: '1 hour ago', icon: <AlertCircle size={16} />, unread: true }
    ];
  }
  if (userRole === 'finance') {
    return [
      { id: 1, title: 'Suspicious Transaction', desc: 'High risk alert on TXN-999823.', time: '5 mins ago', icon: <AlertCircle size={16} />, unread: true },
      { id: 2, title: 'Vendor Payout Due', desc: 'Aura Diamonds payout of ₹1.2L is pending.', time: '3 hours ago', icon: <Info size={16} />, unread: true }
    ];
  }
  // Default Admin/Manager/Staff
  return [
    { id: 1, title: 'New Order Received', desc: 'Order #ORD-88125 needs packing.', time: '2 mins ago', icon: <Package size={16} />, unread: true },
    { id: 3, title: 'New Support Ticket', desc: 'Neha Singh opened a return request.', time: '1 hour ago', icon: <Info size={16} />, unread: false }
  ];
};

export default function NotificationDropdown({ userRole }) {
  const [isOpen, setIsOpen] = useState(false);
  const [staticNotifs, setStaticNotifs] = useState(() => getInitialNotifications(userRole));
  const [dynamicNotifs, setDynamicNotifs] = useState([]);
  const dropdownRef = useRef(null);
  const { user, currentStore } = useApp();
  const activeStoreId = currentStore || (user?.role === 'superadmin' ? 'GLOBAL' : null);
  const { inventory } = useInventory(activeStoreId);
  const { orders } = useOrders(activeStoreId);
  const { shipments } = useLogistics(null, activeStoreId);
  
  // Real-time hooks for customer activities
  const isCustomer = userRole === 'customer' && user;
  const { userSchemes } = useSchemes(isCustomer ? user.uid : null, activeStoreId);
  const { appointments } = useAppointments(isCustomer ? user.uid : null, activeStoreId);
  const { tickets } = useCustomerSupport(isCustomer ? user.uid : null, activeStoreId);

  useEffect(() => {
    let newAlerts = [];

    // 1. Inventory Alerts (Admin/Manager)
    if (inventory && (!userRole || ['superadmin', 'manager', 'staff'].includes(userRole))) {
      const lowStockItems = inventory.filter(item => item.stock <= item.minStock);
      newAlerts.push(...lowStockItems.map((item) => ({
        id: `inv-${item.id}`,
        title: item.stock === 0 ? 'Out of Stock Alert' : 'Low Stock Alert',
        desc: `${item.name} (${item.sku}) has only ${item.stock} left.`,
        time: 'Live',
        icon: <AlertCircle size={16} />,
        unread: true,
      })));
    }

    // 2. Customer Notifications (Orders, Schemes, Appointments, Tickets)
    if (userRole === 'customer') {
      // (a) Order Updates
      if (orders && orders.length > 0) {
        const recentOrders = orders.filter(o => o.status !== 'delivered').slice(0, 3);
        newAlerts.push(...recentOrders.map(o => ({
          id: `order-${o.id}`,
          title: `Order Update`,
          desc: `Your order #${o.id.slice(0, 8)} is currently ${o.status || 'processing'}.`,
          time: o.updatedAt ? new Date(o.updatedAt.seconds * 1000).toLocaleString() : 'Recent',
          icon: <Package size={16} />,
          unread: true
        })));
      }

      // (b) Scheme Updates
      if (userSchemes && userSchemes.length > 0) {
        userSchemes.forEach(s => {
          if (s.status === 'matured') {
            newAlerts.push({
              id: `scheme-${s.id}`,
              title: `Scheme Mature Alert`,
              desc: `Your savings scheme "${s.planName}" has matured! Redeem your zero making charges benefits.`,
              time: 'Matured',
              icon: <Star size={16} color="var(--gold)" />,
              unread: true
            });
          } else if (s.status === 'active') {
            newAlerts.push({
              id: `scheme-${s.id}`,
              title: `Scheme Installment`,
              desc: `Installment for scheme "${s.planName}" (${s.monthsPaid}/${s.durationMonths} months paid) is active.`,
              time: 'Monthly Savings Plan',
              icon: <Star size={16} />,
              unread: false
            });
          }
        });
      }

      // (c) Appointment Updates
      if (appointments && appointments.length > 0) {
        const activeAppointments = appointments.filter(a => a.status === 'confirmed' || a.status === 'pending' || a.status === 'cancelled').slice(0, 3);
        newAlerts.push(...activeAppointments.map(a => ({
          id: `apt-${a.id}`,
          title: `Appointment ${a.status.charAt(0).toUpperCase() + a.status.slice(1)}`,
          desc: `Your appointment for "${a.type}" is ${a.status}.`,
          time: `${a.date} at ${a.time}`,
          icon: <Calendar size={16} />,
          unread: a.status === 'confirmed' || a.status === 'cancelled'
        })));
      }

      // (d) Support Ticket Updates
      if (tickets && tickets.length > 0) {
        const recentTickets = tickets.filter(t => t.status === 'in_progress' || t.status === 'resolved').slice(0, 3);
        newAlerts.push(...recentTickets.map(t => ({
          id: `ticket-${t.id}`,
          title: `Support Ticket Update`,
          desc: `Ticket #${t.id.slice(0, 6)} is now ${t.status === 'in_progress' ? 'In Progress' : 'Resolved'}.`,
          time: 'Support Hub',
          icon: <HelpCircle size={16} />,
          unread: true
        })));
      }
    }

    // 3. Delivery Notifications (Shipments)
    if (userRole === 'delivery' && shipments) {
      const activeShipments = shipments.filter(s => s.status !== 'DELIVERED' && s.status !== 'RETURNED');
      newAlerts.push({
        id: `del-summary`,
        title: 'Active Deliveries',
        desc: `You have ${activeShipments.length} active shipments to process.`,
        time: 'Live',
        icon: <Package size={16} />,
        unread: true
      });
    }

    setDynamicNotifs(newAlerts);
  }, [inventory, orders, shipments, userSchemes, appointments, tickets, userRole]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    };
  }, [isOpen]);

  const notifications = [...dynamicNotifs, ...staticNotifs];
  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllAsRead = () => {
    setStaticNotifs(staticNotifs.map(n => ({ ...n, unread: false })));
    setDynamicNotifs(dynamicNotifs.map(n => ({ ...n, unread: false })));
  };

  const markAsRead = (id) => {
    setStaticNotifs(staticNotifs.map(n => n.id === id ? { ...n, unread: false } : n));
    setDynamicNotifs(dynamicNotifs.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  const clearAll = () => {
    setStaticNotifs([]);
    setDynamicNotifs([]);
  };

  return (
    <div className="notif-dropdown-container" ref={dropdownRef}>
      <button className="topbar-btn" title="Notifications" onClick={() => setIsOpen(!isOpen)}>
        {unreadCount > 0 && <span className="notif-dot">{unreadCount}</span>}
        <Bell size={18} />
      </button>

      {isOpen && createPortal(
        <div className="modal-overlay" style={{ zIndex: 999999 }}>
          <div className="modal-content" style={{ maxWidth: '600px', width: '90%', padding: 0, overflow: 'hidden' }}>
            <div className="notif-header">
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Notifications</h3>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <button className="btn-mark-read" onClick={markAllAsRead}>Mark all read</button>
                <button className="btn-mark-read" style={{ color: 'var(--status-red)' }} onClick={clearAll}>Clear</button>
                <button 
                  onClick={() => setIsOpen(false)} 
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="notif-list">
              {notifications.length === 0 ? (
                <div style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Bell size={40} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                  <div>You&apos;re all caught up!</div>
                </div>
              ) : (
                notifications.map(notif => (
                  <div 
                    key={notif.id} 
                    className={`notif-item ${notif.unread ? 'unread' : ''}`}
                    onClick={() => markAsRead(notif.id)}
                  >
                    <div className="notif-icon">
                      {notif.icon}
                    </div>
                    <div className="notif-content">
                      <div className="notif-title">{notif.title}</div>
                      <div className="notif-desc">{notif.desc}</div>
                      <div className="notif-time">{notif.time}</div>
                    </div>
                    {notif.unread && (
                      <div style={{ 
                        width: 8, height: 8, borderRadius: '50%', 
                        background: 'linear-gradient(135deg, #ff4757, #ff6b81)', 
                        position: 'absolute', top: '1.8rem', right: '1.8rem',
                        boxShadow: '0 0 6px rgba(255,71,87,0.5)' 
                      }} />
                    )}
                  </div>
                ))
              )}
            </div>
            <div className="notif-footer">
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
