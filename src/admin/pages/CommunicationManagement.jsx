import { useState, useRef } from 'react';
import { communications } from '../data/mockData';
import {
  Mail, MessageSquare, Send, Bell, Search, X, Plus, Eye, Upload,
  RefreshCw, Calendar, Shield, FileText, CheckCircle, Clock,
  Package, Star, ChevronDown, Download, Trash2, Users
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { db } from '../../config/firebase';
import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { useEffect } from 'react';
// ─── Mock Data ────────────────────────────────────────────────────────────────
const mockCertificates = [
  { id: 'CERT-001', customer: 'Priya Sharma', product: 'Diamond Solitaire Ring', certNo: 'GIA-20240512', issueDate: '12 May 2024', status: 'verified', file: 'gia_ring.pdf' },
  { id: 'CERT-002', customer: 'Anil Mehta', product: 'Gold Antique Bangle', certNo: 'BIS-20240610', issueDate: '10 Jun 2024', status: 'pending', file: null },
  { id: 'CERT-003', customer: 'Sneha Rao', product: 'Polki Kundan Set', certNo: 'IGI-20240701', issueDate: '01 Jul 2024', status: 'verified', file: 'igi_polki.pdf' },
];

const mockExchanges = [
  { id: 'EXC-001', customer: 'Rahul Gupta', product: 'Old Gold Chain (22K)', weight: '15g', estimatedValue: '₹89,400', status: 'pending', requested: '28 May 2026' },
  { id: 'EXC-002', customer: 'Meena Iyer', product: 'Silver Bracelet', weight: '30g', estimatedValue: '₹3,200', status: 'approved', requested: '25 May 2026' },
  { id: 'EXC-003', customer: 'Vikram Nair', product: 'Old Diamond Stud', weight: '2g', estimatedValue: '₹28,000', status: 'completed', requested: '20 May 2026' },
];

const mockAppointments = [
  { id: 'APT-001', customer: 'Priya Sharma', type: 'Bridal Consultation', date: '2026-06-01', time: '11:00', location: 'Mumbai HQ', status: 'confirmed' },
  { id: 'APT-002', customer: 'Ramesh Kumar', type: 'Jewellery Trial', date: '2026-06-03', time: '14:00', location: 'Delhi Store', status: 'pending' },
  { id: 'APT-003', customer: 'Anita Patel', type: 'Gold Exchange Consultation', date: '2026-06-05', time: '10:30', location: 'Virtual (Zoom)', status: 'confirmed' },
];

const mockSchemes = [
  { id: 'SCH-001', customer: 'Sunita Devi', plan: 'Swarna Nidhi 11-Month', installment: '₹5,000', paid: 8, total: 11, status: 'active' },
  { id: 'SCH-002', customer: 'Mahesh Patel', plan: 'Diamond Savings 12-Month', installment: '₹10,000', paid: 12, total: 12, status: 'completed' },
  { id: 'SCH-003', customer: 'Kavya Rao', plan: 'Silver Plan 6-Month', installment: '₹2,000', paid: 3, total: 6, status: 'active' },
];

const mockTransparency = [
  { product: 'Diamond Solitaire Ring', makingCharge: 12, hallmarkFee: 2, gst: 3, stoneCost: 45, metalCost: 38, visible: true },
  { product: 'Gold Antique Bangle', makingCharge: 15, hallmarkFee: 2, gst: 3, stoneCost: 0, metalCost: 80, visible: true },
  { product: 'Polki Kundan Choker', makingCharge: 20, hallmarkFee: 2, gst: 3, stoneCost: 30, metalCost: 45, visible: false },
];

// ─── Tab config ───────────────────────────────────────────────────────────────
const TABS = [
  { id: 'exchanges', label: 'Exchange/Buyback', icon: RefreshCw },
  { id: 'appointments', label: 'Appointments', icon: Calendar },
  { id: 'schemes', label: 'Scheme Enrollments', icon: Star },
  { id: 'transparency', label: 'Transparency', icon: Eye },
  { id: 'subscribers', label: 'Subscribers', icon: Users },
];

export default function CommunicationManagement() {
  const { showToast } = useApp();
  const [activeTab, setActiveTab] = useState('exchanges');
  const [searchTerm, setSearchTerm] = useState('');

  const handleDownload = (filename) => {
    // Create a dummy PDF blob for demonstration purposes
    const content = `This is a digital certificate mockup for ${filename || 'document'}.\n\nCertificate details and hallmarks would appear here.`;
    const blob = new Blob([content], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'certificate.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Downloading ${filename || 'certificate.pdf'}...`, 'success');
  };

  // Certificates state
  const [certificates, setCertificates] = useState(mockCertificates);
  const [uploadModal, setUploadModal] = useState({ open: false, certId: null });
  const fileRef = useRef(null);

  // Exchanges state
  const [exchanges, setExchanges] = useState(mockExchanges);

  // Appointments state
  const [appointments, setAppointments] = useState(mockAppointments);
  const [newAptOpen, setNewAptOpen] = useState(false);
  const [newApt, setNewApt] = useState({ customer: '', type: 'Bridal Consultation', date: '', time: '10:00', location: 'Mumbai HQ' });

  // Schemes state
  const [schemes, setSchemes] = useState(mockSchemes);
  const [newSchemeOpen, setNewSchemeOpen] = useState(false);
  const [newScheme, setNewScheme] = useState({ customer: '', plan: 'Swarna Nidhi 11-Month', installment: 5000 });

  // Transparency state
  const [transparencyItems, setTransparencyItems] = useState(mockTransparency);

  // Subscribers state
  const [subscribers, setSubscribers] = useState([]);
  const [loadingSubscribers, setLoadingSubscribers] = useState(false);

  useEffect(() => {
    if (activeTab === 'subscribers') {
      fetchSubscribers();
    }
  }, [activeTab]);

  const fetchSubscribers = async () => {
    setLoadingSubscribers(true);
    try {
      const q = query(collection(db, 'newsletter_subscribers'), orderBy('subscribedAt', 'desc'));
      const snapshot = await getDocs(q);
      const subs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().subscribedAt?.toDate().toLocaleDateString('en-GB') || 'Unknown'
      }));
      setSubscribers(subs);
    } catch (err) {
      console.error("Error fetching subscribers:", err);
      // Fallback to empty if missing permissions or db
    } finally {
      setLoadingSubscribers(false);
    }
  };

  const handleUnsubscribe = async (subId, email) => {
    if (!window.confirm(`Are you sure you want to remove ${email} from the newsletter list?`)) return;
    try {
      await deleteDoc(doc(db, 'newsletter_subscribers', subId));
      setSubscribers(subscribers.filter(s => s.id !== subId));
      showToast(`${email} has been unsubscribed.`);
    } catch (err) {
      console.error("Error deleting subscriber:", err);
      showToast("Failed to remove subscriber.");
    }
  };

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const handleUploadCert = (certId) => {
    setCertificates(certificates.map(c =>
      c.id === certId ? { ...c, status: 'verified', file: 'uploaded_cert.pdf' } : c
    ));
    showToast('Certificate uploaded and verified!');
    setUploadModal({ open: false, certId: null });
  };

  const handleExchangeStatus = (id, status) => {
    setExchanges(exchanges.map(e => e.id === id ? { ...e, status } : e));
    showToast(`Exchange request ${status}.`);
  };

  const handleAptStatus = (id, status) => {
    setAppointments(appointments.map(a => a.id === id ? { ...a, status } : a));
    showToast(`Appointment ${status}.`);
  };

  const handleBookApt = (e) => {
    e.preventDefault();
    const apt = {
      id: `APT-${Math.floor(100 + Math.random() * 900)}`,
      ...newApt,
      status: 'confirmed'
    };
    setAppointments([apt, ...appointments]);
    showToast(`Appointment booked for ${newApt.customer}!`);
    setNewAptOpen(false);
    setNewApt({ customer: '', type: 'Bridal Consultation', date: '', time: '10:00', location: 'Mumbai HQ' });
  };

  const handleEnrollScheme = (e) => {
    e.preventDefault();
    const s = {
      id: `SCH-${Math.floor(100 + Math.random() * 900)}`,
      customer: newScheme.customer,
      plan: newScheme.plan,
      installment: `₹${Number(newScheme.installment).toLocaleString()}`,
      paid: 0,
      total: newScheme.plan.includes('11') ? 11 : newScheme.plan.includes('12') ? 12 : 6,
      status: 'active'
    };
    setSchemes([s, ...schemes]);
    showToast(`Scheme enrollment created for ${newScheme.customer}!`);
    setNewSchemeOpen(false);
    setNewScheme({ customer: '', plan: 'Swarna Nidhi 11-Month', installment: 5000 });
  };

  const handleToggleTransparency = (idx) => {
    const updated = transparencyItems.map((t, i) => i === idx ? { ...t, visible: !t.visible } : t);
    setTransparencyItems(updated);
    showToast(`Transparency ${updated[idx].visible ? 'enabled' : 'hidden'} for "${updated[idx].product}".`);
  };

  // ─── Status Badge ─────────────────────────────────────────────────────────
  const StatusBadge = ({ status }) => {
    const map = {
      verified: 'badge-active', pending: 'badge-pending', completed: 'badge-delivered',
      approved: 'badge-shipped', confirmed: 'badge-active', active: 'badge-active',
    };
    return <span className={`badge ${map[status] || 'badge-pending'}`}>{status.toUpperCase()}</span>;
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Communication Hub</h1>
          <p className="page-subtitle">Campaigns, notifications, certifications, exchanges, appointments, schemes & price transparency.</p>
        </div>
        <div className="page-actions">
          {activeTab === 'appointments' && (
            <button className="btn btn-gold" style={{ color: '#fff', fontWeight: 'bold' }} onClick={() => setNewAptOpen(true)}>
              <Calendar size={14} /> Book Appointment
            </button>
          )}
          {activeTab === 'schemes' && (
            <button className="btn btn-gold" style={{ color: '#fff', fontWeight: 'bold' }} onClick={() => setNewSchemeOpen(true)}>
              <Plus size={14} /> Enroll Customer
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-nav" style={{ overflowX: 'auto' }}>
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => { setActiveTab(tab.id); setSearchTerm(''); }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}
            >
              <Icon size={14} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* ──── EXCHANGE/BUYBACK TAB ───────────────────────────────────────────── */}
      {activeTab === 'exchanges' && (
        <div className="admin-card">
          <div className="card-header">
            <div className="card-title">Exchange & Buyback Requests</div>
            <div className="card-subtitle">Review and process customer jewellery exchange and buyback requests.</div>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>ID</th><th>Customer</th><th>Item</th><th>Weight</th><th>Est. Value</th><th>Requested</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {exchanges.map(ex => (
                  <tr key={ex.id}>
                    <td style={{ fontFamily: 'monospace', color: 'var(--gold)' }}>{ex.id}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{ex.customer}</td>
                    <td>{ex.product}</td>
                    <td>{ex.weight}</td>
                    <td style={{ color: 'var(--status-green)', fontWeight: 700 }}>{ex.estimatedValue}</td>
                    <td>{ex.requested}</td>
                    <td><StatusBadge status={ex.status} /></td>
                    <td>
                      {ex.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button className="btn btn-sm btn-success" onClick={() => handleExchangeStatus(ex.id, 'approved')}>
                            <CheckCircle size={12} /> Approve
                          </button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleExchangeStatus(ex.id, 'rejected')}>
                            <X size={12} /> Reject
                          </button>
                        </div>
                      )}
                      {ex.status === 'approved' && (
                        <button className="btn btn-sm btn-outline" onClick={() => handleExchangeStatus(ex.id, 'completed')}>
                          Mark Completed
                        </button>
                      )}
                      {(ex.status === 'completed' || ex.status === 'rejected') && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ──── APPOINTMENTS TAB ───────────────────────────────────────────────── */}
      {activeTab === 'appointments' && (
        <div className="admin-card">
          <div className="card-header">
            <div className="card-title">Store Appointments</div>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>ID</th><th>Customer</th><th>Type</th><th>Date</th><th>Time</th><th>Location</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {appointments.map(apt => (
                  <tr key={apt.id}>
                    <td style={{ fontFamily: 'monospace', color: 'var(--gold)' }}>{apt.id}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{apt.customer}</td>
                    <td>{apt.type}</td>
                    <td>{apt.date}</td>
                    <td>{apt.time}</td>
                    <td>{apt.location}</td>
                    <td><StatusBadge status={apt.status} /></td>
                    <td>
                      {apt.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button className="btn btn-sm btn-success" onClick={() => handleAptStatus(apt.id, 'confirmed')}>
                            <CheckCircle size={12} /> Confirm
                          </button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleAptStatus(apt.id, 'cancelled')}>
                            <X size={12} /> Cancel
                          </button>
                        </div>
                      )}
                      {apt.status !== 'pending' && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ──── SCHEME ENROLLMENTS TAB ─────────────────────────────────────────── */}
      {activeTab === 'schemes' && (
        <div className="admin-card">
          <div className="card-header">
            <div className="card-title">Scheme Enrollments</div>
            <div className="card-subtitle">Track customer gold savings plan installments and progress.</div>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>ID</th><th>Customer</th><th>Plan</th><th>Installment</th><th>Progress</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {schemes.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontFamily: 'monospace', color: 'var(--gold)' }}>{s.id}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.customer}</td>
                    <td>{s.plan}</td>
                    <td style={{ fontWeight: 700 }}>{s.installment}/mo</td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.paid}/{s.total} months</div>
                        <div style={{ height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', width: '100px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${(s.paid / s.total) * 100}%`, background: 'linear-gradient(90deg, var(--gold-dark), var(--gold))', borderRadius: '99px' }} />
                        </div>
                      </div>
                    </td>
                    <td><StatusBadge status={s.status} /></td>
                    <td>
                      {s.status === 'active' && (
                        <button className="btn btn-sm btn-outline" onClick={() => {
                          setSchemes(schemes.map(sc => sc.id === s.id ? { ...sc, paid: Math.min(sc.paid + 1, sc.total), status: sc.paid + 1 >= sc.total ? 'completed' : 'active' } : sc));
                          showToast(`Installment recorded for ${s.customer}.`);
                        }}>
                          + Record Installment
                        </button>
                      )}
                      {s.status === 'completed' && <span style={{ fontSize: '0.8rem', color: 'var(--status-green)' }}>✓ Completed</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ──── TRANSPARENCY TAB ───────────────────────────────────────────────── */}
      {activeTab === 'transparency' && (
        <div>
          <div className="admin-card" style={{ marginBottom: '1.25rem', background: 'linear-gradient(90deg, var(--admin-card), rgba(201,168,76,0.04))' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <Eye size={18} color="var(--gold)" />
              <div className="card-title">Price Transparency Control</div>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Control which products show a full breakdown of making charges, hallmark fees, stone cost, metal cost, and GST to customers on the storefront.
            </p>
          </div>

          {transparencyItems.map((item, idx) => (
            <div key={idx} className="admin-card" style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>{item.product}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '0.8rem', color: item.visible ? 'var(--status-green)' : 'var(--text-muted)' }}>
                    {item.visible ? '👁 Visible to customers' : '🚫 Hidden from customers'}
                  </span>
                  <label className="toggle">
                    <input type="checkbox" checked={item.visible} onChange={() => handleToggleTransparency(idx)} />
                    <span className="toggle-slider" />
                  </label>
                </div>
              </div>
              <div className="grid-3" style={{ gap: '0.75rem' }}>
                {[
                  { label: 'Metal Cost', value: `${item.metalCost}%`, color: '#C9A84C' },
                  { label: 'Stone Cost', value: `${item.stoneCost}%`, color: '#3498db' },
                  { label: 'Making Charge', value: `${item.makingCharge}%`, color: '#9b59b6' },
                  { label: 'Hallmark Fee', value: `${item.hallmarkFee}%`, color: '#2ecc71' },
                  { label: 'GST', value: `${item.gst}%`, color: '#e74c3c' },
                ].map(kpi => (
                  <div key={kpi.label} style={{ padding: '0.75rem 1rem', background: 'var(--admin-surface)', borderRadius: '8px', border: '1px solid var(--admin-border)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{kpi.label}</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: kpi.color }}>{kpi.value}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ──── SUBSCRIBERS TAB ────────────────────────────────────────────────── */}
      {activeTab === 'subscribers' && (
        <div className="admin-card">
          <div className="card-header">
            <div className="card-title">Newsletter Subscribers</div>
            <div className="card-subtitle">Manage users who have opted in to receive promotional emails.</div>
            <div className="filter-search" style={{ margin: 0, width: '250px' }}>
              <Search size={14} />
              <input placeholder="Search emails..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
          </div>
          
          <div className="admin-table-wrap">
            {loadingSubscribers ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading subscribers...</div>
            ) : subscribers.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No subscribers found.</div>
            ) : (
              <table className="admin-table">
                <thead><tr><th>Email Address</th><th>Subscription Date</th><th>Source</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {subscribers.filter(s => s.email?.toLowerCase().includes(searchTerm.toLowerCase())).map(s => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Mail size={14} color="var(--gold)" />
                          {s.email}
                        </div>
                      </td>
                      <td>{s.date}</td>
                      <td><span className="badge badge-info">{s.source || 'website'}</span></td>
                      <td><span className="badge badge-active">SUBSCRIBED</span></td>
                      <td>
                        <button className="btn btn-sm btn-danger" onClick={() => handleUnsubscribe(s.id, s.email)}>
                          <Trash2 size={12} /> Unsubscribe
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ──── MODALS ─────────────────────────────────────────────────────────── */}

      {/* Upload Certificate Modal */}
      {uploadModal.open && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3 className="modal-title">Upload Certificate</h3>
              <button className="modal-close" onClick={() => setUploadModal({ open: false, certId: null })}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <div style={{ border: '2px dashed var(--admin-border-bright)', borderRadius: '12px', padding: '2rem', textAlign: 'center', cursor: 'pointer', marginBottom: '1rem' }}
                onClick={() => fileRef.current?.click()}>
                <Upload size={32} color="var(--gold)" style={{ margin: '0 auto 0.75rem' }} />
                <div style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '0.25rem' }}>Click to upload PDF/Image</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Supported: GIA, IGI, BIS Hallmark</div>
                <input ref={fileRef} type="file" accept=".pdf,.jpg,.png" style={{ display: 'none' }} onChange={() => handleUploadCert(uploadModal.certId)} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button className="btn btn-outline" onClick={() => setUploadModal({ open: false, certId: null })}>Cancel</button>
                <button className="btn btn-gold" style={{ color: '#fff' }} onClick={() => handleUploadCert(uploadModal.certId)}>
                  <Upload size={14} /> Confirm Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Book Appointment Modal */}
      {newAptOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3 className="modal-title">Book Appointment</h3>
              <button className="modal-close" onClick={() => setNewAptOpen(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleBookApt} className="modal-body">
              <div className="form-group"><label>Customer Name</label><input required className="form-input" value={newApt.customer} onChange={e => setNewApt({ ...newApt, customer: e.target.value })} /></div>
              <div className="form-group"><label>Consultation Type</label>
                <select className="form-input" value={newApt.type} onChange={e => setNewApt({ ...newApt, type: e.target.value })}>
                  <option>Bridal Consultation</option><option>Jewellery Trial</option><option>Gold Exchange Consultation</option><option>Virtual Video Tour</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}><label>Date</label><input required type="date" className="form-input" value={newApt.date} onChange={e => setNewApt({ ...newApt, date: e.target.value })} min={new Date().toISOString().split('T')[0]} /></div>
                <div className="form-group" style={{ flex: 1 }}><label>Time</label><input required type="time" className="form-input" value={newApt.time} onChange={e => setNewApt({ ...newApt, time: e.target.value })} /></div>
              </div>
              <div className="form-group"><label>Location</label>
                <select className="form-input" value={newApt.location} onChange={e => setNewApt({ ...newApt, location: e.target.value })}>
                  <option>Mumbai HQ</option><option>Delhi Flagship</option><option>Bangalore Studio</option><option>Virtual (Zoom)</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setNewAptOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-gold" style={{ color: '#fff' }}><CheckCircle size={14} /> Book Appointment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enroll Scheme Modal */}
      {newSchemeOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3 className="modal-title">Enroll in Scheme</h3>
              <button className="modal-close" onClick={() => setNewSchemeOpen(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleEnrollScheme} className="modal-body">
              <div className="form-group"><label>Customer Name</label><input required className="form-input" value={newScheme.customer} onChange={e => setNewScheme({ ...newScheme, customer: e.target.value })} /></div>
              <div className="form-group"><label>Savings Plan</label>
                <select className="form-input" value={newScheme.plan} onChange={e => setNewScheme({ ...newScheme, plan: e.target.value })}>
                  <option>Swarna Nidhi 11-Month</option><option>Diamond Savings 12-Month</option><option>Silver Plan 6-Month</option>
                </select>
              </div>
              <div className="form-group"><label>Monthly Installment (₹)</label><input required type="number" min={500} className="form-input" value={newScheme.installment} onChange={e => setNewScheme({ ...newScheme, installment: e.target.value })} /></div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setNewSchemeOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-gold" style={{ color: '#fff' }}><Star size={14} /> Enroll Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
