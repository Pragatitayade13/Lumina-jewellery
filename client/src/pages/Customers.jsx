import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Search, Plus, Phone, Mail, ShoppingBag, Star, X, Edit2 } from 'lucide-react';

const DEMO_CUSTOMERS = [
  { id: 1, name: 'Priya Sharma',    email: 'priya@email.com',   phone: '+91 98765 43210', orders: 14, totalSpent: 840000, lastOrder: '2024-08-12', status: 'VIP',     city: 'Mumbai'  },
  { id: 2, name: 'Rajan Mehta',     email: 'rajan@email.com',   phone: '+91 91234 56789', orders: 9,  totalSpent: 1210000,lastOrder: '2024-08-07', status: 'VIP',     city: 'Delhi'   },
  { id: 3, name: 'Sunita Agarwal',  email: 'sunita@email.com',  phone: '+91 98001 23456', orders: 21, totalSpent: 460000, lastOrder: '2024-08-13', status: 'Regular', city: 'Pune'    },
  { id: 4, name: 'Arjun Verma',     email: 'arjun@email.com',   phone: '+91 99887 76655', orders: 6,  totalSpent: 980000, lastOrder: '2024-08-05', status: 'VIP',     city: 'Chennai' },
  { id: 5, name: 'Meera Pillai',    email: 'meera@email.com',   phone: '+91 97766 55443', orders: 17, totalSpent: 620000, lastOrder: '2024-08-10', status: 'Regular', city: 'Kochi'   },
  { id: 6, name: 'Deepak Joshi',    email: 'deepak@email.com',  phone: '+91 96655 44332', orders: 3,  totalSpent: 145000, lastOrder: '2024-07-28', status: 'New',     city: 'Jaipur'  },
  { id: 7, name: 'Kavita Nair',     email: 'kavita@email.com',  phone: '+91 95544 33221', orders: 8,  totalSpent: 380000, lastOrder: '2024-08-01', status: 'Regular', city: 'Hyderabad'},
  { id: 8, name: 'Vikram Singh',    email: 'vikram@email.com',  phone: '+91 94433 22110', orders: 1,  totalSpent: 68000,  lastOrder: '2024-08-11', status: 'New',     city: 'Kolkata' },
];

const statusColors = { VIP: 'badge-gold', Regular: 'badge-blue', New: 'badge-green' };

