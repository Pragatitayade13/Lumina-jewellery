import { useState } from 'react';
import { appointments } from '../data/mockData';
import { Calendar, Clock, MapPin, CheckCircle, XCircle, Search } from 'lucide-react';

export default function StoreAppointments() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAppointments = appointments.filter(a => 
    a.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Store Appointments</h1>
          <p className="page-subtitle">Manage customer visits for consultations, trials, and custom designs.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-gold">+ Schedule Visit</button>
        </div>
      </div>

      <div className="admin-card">
        <div className="card-header">
          <div className="card-title">Upcoming Appointments</div>
          <div className="filter-search" style={{ margin: 0, width: '250px' }}>
            <Search size={14} />
            <input 
              placeholder="Search by name or type..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Type</th>
                <th>Date & Time</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((apt) => (
                <tr key={apt.id}>
                  <td style={{ fontFamily: 'Inter, monospace', fontSize: '0.85rem' }}>{apt.id}</td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{apt.customer}</td>
                  <td>{apt.type}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                      <Calendar size={12} color="var(--text-muted)" /> {apt.date}
                      <Clock size={12} color="var(--text-muted)" style={{ marginLeft: '0.5rem' }} /> {apt.time}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem' }}>
                      <MapPin size={12} color="var(--text-muted)" /> {apt.location}
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-${apt.status === 'confirmed' ? 'active' : 'pending'}`}>
                      {apt.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="btn btn-icon btn-outline" title="Confirm" style={{ color: 'var(--status-green)', borderColor: 'var(--status-green)' }}>
                        <CheckCircle size={14} />
                      </button>
                      <button className="btn btn-icon btn-outline" title="Cancel" style={{ color: 'var(--status-red)', borderColor: 'var(--status-red)' }}>
                        <XCircle size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
