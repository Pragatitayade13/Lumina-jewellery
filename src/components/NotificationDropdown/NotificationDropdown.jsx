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
  const [showAll, setShowAll] = useState(false);
  const [notifications, setNotifications] = useState(() => getInitialNotifications(userRole));
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  return (
    <>
      <div className="notif-dropdown-container" ref={dropdownRef}>
        <button className="topbar-btn" title="Notifications" onClick={() => setIsOpen(!isOpen)}>
          {unreadCount > 0 && <span className="notif-dot">{unreadCount}</span>}
          <Bell size={18} />
        </button>

        {isOpen && (
          <div className="notif-dropdown-menu">
            <div className="notif-header">
              <h3>Notifications</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button className="btn-mark-read" onClick={markAllAsRead}>Mark all as read</button>
                <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><X size={16} /></button>
              </div>
            </div>
            <div className="notif-list">
              {notifications.map(notif => (
                <div 
                  key={notif.id} 
                  className={`notif-item ${notif.unread ? 'unread' : ''}`}
                  onClick={() => markAsRead(notif.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="notif-icon">{notif.icon}</div>
                  <div className="notif-content">
                    <div className="notif-title">{notif.title}</div>
                    <div className="notif-desc">{notif.desc}</div>
                    <div className="notif-time">{notif.time}</div>
                  </div>
                  {notif.unread && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)', alignSelf: 'center', marginLeft: 'auto' }} />}
                </div>
              ))}
            </div>
            <div className="notif-footer">
              <button className="btn-view-all" onClick={() => { setIsOpen(false); setShowAll(true); }}>
                View All Notifications
              </button>
            </div>
          </div>
        )}
      </div>

      {showAll && (
        <div className="modal-overlay" onClick={() => setShowAll(false)} style={{ zIndex: 9999, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-box modal-box-lg" onClick={e => e.stopPropagation()} style={{ background: '#0a0a0a', border: '1px solid var(--gold, #c9a84c)', borderRadius: '12px', width: '100%', maxWidth: '800px', padding: '2rem' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
              <h3 className="modal-title" style={{ color: 'var(--gold, #c9a84c)', fontSize: '1.5rem', margin: 0 }}>All Notifications</h3>
              <button className="modal-close" onClick={() => setShowAll(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted, #888)', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>
            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
                <button className="btn btn-outline" style={{ borderColor: 'var(--gold, #c9a84c)', color: 'var(--gold, #c9a84c)', background: 'transparent', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }} onClick={markAllAsRead}>Mark all as read</button>
              </div>
              <div className="notif-list-full" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {notifications.map(notif => (
                  <div 
                    key={notif.id} 
                    className={`notif-item-full ${notif.unread ? 'unread' : ''}`} 
                    onClick={() => markAsRead(notif.id)}
                    style={{ 
                      display: 'flex', gap: '1.5rem', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
                      cursor: 'pointer', background: notif.unread ? 'rgba(201,168,76,0.08)' : '#111',
                      transition: 'background 0.2s, border-color 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--gold, #c9a84c)'}
                    onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                  >
                    <div className="notif-icon" style={{ width: '48px', height: '48px', flexShrink: 0, background: 'rgba(201,168,76,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold, #c9a84c)' }}>
                      {notif.icon}
                    </div>
                    <div className="notif-content" style={{ flex: 1 }}>
                      <div style={{ fontWeight: notif.unread ? '600' : '500', fontSize: '1.1rem', color: '#fff', marginBottom: '0.4rem' }}>{notif.title}</div>
                      <div style={{ color: '#aaa', fontSize: '0.95rem', lineHeight: '1.5' }}>{notif.desc}</div>
                      <div style={{ fontSize: '0.8rem', color: '#777', marginTop: '0.8rem' }}>{notif.time}</div>
                    </div>
                    {notif.unread && <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--gold, #c9a84c)', alignSelf: 'center' }} />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
