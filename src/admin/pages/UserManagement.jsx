import { useState, useEffect } from 'react';
import { adminUsers } from '../data/mockData';
import { Info, Edit, Eye, Ban, Check, Search, Calendar, CheckSquare, MessageSquare, TrendingUp, Plus, Send, Clock } from 'lucide-react';
import { db } from '../../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useApp } from '../../context/AppContext';
import { useCustomers } from '../../hooks/useCustomers';
import { useMessages } from '../../hooks/useMessages';

export default function StaffManagement() {
  const { user, showToast } = useApp();
  const [activeTab, setActiveTab] = useState('directory'); // 'directory', 'tasks', 'schedules', 'performance', 'communication'

  // Directory State
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { customers: firebaseUsers, loading: usersLoading } = useCustomers();
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

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
    setEditingUser(null);
    showToast("User permissions updated successfully.");
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
          { id: 'tasks', label: 'Task Assignments', icon: <CheckSquare size={16} /> },
          { id: 'schedules', label: 'Schedules & Shifts', icon: <Calendar size={16} /> },
          { id: 'performance', label: 'Performance KPIs', icon: <TrendingUp size={16} /> },
          { id: 'communication', label: 'Internal Comms', icon: <MessageSquare size={16} /> }
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
              <button className="btn btn-gold" style={{ background: 'var(--gold)', color: '#000', fontWeight: 'bold' }} onClick={() => setIsAddUserModalOpen(true)}>
                <Plus size={16} style={{ marginRight: '4px' }}/> Add Staff
              </button>
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
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button className="btn btn-icon btn-outline" title="Edit Permissions" onClick={() => setEditingUser(user)}><Edit size={14} /></button>
                          {user.role !== 'superadmin' && (
                            <button className="btn btn-icon btn-danger" onClick={() => handleToggleBlock(user.id)}>
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
      )}

      {/* Tab: Tasks */}
      {activeTab === 'tasks' && (
        <div className="admin-card">
          <div className="card-header">
            <div className="card-title">Task Assignments</div>
            <button className="btn btn-gold" style={{ background: 'var(--gold)', color: '#000', fontWeight: 'bold' }} onClick={() => setNewTaskOpen(true)}>
              <Plus size={16} style={{ marginRight: '4px' }}/> Assign New Task
            </button>
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
                      <button className="btn btn-sm btn-outline" onClick={() => {
                        setTasks(tasks.map(x => x.id === t.id ? { ...x, status: x.status === 'Pending' ? 'In Progress' : 'Completed' } : x));
                        showToast(`Status updated for task: ${t.title}`);
                      }}>
                        Update Status
                      </button>
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
          <div className="card-header"><div className="card-title">Weekly Staff Schedules</div></div>
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
                {users.filter(u => u.role !== 'superadmin').map((u, i) => {
                  const shifts = ['Morning (9A-5P)', 'Evening (1P-9P)', 'Off'];
                  const r = () => shifts[Math.floor(Math.random() * shifts.length)];
                  return (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 600 }}>{u.name}</td>
                      <td style={{ color: i%3===0 ? 'var(--status-red)' : 'var(--text-primary)' }}>{i%3===0 ? 'Off' : 'Morning (9A-5P)'}</td>
                      <td>{r()}</td>
                      <td>{r()}</td>
                      <td>{r()}</td>
                      <td>{r()}</td>
                      <td style={{ color: 'var(--text-muted)' }}>Off</td>
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

      {/* Tab: Communication */}
      {activeTab === 'communication' && (
        <div style={{ display: 'flex', height: '500px', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', background: 'var(--surface)' }}>
          <div style={{ width: '250px', borderRight: '1px solid var(--border)', background: 'var(--bg-sidebar)', overflowY: 'auto' }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Direct Messages</div>
            {users.filter(u => u.role !== 'superadmin').map(u => (
              <div 
                key={u.id} 
                onClick={() => setSelectedChatUser(u)}
                style={{ 
                  padding: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem',
                  background: selectedChatUser?.id === u.id ? 'rgba(255, 215, 0, 0.1)' : 'transparent',
                  borderBottom: '1px solid rgba(255,255,255,0.05)'
                }}
              >
                <div className="user-avatar" style={{ width: 32, height: 32, fontSize: '0.8rem', background: `linear-gradient(135deg, ${u.avatarColor}, #2c3e50)` }}>{u.avatar}</div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{u.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{u.role}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {selectedChatUser ? (
              <>
                <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div className="user-avatar" style={{ width: 32, height: 32, fontSize: '0.8rem', background: `linear-gradient(135deg, ${selectedChatUser.avatarColor}, #2c3e50)` }}>{selectedChatUser.avatar}</div>
                  Chat with {selectedChatUser.name}
                </div>
                <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {messages.map(m => {
                    const isMine = m.senderId === user?.uid;
                    return (
                      <div key={m.id} style={{ alignSelf: isMine ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem', textAlign: isMine ? 'right' : 'left' }}>{m.senderName} • {m.time}</div>
                        <div style={{ background: isMine ? 'var(--gold)' : '#333', color: isMine ? '#000' : '#fff', padding: '0.75rem 1rem', borderRadius: '12px' }}>
                          {m.text}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <form onSubmit={handleSendMessage} style={{ padding: '1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.5rem' }}>
                  <input type="text" className="form-input" style={{ flex: 1 }} placeholder="Type a message..." value={chatMessage} onChange={e => setChatMessage(e.target.value)} />
                  <button type="submit" className="btn btn-gold" style={{ background: 'var(--gold)', color: '#000', padding: '0 1rem' }}><Send size={16}/></button>
                </form>
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexDirection: 'column', gap: '1rem' }}>
                <MessageSquare size={48} opacity={0.2} />
                Select a staff member to start communicating.
              </div>
            )}
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
                      <option value="Logistics">Logistics</option>
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
              <h2 className="modal-title">Edit User Permissions</h2>
              <button className="modal-close" onClick={() => setEditingUser(null)}>×</button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="modal-body">
                <div className="form-group mb-1">
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-input" required value={editingUser.name} onChange={e => setEditingUser({...editingUser, name: e.target.value})} />
                </div>
                <div className="form-row mb-1">
                  <div className="form-group">
                    <label className="form-label">Role</label>
                    <select className="form-input" value={editingUser.role} onChange={e => setEditingUser({...editingUser, role: e.target.value})} disabled={editingUser.role === 'superadmin'}>
                      {editingUser.role === 'superadmin' && <option value="superadmin">Superadmin</option>}
                      <option value="staff">Staff</option>
                      <option value="manager">Manager</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setEditingUser(null)}>Cancel</button>
                <button type="submit" className="btn btn-gold" style={{ background: 'var(--gold)', color: '#000', fontWeight: 'bold' }}>Save Changes</button>
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
