import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Search, Plus, X, Shield, User, Phone, Mail } from 'lucide-react';

const ROLES = ['Owner', 'Manager', 'Salesperson', 'Accountant', 'Security'];
const ROLE_COLORS = {
  Owner: 'badge-gold', Manager: 'badge-blue', Salesperson: 'badge-green',
  Accountant: 'badge-yellow', Security: 'badge-gray',
};

const DEMO_STAFF = [
  { id: 1, name: 'Aryan Kapoor',   role: 'Owner',       email: 'aryan@luxeorbit.in',  phone: '+91 98765 11111', joined: '2020-01-01', status: 'Active',   sales: '₹42.5L' },
  { id: 2, name: 'Neha Sharma',    role: 'Manager',     email: 'neha@luxeorbit.in',   phone: '+91 98765 22222', joined: '2021-03-15', status: 'Active',   sales: '₹28.1L' },
  { id: 3, name: 'Rahul Gupta',    role: 'Salesperson', email: 'rahul@luxeorbit.in',  phone: '+91 98765 33333', joined: '2022-06-01', status: 'Active',   sales: '₹18.7L' },
  { id: 4, name: 'Pooja Mehta',    role: 'Salesperson', email: 'pooja@luxeorbit.in',  phone: '+91 98765 44444', joined: '2022-09-10', status: 'Active',   sales: '₹15.3L' },
  { id: 5, name: 'Suresh Iyer',    role: 'Accountant',  email: 'suresh@luxeorbit.in', phone: '+91 98765 55555', joined: '2021-07-20', status: 'Active',   sales: '—'     },
  { id: 6, name: 'Deepa Pillai',   role: 'Salesperson', email: 'deepa@luxeorbit.in',  phone: '+91 98765 66666', joined: '2023-02-01', status: 'Inactive', sales: '₹8.2L'  },
  { id: 7, name: 'Manoj Tiwari',   role: 'Security',    email: 'manoj@luxeorbit.in',  phone: '+91 98765 77777', joined: '2020-11-05', status: 'Active',   sales: '—'     },
];

const AddStaffModal = ({ onClose }) => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'Salesperson' });
  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={e => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h2 className="admin-modal-title">Add Staff Member</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(232,224,208,0.5)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>
        <div className="admin-form-group">
          <label className="admin-form-label">Full Name</label>
          <input className="admin-form-input" placeholder="e.g. Rahul Kumar" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
        </div>
        <div className="admin-form-group">
          <label className="admin-form-label">Email Address</label>
          <input className="admin-form-input" type="email" placeholder="email@domain.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="admin-form-group">
            <label className="admin-form-label">Phone</label>
            <input className="admin-form-input" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">Role</label>
            <select className="admin-form-input" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button className="admin-btn admin-btn-gold" style={{ flex: 1, justifyContent: 'center' }}>Add Member</button>
          <button className="admin-btn admin-btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

const Staff = () => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);

  const filtered = DEMO_STAFF.filter(s => {
    const match = s.name.toLowerCase().includes(search.toLowerCase()) || s.role.toLowerCase().includes(search.toLowerCase());
    const roleMatch = roleFilter === 'All' || s.role === roleFilter;
    return match && roleMatch;
  });

  return (
    <div className="admin-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Staff</h1>
          <p className="page-subtitle">Manage your team members and roles</p>
        </div>
        <button className="admin-btn admin-btn-gold" onClick={() => setShowModal(true)} id="add-staff-btn">
          <Plus size={15} /> Add Staff
        </button>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Staff',     value: DEMO_STAFF.length },
          { label: 'Active',          value: DEMO_STAFF.filter(s => s.status === 'Active').length },
          { label: 'Roles',           value: [...new Set(DEMO_STAFF.map(s => s.role))].length },
          { label: 'Top Performer',   value: 'Aryan Kapoor' },
        ].map(s => (
          <div key={s.label} className="kpi-card-admin" style={{ padding: '1.1rem 1.25rem' }}>
            <p className="kpi-label-admin">{s.label}</p>
            <p className="kpi-value-admin" style={{ fontSize: s.label === 'Top Performer' ? '0.95rem' : '1.4rem' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="admin-search">
          <Search size={14} style={{ color: 'rgba(232,224,208,0.35)', flexShrink: 0 }} />
          <input placeholder="Search by name or role…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {['All', ...ROLES].map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              style={{
                padding: '0.4rem 0.8rem', borderRadius: 8, fontSize: '0.72rem', fontWeight: 600,
                cursor: 'pointer', border: 'none',
                background: roleFilter === r ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.04)',
                color: roleFilter === r ? '#d4af37' : 'rgba(232,224,208,0.4)',
                transition: 'all 0.2s',
              }}
            >{r}</button>
          ))}
        </div>
      </div>

      {/* Staff Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
        {filtered.map(member => (
          <div key={member.id} className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.9rem' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: member.status === 'Active' ? 'linear-gradient(135deg, #d4af37, #aa851c)' : 'rgba(255,255,255,0.08)', color: member.status === 'Active' ? '#0a0a0c' : 'rgba(232,224,208,0.3)', fontWeight: 800, fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: 'Playfair Display, serif' }}>
                {member.name[0]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <p style={{ margin: 0, fontWeight: 700, color: '#f0ebe0', fontSize: '0.9rem' }}>{member.name}</p>
                  <span className={`badge ${member.status === 'Active' ? 'badge-green' : 'badge-gray'}`} style={{ fontSize: '0.6rem' }}>
                    {member.status}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                  <span className={`badge ${ROLE_COLORS[member.role]}`} style={{ fontSize: '0.6rem' }}>{member.role}</span>
                </div>
              </div>
            </div>

            <div className="admin-divider" style={{ margin: '0' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'rgba(232,224,208,0.5)' }}>
                <Mail size={12} /><span>{member.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'rgba(232,224,208,0.5)' }}>
                <Phone size={12} /><span>{member.phone}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ margin: 0, fontSize: '0.65rem', color: 'rgba(232,224,208,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Sales Generated</p>
                <p style={{ margin: 0, fontWeight: 700, color: '#f3d078', fontSize: '1rem' }}>{member.sales}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: '0.65rem', color: 'rgba(232,224,208,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Joined</p>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'rgba(232,224,208,0.55)' }}>{member.joined}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="admin-empty">
          <div className="admin-empty-icon">👤</div>
          <h3>No staff members found</h3>
          <p>Try adjusting your search filters</p>
        </div>
      )}

      {showModal && <AddStaffModal onClose={() => setShowModal(false)} />}
    </div>
  );
};

export default Staff;
