import { useState, useMemo, useEffect } from 'react';
import { Store, TrendingUp, CheckCircle, Clock, Download, Plus, Search, FileText, IndianRupee, BarChart2, RefreshCw, X, Loader } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { db } from '../../config/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

const initialVendors = [
  { id: 'VND-001', name: 'Aura Diamonds', category: 'Diamonds', totalSales: 1240000, commissionRate: 12, amountDue: 148800, paidToDate: 520000, status: 'pending', joinDate: '12 Jan 2025', contact: 'aura@diamonds.in', phone: '+91 98201 12345', bank: 'HDFC **** 4821' },
  { id: 'VND-002', name: 'Heritage Silvers', category: 'Silver', totalSales: 450000, commissionRate: 8, amountDue: 0, paidToDate: 36000, status: 'paid', joinDate: '05 Mar 2025', contact: 'heritage@silvers.in', phone: '+91 99302 67890', bank: 'SBI **** 3377' },
  { id: 'VND-003', name: 'Kundan Kraft Co.', category: 'Kundan', totalSales: 890000, commissionRate: 15, amountDue: 133500, paidToDate: 210000, status: 'pending', joinDate: '22 Jul 2024', contact: 'info@kundankraft.in', phone: '+91 98760 44332', bank: 'ICICI **** 9912' },
  { id: 'VND-004', name: 'Platinum Pro Gems', category: 'Platinum', totalSales: 3100000, commissionRate: 10, amountDue: 310000, paidToDate: 950000, status: 'overdue', joinDate: '01 Nov 2024', contact: 'sales@platinumpro.in', phone: '+91 97540 11223', bank: 'Axis **** 6654' },
  { id: 'VND-005', name: 'Royal Antiques', category: 'Antique Gold', totalSales: 620000, commissionRate: 18, amountDue: 0, paidToDate: 111600, status: 'paid', joinDate: '14 Feb 2025', contact: 'royal@antiques.in', phone: '+91 96650 78901', bank: 'Kotak **** 1123' },
];

const commissionReportData = [
  { month: 'Jan', earned: 82000, paid: 82000 },
  { month: 'Feb', earned: 95000, paid: 95000 },
  { month: 'Mar', earned: 110000, paid: 100000 },
  { month: 'Apr', earned: 130000, paid: 130000 },
  { month: 'May', earned: 592300, paid: 420000 },
];

const CATEGORY_RATES = {
  Diamonds: 12, Silver: 8, Kundan: 15, Platinum: 10, 'Antique Gold': 18, Other: 10
};

