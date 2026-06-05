import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Search, Download, Filter, ShieldCheck, Clock, ShieldAlert } from 'lucide-react';

export default function LoginActivity() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const q = query(collection(db, 'loginActivity'), orderBy('loginTime', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setActivities(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching login activity:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = 
      activity.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.ipAddress?.includes(searchTerm);
      
    const matchesRole = roleFilter === 'all' || activity.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || activity.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Role', 'Status', 'IP Address', 'Login Time', 'Logout Time', 'Device Info'];
    const rows = filteredActivities.map(a => [
      `"${a.userName || 'Unknown'}"`,
      `"${a.email || ''}"`,
      `"${a.role || 'unknown'}"`,
      `"${a.status || 'unknown'}"`,
      `"${a.ipAddress || 'Unknown'}"`,
      `"${new Date(a.loginTime).toLocaleString()}"`,
      `"${a.logoutTime ? new Date(a.logoutTime).toLocaleString() : 'Active'}"`,
      `"${a.deviceInfo || 'Unknown'}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `login_activity_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <div className="admin-loading">Loading Security Logs...</div>;
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h2>Security & Login Activity</h2>
          <p className="admin-subtitle">Monitor user access and detect suspicious activities.</p>
        </div>
        <div className="admin-header-actions">
          <button className="admin-btn-primary" onClick={exportToCSV}>
            <Download size={18} /> Export CSV
          </button>
        </div>
      </div>

      <div className="admin-filters-bar">
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search by name, email, or IP..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <div className="filter-select">
            <Filter size={18} />
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="all">All Roles</option>
              <option value="superadmin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
              <option value="manager">Manager</option>
              <option value="customer">Customer</option>
            </select>
          </div>
          
          <div className="filter-select">
            <ShieldCheck size={18} />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Statuses</option>
              <option value="success">Successful Logins</option>
              <option value="failed">Failed Logins</option>
              <option value="completed">Completed Sessions</option>
            </select>
          </div>
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>IP Address</th>
              <th>Login Time</th>
              <th>Logout Time</th>
            </tr>
          </thead>
          <tbody>
            {filteredActivities.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No login activity found.</td>
              </tr>
            ) : (
              filteredActivities.map((activity) => (
                <tr key={activity.id}>
                  <td>
                    <div style={{ fontWeight: '500' }}>{activity.userName || 'Unknown User'}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>{activity.email}</div>
                  </td>
                  <td>
                    <span className="admin-role-badge">{activity.role || 'unknown'}</span>
                  </td>
                  <td>
                    {activity.status === 'failed' ? (
                      <span className="admin-badge admin-badge-danger"><ShieldAlert size={12} style={{marginRight: 4}}/>Failed</span>
                    ) : activity.status === 'completed' ? (
                      <span className="admin-badge admin-badge-secondary">Completed</span>
                    ) : (
                      <span className="admin-badge admin-badge-success">Active</span>
                    )}
                  </td>
                  <td>
                    <div style={{ fontFamily: 'monospace', fontSize: '12px' }}>{activity.ipAddress || 'Unknown'}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                      <Clock size={12} /> {new Date(activity.loginTime).toLocaleString()}
                    </div>
                  </td>
                  <td>
                    {activity.logoutTime ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#666' }}>
                        <Clock size={12} /> {new Date(activity.logoutTime).toLocaleString()}
                      </div>
                    ) : (
                      activity.status === 'failed' ? '-' : <span style={{ color: '#2ecc71', fontSize: '12px' }}>Currently Active</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
