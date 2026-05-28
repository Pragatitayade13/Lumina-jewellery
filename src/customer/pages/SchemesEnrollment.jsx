import { RefreshCcw, CheckCircle } from 'lucide-react';

export default function SchemesEnrollment() {
  const activeSchemes = [
    { id: '#SCH-901', plan: '11-Month Gold Scheme', installment: 5000, monthsPaid: 5, startDate: '01 Jan 2026' }
  ];

  return (
    <div>
      <div className="customer-card">
        <h2 className="card-title"><RefreshCcw /> Gold Savings Schemes</h2>
        <p style={{ color: 'var(--text-muted)' }}>Invest in your future jewellery purchases with our flexible monthly savings plans.</p>
      </div>

      <div className="customer-card">
        <h3 className="card-title" style={{ fontSize: '1.1rem' }}>Your Active Schemes</h3>
        {activeSchemes.length === 0 ? (
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
                {activeSchemes.map((scheme) => (
                  <tr key={scheme.id}>
                    <td style={{ fontFamily: 'monospace' }}>{scheme.id}</td>
                    <td style={{ fontWeight: 500 }}>{scheme.plan}</td>
                    <td>{scheme.startDate}</td>
                    <td style={{ fontWeight: 600 }}>₹{scheme.installment.toLocaleString()}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                         <div style={{ width: '100px', height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${(scheme.monthsPaid / 11) * 100}%`, height: '100%', background: 'var(--gold)' }}></div>
                         </div>
                         <span style={{ fontSize: '0.75rem', fontFamily: 'Inter' }}>{scheme.monthsPaid}/11 Months</span>
                      </div>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-gold">Pay Next Installment</button>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ background: '#111', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <h4 style={{ margin: '0 0 0.5rem 0' }}>Golden Harvest</h4>
            <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--gold)', marginBottom: '1rem', fontFamily: 'Inter' }}>₹10,000 / mo</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <li style={{ marginBottom: '0.5rem', display: 'flex', gap: '0.5rem' }}><CheckCircle size={14} color="var(--gold)" /> 11 Months</li>
              <li style={{ display: 'flex', gap: '0.5rem' }}><CheckCircle size={14} color="var(--gold)" /> Zero Making Charges</li>
            </ul>
            <button className="btn btn-outline" style={{ width: '100%' }}>Select Plan</button>
          </div>
          <div style={{ background: '#111', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--gold)', position: 'relative' }}>
            <span className="badge badge-gold" style={{ position: 'absolute', top: '-10px', right: '10px' }}>POPULAR</span>
            <h4 style={{ margin: '0 0 0.5rem 0' }}>Diamond Savings</h4>
            <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--gold)', marginBottom: '1rem', fontFamily: 'Inter' }}>₹25,000 / mo</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <li style={{ marginBottom: '0.5rem', display: 'flex', gap: '0.5rem' }}><CheckCircle size={14} color="var(--gold)" /> 11 Months</li>
              <li style={{ display: 'flex', gap: '0.5rem' }}><CheckCircle size={14} color="var(--gold)" /> Free Insured Delivery</li>
            </ul>
            <button className="btn btn-gold" style={{ width: '100%' }}>Select Plan</button>
          </div>
        </div>
      </div>
    </div>
  );
}
