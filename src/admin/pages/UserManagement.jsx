// src/admin/pages/UserManagement.jsx
import { useState, useEffect } from 'react';
import { adminUsers } from '../data/mockData';
import { Info, Edit, Eye, Ban, Check, Search } from 'lucide-react';

export default function UserManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState(() => {
    try {
      const saved = localStorage.getItem('jw_admin_users');
      if (saved) return JSON.parse(saved);
      return adminUsers;
    } catch {
      return adminUsers;
    }
  });

  useEffect(() => {
    localStorage.setItem('jw_admin_users', JSON.stringify(users));
  }, [users]);

  // Form state for new user
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'staff', department: 'Sales' });

  // States for Edit and View modals
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);

  const handleToggleBlock = (userId) => {
    setUsers(users.map(u => {
      if (u.id === userId) {
        const newStatus = u.status === 'blocked' ? 'active' : 'blocked';
        return { ...u, status: newStatus };
      }
      return u;
    }));
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
    setEditingUser(null);
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddUser = (e) => {
    e.preventDefault();
    const newUserEntry = {
      id: `usr-${Date.now()}`,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      department: newUser.department,
      status: 'active',
      avatar: newUser.name.substring(0, 2).toUpperCase(),
      avatarColor: '#16a085',
      lastLogin: 'Never',
      joinDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    };
    setUsers([newUserEntry, ...users]);
    setIsAddUserModalOpen(false);
    setNewUser({ name: '', email: '', role: 'staff', department: 'Sales' });
  };

  const handleDownloadReport = () => {
    const csvHeader = "Staff Member,Role,Present Days,Absents,Leave Status\n";
    const csvContent = adminUsers.map(u => {
      const present = Math.floor(Math.random() * 5) + 20;
      const absent = Math.floor(Math.random() * 3);
      return `"${u.name}","${u.role}","${present}","${absent}","None"`;
    }).join("\n");
    
    const blob = new Blob([csvHeader + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "Live_Attendance_Report_2026.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage administrative accounts, roles, and staff permissions</p>
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button className="btn btn-outline" onClick={() => setIsModalOpen(true)}>Attendance Report</button>
          <button className="btn btn-gold" style={{ background: 'var(--gold)', color: '#000', fontWeight: 'bold', padding: '0.5rem 1rem', borderRadius: '4px' }} onClick={() => setIsAddUserModalOpen(true)}>+ Add New Staff</button>
        </div>
      </div>

      <div className="stat-grid mb-15">
        <div className="stat-card">
          <div className="stat-label">Total Staff Users</div>
          <div className="stat-value">{users.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Managers</div>
          <div className="stat-value">{users.filter(u => u.role === 'manager' && u.status === 'active').length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Blocked Accounts</div>
          <div className="stat-value" style={{ color: 'var(--status-red)' }}>{users.filter(u => u.status === 'blocked').length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Super Admins</div>
          <div className="stat-value" style={{ color: 'var(--gold)' }}>{users.filter(u => u.role === 'superadmin').length}</div>
        </div>
      </div>

      <div className="admin-card">
        <div className="card-header">
          <div className="card-title">Admin Accounts Directory</div>
          <div className="filter-search" style={{ margin: 0, width: '250px' }}>
            <Search size={14} />
            <input 
              placeholder="Search users by name, role..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User Details</th>
                <th>Role & Access</th>
                <th>Department</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No users found matching "{searchTerm}"</td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar" style={{ background: `linear-gradient(135deg, ${user.avatarColor}, #2c3e50)`, color: 'white' }}>{user.avatar}</div>
                        <div>
                          <div className="user-name">{user.name}</div>
                          <div className="user-email">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${user.role}`}>{user.role.toUpperCase()}</span>
                    </td>
                    <td>{user.department}</td>
                    <td>
                      <span className={`badge badge-${user.status === 'active' ? 'active' : user.status === 'blocked' ? 'blocked' : 'pending'}`}>
                        {user.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user.lastLogin}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Joined {user.joinDate}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className="btn btn-icon btn-outline" title="Edit Permissions" onClick={() => setEditingUser(user)}>
                          <Edit size={14} />
                        </button>
                        <button className="btn btn-icon btn-outline" title="View Activity" onClick={() => setViewingUser(user)}>
                          <Eye size={14} />
                        </button>
                        {user.role !== 'superadmin' && (
                          <button 
                            className="btn btn-icon btn-danger" 
                            title={user.status === 'blocked' ? 'Unblock' : 'Suspend Account'}
                            onClick={() => handleToggleBlock(user.id)}
                          >
                            {user.status === 'blocked' ? <Check size={14} /> : <Ban size={14} />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-box modal-box-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Live Staff Attendance Overview</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="alert-banner alert-info">
                <Info size={18} />
                <span>Showing live attendance records for current month (May 2026).</span>
              </div>
              <div className="admin-table-wrap" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                 <table className="admin-table">
                  <thead><tr><th>Staff Member</th><th>Role</th><th>Present Days</th><th>Absents</th><th>Leave Status</th></tr></thead>
                  <tbody>
                    {adminUsers.filter(u => u.role !== 'superadmin').map(u => (
                      <tr key={`att-${u.id}`}>
                        <td><strong>{u.name}</strong></td>
                        <td>{u.role}</td>
                        <td style={{ color: 'var(--status-green)' }}>{Math.floor(Math.random() * 5) + 20} days</td>
                        <td style={{ color: 'var(--status-red)' }}>{Math.floor(Math.random() * 3)} days</td>
                        <td>None</td>
                      </tr>
                    ))}
                  </tbody>
                 </table>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Close</button>
              <button className="btn btn-gold" onClick={handleDownloadReport}>Download Full Report</button>
            </div>
          </div>
        </div>
      )}

      {isAddUserModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddUserModalOpen(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Add New Staff Member</h2>
              <button className="modal-close" onClick={() => setIsAddUserModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleAddUser}>
              <div className="modal-body">
                <div className="form-group mb-1">
                  <label className="form-label">Full Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    required 
                    placeholder="Enter staff name"
                    value={newUser.name}
                    onChange={e => setNewUser({...newUser, name: e.target.value})}
                  />
                </div>
                <div className="form-group mb-1">
                  <label className="form-label">Email Address</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    required 
                    placeholder="Enter staff email"
                    value={newUser.email}
                    onChange={e => setNewUser({...newUser, email: e.target.value})}
                  />
                </div>
                <div className="form-row mb-1">
                  <div className="form-group">
                    <label className="form-label">Role</label>
                    <select 
                      className="form-input"
                      value={newUser.role}
                      onChange={e => setNewUser({...newUser, role: e.target.value})}
                    >
                      <option value="staff">Staff</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                      <option value="finance">Finance</option>
                      <option value="delivery">Delivery</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <select 
                      className="form-input"
                      value={newUser.department}
                      onChange={e => setNewUser({...newUser, department: e.target.value})}
                    >
                      <option value="Sales">Sales</option>
                      <option value="Customer Support">Customer Support</option>
                      <option value="Finance">Finance</option>
                      <option value="Logistics">Logistics</option>
                      <option value="Management">Management</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setIsAddUserModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-gold" style={{ background: 'var(--gold)', color: '#000', fontWeight: 'bold', padding: '0.5rem 1rem', borderRadius: '4px' }}>Create Account</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="modal-overlay" onClick={() => setEditingUser(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Edit User Permissions</h2>
              <button className="modal-close" onClick={() => setEditingUser(null)}>×</button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="modal-body">
                <div className="form-group mb-1">
                  <label className="form-label">Full Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    required 
                    value={editingUser.name}
                    onChange={e => setEditingUser({...editingUser, name: e.target.value})}
                  />
                </div>
                <div className="form-row mb-1">
                  <div className="form-group">
                    <label className="form-label">Role</label>
                    <select 
                      className="form-input"
                      value={editingUser.role}
                      onChange={e => setEditingUser({...editingUser, role: e.target.value})}
                      disabled={editingUser.role === 'superadmin'}
                    >
                      {editingUser.role === 'superadmin' && <option value="superadmin">Superadmin</option>}
                      <option value="staff">Staff</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                      <option value="finance">Finance</option>
                      <option value="delivery">Delivery</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <select 
                      className="form-input"
                      value={editingUser.department}
                      onChange={e => setEditingUser({...editingUser, department: e.target.value})}
                    >
                      <option value="Sales">Sales</option>
                      <option value="Customer Support">Customer Support</option>
                      <option value="Finance">Finance</option>
                      <option value="Logistics">Logistics</option>
                      <option value="Management">Management</option>
                      <option value="Products">Products</option>
                      <option value="Orders">Orders</option>
                      <option value="Inventory">Inventory</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Support">Support</option>
                      <option value="Content">Content</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setEditingUser(null)}>Cancel</button>
                <button type="submit" className="btn btn-gold" style={{ background: 'var(--gold)', color: '#000', fontWeight: 'bold', padding: '0.5rem 1rem', borderRadius: '4px' }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Activity Modal */}
      {viewingUser && (
        <div className="modal-overlay" onClick={() => setViewingUser(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{viewingUser.name}'s Activity</h2>
              <button className="modal-close" onClick={() => setViewingUser(null)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                 <div className="user-avatar" style={{ background: `linear-gradient(135deg, ${viewingUser.avatarColor}, #2c3e50)`, color: 'white', width: '64px', height: '64px', fontSize: '1.5rem' }}>{viewingUser.avatar}</div>
                 <div>
                    <h3 style={{ margin: '0 0 0.2rem 0' }}>{viewingUser.email}</h3>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Joined {viewingUser.joinDate}</div>
                    <span className={`badge badge-${viewingUser.role}`} style={{ marginTop: '0.4rem', display: 'inline-block' }}>{viewingUser.role.toUpperCase()}</span>
                 </div>
              </div>
              
              <h4 style={{ margin: '0 0 1rem 0', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>Recent Actions</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 <li style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span>Updated product inventory for SKU-4022</span>
                    <span style={{ color: 'var(--text-muted)' }}>2 hours ago</span>
                 </li>
                 <li style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span>Resolved customer ticket #TKT-1024</span>
                    <span style={{ color: 'var(--text-muted)' }}>Yesterday</span>
                 </li>
                 <li style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span>Logged into Admin Portal</span>
                    <span style={{ color: 'var(--text-muted)' }}>{viewingUser.lastLogin}</span>
                 </li>
              </ul>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setViewingUser(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
