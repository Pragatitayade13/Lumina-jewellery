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
      String(activity.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(activity.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
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
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Security & Login Activity</h1>
          <p className="page-subtitle">Monitor user access and detect suspicious activities.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={exportToCSV}>
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      <div className="admin-card">
        <div className="filter-bar" style={{ marginBottom: '1.25rem' }}>
          <div className="filter-search" style={{ margin: 0, width: '300px' }}>
            <Search size={14} />
            <input 
              type="text" 
              placeholder="Search by name, email, or IP..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select className="form-input" style={{ width: '160px', padding: '0.475rem 0.875rem' }} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="all">All Roles</option>
            <option value="superadmin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
            <option value="manager">Manager</option>
            <option value="customer">Customer</option>
          </select>
          
          <select className="form-input" style={{ width: '180px', padding: '0.475rem 0.875rem' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="success">Successful Logins</option>
            <option value="failed">Failed Logins</option>
            <option value="completed">Completed Sessions</option>
          </select>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>IP & Device</th>
                <th>Login Time</th>
                <th>Logout Time</th>
              </tr>
            </thead>
            <tbody>
              {filteredActivities.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: 'var(--text-muted)' }}><ShieldCheck size={48} /></div>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>No login activity found</div>
                  </td>
                </tr>
              ) : (
                filteredActivities.map((activity) => {
                  let deviceOS = 'Unknown Device';
                  let browserInfo = '';
                  if (activity.deviceInfo) {
                    const ua = activity.deviceInfo;
                    if (ua.includes('Win')) deviceOS = 'Windows';
                    else if (ua.includes('Mac')) deviceOS = 'MacOS';
                    else if (ua.includes('Linux')) deviceOS = 'Linux';
                    else if (ua.includes('Android')) deviceOS = 'Android';
                    else if (ua.includes('iOS') || ua.includes('iPhone')) deviceOS = 'iOS';
                    
                    if (ua.includes('Chrome')) browserInfo = 'Chrome';
                    else if (ua.includes('Safari') && !ua.includes('Chrome')) browserInfo = 'Safari';
                    else if (ua.includes('Firefox')) browserInfo = 'Firefox';
                    else if (ua.includes('Edge')) browserInfo = 'Edge';
                  }

                  return (
                  <tr key={activity.id}>
                    <td>
                      <div className="user-name">{activity.userName || 'Unknown User'}</div>
                      <div className="user-email">{activity.email}</div>
                    </td>
                    <td>
                      <span className="badge badge-pending" style={{ textTransform: 'uppercase' }}>{activity.role || 'unknown'}</span>
                    </td>
                    <td>
                      {activity.status === 'failed' ? (
                        <span className="badge badge-cancelled">Failed</span>
                      ) : activity.status === 'completed' ? (
                        <span className="badge badge-shipped">Completed</span>
                      ) : (
                        <span className="badge badge-delivered">Active</span>
                      )}
                    </td>
                    <td>
                      <div style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{activity.ipAddress || 'Unknown'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }} title={activity.deviceInfo}>
                        {deviceOS} {browserInfo && `· ${browserInfo}`}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                        <Clock size={12} /> {new Date(activity.loginTime).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}
                      </div>
                    </td>
                    <td>
                      {activity.logoutTime ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          <Clock size={12} /> {new Date(activity.logoutTime).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}
                        </div>
                      ) : (
                        activity.status === 'failed' ? '-' : <span style={{ color: 'var(--status-green)', fontSize: '0.85rem', fontWeight: 600 }}>Currently Active</span>
                      )}
                    </td>
                  </tr>
                )})
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
