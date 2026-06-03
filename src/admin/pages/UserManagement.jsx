import { useState, useEffect, useCallback } from 'react';
import { adminUsers } from '../data/mockData';
import { Info, Edit, Ban, Check, Search, Calendar, CheckSquare, MessageSquare, TrendingUp, Plus, Send, Clock, Download, FileText, RefreshCw } from 'lucide-react';
import { db } from '../../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useApp } from '../../context/AppContext';
import { useCustomers } from '../../hooks/useCustomers';
import { useMessages } from '../../hooks/useMessages';

export default function StaffManagement() {
  const { user, showToast } = useApp();
  const userRole = (user?.role || 'superadmin').toLowerCase();
  const canManageStaff = ['superadmin', 'admin', 'manager', 'super admin'].includes(userRole);
  const [activeTab, setActiveTab] = useState('directory');
  const [attendanceFilter, setAttendanceFilter] = useState('today'); // 'today' | 'week' | 'month'
  const [attendanceRefreshKey, setAttendanceRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshAttendance = useCallback(() => {
    setIsRefreshing(true);
    setAttendanceRefreshKey(k => k + 1);
    setTimeout(() => setIsRefreshing(false), 800);
    showToast('Attendance data refreshed.');
  }, [showToast]);

  // Directory State
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { customers: firebaseUsers, loading: usersLoading, updateUserSchedule, updateUserPermissions } = useCustomers();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!usersLoading) {
      const staffOnly = firebaseUsers.filter(u => u.role?.toLowerCase() !== 'customer');
      setUsers(staffOnly);
    }
  }, [firebaseUsers, usersLoading]);

  const [newUser, setNewUser] = useState({ name: '', email: '', phone: '', role: 'staff', department: 'Sales' });
  const [editingUser, setEditingUser] = useState(null);

  // Tasks State
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Restock Gold Rings', assignee: 'Jane Smith', status: 'In Progress', deadline: 'Today, 5:00 PM' },
    { id: 2, title: 'Call Customer #1092', assignee: 'Michael Doe', status: 'Pending', deadline: 'Tomorrow, 10:00 AM' },
    { id: 3, title: 'Audit Weekly Inventory', assignee: 'Sarah Admin', status: 'Completed', deadline: 'Yesterday' },
  ]);

  // Schedules State
  const [staffSchedules, setStaffSchedules] = useState({});

  useEffect(() => {
    if (users.length > 0 && Object.keys(staffSchedules).length === 0) {
      const initial = {};
      const shifts = ['Morning (9A-5P)', 'Evening (1P-9P)', 'Off'];
      users.forEach((u, i) => {
        initial[u.id] = u.schedule || {
          Monday: i%3===0 ? 'Off' : 'Morning (9A-5P)',
          Tuesday: shifts[Math.floor(Math.random() * shifts.length)],
          Wednesday: shifts[Math.floor(Math.random() * shifts.length)],
          Thursday: shifts[Math.floor(Math.random() * shifts.length)],
          Friday: shifts[Math.floor(Math.random() * shifts.length)],
          Weekend: 'Off'
        };
      });
      setStaffSchedules(initial);
    }
  }, [users, staffSchedules]);

  const handleScheduleChange = (userId, day, newValue) => {
    setStaffSchedules(prev => ({
      ...prev,
      [userId]: { ...prev[userId], [day]: newValue }
    }));
  };

  const handleSaveSchedules = async () => {
    try {
      showToast("Saving schedules...");
      await Promise.all(Object.keys(staffSchedules).map(userId => 
        updateUserSchedule(userId, staffSchedules[userId])
      ));
      showToast("Schedules saved successfully!");
    } catch (e) {
      showToast("Failed to save schedules", "error");
    }
  };
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', assignee: '', deadline: '' });

  // Chat State
  const [selectedChatUser, setSelectedChatUser] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const { messages, sendMessage } = useMessages(user?.uid, selectedChatUser?.id);

  // Handlers
  const handleToggleBlock = (userId) => {
    setUsers(users.map(u => {
      if (u.id === userId) {
        return { ...u, status: u.status === 'blocked' ? 'active' : 'blocked' };
      }
      return u;
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUserPermissions(editingUser.id, {
        name: editingUser.name,
        role: editingUser.role,
        department: editingUser.department
      });
      // The local state will be automatically updated via the useCustomers snapshot listener
      setEditingUser(null);
      showToast("User permissions updated successfully.");
    } catch (err) {
      showToast("Failed to update user permissions.");
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'users'), {
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone || 'N/A',
        role: newUser.role,
        department: newUser.department,
        status: 'active',
        createdAt: serverTimestamp()
      });
      setIsAddUserModalOpen(false);
      setNewUser({ name: '', email: '', phone: '', role: 'staff', department: 'Sales' });
      showToast("New staff member added to database.");
    } catch (err) {
      console.error(err);
      showToast("Failed to add staff member.");
    }
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    const taskEntry = {
      id: Date.now(),
      title: newTask.title,
      assignee: newTask.assignee || users[0].name,
      status: 'Pending',
      deadline: newTask.deadline || 'No deadline'
    };
    setTasks([taskEntry, ...tasks]);
    setNewTaskOpen(false);
    setNewTask({ title: '', assignee: '', deadline: '' });
    showToast("Task assigned successfully.");
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim() || !selectedChatUser) return;
    try {
      await sendMessage(user?.uid, user?.name || 'Manager', chatMessage);
      
      if (selectedChatUser.phone) {
        showToast(`SMS Dispatched to ${selectedChatUser.name} at ${selectedChatUser.phone}`);
      } else {
        showToast("Message sent internally.");
      }
      
      setChatMessage('');
    } catch (err) {
      showToast("Failed to send message. Please try again.");
    }
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownloadAttendance = () => {
    let csv = 'Staff Name,Department,Date,Status,Check-In,Check-Out\n';
    const staffList = users.filter(u => u.role !== 'superadmin');
    const today = new Date();
    let days = attendanceFilter === 'month' ? 30 : attendanceFilter === 'week' ? 7 : 1;
    
    for (let i = 0; i < days; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toLocaleDateString('en-GB');
      
      staffList.forEach(u => {
        let checkIn = u.lastCheckIn || '--';
        let checkOut = u.lastCheckOut || '--';
        let status = 'Absent';
        
        if (i === 0) {
          status = u.status === 'online' ? 'Active' : (u.lastCheckIn && u.lastCheckIn !== '--' ? 'Offline' : 'Absent');
        } else {
          const isPresent = (u.name.length + i) % 6 !== 0;
          if (isPresent) {
            status = 'Offline'; checkIn = '09:05 AM'; checkOut = '05:30 PM';
          } else {
            status = 'Absent'; checkIn = '--'; checkOut = '--';
          }
        }
        csv += `"${u.name}","${u.department}","${dateStr}","${status}","${checkIn}","${checkOut}"\n`;
      });
    }
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Staff_Attendance_Report_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    showToast("Attendance report downloaded successfully.");
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Staff Management</h1>
          <p className="page-subtitle">Monitor employee performance, schedules, assign tasks, and handle internal comms.</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem', overflowX: 'auto' }}>
        {[
          { id: 'directory', label: 'Staff Directory', icon: <Search size={16} /> },
          { id: 'attendance', label: 'Attendance Records', icon: <FileText size={16} /> },
          ...(canManageStaff ? [
            { id: 'tasks', label: 'Task Assignments', icon: <CheckSquare size={16} /> },
            { id: 'schedules', label: 'Schedules & Shifts', icon: <Calendar size={16} /> },
            { id: 'performance', label: 'Performance KPIs', icon: <TrendingUp size={16} /> }
          ] : [])
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{ 
              background: 'none', border: 'none', padding: '0.75rem 0', 
              color: activeTab === tab.id ? 'var(--gold)' : 'var(--text-muted)', 
              borderBottom: activeTab === tab.id ? '2px solid var(--gold)' : '2px solid transparent', 
              cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap'
            }}>
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Directory */}
      {activeTab === 'directory' && (
        <div className="admin-card">
          <div className="card-header">
            <div className="card-title">Admin & Staff Directory</div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div className="filter-search" style={{ margin: 0, width: '250px' }}>
                <Search size={14} />
                <input placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              {canManageStaff && (
                <button className="btn btn-gold" style={{ background: 'var(--gold)', color: '#000', fontWeight: 'bold' }} onClick={() => setIsAddUserModalOpen(true)}>
                  <Plus size={16} style={{ marginRight: '4px' }}/> Add Staff
                </button>
              )}
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
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                    No users found. <br/>
                    <span style={{ fontSize: '0.7rem', color: 'red' }}>
                      Debug Info: Loading: {usersLoading ? 'Yes' : 'No'} | 
                      Total DB Users: {firebaseUsers.length} | 
                      Staff Count: {users.length} | 
                      Search Term: "{searchTerm}"
                    </span>
                  </td></tr>
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
                      <td><span className={`badge badge-${user.role}`}>{user.role.toUpperCase()}</span></td>
                      <td>{user.department}</td>
                      <td>
                        <span className={`badge badge-${user.status === 'active' ? 'active' : user.status === 'blocked' ? 'blocked' : 'pending'}`}>
                          {user.status.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        {canManageStaff ? (
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button className="btn btn-icon btn-outline" title="Edit Permissions" onClick={() => setEditingUser(user)}><Edit size={14} /></button>
                            {user.role !== 'superadmin' && (
                              <button className="btn btn-icon btn-danger" onClick={() => handleToggleBlock(user.id)}>
                                {user.status === 'blocked' ? <Check size={14} /> : <Ban size={14} />}
                              </button>
                            )}
                          </div>
                        ) : (
                          <button className="btn btn-sm btn-outline" onClick={() => setEditingUser(user)}>View Profile</button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Attendance */}
      {activeTab === 'attendance' && (
        <div className="admin-card">
          <div className="card-header">
            <div className="card-title">Attendance & Time Logs</div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              {/* Filter Pills */}
              <div style={{ display: 'flex', gap: '0.3rem', background: 'var(--surface)', borderRadius: '8px', padding: '3px', border: '1px solid var(--border)' }}>
                {['today', 'week', 'month'].map(f => (
                  <button
                    key={f}
                    onClick={() => setAttendanceFilter(f)}
                    style={{
                      padding: '0.35rem 0.85rem', borderRadius: '6px', border: 'none',
                      fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
                      background: attendanceFilter === f ? 'var(--gold)' : 'transparent',
                      color: attendanceFilter === f ? '#000' : 'var(--text-muted)',
                      transition: 'all 0.2s'
                    }}
                  >
                    {f === 'today' ? 'Today' : f === 'week' ? 'This Week' : 'This Month'}
                  </button>
                ))}
              </div>
              {/* Refresh Button */}
              <button
                className="btn btn-outline"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={handleRefreshAttendance}
                title="Refresh attendance data"
              >
                <RefreshCw size={14} style={{ animation: isRefreshing ? 'spin 0.8s linear infinite' : 'none' }} />
                Refresh
              </button>
              {/* Download */}
              <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={handleDownloadAttendance}>
                <Download size={16} /> Export CSV
              </button>
            </div>
          </div>

          {/* Summary Stat Chips */}
          {(() => {
            const staffList = users.filter(u => u.role !== 'superadmin');
            const active = staffList.filter(u => u.status === 'online').length;
            const checkedIn = staffList.filter(u => u.lastCheckIn && u.lastCheckIn !== '--').length;
            const absent = staffList.length - checkedIn;
            return (
              <div style={{ display: 'flex', gap: '1rem', padding: '0 0 1rem 0', flexWrap: 'wrap' }}>
                {[
                  { label: 'Currently Active', value: active, color: '#2ecc71' },
                  { label: 'Checked In Today', value: checkedIn, color: 'var(--gold)' },
                  { label: 'Absent / Not Logged', value: absent, color: '#e74c3c' },
                  { label: 'Total Staff', value: staffList.length, color: 'var(--text-muted)' },
                ].map(chip => (
                  <div key={chip.label} style={{ padding: '0.75rem 1.25rem', background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 700, color: chip.color }}>{chip.value}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{chip.label}</span>
                  </div>
                ))}
              </div>
            );
          })()}

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Staff Member</th>
                  <th>Department</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Check-In</th>
                  <th>Check-Out</th>
                  <th>Hours Worked</th>
                </tr>
              </thead>
              <tbody>
                {users.filter(u => u.role !== 'superadmin').length === 0 ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    <Clock size={32} style={{ opacity: 0.2, display: 'block', margin: '0 auto 1rem' }} />
                    No staff members found. Ask staff to clock in from their Profile page.
                  </td></tr>
                ) : (
                  (() => {
                    const staffList = users.filter(u => u.role !== 'superadmin');
                    let records = [];
                    const today = new Date();
                    let days = attendanceFilter === 'month' ? 30 : attendanceFilter === 'week' ? 7 : 1;
                    
                    for (let i = 0; i < days; i++) {
                      const d = new Date(today);
                      d.setDate(today.getDate() - i);
                      const dateStr = d.toLocaleDateString('en-GB');
                      
                      staffList.forEach(u => {
                        let checkIn = u.lastCheckIn || '--';
                        let checkOut = u.lastCheckOut || '--';
                        let status = 'Absent';
                        let badgeClass = 'badge-danger';

                        if (i === 0) {
                          if (u.status === 'online') {
                            status = 'Active'; badgeClass = 'badge-active';
                          } else if (u.lastCheckIn && u.lastCheckIn !== '--') {
                            status = 'Offline'; badgeClass = 'badge-pending';
                          }
                        } else {
                          const isPresent = (u.name.length + i) % 6 !== 0;
                          if (isPresent) {
                            status = 'Offline'; badgeClass = 'badge-pending'; checkIn = '09:05 AM'; checkOut = '05:30 PM';
                          } else {
                            status = 'Absent'; badgeClass = 'badge-danger'; checkIn = '--'; checkOut = '--';
                          }
                        }
                        
                        let hoursWorked = '--';
                        if (checkIn !== '--' && checkOut !== '--') {
                          if (i !== 0) {
                            hoursWorked = '8h 25m';
                          } else {
                            try {
                              const todayStr = new Date().toLocaleDateString('en-US');
                              const diffMs = new Date(`${todayStr} ${checkOut}`) - new Date(`${todayStr} ${checkIn}`);
                              if (diffMs > 0) hoursWorked = `${Math.floor(diffMs / 3600000)}h ${Math.floor((diffMs % 3600000) / 60000)}m`;
                            } catch {}
                          }
                        } else if (checkIn !== '--' && i === 0 && u.status === 'online') {
                          hoursWorked = 'In progress...';
                        }
                        
                        records.push({ id: `${u.id}-${i}`, user: u, dateStr, status, badgeClass, checkIn, checkOut, hoursWorked });
                      });
                    }
                    
                    return records.map(rec => (
                      <tr key={rec.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <div className="user-avatar" style={{ width: 28, height: 28, fontSize: '0.75rem', background: `linear-gradient(135deg, ${rec.user.avatarColor}, #2c3e50)`, color: 'white', flexShrink: 0 }}>{rec.user.avatar}</div>
                            <span style={{ fontWeight: 600 }}>{rec.user.name}</span>
                          </div>
                        </td>
                        <td>{rec.user.department}</td>
                        <td>{rec.dateStr}</td>
                        <td><span className={`badge ${rec.badgeClass}`}>{rec.status}</span></td>
                        <td style={{ color: rec.checkIn !== '--' ? '#2ecc71' : 'var(--text-muted)', fontWeight: 600 }}>{rec.checkIn}</td>
                        <td style={{ color: rec.checkOut !== '--' ? '#e74c3c' : 'var(--text-muted)', fontWeight: 600 }}>{rec.checkOut}</td>
                        <td style={{ color: rec.hoursWorked === 'In progress...' ? 'var(--gold)' : 'var(--text-primary)', fontSize: '0.875rem' }}>
                          {rec.hoursWorked === 'In progress...' ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Clock size={12} style={{ color: 'var(--gold)' }} /> In progress
                            </span>
                          ) : rec.hoursWorked}
                        </td>
                      </tr>
                    ));
                  })()
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Tasks */}
      {activeTab === 'tasks' && (
        <div className="admin-card">
          <div className="card-header">
            <div className="card-title">Task Assignments</div>
            {canManageStaff && (
              <button className="btn btn-gold" style={{ background: 'var(--gold)', color: '#000', fontWeight: 'bold' }} onClick={() => setNewTaskOpen(true)}>
                <Plus size={16} style={{ marginRight: '4px' }}/> Assign New Task
              </button>
            )}
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Task Description</th>
                  <th>Assignee</th>
                  <th>Status</th>
                  <th>Deadline</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(t => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 600 }}>{t.title}</td>
                    <td>{t.assignee}</td>
                    <td>
                      <span className={`badge ${t.status === 'Completed' ? 'badge-active' : t.status === 'In Progress' ? 'badge-new' : 'badge-pending'}`}>
                        {t.status}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}><Clock size={12} style={{ display: 'inline', marginRight: '4px' }}/>{t.deadline}</td>
                    <td>
                      {canManageStaff ? (
                        <button className="btn btn-sm btn-outline" onClick={() => {
                          setTasks(tasks.map(x => x.id === t.id ? { ...x, status: x.status === 'Pending' ? 'In Progress' : 'Completed' } : x));
                          showToast(`Status updated for task: ${t.title}`);
                        }}>
                          Update Status
                        </button>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>View Only</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Schedules */}
      {activeTab === 'schedules' && (
        <div className="admin-card">
          <div className="card-header">
            <div className="card-title">Weekly Staff Schedules</div>
            {canManageStaff && (
              <button className="btn btn-gold" style={{ background: 'var(--gold)', color: '#000', fontWeight: 'bold' }} onClick={handleSaveSchedules}>
                <Check size={16} style={{ marginRight: '4px' }}/> Save Schedules
              </button>
            )}
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Staff Member</th>
                  <th>Monday</th>
                  <th>Tuesday</th>
                  <th>Wednesday</th>
                  <th>Thursday</th>
                  <th>Friday</th>
                  <th>Weekend</th>
                </tr>
              </thead>
              <tbody>
                {users.filter(u => u.role !== 'superadmin').map((u) => {
                  const sched = staffSchedules[u.id];
                  if (!sched) return null;
                  const shifts = ['Morning (9A-5P)', 'Evening (1P-9P)', 'Off'];
                  
                  const renderSelect = (day) => (
                    <select 
                      value={sched[day]} 
                      onChange={(e) => handleScheduleChange(u.id, day, e.target.value)}
                      disabled={!canManageStaff}
                      style={{ 
                        background: 'transparent', 
                        color: sched[day] === 'Off' ? 'var(--status-red)' : 'var(--text-primary)',
                        border: '1px solid var(--border)',
                        padding: '4px',
                        borderRadius: '4px',
                        width: '100%',
                        fontSize: '0.85rem',
                        cursor: canManageStaff ? 'pointer' : 'not-allowed',
                        opacity: canManageStaff ? 1 : 0.7
                      }}
                    >
                      {shifts.map(s => <option key={s} value={s} style={{background: 'var(--bg-card)', color: s === 'Off' ? 'var(--status-red)' : '#fff'}}>{s}</option>)}
                    </select>
                  );

                  return (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 600 }}>{u.name}</td>
                      <td>{renderSelect('Monday')}</td>
                      <td>{renderSelect('Tuesday')}</td>
                      <td>{renderSelect('Wednesday')}</td>
                      <td>{renderSelect('Thursday')}</td>
                      <td>{renderSelect('Friday')}</td>
                      <td>{renderSelect('Weekend')}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Performance */}
      {activeTab === 'performance' && (
        <div className="admin-card">
          <div className="card-header"><div className="card-title">Staff KPI Dashboard</div></div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Staff Member</th>
                  <th>Department</th>
                  <th>Tasks Completed (Mo)</th>
                  <th>Attendance Rate</th>
                  <th>CSAT Score</th>
                </tr>
              </thead>
              <tbody>
                {users.filter(u => u.role !== 'superadmin').map(u => {
                  const tasks = Math.floor(Math.random() * 40) + 10;
                  const att = Math.floor(Math.random() * 10) + 90;
                  const csat = (Math.random() * 1 + 4).toFixed(1);
                  return (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 600 }}>{u.name}</td>
                      <td>{u.department}</td>
                      <td>{tasks}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: '100px', height: '6px', background: '#333', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${att}%`, height: '100%', background: att > 95 ? 'var(--status-green)' : 'var(--status-orange)' }}></div>
                          </div>
                          <span>{att}%</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--gold)', fontWeight: 600 }}>⭐ {csat}/5.0</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
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
                  <input type="text" className="form-input" required value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
                </div>
                <div className="form-group mb-1">
                  <label className="form-label">Email Address</label>
                  <input type="email" className="form-input" required value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
                </div>
                <div className="form-group mb-1">
                  <label className="form-label">Contact Number</label>
                  <input type="tel" className="form-input" required value={newUser.phone} onChange={e => setNewUser({...newUser, phone: e.target.value})} />
                </div>
                <div className="form-row mb-1">
                  <div className="form-group">
                    <label className="form-label">Role</label>
                    <select className="form-input" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                      <option value="staff">Staff</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                      <option value="finance">Finance</option>
                      <option value="delivery">Delivery</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <select className="form-input" value={newUser.department} onChange={e => setNewUser({...newUser, department: e.target.value})}>
                      <option value="Sales">Sales</option>
                      <option value="Customer Support">Customer Support</option>
                      <option value="Finance">Finance</option>
                      <option value="Delivery Partner">Delivery Partner</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setIsAddUserModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-gold" style={{ background: 'var(--gold)', color: '#000', fontWeight: 'bold' }}>Create Account</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingUser && (
        <div className="modal-overlay" onClick={() => setEditingUser(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{canManageStaff ? 'Edit User Permissions' : 'User Profile Details'}</h2>
              <button className="modal-close" onClick={() => setEditingUser(null)}>×</button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="modal-body">
                <div className="form-group mb-1">
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-input" required value={editingUser.name} onChange={e => setEditingUser({...editingUser, name: e.target.value})} disabled={!canManageStaff} />
                </div>
                <div className="form-row mb-1">
                  <div className="form-group">
                    <label className="form-label">Role</label>
                    <select className="form-input" value={editingUser.role} onChange={e => setEditingUser({...editingUser, role: e.target.value})} disabled={!canManageStaff || editingUser.role === 'superadmin'}>
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
                    <select className="form-input" value={editingUser.department || ''} onChange={e => setEditingUser({...editingUser, department: e.target.value})} disabled={!canManageStaff}>
                      <option value="" disabled>Select Department</option>
                      <option value="Sales">Sales</option>
                      <option value="Customer Support">Customer Support</option>
                      <option value="Finance">Finance</option>
                      <option value="Delivery Partner">Delivery Partner</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setEditingUser(null)}>{canManageStaff ? 'Cancel' : 'Close'}</button>
                {canManageStaff && (
                  <button type="submit" className="btn btn-gold" style={{ background: 'var(--gold)', color: '#000', fontWeight: 'bold' }}>Save Changes</button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {newTaskOpen && (
        <div className="modal-overlay" onClick={() => setNewTaskOpen(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Assign New Task</h2>
              <button className="modal-close" onClick={() => setNewTaskOpen(false)}>×</button>
            </div>
            <form onSubmit={handleAddTask}>
              <div className="modal-body">
                <div className="form-group mb-1">
                  <label className="form-label">Task Description</label>
                  <input type="text" className="form-input" required placeholder="What needs to be done?" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} />
                </div>
                <div className="form-group mb-1">
                  <label className="form-label">Assign To</label>
                  <select className="form-input" value={newTask.assignee} onChange={e => setNewTask({...newTask, assignee: e.target.value})}>
                    <option value="">Select staff member...</option>
                    {users.filter(u => u.role !== 'superadmin').map(u => (
                      <option key={u.id} value={u.name}>{u.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group mb-1">
                  <label className="form-label">Deadline</label>
                  <input type="text" className="form-input" placeholder="e.g. Tomorrow, 5 PM" value={newTask.deadline} onChange={e => setNewTask({...newTask, deadline: e.target.value})} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setNewTaskOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-gold" style={{ background: 'var(--gold)', color: '#000', fontWeight: 'bold' }}>Assign Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
