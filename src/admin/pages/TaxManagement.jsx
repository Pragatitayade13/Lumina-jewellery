import { Receipt, FileText, Download } from 'lucide-react';

export default function TaxManagement() {
  const taxRecords = [
    { id: '#INV-88912', date: '27 May 2026', amount: 285000, gstPerc: 3, gstAmount: 8550, state: 'Maharashtra', type: 'CGST+SGST' },
    { id: '#INV-88911', date: '26 May 2026', amount: 45000, gstPerc: 3, gstAmount: 1350, state: 'Delhi', type: 'IGST' },
    { id: '#INV-88910', date: '25 May 2026', amount: 120000, gstPerc: 3, gstAmount: 3600, state: 'Karnataka', type: 'IGST' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Tax & Compliance</h1>
          <p className="page-subtitle">Manage GST configurations, view tax summaries, and generate filing reports.</p>
        </div>
      </div>

      <div className="grid-3 mb-15">
        <div className="admin-card">
          <div className="card-header" style={{ marginBottom: '1rem' }}>
            <h3 className="card-title" style={{ fontSize: '1rem' }}>Current GST Rules (India)</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'var(--surface)', borderRadius: '4px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Gold Jewellery</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>3%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'var(--surface)', borderRadius: '4px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Diamond Jewellery</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>3%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'var(--surface)', borderRadius: '4px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Making Charges</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>5%</span>
            </div>
            <button className="btn btn-outline btn-sm" style={{ marginTop: '0.5rem' }}>Update Tax Brackets</button>
          </div>
        </div>

        <div className="admin-card" style={{ gridColumn: 'span 2' }}>
           <div className="card-header">
            <h3 className="card-title" style={{ fontSize: '1rem' }}>Monthly Tax Summary (May 2026)</h3>
            <button className="btn btn-gold btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><FileText size={14} /> GSTR-3B Report</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
             <div style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
               <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Total IGST Collected</div>
               <div style={{ fontSize: '1.8rem', fontWeight: 600, fontFamily: 'Inter' }}>₹4.2L</div>
             </div>
             <div style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
               <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Total CGST Collected</div>
               <div style={{ fontSize: '1.8rem', fontWeight: 600, fontFamily: 'Inter' }}>₹1.8L</div>
             </div>
             <div style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
               <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Total SGST Collected</div>
               <div style={{ fontSize: '1.8rem', fontWeight: 600, fontFamily: 'Inter' }}>₹1.8L</div>
             </div>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <div className="card-header">
          <div className="card-title">Recent Tax Invoices</div>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Date</th>
                <th>Base Amount</th>
                <th>GST %</th>
                <th>Tax Type</th>
                <th>Tax Amount</th>
                <th>Total Billed</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {taxRecords.map(record => (
                <tr key={record.id}>
                  <td style={{ fontFamily: 'monospace', color: 'var(--gold)' }}>{record.id}</td>
                  <td>{record.date}</td>
                  <td style={{ fontWeight: 600 }}>₹{record.amount.toLocaleString('en-IN')}</td>
                  <td>{record.gstPerc}%</td>
                  <td><span className="badge badge-info">{record.type}</span></td>
                  <td style={{ color: 'var(--status-orange)' }}>₹{record.gstAmount.toLocaleString('en-IN')}</td>
                  <td style={{ fontWeight: 700 }}>₹{(record.amount + record.gstAmount).toLocaleString('en-IN')}</td>
                  <td>
                    <button className="btn btn-icon btn-outline" title="Download Tax Invoice">
                      <Download size={14} />
                    </button>
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
