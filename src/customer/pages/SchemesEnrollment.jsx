import { useState } from 'react';
import { RefreshCcw, CheckCircle, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useSchemes } from '../../hooks/useSchemes';

export default function SchemesEnrollment() {
  const { user, showToast } = useApp();
  const { adminSchemes, userSchemes, loading, enrollInScheme, payInstallment } = useSchemes(user?.uid);
  
  const [enrollModal, setEnrollModal] = useState({ isOpen: false, plan: null });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleEnroll = async () => {
    if (!user) return showToast("Please login first", "error");
    setIsProcessing(true);
    try {
      await enrollInScheme(enrollModal.plan);
      showToast(`Successfully enrolled in ${enrollModal.plan.name}!`);
      setEnrollModal({ isOpen: false, plan: null });
    } catch (err) {
      showToast("Failed to enroll in scheme", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePay = async (scheme) => {
    setIsProcessing(true);
    try {
      await payInstallment(scheme.id, scheme.monthsPaid, scheme.durationMonths);
      showToast(`Payment successful for ${scheme.schemeId}!`);
    } catch (err) {
      showToast("Payment failed", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <div className="customer-card">
        <h2 className="card-title"><RefreshCcw /> Gold Savings Schemes</h2>
        <p style={{ color: 'var(--text-muted)' }}>Invest in your future jewellery purchases with our flexible monthly savings plans.</p>
      </div>

      <div className="customer-card">
        <h3 className="card-title" style={{ fontSize: '1.1rem' }}>Your Active Schemes</h3>
        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading your schemes...</p>
        ) : userSchemes.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>You do not have any active schemes.</p>
        ) : (
          <div className="customer-table-wrap">
            <table className="customer-table">
              <thead>
                <tr>
                  <th>Scheme ID</th>
                  <th>Plan Name</th>
                  <th>Start Date</th>
                  <th>Monthly Installment</th>
                  <th>Progress</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {userSchemes.map((scheme) => (
                  <tr key={scheme.id}>
                    <td style={{ fontFamily: 'monospace' }}>{scheme.schemeId}</td>
                    <td style={{ fontWeight: 500 }}>{scheme.planName}</td>
                    <td>{scheme.startDate}</td>
                    <td style={{ fontWeight: 600 }}>₹{scheme.installment.toLocaleString()}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                         <div style={{ width: '100px', height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${(scheme.monthsPaid / scheme.durationMonths) * 100}%`, height: '100%', background: scheme.status === 'matured' ? 'var(--status-green)' : 'var(--gold)' }}></div>
                         </div>
                         <span style={{ fontSize: '0.75rem', fontFamily: 'Inter', color: scheme.status === 'matured' ? 'var(--status-green)' : 'inherit' }}>
                           {scheme.monthsPaid}/{scheme.durationMonths} Months
                         </span>
                      </div>
                    </td>
                    <td>
                      {scheme.status === 'matured' ? (
                        <span className="badge badge-success">MATURED</span>
                      ) : (
                        <button 
                          className="btn btn-sm btn-gold" 
                          onClick={() => handlePay(scheme)}
                          disabled={isProcessing}
                        >
                          Pay Installment
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="customer-card" style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.1), transparent)' }}>
        <h3 style={{ margin: '0 0 1rem 0', color: 'var(--gold)' }}>Enroll in a New Scheme</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: '600px' }}>
          Pay fixed monthly installments for 11 months, and we will pay the 12th installment! Redeem the total accumulated amount to buy your favorite jewellery.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          
          {adminSchemes.map((plan) => (
            <div key={plan.id} style={{ background: '#111', padding: '1.5rem', borderRadius: '8px', border: plan.isPopular ? '1px solid var(--gold)' : '1px solid var(--border-color)', position: 'relative' }}>
              {plan.isPopular && <span className="badge badge-gold" style={{ position: 'absolute', top: '-10px', right: '10px' }}>POPULAR</span>}
              <h4 style={{ margin: '0 0 0.5rem 0' }}>{plan.name}</h4>
              <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--gold)', marginBottom: '1rem', fontFamily: 'Inter' }}>
                ₹{plan.installment.toLocaleString()} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ mo</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <li style={{ marginBottom: '0.5rem', display: 'flex', gap: '0.5rem' }}><CheckCircle size={14} color="var(--gold)" /> {plan.durationMonths} Months Duration</li>
                {plan.benefits && plan.benefits.map((b, i) => (
                  <li key={i} style={{ marginBottom: '0.5rem', display: 'flex', gap: '0.5rem' }}><CheckCircle size={14} color="var(--gold)" /> {b}</li>
                ))}
              </ul>
              <button 
                className={plan.isPopular ? "btn btn-gold" : "btn btn-outline"} 
                style={{ width: '100%' }}
                onClick={() => setEnrollModal({ isOpen: true, plan })}
              >
                Select Plan
              </button>
            </div>
          ))}

        </div>
      </div>

      {/* Enroll Modal */}
      {enrollModal.isOpen && enrollModal.plan && (
        <div className="modal-overlay" style={{ zIndex: 9999, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-box" style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '400px', border: '1px solid var(--border-color)' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ color: 'var(--gold)', margin: 0 }}>Confirm Enrollment</h3>
              <button onClick={() => setEnrollModal({ isOpen: false, plan: null })} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20}/></button>
            </div>
            
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              You are enrolling in the <strong>{enrollModal.plan.name}</strong>. This requires a monthly commitment of <strong style={{ color: 'var(--gold)' }}>₹{enrollModal.plan.installment.toLocaleString()}</strong> for {enrollModal.plan.durationMonths} months.
            </p>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button className="btn btn-outline" onClick={() => setEnrollModal({ isOpen: false, plan: null })}>Cancel</button>
              <button className="btn btn-gold" onClick={handleEnroll} disabled={isProcessing}>
                {isProcessing ? 'Enrolling...' : 'Confirm Enrollment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
