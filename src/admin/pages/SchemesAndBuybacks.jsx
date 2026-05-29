import { useState, useEffect } from 'react';
import { schemes as initialSchemes, exchangeRequests as initialExchanges } from '../data/mockData';
import { IndianRupee, RefreshCw, CheckCircle, Search, Calculator, ShieldCheck } from 'lucide-react';
import { useRates } from '../../hooks/useRates';
import { useApp } from '../../context/AppContext';

export default function SchemesAndBuybacks() {
  const { rates } = useRates();
  const { showToast } = useApp();
  const [activeTab, setActiveTab] = useState('schemes');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [exchanges, setExchanges] = useState(initialExchanges);
  const [localSchemes, setLocalSchemes] = useState(initialSchemes);
  const [evalModal, setEvalModal] = useState({ isOpen: false, data: null });
  const [enrollModal, setEnrollModal] = useState(false);
  const [enrollForm, setEnrollForm] = useState({ customer: '', plan: 'Swarna Nidhi 11-Month', installment: 5000 });
  
  const [evalForm, setEvalForm] = useState({
    purity: '22K',
    netWeight: '',
    deductionPerc: 2
  });

  const [calculatedValue, setCalculatedValue] = useState(0);

  useEffect(() => {
    if (!evalForm.netWeight) {
      setCalculatedValue(0);
      return;
    }
    const weight = parseFloat(evalForm.netWeight) || 0;
    const deduction = parseFloat(evalForm.deductionPerc) || 0;
    
    let ratePerGram = rates.gold24k;
    if (evalForm.purity === '22K') ratePerGram = rates.gold22k;
    if (evalForm.purity === '18K') ratePerGram = rates.gold18k;
    
    const baseValue = weight * ratePerGram;
    const finalValue = baseValue - (baseValue * (deduction / 100));
    setCalculatedValue(finalValue);
  }, [evalForm, rates]);

  const filteredSchemes = localSchemes.filter(s => 
    s.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEnrollSubmit = () => {
    if (!enrollForm.customer || !enrollForm.installment) return;
    const newScheme = {
      id: `SCH-${Math.floor(Math.random() * 100000)}`,
      customer: enrollForm.customer,
      plan: enrollForm.plan,
      startDate: new Date().toISOString().split('T')[0],
      installment: Number(enrollForm.installment),
      monthsPaid: 1,
      status: 'active'
    };
    setLocalSchemes([newScheme, ...localSchemes]);
    showToast(`${enrollForm.customer} successfully enrolled in ${enrollForm.plan}!`);
    setEnrollModal(false);
    setEnrollForm({ customer: '', plan: 'Swarna Nidhi 11-Month', installment: 5000 });
  };

  const handlePayInstallment = (id) => {
    setLocalSchemes(localSchemes.map(s => {
      if (s.id === id) {
        if (s.monthsPaid >= 11) {
          showToast("Scheme is already fully paid!", "error");
          return s;
        }
        showToast(`Installment paid successfully for ${s.customer}.`);
        return { ...s, monthsPaid: s.monthsPaid + 1, status: s.monthsPaid + 1 >= 11 ? 'completed' : 'active' };
      }
      return s;
    }));
  };

  const filteredExchanges = exchanges.filter(e => 
    e.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openEvalModal = (exc) => {
    setEvalModal({ isOpen: true, data: exc });
    setEvalForm({ purity: '22K', netWeight: exc.approxWeight.replace('g', '').trim(), deductionPerc: 2 });
  };

  const handleApproveBuyback = () => {
    setExchanges(exchanges.map(e => 
      e.id === evalModal.data.id 
        ? { ...e, status: 'offer_made', offerAmount: Math.round(calculatedValue) } 
        : e
    ));
    showToast(`Exchange offer of ₹${Math.round(calculatedValue).toLocaleString('en-IN')} sent to ${evalModal.data.customer}!`);
    setEvalModal({ isOpen: false, data: null });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Schemes &amp; Buybacks</h1>
          <p className="page-subtitle">Manage customer gold savings schemes, old gold exchanges, and buyback evaluations.</p>
        </div>
        <div className="page-actions">
           {activeTab === 'schemes' ? (
             <button className="btn btn-gold" onClick={() => setEnrollModal(true)} style={{ backgroundColor: 'var(--gold)', color: '#000', fontWeight: 800, padding: '0.8rem 1.5rem', fontSize: '1rem', border: 'none', borderRadius: '8px' }}>+ New Scheme Enrollment</button>
           ) : activeTab === 'exchanges' ? (
             <button className="btn btn-gold" style={{ backgroundColor: 'var(--gold)', color: '#000', fontWeight: 800, padding: '0.8rem 1.5rem', fontSize: '1rem', border: 'none', borderRadius: '8px' }}>+ New Exchange Request</button>
           ) : null}
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0', borderBottom: '1px solid var(--border-color)' }}>
        {[['schemes','Savings Schemes'],['exchanges','Exchange / Buyback'],['emi','EMI Tracking']].map(([key, label]) => (
          <button key={key} onClick={() => setActiveTab(key)} style={{ background: 'none', border: 'none', fontSize: '0.95rem', fontWeight: 600, color: activeTab === key ? 'var(--gold)' : 'var(--text-muted)', cursor: 'pointer', borderBottom: activeTab === key ? '2px solid var(--gold)' : '2px solid transparent', padding: '0.7rem 1.5rem', transition: 'color 0.2s' }}>
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'emi' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem' }}>
            {[
              { label: 'Active EMI Plans', value: localSchemes.filter(s => s.status === 'active').length, color: 'var(--gold)', border: 'var(--gold)' },
              { label: 'Completed Plans', value: localSchemes.filter(s => s.status === 'completed').length, color: 'var(--status-green)', border: 'var(--status-green)' },
              { label: 'Monthly Collection', value: `₹${localSchemes.filter(s => s.status === 'active').reduce((a, s) => a + s.installment, 0).toLocaleString('en-IN')}`, color: '#88ccff', border: '#88ccff' },
            ].map(c => (
              <div key={c.label} className="admin-card" style={{ borderTop: `3px solid ${c.border}` }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>{c.label}</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: c.color }}>{c.value}</div>
              </div>
            ))}
          </div>

          <div className="admin-card">
            <div className="card-header" style={{ marginBottom: '1.5rem' }}>
              <div className="card-title">EMI Installment Status — All Members</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Total outstanding: <strong style={{ color: 'var(--status-orange)' }}>
                  ₹{localSchemes.filter(s => s.status === 'active').reduce((a, s) => a + (11 - s.monthsPaid) * s.installment, 0).toLocaleString('en-IN')}
                </strong>
              </div>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Scheme ID</th><th>Customer</th><th>Plan</th><th>EMI Amount</th>
                    <th>Months Paid</th><th>Remaining</th><th>Progress</th><th>Next Due</th><th>Status</th><th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {localSchemes.map(s => {
                    const totalMonths = 11;
                    const remaining = totalMonths - s.monthsPaid;
                    const totalDue = remaining * s.installment;
                    const pct = Math.round((s.monthsPaid / totalMonths) * 100);
                    const nextDue = new Date();
                    nextDue.setMonth(nextDue.getMonth() + 1);
                    return (
                      <tr key={s.id}>
                        <td style={{ fontFamily: 'monospace', color: 'var(--gold)', fontSize: '0.8rem' }}>{s.id}</td>
                        <td style={{ fontWeight: 700 }}>{s.customer}</td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{s.plan}</td>
                        <td style={{ fontWeight: 700 }}>₹{s.installment.toLocaleString('en-IN')}</td>
                        <td>
                          <span style={{ color: 'var(--status-green)', fontWeight: 700 }}>{s.monthsPaid}</span>
                          <span style={{ color: 'var(--text-muted)' }}>/{totalMonths}</span>
                        </td>
                        <td style={{ color: remaining > 0 ? 'var(--status-orange)' : 'var(--text-muted)', fontWeight: 600 }}>
                          {remaining > 0 ? `${remaining}mo · ₹${totalDue.toLocaleString('en-IN')}` : '—'}
                        </td>
                        <td style={{ minWidth: '140px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ flex: 1, height: '8px', background: 'var(--surface)', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{ width: `${pct}%`, height: '100%', background: s.status === 'completed' ? 'var(--status-green)' : 'linear-gradient(90deg,var(--gold),#f1c40f)', borderRadius: '4px' }} />
                            </div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', minWidth: '32px' }}>{pct}%</span>
                          </div>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: s.status === 'completed' ? 'var(--text-muted)' : 'var(--text-secondary)' }}>
                          {s.status === 'completed' ? '—' : nextDue.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td>
                          <span style={{ padding: '0.3rem 0.7rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, background: s.status === 'completed' ? 'rgba(46,204,113,0.15)' : 'rgba(201,168,76,0.15)', color: s.status === 'completed' ? 'var(--status-green)' : 'var(--gold)' }}>
                            {s.status.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          {s.monthsPaid < 11 ? (
                            <button className="btn btn-sm btn-gold" style={{ backgroundColor: 'var(--gold)', color: '#000', fontWeight: 700, border: 'none', fontSize: '0.78rem' }} onClick={() => handlePayInstallment(s.id)}>
                              Pay EMI
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.78rem', color: 'var(--status-green)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <CheckCircle size={13} /> Done
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="admin-card">
            <div className="card-title" style={{ marginBottom: '1rem' }}>⚠️ Upcoming EMI Due — Next Collection</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {localSchemes.filter(s => s.status === 'active').length > 0 ? (
                localSchemes.filter(s => s.status === 'active').map(s => (
                  <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem 1rem', background: 'rgba(201,168,76,0.06)', borderRadius: '8px', border: '1px solid rgba(201,168,76,0.2)' }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{s.customer}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{s.id} · Month {s.monthsPaid + 1} of 11</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, color: 'var(--gold)', fontSize: '1.05rem' }}>₹{s.installment.toLocaleString('en-IN')}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.plan}</div>
                    </div>
                    <button className="btn btn-sm btn-gold" style={{ backgroundColor: 'var(--gold)', color: '#000', fontWeight: 700, border: 'none', marginLeft: '1rem' }} onClick={() => handlePayInstallment(s.id)}>
                      Collect EMI
                    </button>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--status-green)' }}>
                  <CheckCircle size={28} style={{ marginBottom: '0.5rem' }} />
                  <div>All EMIs are up to date!</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab !== 'emi' && (
        <div className="admin-card">
          <div className="card-header">
            <div className="card-title">{activeTab === 'schemes' ? 'Active Savings Schemes' : 'Exchange / Buyback Requests'}</div>
            <div className="filter-search" style={{ margin: 0, width: '250px' }}>
              <Search size={14} />
              <input placeholder="Search by ID or customer..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              {activeTab === 'schemes' ? (
                <>
                  <thead>
                    <tr>
                      <th>Scheme ID</th><th>Customer Name</th><th>Plan Name</th>
                      <th>Start Date</th><th>Installment</th><th>Progress</th><th>Status</th><th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSchemes.map((scheme) => (
                      <tr key={scheme.id}>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{scheme.id}</td>
                        <td style={{ fontWeight: 600 }}>{scheme.customer}</td>
                        <td>{scheme.plan}</td>
                        <td style={{ fontSize: '0.85rem' }}>{scheme.startDate}</td>
                        <td>₹{scheme.installment.toLocaleString()}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '80px', height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ width: `${(scheme.monthsPaid / 11) * 100}%`, height: '100%', background: 'var(--gold)' }}></div>
                            </div>
                            <span style={{ fontSize: '0.75rem' }}>{scheme.monthsPaid}/11</span>
                          </div>
                        </td>
                        <td><span className={`badge badge-${scheme.status === 'active' ? 'active' : 'superadmin'}`}>{scheme.status.toUpperCase()}</span></td>
                        <td>
                          {scheme.monthsPaid < 11 ? (
                            <button className="btn btn-sm btn-outline" onClick={() => handlePayInstallment(scheme.id)} style={{ color: 'var(--gold)', borderColor: 'var(--gold)' }}>Pay Installment</button>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--status-green)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><CheckCircle size={14}/> Completed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </>
              ) : (
                <>
                  <thead>
                    <tr>
                      <th>Request ID</th><th>Customer Name</th><th>Item Description</th>
                      <th>Approx Weight</th><th>Requested Date</th><th>Offer Amount</th><th>Status</th><th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExchanges.map((exc) => (
                      <tr key={exc.id}>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{exc.id}</td>
                        <td style={{ fontWeight: 600 }}>{exc.customer}</td>
                        <td>{exc.item}</td>
                        <td>{exc.approxWeight}</td>
                        <td style={{ fontSize: '0.85rem' }}>{exc.requestedDate}</td>
                        <td style={{ fontWeight: 600, color: exc.offerAmount ? 'var(--status-green)' : 'inherit' }}>
                          {exc.offerAmount ? `₹${exc.offerAmount.toLocaleString()}` : '-'}
                        </td>
                        <td><span className={`badge badge-${exc.status === 'offer_made' ? 'active' : 'pending'}`}>{exc.status.replace('_', ' ').toUpperCase()}</span></td>
                        <td><button className="btn btn-sm btn-outline" onClick={() => openEvalModal(exc)}>Evaluate</button></td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}
            </table>
          </div>
        </div>
      )}

      {enrollModal && (
        <div className="modal-overlay" onClick={() => setEnrollModal(false)}>
          <div className="modal-box" style={{ maxWidth: '500px', padding: '2rem' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <IndianRupee size={20} color="var(--gold)" /> New Scheme Enrollment
              </h3>
              <button className="modal-close" onClick={() => setEnrollModal(false)}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Customer Name</label>
                <input type="text" className="form-input" style={{ background: '#111', color: '#fff', padding: '0.8rem' }} placeholder="Enter customer name..." value={enrollForm.customer} onChange={e => setEnrollForm({...enrollForm, customer: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Savings Plan</label>
                <select className="form-input" style={{ background: '#111', color: '#fff', padding: '0.8rem' }} value={enrollForm.plan} onChange={e => setEnrollForm({...enrollForm, plan: e.target.value})}>
                  <option value="Swarna Nidhi 11-Month">Swarna Nidhi (11 Months + 1 Bonus)</option>
                  <option value="Diamond Club 12-Month">Diamond Club (12 Months)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Monthly Installment Amount (₹)</label>
                <input type="number" className="form-input" style={{ background: '#111', color: '#fff', padding: '0.8rem' }} min="1000" step="1000" value={enrollForm.installment} onChange={e => setEnrollForm({...enrollForm, installment: e.target.value})} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button className="btn btn-gold" onClick={handleEnrollSubmit} style={{ flex: 1, padding: '1rem', fontWeight: 800, color: '#000' }}>Confirm Enrollment &amp; Pay 1st</button>
              <button className="btn btn-outline" onClick={() => setEnrollModal(false)} style={{ padding: '1rem 2rem', fontWeight: 600 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {evalModal.isOpen && (
        <div className="modal-overlay" onClick={() => setEvalModal({ isOpen: false, data: null })}>
          <div className="modal-box" style={{ maxWidth: '600px', padding: '2rem' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={20} color="var(--gold)" /> Buyback &amp; Exchange Valuation
              </h3>
              <button className="modal-close" onClick={() => setEvalModal({ isOpen: false, data: null })}>×</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', padding: '1rem', background: 'var(--surface)', borderRadius: '8px' }}>
              <div><span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Customer:</span> <br/><strong>{evalModal.data.customer}</strong></div>
              <div><span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Request ID:</span> <br/><span style={{ fontFamily: 'monospace' }}>{evalModal.data.id}</span></div>
              <div><span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Item:</span> <br/>{evalModal.data.item}</div>
              <div><span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Declared Weight:</span> <br/>{evalModal.data.approxWeight}</div>
            </div>
            <h4 style={{ marginBottom: '1rem', color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Calculator size={16}/> Calculation Engine</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Verified Net Gold Weight (g)</label>
                <input type="number" className="form-input" style={{ background: '#111', color: '#fff', padding: '0.8rem', fontSize: '1.1rem' }} value={evalForm.netWeight} onChange={e => setEvalForm({...evalForm, netWeight: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Tested Purity</label>
                <select className="form-input" style={{ background: '#111', color: '#fff', padding: '0.8rem', fontSize: '1.1rem' }} value={evalForm.purity} onChange={e => setEvalForm({...evalForm, purity: e.target.value})}>
                  <option value="24K" style={{ background: '#111' }}>24 Karat (99.9%) - ₹{rates.gold24k}/g</option>
                  <option value="22K" style={{ background: '#111' }}>22 Karat (91.6%) - ₹{rates.gold22k}/g</option>
                  <option value="18K" style={{ background: '#111' }}>18 Karat (75.0%) - ₹{rates.gold18k}/g</option>
                </select>
              </div>
              <div className="form-group">
                <label>Handling / Melting Deduction (%)</label>
                <input type="number" className="form-input" style={{ background: '#111', color: '#fff', padding: '0.8rem', fontSize: '1.1rem' }} value={evalForm.deductionPerc} onChange={e => setEvalForm({...evalForm, deductionPerc: e.target.value})} />
              </div>
              <div style={{ padding: '0.8rem', background: 'rgba(46, 204, 113, 0.1)', border: '1px solid var(--status-green)', borderRadius: '4px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--status-green)', textTransform: 'uppercase' }}>Final Exchange Value</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--status-green)' }}>₹{Math.round(calculatedValue).toLocaleString('en-IN')}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button className="btn btn-gold" onClick={handleApproveBuyback} style={{ flex: 1, padding: '1rem', fontWeight: 700, fontSize: '1rem', color: '#000' }}>Approve &amp; Send Offer</button>
              <button className="btn btn-outline" onClick={() => setEvalModal({ isOpen: false, data: null })} style={{ padding: '1rem 2rem', fontWeight: 600 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
