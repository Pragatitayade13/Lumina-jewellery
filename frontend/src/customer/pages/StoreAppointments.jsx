import { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Video, X, Save } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAppointments } from '../../hooks/useAppointments';

export default function StoreAppointments() {
  const { user, showToast } = useApp();
  const { appointments, loading, addAppointment, updateAppointment, deleteAppointment } = useAppointments(user?.uid);
  
  const [modal, setModal] = useState({ isOpen: false, item: null });
  const [form, setForm] = useState({ type: 'Bridal Consultation', date: '', time: '10:00', location: 'Mumbai HQ (VIP Lounge)' });
  const [isSaving, setIsSaving] = useState(false);

  // Open modal for Create or Edit
  const openModal = (item = null) => {
    if (item) {
      setForm({ type: item.type, date: item.date, time: item.time, location: item.location });
    } else {
      setForm({ type: 'Bridal Consultation', date: '', time: '10:00', location: 'Mumbai HQ (VIP Lounge)' });
    }
    setModal({ isOpen: true, item });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    try {
      if (modal.item) {
        await updateAppointment(modal.item.id, form);
        showToast("Appointment rescheduled successfully!");
      } else {
        await addAppointment({ ...form, status: 'confirmed' });
        showToast("Appointment booked successfully!");
      }
      setModal({ isOpen: false, item: null });
    } catch (err) {
      showToast(modal.item ? "Failed to reschedule" : "Failed to book appointment", "error");
    }
    setIsSaving(false);
  };

  const handleCancel = async (id) => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      try {
        await deleteAppointment(id);
        showToast("Appointment cancelled successfully");
      } catch (err) {
        showToast("Failed to cancel appointment", "error");
      }
    }
  };

  return (
    <div>
      <div className="customer-card">
        <h2 className="card-title"><Calendar /> Store Appointments</h2>
        <p style={{ color: 'var(--text-muted)' }}>Book an exclusive in-store consultation, jewellery trial, or a virtual video tour.</p>
        <button className="btn btn-gold" style={{ marginTop: '1.5rem' }} onClick={() => openModal()}>
          + Book New Appointment
        </button>
      </div>

      <div className="customer-card">
        <h3 className="card-title" style={{ fontSize: '1.1rem' }}>Upcoming Visits</h3>
        
        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading appointments...</p>
        ) : appointments.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>You have no upcoming appointments.</p>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {appointments.map(apt => (
              <div key={apt.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', background: '#111', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{apt.type}</h4>
                    <span className="badge badge-success">{apt.status.toUpperCase()}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Calendar size={14} /> {apt.date}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Clock size={14} /> {apt.time}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {apt.location.includes('Virtual') ? <Video size={14} /> : <MapPin size={14} />} 
                      {apt.location}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-outline btn-sm" onClick={() => openModal(apt)}>Reschedule</button>
                  <button className="btn btn-outline btn-sm" onClick={() => handleCancel(apt.id)} style={{ color: 'var(--status-red)', borderColor: 'var(--status-red)' }}>Cancel</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking / Reschedule Modal */}
      {modal.isOpen && (
        <div className="modal-overlay" style={{ zIndex: 9999, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-box" style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '500px', border: '1px solid var(--border-color)' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ color: 'var(--gold)' }}>{modal.item ? 'Reschedule Appointment' : 'Book New Appointment'}</h3>
              <button onClick={() => setModal({ isOpen: false, item: null })} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSave}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Consultation Type</label>
                <select className="form-input" required style={{ width: '100%', padding: '0.8rem', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '4px' }} 
                        value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                  <option value="Bridal Consultation">Bridal Consultation</option>
                  <option value="Jewellery Trial">Jewellery Trial</option>
                  <option value="Virtual Video Tour">Virtual Video Tour</option>
                  <option value="Gold Exchange/Buyback">Gold Exchange/Buyback</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Date</label>
                  <input type="date" required className="form-input" style={{ width: '100%', padding: '0.8rem', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '4px' }} 
                         value={form.date} onChange={e => setForm({...form, date: e.target.value})} min={new Date().toISOString().split('T')[0]} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Time</label>
                  <input type="time" required className="form-input" style={{ width: '100%', padding: '0.8rem', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '4px' }} 
                         value={form.time} onChange={e => setForm({...form, time: e.target.value})} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Location</label>
                <select className="form-input" required style={{ width: '100%', padding: '0.8rem', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '4px' }} 
                        value={form.location} onChange={e => setForm({...form, location: e.target.value})}>
                  <option value="Mumbai HQ (VIP Lounge)">Mumbai HQ (VIP Lounge)</option>
                  <option value="Delhi Flagship Store">Delhi Flagship Store</option>
                  <option value="Bangalore Studio">Bangalore Studio</option>
                  <option value="Virtual Meeting (Zoom)">Virtual Meeting (Zoom)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setModal({ isOpen: false, item: null })}>Cancel</button>
                <button type="submit" disabled={isSaving} className="btn btn-gold" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Save size={16} /> {isSaving ? 'Saving...' : 'Confirm Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