export default function VendorManagement() {
  const { showToast } = useApp();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('vendors');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [detailVendor, setDetailVendor] = useState(null);
  const [newVendor, setNewVendor] = useState({ name: '', category: 'Diamonds', contact: '', phone: '', bank: '' });

  // Load vendors from Firebase in real-time
  useEffect(() => {
    if (!db) { setLoading(false); return; }
    const q = query(collection(db, 'vendors'), orderBy('joinDate', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setVendors(snap.docs.map(d => ({ _docId: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => {
      console.error('Error loading vendors:', err);
      // Fall back to initial data so page is usable
      setVendors(initialVendors);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const totalDue = vendors.reduce((a, v) => a + v.amountDue, 0);
  const totalPaid = vendors.reduce((a, v) => a + v.paidToDate, 0);
  const totalSales = vendors.reduce((a, v) => a + v.totalSales, 0);

  const filteredVendors = useMemo(() => vendors.filter(v => {
    const matchSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) || v.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'All' || v.status === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
  }), [vendors, searchTerm, statusFilter]);

  const handleReleasePayout = async (vendorId, docId) => {
    showToast('Processing vendor payout...');
    const vendor = vendors.find(v => v.id === vendorId || v._docId === docId);
    if (!vendor) return;
    try {
      if (db && docId) {
        await updateDoc(doc(db, 'vendors', docId), {
          paidToDate: (vendor.paidToDate || 0) + (vendor.amountDue || 0),
          amountDue: 0,
          status: 'paid',
          lastPaidAt: serverTimestamp()
        });
      }
      showToast('Vendor payout released and settled successfully!');
    } catch (err) {
      console.error('Payout error:', err);
      showToast('Failed to release payout.', 'error');
    }
  };

  const handleAddVendor = async () => {
    if (!newVendor.name || !newVendor.contact) { showToast('Please fill all required fields.', 'error'); return; }
    const rate = CATEGORY_RATES[newVendor.category] || 10;
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const vendorData = {
      id: `VND-${String(vendors.length + 1).padStart(3, '0')}`,
      ...newVendor,
      commissionRate: rate,
      totalSales: 0,
      amountDue: 0,
      paidToDate: 0,
      status: 'paid',
      joinDate: today,
      createdAt: serverTimestamp()
    };
    try {
      if (db) {
        await addDoc(collection(db, 'vendors'), vendorData);
        showToast(`Vendor ${newVendor.name} added and saved!`);
      } else {
        setVendors(prev => [vendorData, ...prev]);
        showToast(`Vendor ${newVendor.name} added (offline mode).`);
      }
    } catch (err) {
      console.error('Error adding vendor:', err);
      showToast('Failed to add vendor.', 'error');
      return;
    }
    setShowAddModal(false);
    setNewVendor({ name: '', category: 'Diamonds', contact: '', phone: '', bank: '' });
  };

  const handleDownloadReport = () => {
    showToast('Generating Commission Report...');
    setTimeout(() => {
      const w = window.open('', '_blank');
      w.document.write(`<html><head><title>Commission Report</title><style>body{font-family:Arial;padding:2rem;color:#333}table{width:100%;border-collapse:collapse;margin-top:1rem}th,td{border:1px solid #ddd;padding:10px;text-align:left}th{background:#f5f5f5}.header{text-align:center;margin-bottom:2rem;border-bottom:2px solid #c9a84c;padding-bottom:1rem}</style></head><body><div class="header"><h1 style="color:#c9a84c;margin:0">LUMINA JEWELS</h1><p>Vendor Commission Report — May 2026</p></div><h3>Summary</h3><p>Total Sales Facilitated: ₹${totalSales.toLocaleString('en-IN')}</p><p>Total Commission Earned: ₹${totalPaid.toLocaleString('en-IN')}</p><p>Outstanding Due: ₹${totalDue.toLocaleString('en-IN')}</p><h3>Vendor Breakdown</h3><table><tr><th>Vendor ID</th><th>Name</th><th>Category</th><th>Total Sales</th><th>Rate %</th><th>Paid To Date</th><th>Amount Due</th><th>Status</th></tr>${vendors.map(v => `<tr><td>${v.id}</td><td>${v.name}</td><td>${v.category}</td><td>₹${v.totalSales.toLocaleString('en-IN')}</td><td>${v.commissionRate}%</td><td>₹${v.paidToDate.toLocaleString('en-IN')}</td><td>₹${v.amountDue.toLocaleString('en-IN')}</td><td>${v.status.toUpperCase()}</td></tr>`).join('')}</table><p style="text-align:center;margin-top:3rem;font-size:0.8rem;color:#888">Computer Generated Report — Lumina Jewels Finance</p></body></html>`);
      w.document.close(); w.print();
      showToast('Commission report downloaded!');
    }, 800);
  };

  const statusColor = { paid: 'var(--status-green)', pending: 'var(--status-orange)', overdue: 'var(--status-red)' };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}><Loader className="spin" size={24} color="var(--gold)" /></div>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Vendor & Commission Management</h1>
          <p className="page-subtitle">Marketplace sellers, commission tracking, and payout management.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline" onClick={handleDownloadReport} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Download size={14} /> Export Report
          </button>
          <button className="btn btn-gold" onClick={() => setShowAddModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'var(--gold)', color: '#FFFFFF', fontWeight: 800, border: 'none', borderRadius: '8px', padding: '0.6rem 1.2rem' }}>
            <Plus size={14} /> Add Vendor
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid-3 mb-15" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="admin-card" style={{ borderTop: '3px solid var(--gold)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Total Vendors</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--gold)' }}>{vendors.length}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Active marketplace sellers</div>
        </div>
        <div className="admin-card" style={{ borderTop: '3px solid var(--status-green)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Total Sales Facilitated</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--status-green)' }}>₹{(totalSales / 100000).toFixed(1)}L</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Across all vendors</div>
        </div>
        <div className="admin-card" style={{ borderTop: '3px solid var(--status-orange)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Outstanding Payouts</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--status-orange)' }}>₹{(totalDue / 100000).toFixed(2)}L</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Awaiting release</div>
        </div>
        <div className="admin-card" style={{ borderTop: '3px solid #88ccff' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Commission Paid YTD</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#88ccff' }}>₹{(totalPaid / 100000).toFixed(1)}L</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>All time payouts</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
        {['vendors', 'commissions', 'reports'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '0.7rem 1.5rem', background: 'none', border: 'none', borderBottom: activeTab === tab ? '2px solid var(--gold)' : '2px solid transparent', color: activeTab === tab ? 'var(--gold)' : 'var(--text-muted)', fontWeight: activeTab === tab ? 700 : 500, cursor: 'pointer', textTransform: 'capitalize', fontSize: '0.95rem' }}>
            {tab === 'vendors' ? 'Vendor Directory' : tab === 'commissions' ? 'Commission Tracker' : 'Payout Reports'}
          </button>
        ))}
      </div>

      {/* VENDOR DIRECTORY TAB */}
      {activeTab === 'vendors' && (
        <div className="admin-card">
          <div className="card-header" style={{ marginBottom: '1rem' }}>
            <div className="card-title">All Vendors</div>
            <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
              <div className="filter-search" style={{ margin: 0 }}>
                <Search size={14} />
                <input placeholder="Search vendor..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <select className="form-input" style={{ padding: '0.4rem 0.8rem', width: '140px' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option>All</option>
                <option>Pending</option>
                <option>Paid</option>
                <option>Overdue</option>
              </select>
            </div>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Vendor</th>
                  <th>Category</th>
                  <th>Total Sales</th>
                  <th>Commission Rate</th>
                  <th>Paid To Date</th>
                  <th>Amount Due</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVendors.map(v => (
                  <tr key={v.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{v.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{v.id}</div>
                    </td>
                    <td><span style={{ padding: '0.2rem 0.6rem', background: 'rgba(201,168,76,0.1)', borderRadius: '12px', fontSize: '0.78rem', color: 'var(--gold)' }}>{v.category}</span></td>
                    <td style={{ fontWeight: 700 }}>₹{v.totalSales.toLocaleString('en-IN')}</td>
                    <td style={{ fontWeight: 700, color: 'var(--gold)' }}>{v.commissionRate}%</td>
                    <td style={{ color: 'var(--status-green)', fontWeight: 600 }}>₹{v.paidToDate.toLocaleString('en-IN')}</td>
                    <td style={{ fontWeight: 700, color: v.amountDue > 0 ? 'var(--status-orange)' : 'var(--text-muted)' }}>
                      {v.amountDue > 0 ? `₹${v.amountDue.toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td>
                      <span style={{ padding: '0.3rem 0.8rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, background: `${statusColor[v.status]}22`, color: statusColor[v.status] }}>
                        {v.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-sm btn-outline" onClick={() => setDetailVendor(v)}>View</button>
                        {v.status !== 'paid' && (
                          <button className="btn btn-sm btn-gold" style={{ backgroundColor: 'var(--gold)', color: '#FFFFFF', fontWeight: 700, border: 'none' }} onClick={() => handleReleasePayout(v.id, v._docId)}>
                            Release
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
      )}

      {/* COMMISSION TRACKER TAB */}
      {activeTab === 'commissions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="admin-card">
            <div className="card-title" style={{ marginBottom: '1.5rem' }}>Commission Calculator — Per Vendor</div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Vendor</th>
                    <th>Category</th>
                    <th>Sales Volume</th>
                    <th>Rate (%)</th>
                    <th>Gross Commission</th>
                    <th>Platform Fee (2%)</th>
                    <th>Net Payout</th>
                    <th>Payout Status</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map(v => {
                    const gross = Math.round(v.totalSales * v.commissionRate / 100);
                    const platformFee = Math.round(gross * 0.02);
                    const net = gross - platformFee;
                    return (
                      <tr key={v.id}>
                        <td style={{ fontWeight: 700 }}>{v.name}</td>
                        <td>{v.category}</td>
                        <td>₹{v.totalSales.toLocaleString('en-IN')}</td>
                        <td style={{ color: 'var(--gold)', fontWeight: 700 }}>{v.commissionRate}%</td>
                        <td>₹{gross.toLocaleString('en-IN')}</td>
                        <td style={{ color: 'var(--status-red)' }}>-₹{platformFee.toLocaleString('en-IN')}</td>
                        <td style={{ fontWeight: 800, color: 'var(--status-green)' }}>₹{net.toLocaleString('en-IN')}</td>
                        <td>
                          <span style={{ padding: '0.3rem 0.8rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, background: `${statusColor[v.status]}22`, color: statusColor[v.status] }}>
                            {v.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="admin-card">
            <div className="card-title" style={{ marginBottom: '1rem' }}>Category Commission Rates</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              {Object.entries(CATEGORY_RATES).map(([cat, rate]) => (
                <div key={cat} style={{ padding: '1rem', background: 'var(--surface)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '3px solid var(--gold)' }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{cat}</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--gold)' }}>{rate}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PAYOUT REPORTS TAB */}
      {activeTab === 'reports' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="admin-card">
            <div className="card-header">
              <div className="card-title">Monthly Commission Report — 2026</div>
              <button className="btn btn-gold btn-sm" onClick={handleDownloadReport} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'var(--gold)', color: '#FFFFFF', fontWeight: 700, border: 'none' }}>
                <Download size={14} /> Download PDF
              </button>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table" style={{ marginTop: '1rem' }}>
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Commission Earned</th>
                    <th>Commission Paid</th>
                    <th>Outstanding</th>
                    <th>Settlement Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {commissionReportData.map(r => {
                    const outstanding = r.earned - r.paid;
                    const rate = Math.round((r.paid / r.earned) * 100);
                    return (
                      <tr key={r.month}>
                        <td style={{ fontWeight: 700 }}>{r.month} 2026</td>
                        <td>₹{r.earned.toLocaleString('en-IN')}</td>
                        <td style={{ color: 'var(--status-green)', fontWeight: 700 }}>₹{r.paid.toLocaleString('en-IN')}</td>
                        <td style={{ color: outstanding > 0 ? 'var(--status-orange)' : 'var(--text-muted)', fontWeight: outstanding > 0 ? 700 : 400 }}>
                          {outstanding > 0 ? `₹${outstanding.toLocaleString('en-IN')}` : '—'}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ flex: 1, height: '6px', background: 'var(--surface)', borderRadius: '3px' }}>
                              <div style={{ width: `${rate}%`, height: '100%', background: rate === 100 ? 'var(--status-green)' : 'var(--status-orange)', borderRadius: '3px' }} />
                            </div>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: rate === 100 ? 'var(--status-green)' : 'var(--status-orange)' }}>{rate}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="admin-card">
            <div className="card-title" style={{ marginBottom: '1rem' }}>Outstanding Payouts — Action Required</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {vendors.filter(v => v.status !== 'paid').map(v => (
                <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--surface)', borderRadius: '8px', borderLeft: `3px solid ${statusColor[v.status]}` }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{v.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{v.bank} · {v.category}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: statusColor[v.status] }}>₹{v.amountDue.toLocaleString('en-IN')}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{v.status.toUpperCase()}</div>
                  </div>
                  <button className="btn btn-gold btn-sm" style={{ backgroundColor: 'var(--gold)', color: '#FFFFFF', fontWeight: 700, border: 'none', marginLeft: '1rem' }} onClick={() => handleReleasePayout(v.id, v._docId)}>
                    Release Payout
                  </button>
                </div>
              ))}
              {vendors.filter(v => v.status !== 'paid').length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--status-green)' }}>
                  <CheckCircle size={32} style={{ marginBottom: '0.5rem' }} />
                  <div>All vendor payouts settled!</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ADD VENDOR MODAL */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-box" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add New Vendor</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Vendor / Company Name *</label>
                <input type="text" placeholder="e.g. Rajasthan Gems Co." value={newVendor.name} onChange={e => setNewVendor({ ...newVendor, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select value={newVendor.category} onChange={e => setNewVendor({ ...newVendor, category: e.target.value })}>
                  {Object.keys(CATEGORY_RATES).map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ padding: '0.8rem', background: 'rgba(201,168,76,0.08)', borderRadius: '8px', border: '1px solid var(--gold)', fontSize: '0.85rem' }}>
                Auto Commission Rate: <strong style={{ color: 'var(--gold)' }}>{CATEGORY_RATES[newVendor.category]}%</strong> for {newVendor.category}
              </div>
              <div className="form-group">
                <label>Contact Email *</label>
                <input type="email" placeholder="vendor@company.in" value={newVendor.contact} onChange={e => setNewVendor({ ...newVendor, contact: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input type="text" placeholder="+91 XXXXX XXXXX" value={newVendor.phone} onChange={e => setNewVendor({ ...newVendor, phone: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Bank Account (masked)</label>
                <input type="text" placeholder="e.g. HDFC **** 1234" value={newVendor.bank} onChange={e => setNewVendor({ ...newVendor, bank: e.target.value })} />
              </div>
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem' }}>
              <button className="btn btn-outline" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="btn btn-gold" style={{ backgroundColor: 'var(--gold)', color: '#FFFFFF', fontWeight: 800, border: 'none' }} onClick={handleAddVendor}>Add Vendor</button>
            </div>
          </div>
        </div>
      )}

      {/* VENDOR DETAIL MODAL */}
      {detailVendor && (
        <div className="modal-overlay" onClick={() => setDetailVendor(null)}>
          <div className="modal-box" style={{ maxWidth: '560px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Vendor Profile — {detailVendor.name}</h3>
              <button className="modal-close" onClick={() => setDetailVendor(null)}>×</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', fontSize: '0.85rem' }}>
                {[
                  ['Vendor ID', detailVendor.id], ['Category', detailVendor.category],
                  ['Email', detailVendor.contact], ['Phone', detailVendor.phone],
                  ['Bank', detailVendor.bank], ['Joined', detailVendor.joinDate],
                  ['Commission Rate', `${detailVendor.commissionRate}%`], ['Status', detailVendor.status.toUpperCase()]
                ].map(([k, val]) => (
                  <div key={k} style={{ padding: '0.8rem', background: 'var(--surface)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>{k}</div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{val}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.8rem' }}>
                {[
                  ['Total Sales', `₹${detailVendor.totalSales.toLocaleString('en-IN')}`, 'var(--text-primary)'],
                  ['Paid To Date', `₹${detailVendor.paidToDate.toLocaleString('en-IN')}`, 'var(--status-green)'],
                  ['Outstanding', detailVendor.amountDue > 0 ? `₹${detailVendor.amountDue.toLocaleString('en-IN')}` : '—', 'var(--status-orange)']
                ].map(([label, val, color]) => (
                  <div key={label} style={{ padding: '1rem', background: 'rgba(201,168,76,0.05)', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>{label}</div>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem' }}>
              <button className="btn btn-outline" onClick={() => setDetailVendor(null)}>Close</button>
              {detailVendor.status !== 'paid' && (
                <button className="btn btn-gold" style={{ backgroundColor: 'var(--gold)', color: '#FFFFFF', fontWeight: 800, border: 'none' }}
                  onClick={() => { handleReleasePayout(detailVendor.id, detailVendor._docId); setDetailVendor(null); }}>
                  Release Payout
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
