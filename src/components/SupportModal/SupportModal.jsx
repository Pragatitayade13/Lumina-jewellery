import { useState } from 'react';
import { X, Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useSupportTickets } from '../../hooks/useSupportTickets';
import './SupportModal.css';

export default function SupportModal({ isOpen, onClose }) {
  const { addTicket } = useSupportTickets();
  const [formData, setFormData] = useState({
    customer: '',
    email: '',
    subject: '',
    priority: 'low',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      // Send email automatically via FormSubmit API
      const ownerEmail = 'luminajewels.app@gmail.com';
      await fetch(`https://formsubmit.co/ajax/${ownerEmail}`, {
        method: "POST",
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: formData.customer,
          email: formData.email,
          _subject: `New Support Ticket: ${formData.subject}`,
          priority: formData.priority,
          message: formData.message
        })
      });

      // Try to save to database, but don't fail if it doesn't work (e.g. Firebase rules)
      try {
        await addTicket(formData);
      } catch (dbErr) {
        console.warn("Failed to save ticket to database.", dbErr);
      }
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setFormData({ customer: '', email: '', subject: '', priority: 'low', message: '' });
        onClose();
      }, 3000);
    } catch (err) {
      setError('An unexpected error occurred while sending the email. Please try again.');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="support-modal-overlay" onClick={onClose}>
      <div className="support-modal-box" onClick={e => e.stopPropagation()}>
        <button className="support-modal-close" onClick={onClose}><X size={20} /></button>
        
        <div className="support-modal-header">
          <h2>Contact Support</h2>
          <p>We're here to help. Describe your issue below and our team will get back to you shortly.</p>
        </div>

        {success ? (
          <div className="support-success">
            <CheckCircle2 size={48} color="var(--gold)" />
            <h3>Ticket Submitted Successfully!</h3>
            <p>Our support team has received your request and will contact you via email soon.</p>
          </div>
        ) : (
          <form className="support-form" onSubmit={handleSubmit}>
            {error && <div className="support-error"><AlertCircle size={14} /> {error}</div>}
            
            <div className="form-group-row">
              <div className="form-group">
                <label>Your Name *</label>
                <input 
                  type="text" 
                  required 
                  value={formData.customer} 
                  onChange={e => setFormData({...formData, customer: e.target.value})}
                  placeholder="e.g. Ananya Gupta"
                />
              </div>
              <div className="form-group">
                <label>Email Address *</label>
                <input 
                  type="email" 
                  required 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  placeholder="hello@example.com"
                />
              </div>
            </div>

            <div className="form-group-row">
              <div className="form-group">
                <label>Subject *</label>
                <input 
                  type="text" 
                  required 
                  value={formData.subject} 
                  onChange={e => setFormData({...formData, subject: e.target.value})}
                  placeholder="e.g. Order delivery delay"
                />
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select 
                  value={formData.priority} 
                  onChange={e => setFormData({...formData, priority: e.target.value})}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent (Account/Payment Issues)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Message *</label>
              <textarea 
                required 
                rows="4" 
                value={formData.message} 
                onChange={e => setFormData({...formData, message: e.target.value})}
                placeholder="Describe your issue in detail..."
              />
            </div>

            <button type="submit" className="btn btn-gold w-100" disabled={isSubmitting} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
              {isSubmitting ? 'Submitting...' : <><Send size={16} /> Submit Ticket</>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
