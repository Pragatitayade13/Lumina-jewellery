import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Bell, Package, Tag, AlertCircle, Info, X } from 'lucide-react';
import './NotificationDropdown.css';

const getInitialNotifications = (userRole) => {
  if (userRole === 'customer') {
    return [
      { id: 1, title: 'Order Dispatched', desc: 'Your order #ORD-88120 is out for delivery.', time: '10 mins ago', icon: <Package size={16} />, unread: true },
      { id: 2, title: 'Price Drop Alert', desc: '22k Gold price dropped by ₹145/g today!', time: '2 hours ago', icon: <Tag size={16} />, unread: true },
      { id: 3, title: 'Scheme Maturity', desc: 'Your Golden Harvest scheme matures next week.', time: '1 day ago', icon: <Info size={16} />, unread: false }
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
    { id: 2, title: 'Low Stock Alert', desc: 'Polki Kundan Bridal Set is out of stock.', time: '30 mins ago', icon: <AlertCircle size={16} />, unread: true },
    { id: 3, title: 'New Support Ticket', desc: 'Neha Singh opened a return request.', time: '1 hour ago', icon: <Info size={16} />, unread: false }
  ];
};

export default function NotificationDropdown({ userRole }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(() => getInitialNotifications(userRole));
  const dropdownRef = useRef(null);

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

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, unread: false } : n));
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
                <button className="btn-mark-read" style={{ color: 'var(--status-red)' }} onClick={() => setNotifications([])}>Clear</button>
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
