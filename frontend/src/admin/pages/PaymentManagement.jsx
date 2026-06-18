import { useState, useEffect } from 'react';
import { Search, ShieldAlert, FileText, CheckCircle, Clock, RefreshCw, Loader } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { db } from '../../config/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';

export default function PaymentManagement() {
  const { showToast, user } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Status: All');
  const [methodFilter, setMethodFilter] = useState('Method: All');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isReconciling, setIsReconciling] = useState(false);
  
  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }
    const q = query(collection(db, 'transactions'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        _docId: doc.id,
        ...doc.data()
      }));
      setTransactions(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching transactions:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  
  const [fraudAlerts, setFraudAlerts] = useState([
    { id: 'TXN-999823', level: 'danger', label: 'High Risk', description: 'Multiple failed high-value credit card attempts from IP address outside India.', customer: 'Unknown', amount: '₹12,45,000' },
    { id: 'TXN-999845', level: 'warning', label: 'Medium Risk', description: 'Unusual refund pattern detected for customer ID #CU-881 (4 refunds this week).', customer: 'Anjali Desai', amount: '₹1,15,000' }
  ]);
  const [securityModal, setSecurityModal] = useState({ isOpen: false, alert: null });
  const [vendors, setVendors] = useState([
    { id: 'v1', name: 'Aura Diamonds', amount: '₹1.2L', status: 'pending' },
    { id: 'v2', name: 'Heritage Silvers', amount: '₹45,000', status: 'paid' }
  ]);

  const [logModal, setLogModal] = useState({ isOpen: false, txnId: null });

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = String(t.id || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          String(t.orderId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          String(t.customer || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter !== 'Status: All') matchesStatus = t.status.toLowerCase() === statusFilter.toLowerCase();

    let matchesMethod = true;
    if (methodFilter !== 'Method: All') matchesMethod = t.method.toLowerCase() === methodFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesMethod;
  });

  const HIGH_VALUE_THRESHOLD = 50000;
  const APPROVER_ROLES = ['finance_manager', 'super_admin', 'admin'];

  const handleProcessRefund = async (docId, id) => {
    // Find the transaction to check its amount
    const txn = transactions.find(t => t._docId === docId || t.id === id);
    const txnAmount = Number(txn?.amount) || 0;

    // High-value refund gate: requires finance_manager or higher
    if (txnAmount > HIGH_VALUE_THRESHOLD && !APPROVER_ROLES.includes(user?.role)) {
      showToast(`⚠️ High-value refund (₹${txnAmount.toLocaleString('en-IN')}) requires Finance Manager approval. Please escalate.`, 'error');
      return;
    }

    showToast("Processing refund...");
    try {
      await updateDoc(doc(db, 'transactions', docId), { status: 'refunded' });
      showToast("Refund successfully processed and settled.");
    } catch (err) {
      showToast("Failed to process refund", "error");
    }
  };

  const handleVerify = async (docId, id) => {
    showToast("Verifying payment settlement with gateway...");
    try {
      await updateDoc(doc(db, 'transactions', docId), { status: 'success' });
      showToast("Payment verified and settled.");
    } catch (err) {
      showToast("Failed to verify payment", "error");
    }
  };

  const handleCheckLogs = (id) => {
    setLogModal({ isOpen: true, txnId: id });
  };

  const handleDownloadPDF = (txn) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Payment Receipt - ${txn.id}</title>
          <style>
            body { font-family: monospace; color: #000; padding: 2rem; max-width: 600px; margin: 0 auto; }
            h2 { margin: 0; font-family: 'Playfair Display', serif; font-size: 1.8rem; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 1rem; margin-bottom: 2rem; }
            .details { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem; font-size: 0.85rem; }
            .footer { text-align: center; color: #888; font-size: 0.7rem; margin-top: 3rem; border-top: 1px solid #ddd; padding-top: 1rem; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h2>LUMINA JEWELS</h2>
              <div style="font-size: 0.8rem; color: #555;">Payment Receipt</div>
            </div>
            <div style="text-align: right;">
              <strong style="font-size: 1.2rem;">${txn.id}</strong><br/>
              <span style="font-size: 0.8rem; color: #555;">Date: ${txn.date}</span>
            </div>
          </div>
          
          <div class="details">
            <div>
              <strong style="text-transform: uppercase; color: #888; font-size: 0.7rem;">Customer Details:</strong><br/>
              <strong>${txn.customer}</strong><br/>
              Order Ref: ${txn.orderId}
            </div>
            <div>
              <strong style="text-transform: uppercase; color: #888; font-size: 0.7rem;">Payment Details:</strong><br/>
              <strong>Method:</strong> ${txn.method}<br/>
              <strong>Gateway:</strong> ${txn.gateway}<br/>
              <strong>Status:</strong> ${txn.status.toUpperCase()}
            </div>
          </div>

          <div style="background: #f9f9f9; padding: 1.5rem; text-align: center; font-size: 1.2rem; border: 1px solid #eee; border-radius: 4px;">
            Amount Paid: <strong>₹${txn.amount.toLocaleString('en-IN')}</strong>
          </div>
          
          <div class="footer">
            This is a computer generated receipt and does not require a physical signature.<br/>
            Lumina Jewels, Mumbai, Maharashtra 400001
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    showToast("Opening PDF Print Dialog...");
  };

  const handleReconcile = () => {
    setIsReconciling(true);
    showToast("Reconciling with payment gateways (Razorpay, Stripe, UPI)...");
    setTimeout(() => {
      const hasPending = transactions.some(t => t.status === 'pending');
      if (hasPending) {
        setTransactions(transactions.map(t => t.status === 'pending' ? { ...t, status: 'success' } : t));
        showToast("Reconciliation complete. Pending settlements have been matched and updated.");
      } else {
        showToast("Reconciliation complete. All records matched. 0 discrepancies found.");
      }
      setIsReconciling(false);
    }, 2000);
  };

  const handleResolveFraud = (actionStr) => {
    showToast(`Security Action: ${actionStr} applied successfully.`);
    setFraudAlerts(fraudAlerts.filter(a => a.id !== securityModal.alert.id));
    setSecurityModal({ isOpen: false, alert: null });
  };

  const handleReleasePayout = (id) => {
    showToast("Processing vendor payout...");
    setTimeout(() => {
      setVendors(vendors.map(v => v.id === id ? { ...v, status: 'paid' } : v));
      showToast("Vendor payout released and settled successfully!");
    }, 1000);
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}><Loader className="spin" size={24} color="var(--gold)" /></div>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Payments & Financial Control</h1>
          <p className="page-subtitle">Monitor online payments, detect fraud, handle refunds, and manage vendor payouts.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline" onClick={handleReconcile} disabled={isReconciling} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <RefreshCw size={16} className={isReconciling ? "spin" : ""} /> {isReconciling ? 'Reconciling...' : 'Reconcile Gateways'}
          </button>
        </div>
      </div>

      <div className="grid-4 mb-15">
        <div className="stat-card">
          <div className="stat-label">Today's Collections</div>
          <div className="stat-value" style={{ color: 'var(--status-green)' }}>₹14.5L</div>
          <div className="stat-trend up" style={{ marginTop: '0.5rem' }}>↑ 12% vs yesterday</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending Settlements</div>
          <div className="stat-value" style={{ color: 'var(--status-orange)' }}>₹2.8L</div>
          <div className="stat-trend" style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>from Razorpay & Stripe</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Refunds Processed</div>
          <div className="stat-value" style={{ color: 'var(--status-purple)' }}>₹4.2L</div>
          <div className="stat-trend" style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>14 transactions (May)</div>
        </div>
        <div className="stat-card" style={{ background: fraudAlerts.length > 0 ? 'var(--status-red-bg)' : 'var(--surface)', border: fraudAlerts.length > 0 ? '1px solid var(--status-red)' : '1px solid var(--border-color)' }}>
          <div className="stat-label" style={{ color: fraudAlerts.length > 0 ? 'var(--status-red)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShieldAlert size={14} /> Suspicious Activity
          </div>
          <div className="stat-value" style={{ color: fraudAlerts.length > 0 ? 'var(--status-red)' : 'var(--text-primary)' }}>{fraudAlerts.length} Alerts</div>
          <div className="stat-trend" style={{ marginTop: '0.5rem', color: 'var(--text-primary)', fontSize: '0.75rem' }}>
            {fraudAlerts.length > 0 ? 'Requires manual verification' : 'All systems clear'}
          </div>
        </div>
      </div>

      <div className="grid-2 mb-15">
        <div className="admin-card">
           <h3 className="card-title" style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <ShieldAlert size={18} color="var(--status-red)" /> Fraud Detection Queue
           </h3>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             {fraudAlerts.length === 0 ? (
               <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--status-green)' }}>
                 <CheckCircle size={32} style={{ marginBottom: '1rem' }} />
                 <div>No suspicious activity detected.</div>
               </div>
             ) : (
               fraudAlerts.map(alert => (
                 <div key={alert.id} style={{ padding: '1rem', background: 'var(--surface)', borderRadius: '8px', borderLeft: `3px solid var(--status-${alert.level === 'danger' ? 'red' : 'orange'})` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{alert.id}</span>
                      <span className={`badge badge-${alert.level}`}>{alert.label}</span>
                    </div>
                    <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{alert.description}</p>
                    <button className="btn btn-sm btn-outline" onClick={() => setSecurityModal({ isOpen: true, alert })}>Review Case</button>
                 </div>
               ))
             )}
           </div>
        </div>

        <div className="admin-card">
           <h3 className="card-title" style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <Clock size={18} color="var(--gold)" /> Vendor Commissions & Payouts
           </h3>
           <div className="admin-table-wrap">
             <table className="admin-table" style={{ fontSize: '0.85rem' }}>
               <thead>
                 <tr>
                   <th>Vendor</th>
                   <th>Due Amount</th>
                   <th>Status</th>
                   <th>Action</th>
                 </tr>
               </thead>
               <tbody>
                 {vendors.map(v => (
                   <tr key={v.id}>
                     <td style={{ fontWeight: 600 }}>{v.name}</td>
                     <td style={{ fontFamily: 'Inter', fontWeight: 600 }}>{v.amount}</td>
                     <td>
                       <span className={`badge badge-${v.status === 'pending' ? 'warning' : 'success'}`}>
                         {v.status.charAt(0).toUpperCase() + v.status.slice(1)}
                       </span>
                     </td>
                     <td>
                       {v.status === 'pending' ? (
                         <button className="btn btn-sm btn-gold" style={{ color: '#FFFFFF', fontWeight: 700, padding: '0.4rem 0.8rem' }} onClick={() => handleReleasePayout(v.id)}>
                           Release
                         </button>
                       ) : (
                         <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}>
                           <CheckCircle size={14} /> Settled
                         </span>
                       )}
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      </div>

      <div className="admin-card">
        <div className="card-header">
          <div className="card-title">Transaction Ledger & Billing</div>
        </div>

        <div className="filter-bar" style={{ marginBottom: '1.25rem' }}>
          <div className="filter-search" style={{ margin: 0, width: '250px' }}>
            <Search size={14} />
            <input 
              placeholder="Search TXN ID, Order ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select className="form-input" style={{ width: '150px', padding: '0.475rem 0.875rem' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option>Status: All</option>
            <option>Success</option>
            <option>Pending</option>
            <option>Failed</option>
            <option>Refunded</option>
          </select>
          <select className="form-input" style={{ width: '150px', padding: '0.475rem 0.875rem' }} value={methodFilter} onChange={e => setMethodFilter(e.target.value)}>
            <option>Method: All</option>
            <option>UPI</option>
            <option>Credit Card</option>
            <option>Debit Card</option>
            <option>Net Banking</option>
            <option>Wallets</option>
            <option>EMI</option>
            <option>Cash on Delivery</option>
          </select>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Order ID & Customer</th>
                <th>Amount & Method</th>
                <th>Gateway</th>
                <th>Status</th>
                <th>Action</th>
                <th>Billing</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No transactions found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map(t => (
                  <tr key={t.id}>
                    <td style={{ color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: '0.8rem' }}>{t.id}</td>
                    <td>
                      <div style={{ color: 'var(--gold)', fontWeight: 700, fontFamily: 'monospace', fontSize: '0.8rem' }}>{t.orderId}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.customer}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>₹{t.amount.toLocaleString('en-IN')}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t.method}</div>
                    </td>
                    <td>{t.gateway}</td>
                    <td>
                      <span className={`badge badge-${t.status}`}>
                        {t.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {t.status === 'success' && <button className="btn btn-sm btn-outline" onClick={() => handleProcessRefund(t._docId, t.id)}>Process Refund</button>}
                      {t.status === 'failed' && <button className="btn btn-sm btn-outline" onClick={() => handleCheckLogs(t.id)}>Check Logs</button>}
                      {t.status === 'pending' && <button className="btn btn-sm btn-outline" onClick={() => handleVerify(t._docId, t.id)}>Verify</button>}
                      {t.status === 'refunded' && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><CheckCircle size={12} /> Settled</span>}
                    </td>
                    <td>
                      {(t.status === 'success' || t.status === 'refunded') && (
                        <button className="btn btn-sm btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--gold)', borderColor: 'var(--border-color)' }} onClick={() => handleDownloadPDF(t)}>
                          <FileText size={12} /> PDF
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {logModal.isOpen && (
        <div className="modal-overlay" onClick={() => setLogModal({ isOpen: false, txnId: null })}>
          <div className="modal-box" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldAlert size={18} color="var(--status-red)" /> Transaction Logs: {logModal.txnId}
              </h3>
              <button className="modal-close" onClick={() => setLogModal({ isOpen: false, txnId: null })}>×</button>
            </div>
            <div className="modal-body" style={{ background: '#111', color: '#00ff00', padding: '1rem', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.8rem', whiteSpace: 'pre-wrap', maxHeight: '300px', overflowY: 'auto' }}>
{`[${new Date().toISOString()}] INIT PAYMENT_REQ ${logModal.txnId}
[${new Date().toISOString()}] CONNECT GATEWAY (Stripe)
[${new Date().toISOString()}] AUTH_CHALLENGE_ISSUED
[${new Date().toISOString()}] 3D_SECURE_VERIFICATION_PENDING
[${new Date().toISOString()}] TIMEOUT: Customer bank server did not respond
[${new Date().toISOString()}] ERROR 504: GATEWAY_TIMEOUT
[${new Date().toISOString()}] PAYMENT_FAILED
-- End of Log --`}
            </div>
            <div className="modal-footer" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setLogModal({ isOpen: false, txnId: null })}>Close</button>
            </div>
          </div>
        </div>
      )}

      {securityModal.isOpen && securityModal.alert && (
        <div className="modal-overlay" onClick={() => setSecurityModal({ isOpen: false, alert: null })}>
          <div className="modal-box" style={{ maxWidth: '600px', borderTop: `4px solid var(--status-${securityModal.alert.level === 'danger' ? 'red' : 'orange'})` }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ marginBottom: '1rem' }}>
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldAlert size={20} color={`var(--status-${securityModal.alert.level === 'danger' ? 'red' : 'orange'})`} /> 
                Security Verification: {securityModal.alert.id}
              </h3>
              <button className="modal-close" onClick={() => setSecurityModal({ isOpen: false, alert: null })}>×</button>
            </div>
            
            <div style={{ background: '#1a1a1a', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <p style={{ color: '#ff6b6b', fontWeight: 600, margin: '0 0 1rem 0', fontSize: '0.9rem' }}>{securityModal.alert.description}</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
                <div><span style={{ color: 'var(--text-muted)' }}>Customer:</span> <br/><strong style={{ color: '#fff' }}>{securityModal.alert.customer}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Transaction Amount:</span> <br/><strong style={{ color: '#fff', fontSize: '1.1rem' }}>{securityModal.alert.amount}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Risk Level:</span> <br/><span className={`badge badge-${securityModal.alert.level}`}>{securityModal.alert.label}</span></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Location/IP:</span> <br/><strong style={{ color: '#fff', fontFamily: 'monospace' }}>198.51.100.42 (Flagged)</strong></div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Required Actions:</h4>
              <button className="btn btn-outline" style={{ color: 'var(--status-red)', borderColor: 'var(--status-red)', justifyContent: 'center' }} onClick={() => handleResolveFraud('Decline & Block IP/User')}>
                Deny Transaction & Block Origin
              </button>
              <button className="btn btn-outline" style={{ color: 'var(--status-orange)', borderColor: 'var(--status-orange)', justifyContent: 'center' }} onClick={() => handleResolveFraud('Hold & Request KYC')}>
                Place on Hold & Request Manual KYC Verification
              </button>
              <button className="btn btn-outline" style={{ color: 'var(--status-green)', borderColor: 'var(--status-green)', justifyContent: 'center' }} onClick={() => handleResolveFraud('Whitelist & Approve')}>
                Whitelist (Verify Large-Value Purchase)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
