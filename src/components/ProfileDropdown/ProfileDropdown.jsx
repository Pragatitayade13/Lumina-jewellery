import { useState, useRef, useEffect } from 'react';
import { User, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../NotificationDropdown/NotificationDropdown.css'; // Reusing dropdown styles

export default function ProfileDropdown({ userRole, userName, onLogout, isSuperAdmin }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const handleAction = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  return (
    <div className="notif-dropdown-container" ref={dropdownRef}>
      <div 
        className="admin-avatar" 
        style={{ cursor: 'pointer', width: 34, height: 34, marginLeft: '0.5rem' }}
        onClick={() => setIsOpen(!isOpen)}
        title={userName}
      >
        {userName ? userName.substring(0, 2).toUpperCase() : userRole.substring(0, 2).toUpperCase()}
      </div>

      {isOpen && (
        <div className="notif-dropdown-menu" style={{ width: '220px' }}>
          <div className="notif-header" style={{ padding: '1rem', borderBottom: '1px solid var(--admin-border)' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>{userName}</h3>
            <div style={{ fontSize: '0.75rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{userRole}</div>
          </div>
          <div className="notif-list" style={{ padding: '0.5rem' }}>
            <div className="notif-item" style={{ cursor: 'pointer', padding: '0.75rem', borderRadius: '6px' }} onClick={() => handleAction('/admin/settings')}>
              <User size={16} color="var(--text-secondary)" style={{ marginRight: '0.75rem' }} />
              <div style={{ fontSize: '0.85rem' }}>My Profile</div>
            </div>
            {isSuperAdmin && (
              <div className="notif-item" style={{ cursor: 'pointer', padding: '0.75rem', borderRadius: '6px' }} onClick={() => handleAction('/admin/settings')}>
                <Settings size={16} color="var(--text-secondary)" style={{ marginRight: '0.75rem' }} />
                <div style={{ fontSize: '0.85rem' }}>Account Settings</div>
              </div>
            )}
            <div className="notif-item" style={{ cursor: 'pointer', padding: '0.75rem', borderRadius: '6px', color: 'var(--status-red)' }} onClick={onLogout}>
              <LogOut size={16} color="var(--status-red)" style={{ marginRight: '0.75rem' }} />
              <div style={{ fontSize: '0.85rem' }}>Sign Out</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
