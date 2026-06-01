import { useState } from 'react';
import { appointments } from '../data/mockData';
import { Calendar, Clock, MapPin, CheckCircle, XCircle, Search, X, Save } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function StoreAppointments() {
  const { showToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [appointmentsList, setAppointmentsList] = useState(appointments);
  const [form, setForm] = useState({ customer: '', type: 'Bridal Consultation', date: '', time: '10:00', location: 'Mumbai HQ (VIP Lounge)' });

  const filteredAppointments = appointmentsList.filter(a => 
    a.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleConfirm = (id) => {
    setAppointmentsList(appointmentsList.map(a => a.id === id ? { ...a, status: 'confirmed' } : a));
    showToast('Appointment confirmed successfully!');
  };

  const handleCancel = (id) => {
    setAppointmentsList(appointmentsList.map(a => a.id === id ? { ...a, status: 'cancelled' } : a));
    showToast('Appointment cancelled.', 'error');
  };

  const handleBook = (e) => {
    e.preventDefault();
    const newApt = {
      id: `APT-${Math.floor(1000 + Math.random() * 9000)}`,
      ...form,
      status: 'confirmed'
    };
    setAppointmentsList([newApt, ...appointmentsList]);
    showToast(`Appointment scheduled for ${form.customer}!`);
    setModalOpen(false);
    setForm({ customer: '', type: 'Bridal Consultation', date: '', time: '10:00', location: 'Mumbai HQ (VIP Lounge)' });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Store Appointments</h1>
          <p className="page-subtitle">Manage customer visits for consultations, trials, and custom designs.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-gold" style={{ color: '#FFFFFF', fontWeight: 'bold' }} onClick={() => setModalOpen(true)}>+ Schedule Visit</button>
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
                    <span className={`badge badge-${apt.status === 'confirmed' ? 'active' : apt.status === 'cancelled' ? 'danger' : 'pending'}`}>
                      {apt.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      {apt.status !== 'confirmed' && apt.status !== 'cancelled' && (
                        <button className="btn btn-icon btn-outline" title="Confirm" onClick={() => handleConfirm(apt.id)} style={{ color: 'var(--status-green)', borderColor: 'var(--status-green)' }}>
                          <CheckCircle size={14} />
                        </button>
                      )}
                      {apt.status !== 'cancelled' && (
                        <button className="btn btn-icon btn-outline" title="Cancel" onClick={() => handleCancel(apt.id)} style={{ color: 'var(--status-red)', borderColor: 'var(--status-red)' }}>
                          <XCircle size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-box" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Schedule Store Visit</h3>
              <button className="modal-close" onClick={() => setModalOpen(false)}><X size={16} /></button>
            </div>
            
            <form onSubmit={handleBook} className="modal-body">
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Customer Name</label>
                <input type="text" required className="form-input" value={form.customer} onChange={e => setForm({...form, customer: e.target.value})} />
              </div>
              
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Consultation Type</label>
                <select className="form-input" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                  <option>Bridal Consultation</option>
                  <option>Jewellery Trial</option>
                  <option>Virtual Video Tour</option>
                  <option>Gold Exchange/Buyback</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Date</label>
                  <input type="date" required className="form-input" value={form.date} onChange={e => setForm({...form, date: e.target.value})} min={new Date().toISOString().split('T')[0]} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Time</label>
                  <input type="time" required className="form-input" value={form.time} onChange={e => setForm({...form, time: e.target.value})} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label>Location</label>
                <select className="form-input" value={form.location} onChange={e => setForm({...form, location: e.target.value})}>
                  <option>Mumbai HQ (VIP Lounge)</option>
                  <option>Delhi Flagship Store</option>
                  <option>Bangalore Studio</option>
                  <option>Virtual Meeting (Zoom)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-gold" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#FFFFFF', fontWeight: 'bold' }}>
                  <Save size={14} /> Schedule Visit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