const CustomerModal = ({ customer, onClose }) => (
  <div className="admin-modal-overlay" onClick={onClose}>
    <div className="admin-modal" onClick={e => e.stopPropagation()}>
      <div className="admin-modal-header">
        <h2 className="admin-modal-title">Customer Profile</h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(232,224,208,0.5)', cursor: 'pointer', padding: 4 }}>
          <X size={18} />
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #d4af37, #aa851c)', color: '#0a0a0c', fontWeight: 800, fontSize: '1.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Playfair Display, serif' }}>
          {customer.name[0]}
        </div>
        <div>
          <h3 style={{ margin: 0, fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', color: '#f0ebe0' }}>{customer.name}</h3>
          <span className={`badge ${statusColors[customer.status]}`} style={{ marginTop: 4 }}>{customer.status} Client</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
        {[
          { label: 'Total Orders', value: customer.orders, icon: ShoppingBag },
          { label: 'Total Spent', value: `₹${customer.totalSpent.toLocaleString('en-IN')}`, icon: Star },
          { label: 'Phone', value: customer.phone, icon: Phone },
          { label: 'City', value: customer.city, icon: null },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '1rem' }}>
            <p style={{ margin: '0 0 0.25rem', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(232,224,208,0.35)' }}>{label}</p>
            <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#f0ebe0' }}>{value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', flexDirection: 'column' }}>
        <a href={`mailto:${customer.email}`} className="admin-btn admin-btn-gold" style={{ justifyContent: 'center' }}>
          <Mail size={14} /> Send Email
        </a>
        <a href={`tel:${customer.phone}`} className="admin-btn admin-btn-outline" style={{ justifyContent: 'center' }}>
          <Phone size={14} /> Call Customer
        </a>
      </div>
    </div>
  </div>
);

const Customers = () => {
  const { token } = useSelector(state => state.auth);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState(null);

  const customers = DEMO_CUSTOMERS;

  const filtered = customers.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
                        c.email.toLowerCase().includes(search.toLowerCase()) ||
                        c.city.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' || c.status === filter;
    return matchSearch && matchFilter;
  });

  const stats = {
    total: customers.length,
    vip: customers.filter(c => c.status === 'VIP').length,
    newThisMonth: customers.filter(c => c.status === 'New').length,
    avgSpend: Math.round(customers.reduce((a, c) => a + c.totalSpent, 0) / customers.length),
  };

  return (
    <div className="admin-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">Manage your client relationships</p>
        </div>
        <button className="admin-btn admin-btn-gold" id="add-customer-btn">
          <Plus size={15} /> Add Customer
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Clients', value: stats.total },
          { label: 'VIP Clients', value: stats.vip },
          { label: 'New This Month', value: stats.newThisMonth },
          { label: 'Avg. Lifetime Value', value: `₹${stats.avgSpend.toLocaleString('en-IN')}` },
        ].map(s => (
          <div key={s.label} className="kpi-card-admin" style={{ padding: '1.1rem 1.25rem' }}>
            <p className="kpi-label-admin">{s.label}</p>
            <p className="kpi-value-admin" style={{ fontSize: '1.4rem' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="admin-search">
          <Search size={14} style={{ color: 'rgba(232,224,208,0.35)', flexShrink: 0 }} />
          <input placeholder="Search by name, email, city…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {['All', 'VIP', 'Regular', 'New'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '0.45rem 0.9rem', borderRadius: 8, fontSize: '0.75rem', fontWeight: 600,
                cursor: 'pointer', border: 'none',
                background: filter === f ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.04)',
                color: filter === f ? '#d4af37' : 'rgba(232,224,208,0.4)',
                transition: 'all 0.2s',
              }}
            >{f}</button>
          ))}
        </div>
        <p style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'rgba(232,224,208,0.35)' }}>
          {filtered.length} client{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Table */}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Contact</th>
              <th>City</th>
              <th>Orders</th>
              <th>Total Spent</th>
              <th>Last Order</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <div className="admin-empty">
                    <div className="admin-empty-icon">👤</div>
                    <h3>No customers found</h3>
                    <p>Try adjusting your search or filters</p>
                  </div>
                </td>
              </tr>
            ) : filtered.map(c => (
              <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(c)}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #d4af37, #aa851c)', color: '#0a0a0c', fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: 'Playfair Display, serif' }}>
                      {c.name[0]}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, color: '#f0ebe0', fontSize: '0.85rem' }}>{c.name}</p>
                      <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(232,224,208,0.4)' }}>{c.email}</p>
                    </div>
                  </div>
                </td>
                <td style={{ fontSize: '0.8rem' }}>{c.phone}</td>
                <td style={{ fontSize: '0.8rem' }}>{c.city}</td>
                <td style={{ fontWeight: 700, color: '#f0ebe0' }}>{c.orders}</td>
                <td style={{ fontWeight: 700, color: '#f3d078' }}>₹{c.totalSpent.toLocaleString('en-IN')}</td>
                <td style={{ fontSize: '0.78rem', color: 'rgba(232,224,208,0.45)' }}>{c.lastOrder}</td>
                <td><span className={`badge ${statusColors[c.status]}`}>{c.status}</span></td>
                <td>
                  <button onClick={e => { e.stopPropagation(); setSelected(c); }} style={{ background: 'none', border: 'none', color: 'rgba(232,224,208,0.4)', cursor: 'pointer', padding: 4, borderRadius: 6 }}>
                    <Edit2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && <CustomerModal customer={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

export default Customers;
