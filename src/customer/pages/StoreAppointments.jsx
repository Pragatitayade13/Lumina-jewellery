import { Calendar, MapPin, Clock, Video } from 'lucide-react';

export default function StoreAppointments() {
  const appointments = [
    { id: '#APT-501', type: 'Bridal Consultation', date: '30 May 2026', time: '14:00', location: 'Mumbai HQ (VIP Lounge)', status: 'confirmed' }
  ];

  return (
    <div>
      <div className="customer-card">
        <h2 className="card-title"><Calendar /> Store Appointments</h2>
        <p style={{ color: 'var(--text-muted)' }}>Book an exclusive in-store consultation, jewellery trial, or a virtual video tour.</p>
        <button className="btn btn-gold" style={{ marginTop: '1.5rem' }}>+ Book New Appointment</button>
      </div>

      <div className="customer-card">
        <h3 className="card-title" style={{ fontSize: '1.1rem' }}>Upcoming Visits</h3>
        {appointments.length === 0 ? (
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
                  <button className="btn btn-outline btn-sm">Reschedule</button>
                  <button className="btn btn-outline btn-sm" style={{ color: 'var(--status-red)', borderColor: 'var(--status-red)' }}>Cancel</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
