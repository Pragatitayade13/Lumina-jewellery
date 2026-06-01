import { useState, useRef, useEffect } from 'react';
import { Bell, Package, Tag, AlertCircle, Info, X } from 'lucide-react';
import './NotificationDropdown.css';

const getInitialNotifications = (userRole) => {
  if (userRole === 'customer') {
    return [
      { id: 1, title: 'Order Dispatched', desc: 'Your order #ORD-88120 is out for delivery.', time: '10 mins ago', icon: <Package size={16} />, unread: true },
      { id: 2, title: 'Price Drop Alert', desc: '22k Gold price dropped by ₹45/g today!', time: '2 hours ago', icon: <Tag size={16} />, unread: true },
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
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
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
    <>
      <div className="notif-dropdown-container">
        <button className="topbar-btn" title="Notifications" onClick={() => setIsOpen(true)}>
          {unreadCount > 0 && <span className="notif-dot">{unreadCount}</span>}
          <Bell size={18} />
        </button>
      </div>

      {isOpen && (
        <div className="auth-modal-overlay" style={{ zIndex: 9999, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setIsOpen(false)}>
          <div className="auth-modal cart-modal-box" onClick={(e) => e.stopPropagation()} style={{ width: '650px', maxWidth: '100%', display: 'flex', flexDirection: 'column', maxHeight: '90vh', background: 'var(--bg-card)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, color: 'var(--text-primary)' }}>
                <Bell size={20} color="var(--gold)" /> Notifications
              </h2>
              <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem', gap: '1rem' }}>
              <button className="btn btn-outline" style={{ padding: '0.5rem 1rem', borderColor: 'var(--gold)', color: 'var(--gold)' }} onClick={markAllAsRead}>Mark all as read</button>
              <button className="btn btn-outline" style={{ padding: '0.5rem 1rem', borderColor: 'var(--status-red)', color: 'var(--status-red)' }} onClick={() => setNotifications([])}>Clear all</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
              {notifications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
                  <Bell size={56} style={{ opacity: 0.15, marginBottom: '1.5rem' }} />
                  <p style={{ fontSize: '1.1rem' }}>You're all caught up!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {notifications.map(notif => (
                    <div 
                      key={notif.id} 
                      onClick={() => markAsRead(notif.id)}
                      style={{ 
                        display: 'flex', gap: '1.25rem', padding: '1.25rem', 
                        background: notif.unread ? 'var(--surface)' : 'var(--bg-card)',
                        border: '1px solid',
                        borderColor: notif.unread ? 'var(--border-bright)' : 'var(--border)',
                        borderRadius: '10px', cursor: 'pointer', position: 'relative',
                        borderLeft: notif.unread ? '3px solid var(--gold)' : '1px solid var(--border)',
                        transition: 'transform 0.2s ease, border-color 0.2s ease'
                      }}
                      onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <div style={{ width: '48px', height: '48px', flexShrink: 0, borderRadius: '8px', background: 'rgba(201,168,76,0.1)', color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {notif.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '0.4rem' }}>{notif.title}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.4', marginBottom: '0.6rem' }}>{notif.desc}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{notif.time}</div>
                      </div>
                      {notif.unread && <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'linear-gradient(135deg, #ff4757, #ff6b81)', position: 'absolute', top: '1.25rem', right: '1.25rem', boxShadow: '0 0 8px rgba(255,71,87,0.5)' }} />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
