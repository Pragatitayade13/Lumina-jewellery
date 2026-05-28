import { useState, useRef, useEffect } from 'react';
import { Zap, Plus, FileText, UserPlus, PackagePlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../NotificationDropdown/NotificationDropdown.css'; // Reusing dropdown styles

export default function QuickActionsDropdown({ userRole }) {
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

  const hasAccess = (roles) => roles.includes(userRole);

  return (
    <div className="notif-dropdown-container" ref={dropdownRef}>
      <div className="topbar-btn" title="Quick Actions" onClick={() => setIsOpen(!isOpen)}>
        <Zap size={18} />
      </div>

      {isOpen && (
        <div className="notif-dropdown-menu" style={{ width: '220px' }}>
          <div className="notif-header" style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--admin-border)' }}>
            <h3 style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quick Actions</h3>
          </div>
          <div className="notif-list" style={{ padding: '0.5rem' }}>
            {hasAccess(['superadmin', 'admin', 'manager', 'staff']) && (
              <div className="notif-item" style={{ cursor: 'pointer', padding: '0.75rem', borderRadius: '6px' }} onClick={() => handleAction('/admin/products')}>
                <PackagePlus size={16} color="var(--gold)" style={{ marginRight: '0.75rem' }} />
                <div style={{ fontSize: '0.85rem' }}>Add Product</div>
              </div>
            )}
            {hasAccess(['superadmin', 'admin', 'manager', 'finance']) && (
              <div className="notif-item" style={{ cursor: 'pointer', padding: '0.75rem', borderRadius: '6px' }} onClick={() => handleAction('/admin/orders')}>
                <Plus size={16} color="var(--gold)" style={{ marginRight: '0.75rem' }} />
                <div style={{ fontSize: '0.85rem' }}>Create Order</div>
              </div>
            )}
            {hasAccess(['superadmin', 'manager']) && (
              <div className="notif-item" style={{ cursor: 'pointer', padding: '0.75rem', borderRadius: '6px' }} onClick={() => handleAction('/admin/users')}>
                <UserPlus size={16} color="var(--gold)" style={{ marginRight: '0.75rem' }} />
                <div style={{ fontSize: '0.85rem' }}>Add Staff</div>
              </div>
            )}
            {hasAccess(['superadmin', 'finance']) && (
              <div className="notif-item" style={{ cursor: 'pointer', padding: '0.75rem', borderRadius: '6px' }} onClick={() => handleAction('/admin/analytics')}>
                <FileText size={16} color="var(--gold)" style={{ marginRight: '0.75rem' }} />
                <div style={{ fontSize: '0.85rem' }}>Generate Report</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
