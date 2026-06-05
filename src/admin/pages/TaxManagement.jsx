import { useState, useEffect } from 'react';
import { Receipt, FileText, Download, Calculator, Plus, Loader } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTaxes } from '../../hooks/useTaxes';
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';

export default function TaxManagement() {
  const { user, showToast } = useApp();
  const { taxSettings, loading: taxLoading, updateTaxSettings, calculateTax } = useTaxes();
  
  const [taxRecords, setTaxRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(true);

  // Month filter for GSTR-3B: default to current month
  const now = new Date();
  const [filterMonth, setFilterMonth] = useState(now.getMonth() + 1); // 1-12
  const [filterYear, setFilterYear] = useState(now.getFullYear());

  useEffect(() => {
    if (!db) {
      setLoadingRecords(false);
      return;
    }
    const q = query(collection(db, 'tax_transactions'), orderBy('createdAt', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const records = [];
      snapshot.forEach(doc => {
        records.push({ id: doc.id, ...doc.data() });
      });
      setTaxRecords(records);
      setLoadingRecords(false);
    }, (err) => {
      console.error(err);
      setLoadingRecords(false);
    });
    return () => unsubscribe();
  }, []);

  const newTxState = taxSettings.storeOriginState || 'Maharashtra';
  const [newTx, setNewTx] = useState({ amount: '', state: newTxState, type: 'gold' });
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [tempRates, setTempRates] = useState({ gold: 3, diamond: 3, silver: 3, making: 5 });

  // Filter records to the selected month
  const filteredRecords = taxRecords.filter(rec => {
    if (!rec.date) return false;
    const recDate = new Date(rec.date);
    return recDate.getMonth() + 1 === filterMonth && recDate.getFullYear() === filterYear;
  });

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const calculateGstDetails = () => {
    if (!newTx.amount) return { total: 0, cgst: 0, sgst: 0, igst: 0, rate: 0, type: '' };
    return calculateTax(parseFloat(newTx.amount), newTx.type, newTx.state);
  };

  const handleAddTransaction = async () => {
    if (!newTx.amount) return;
    const details = calculateGstDetails();
    
    const newRecord = {
      displayId: `#INV-${Math.floor(Math.random() * 10000) + 80000}`,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      amount: parseFloat(newTx.amount),
      gstPerc: details.rate,
      gstAmount: details.total,
      cgst: details.cgst,
      sgst: details.sgst,
      igst: details.igst,
      state: newTx.state,
      type: details.type,
      createdAt: serverTimestamp(),
      source: 'manual_calculator'
    };
    
    try {
      await addDoc(collection(db, 'tax_transactions'), newRecord);
      setNewTx({ amount: '', state: taxSettings.storeOriginState || 'Maharashtra', type: 'gold' });
      showToast('Tax Transaction Recorded!');
    } catch (err) {
      showToast('Failed to record transaction', 'error');
    }
  };

  const handleUpdateBrackets = async () => {
    const success = await updateTaxSettings(tempRates, user);
    if (success) {
      setShowUpdateModal(false);
      showToast('Tax configuration updated successfully (Regional rules applied)');
    } else {
      showToast('Failed to update tax brackets', 'error');
    }
  };

  const handleDownloadInvoice = (record) => {
    showToast(`Generating Tax Invoice ${record.id}...`);
    setTimeout(() => {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Tax Invoice ${record.id}</title>
            <style>
              body { font-family: Arial; padding: 2rem; max-width: 800px; margin: 0 auto; color: #333; }
              table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
              th, td { border: 1px solid #ccc; padding: 10px; text-align: left; }
              .header { text-align: center; margin-bottom: 2rem; border-bottom: 2px solid #c9a84c; padding-bottom: 1rem; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 style="color: #c9a84c; margin:0;">LUMINA JEWELS</h1>
              <p>TAX INVOICE (GST Compliant)</p>
            </div>
            <p><strong>Invoice No:</strong> ${record.id}</p>
            <p><strong>Date:</strong> ${record.date}</p>
            <p><strong>Place of Supply:</strong> ${record.state}</p>
            <table>
              <tr><th>Description</th><th>Base Amount</th><th>GST Rate</th><th>Tax Type</th><th>Tax Amount</th><th>Total</th></tr>
              <tr>
                <td>Jewellery Goods</td>
                <td>₹${record.amount.toLocaleString('en-IN')}</td>
                <td>${record.gstPerc}%</td>
                <td>${record.type}</td>
                <td>₹${record.gstAmount.toLocaleString('en-IN')}</td>
                <td><strong>₹${(record.amount + record.gstAmount).toLocaleString('en-IN')}</strong></td>
              </tr>
            </table>
            <p style="text-align: center; margin-top: 3rem; font-size: 0.8rem; color: #888;">Computer Generated Tax Invoice</p>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }, 500);
  };

  const handleGSTR3B = () => {
    const periodLabel = `${monthNames[filterMonth - 1]} ${filterYear}`;
    const reportRecords = filteredRecords;
    showToast(`Generating GSTR-3B Filing Report for ${periodLabel}...`);
    setTimeout(() => {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>GSTR-3B Report — ${periodLabel}</title>
            <style>body { font-family: Arial; padding: 2rem; }</style>
          </head>
          <body>
            <h2 style="color: #c9a84c;">GSTR-3B Filing Summary</h2>
            <p><strong>Filing Period:</strong> ${periodLabel}</p>
            <p><strong>GSTIN:</strong> 27AAACL1234F1Z5</p>
            <p><strong>Total Outward Supplies (Base):</strong> ₹${reportRecords.reduce((a,b)=>a+(b.amount||0),0).toLocaleString('en-IN')}</p>
            <p><strong>Total IGST Liability:</strong> ₹${reportRecords.reduce((a,b)=>a+(b.igst||0),0).toLocaleString('en-IN')}</p>
            <p><strong>Total CGST Liability:</strong> ₹${reportRecords.reduce((a,b)=>a+(b.cgst||0),0).toLocaleString('en-IN')}</p>
            <p><strong>Total SGST Liability:</strong> ₹${reportRecords.reduce((a,b)=>a+(b.sgst||0),0).toLocaleString('en-IN')}</p>
            <p><strong>Total Tax Liability:</strong> ₹${reportRecords.reduce((a,b)=>a+(b.gstAmount||0),0).toLocaleString('en-IN')}</p>
            <p><em>${reportRecords.length} transactions included in this period.</em></p>
            <p>Ready for GST Portal upload.</p>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }, 500);
  };

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
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{taxSettings.gold}%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'var(--surface)', borderRadius: '4px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Diamond Jewellery</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{taxSettings.diamond}%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'var(--surface)', borderRadius: '4px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Silver Jewellery</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{taxSettings.silver}%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'var(--surface)', borderRadius: '4px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Making Charges</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{taxSettings.making}%</span>
            </div>
            <button className="btn btn-outline btn-sm" style={{ marginTop: '0.5rem' }} onClick={() => {setTempRates(taxSettings); setShowUpdateModal(true);}}>Update Tax Brackets</button>
          </div>
        </div>

        <div className="admin-card" style={{ gridColumn: 'span 2' }}>
           <div className="card-header">
            <div>
              <h3 className="card-title" style={{ fontSize: '1rem' }}>Monthly Tax Summary</h3>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.3rem' }}>
                Period:
                <select value={filterMonth} onChange={e => setFilterMonth(Number(e.target.value))} style={{ padding: '0.2rem 0.4rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-primary)' }}>
                  {monthNames.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                </select>
                <select value={filterYear} onChange={e => setFilterYear(Number(e.target.value))} style={{ padding: '0.2rem 0.4rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-primary)' }}>
                  {[2024, 2025, 2026].map(y => <option key={y}>{y}</option>)}
                </select>
                <span style={{ color: 'var(--text-muted)' }}>({filteredRecords.length} records)</span>
              </div>
            </div>
            <button className="btn btn-gold btn-sm" onClick={handleGSTR3B} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#FFFFFF', fontWeight: 'bold' }}><FileText size={14} /> GSTR-3B Report</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
               <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Total IGST Collected</div>
               <div style={{ fontSize: '1.8rem', fontWeight: 600, fontFamily: 'Inter' }}>₹{filteredRecords.reduce((a,b)=>a+(b.igst||0),0).toLocaleString('en-IN')}</div>
             </div>
             <div style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
               <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Total CGST Collected</div>
               <div style={{ fontSize: '1.8rem', fontWeight: 600, fontFamily: 'Inter' }}>₹{filteredRecords.reduce((a,b)=>a+(b.cgst||0),0).toLocaleString('en-IN')}</div>
             </div>
             <div style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
               <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Total SGST Collected</div>
               <div style={{ fontSize: '1.8rem', fontWeight: 600, fontFamily: 'Inter' }}>₹{filteredRecords.reduce((a,b)=>a+(b.sgst||0),0).toLocaleString('en-IN')}</div>
             </div>
           </div>
        </div>
      </div>

      <div className="admin-card mb-15">
        <div className="card-header">
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Calculator size={18} color="var(--gold)" /> Auto GST Calculator & Logger</div>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
            <label style={{ fontSize: '0.8rem' }}>Base Amount (₹)</label>
            <input type="number" value={newTx.amount} onChange={e => setNewTx({...newTx, amount: e.target.value})} placeholder="e.g. 50000" />
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
            <label style={{ fontSize: '0.8rem' }}>Category</label>
            <select value={newTx.type} onChange={e => setNewTx({...newTx, type: e.target.value})} className="form-control" style={{ background: 'var(--surface)', border: '1px solid var(--border-color)', padding: '0.6rem', borderRadius: '8px', color: 'var(--text-primary)' }}>
              <option value="gold" style={{ background: 'var(--surface)', color: 'var(--text-primary)' }}>Gold Jewellery</option>
              <option value="diamond" style={{ background: 'var(--surface)', color: 'var(--text-primary)' }}>Diamond Jewellery</option>
              <option value="silver" style={{ background: 'var(--surface)', color: 'var(--text-primary)' }}>Silver Jewellery</option>
              <option value="making" style={{ background: 'var(--surface)', color: 'var(--text-primary)' }}>Making Charges</option>
            </select>
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
            <label style={{ fontSize: '0.8rem' }}>State (Place of Supply)</label>
            <select value={newTx.state} onChange={e => setNewTx({...newTx, state: e.target.value})} className="form-control" style={{ background: 'var(--surface)', border: '1px solid var(--border-color)', padding: '0.6rem', borderRadius: '8px', color: 'var(--text-primary)' }}>
              <option value="Maharashtra" style={{ background: 'var(--surface)', color: 'var(--text-primary)' }}>Maharashtra (Local)</option>
              <option value="Delhi" style={{ background: 'var(--surface)', color: 'var(--text-primary)' }}>Delhi</option>
              <option value="Karnataka" style={{ background: 'var(--surface)', color: 'var(--text-primary)' }}>Karnataka</option>
              <option value="Gujarat" style={{ background: 'var(--surface)', color: 'var(--text-primary)' }}>Gujarat</option>
              <option value="Tamil Nadu" style={{ background: 'var(--surface)', color: 'var(--text-primary)' }}>Tamil Nadu</option>
              <option value="Uttar Pradesh" style={{ background: 'var(--surface)', color: 'var(--text-primary)' }}>Uttar Pradesh</option>
              <option value="West Bengal" style={{ background: 'var(--surface)', color: 'var(--text-primary)' }}>West Bengal</option>
              <option value="Rajasthan" style={{ background: 'var(--surface)', color: 'var(--text-primary)' }}>Rajasthan</option>
            </select>
          </div>
          <div style={{ flex: 1, minWidth: '220px', padding: '0.6rem', background: 'rgba(201,168,76,0.1)', borderRadius: '8px', border: '1px solid var(--gold)', marginBottom: '1rem' }}>
            {(() => {
              const details = calculateGstDetails();
              return (
                <>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                    Calculated {details.rate ? `${details.rate}%` : ''} GST {details.type ? `(${details.type})` : ''}
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--gold)' }}>₹{details.total.toLocaleString('en-IN')}</div>
                  {details.total > 0 && (
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      {details.type === 'IGST' 
                        ? `IGST: ₹${details.igst.toLocaleString('en-IN')}` 
                        : `CGST: ₹${details.cgst.toLocaleString('en-IN')} | SGST: ₹${details.sgst.toLocaleString('en-IN')}`}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
          <button className="btn btn-gold" onClick={handleAddTransaction} style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#FFFFFF', fontWeight: 'bold' }}><Plus size={16} /> Log Transaction</button>
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
                <th>State (Supply)</th>
                <th>Base Amount</th>
                <th>GST %</th>
                <th>Tax Type</th>
                <th>Tax Amount</th>
                <th>Total Billed</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loadingRecords ? (
                <tr><td colSpan="9" style={{textAlign:'center', padding:'2rem'}}><Loader className="spin" size={24} color="var(--gold)" /></td></tr>
              ) : taxRecords.length === 0 ? (
                <tr><td colSpan="9" style={{textAlign:'center', padding:'2rem'}}>No tax transactions found.</td></tr>
              ) : taxRecords.map(record => (
                <tr key={record.id}>
                  <td style={{ fontFamily: 'monospace', color: 'var(--gold)' }}>{record.displayId || record.id.slice(0,8)}</td>
                  <td>{record.date}</td>
                  <td>
                    <span style={{ 
                      padding: '0.3rem 0.8rem', 
                      borderRadius: '12px', 
                      fontSize: '0.75rem', 
                      fontWeight: 700,
                      background: record.state === taxSettings.storeOriginState ? 'var(--status-green)' : 'var(--status-blue)',
                      color: '#000'
                    }}>
                      {record.state}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>₹{record.amount?.toLocaleString('en-IN') || 0}</td>
                  <td>{record.gstPerc}%</td>
                  <td><span className="badge badge-info">{record.type}</span></td>
                  <td style={{ color: 'var(--status-orange)' }}>₹{record.gstAmount?.toLocaleString('en-IN') || 0}</td>
                  <td style={{ fontWeight: 700 }}>₹{((record.amount || 0) + (record.gstAmount || 0)).toLocaleString('en-IN')}</td>
                  <td>
                    <button className="btn btn-icon btn-outline" onClick={() => handleDownloadInvoice(record)} title="Download Tax Invoice">
                      <Download size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {showUpdateModal && (
        <div className="auth-modal-overlay" onClick={() => setShowUpdateModal(false)}>
          <div className="auth-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px', padding: '2.5rem' }}>
            <div className="auth-modal-header">
              <h2 className="auth-modal-title">Update Tax Brackets</h2>
              <p className="auth-modal-subtitle">Modify the default GST rates</p>
            </div>
            <div className="auth-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Gold Jewellery GST (%)</label>
                <input type="number" className="form-control" style={{ color: '#000', background: '#fff', border: '1px solid #ccc', padding: '0.6rem', borderRadius: '4px' }} value={tempRates.gold} onChange={e => setTempRates({...tempRates, gold: parseFloat(e.target.value) || 0})} />
              </div>
              <div className="form-group">
                <label>Diamond Jewellery GST (%)</label>
                <input type="number" className="form-control" style={{ color: '#000', background: '#fff', border: '1px solid #ccc', padding: '0.6rem', borderRadius: '4px' }} value={tempRates.diamond} onChange={e => setTempRates({...tempRates, diamond: parseFloat(e.target.value) || 0})} />
              </div>
              <div className="form-group">
                <label>Silver Jewellery GST (%)</label>
                <input type="number" className="form-control" style={{ color: '#000', background: '#fff', border: '1px solid #ccc', padding: '0.6rem', borderRadius: '4px' }} value={tempRates.silver} onChange={e => setTempRates({...tempRates, silver: parseFloat(e.target.value) || 0})} />
              </div>
              <div className="form-group">
                <label>Making Charges GST (%)</label>
                <input type="number" className="form-control" style={{ color: '#000', background: '#fff', border: '1px solid #ccc', padding: '0.6rem', borderRadius: '4px' }} value={tempRates.making} onChange={e => setTempRates({...tempRates, making: parseFloat(e.target.value) || 0})} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button className="btn btn-gold" onClick={handleUpdateBrackets} style={{ flex: 1, padding: '0.8rem', fontWeight: 700, fontSize: '1rem', color: '#FFFFFF' }}>Save Updates</button>
                <button className="btn btn-outline" onClick={() => setShowUpdateModal(false)} style={{ flex: 1, padding: '0.8rem', fontWeight: 600, fontSize: '1rem' }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
