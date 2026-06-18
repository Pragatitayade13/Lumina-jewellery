import { useState, useMemo, useEffect } from 'react';
import { FileText, Download, Plus, Search, CheckCircle, Clock, XCircle, RefreshCw, IndianRupee, Printer, Eye, CreditCard, Loader } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { db } from '../../config/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

import { generateInvoiceHTML, calcInvoiceTotals as calcTotals, downloadInvoice } from '../../utils/invoiceGenerator';
import { useTaxes } from '../../hooks/useTaxes';
import { getStoreQuery } from '../../utils/storeQuery';
import { useScrollLock } from '../../hooks/useScrollLock';
import { useCMS } from '../../context/CMSContext';

export default function InvoiceBilling() {
  const { showToast, activeStoreId, allPublicStores } = useApp();
  const { calculateTax } = useTaxes();
  const { landingPageData, systemSettingsData } = useCMS();
  const shopName = landingPageData?.branding?.storeName || systemSettingsData?.storeName || 'Lumina Jewels';
  const [invoices, setInvoices] = useState([]);
  const [dbLoading, setDbLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [previewInv, setPreviewInv] = useState(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newInvType, setNewInvType] = useState('invoice');
  const [newInv, setNewInv] = useState({ customer: '', email: '', phone: '', address: '', state: 'Maharashtra', orderId: '', paymentMethod: 'UPI', items: [{ name: '', qty: 1, rate: '', gst: 3 }] });

  useScrollLock(showNewModal || !!previewInv);

  // Load invoices from Firebase in real-time
  useEffect(() => {
    if (!db) {
      setDbLoading(false);
      return;
    }
    
    try {
      const q = getStoreQuery(db, 'invoices', activeStoreId, [orderBy('createdAt', 'desc')]);
      const unsub = onSnapshot(q, (snap) => {
        setInvoices(snap.docs.map(d => ({ ...d.data(), _docId: d.id })));
        setDbLoading(false);
      }, (err) => {
        console.error('Error loading invoices:', err);
        setDbLoading(false);
      });
      return () => unsub();
    } catch (err) {
      setInvoices([]);
      setDbLoading(false);
    }
  }, [activeStoreId]);

  const filtered = useMemo(() => {
    let list = invoices;
    if (activeTab === 'invoice') list = list.filter(i => i.type === 'invoice');
    if (activeTab === 'credit_note') list = list.filter(i => i.type === 'credit_note');
    if (activeTab === 'overdue') list = list.filter(i => i.status === 'overdue');
    if (search) list = list.filter(i => String(i.id || '').toLowerCase().includes(search.toLowerCase()) || String(i.customer || '').toLowerCase().includes(search.toLowerCase()) || String(i.orderId || '').toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [invoices, activeTab, search]);

  const handleDownload = (inv) => {
    showToast(`Generating ${inv.type === 'credit_note' ? 'Credit Note' : 'Invoice'} PDF...`);
    downloadInvoice(inv, inv.type === 'credit_note', calculateTax, shopName);
  };

  const handleMarkPaid = async (inv) => {
    if (!inv._docId) {
      showToast('Cannot update: invoice not saved to database.', 'error');
      return;
    }
    try {
      await updateDoc(doc(db, 'invoices', inv._docId), { status: 'paid', paidAt: serverTimestamp() });
      showToast('Invoice marked as Paid!');
    } catch (err) {
      showToast('Failed to update invoice status.', 'error');
    }
  };

  const handleAddItem = () => setNewInv(prev => ({ ...prev, items: [...prev.items, { name: '', qty: 1, rate: '', gst: 3 }] }));
  const handleRemoveItem = (idx) => setNewInv(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
  const handleItemChange = (idx, field, val) => setNewInv(prev => ({ ...prev, items: prev.items.map((item, i) => i === idx ? { ...item, [field]: val } : item) }));

  const handleGenerateInvoice = async () => {
    if (!newInv.customer || !newInv.orderId || !newInv.items[0].name) { showToast('Please fill required fields.', 'error'); return; }
    const today = new Date();
    const due = new Date(today); due.setDate(due.getDate() + 10);
    const fmt = d => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const isCN = newInvType === 'credit_note';
    const nextNum = invoices.length + 1;
    const id = isCN ? `CN-2026-${String(nextNum).padStart(4, '0')}` : `INV-2026-${String(nextNum).padStart(4, '0')}`;
    const mappedItems = newInv.items.map(i => ({ ...i, qty: Number(i.qty), rate: isCN ? -Math.abs(Number(i.rate)) : Number(i.rate), gst: Number(i.gst) }));
    const { subtotal, gstAmt, cgst, sgst, igst, total } = calcTotals(mappedItems, calculateTax, newInv.state);

    const activeStoreObj = activeStoreId && activeStoreId !== 'GLOBAL' && activeStoreId !== 'NONE'
      ? allPublicStores.find(s => s.id === activeStoreId)
      : null;

    const invoice = {
      id,
      orderId: newInv.orderId,
      customer: newInv.customer,
      email: newInv.email,
      phone: newInv.phone,
      address: newInv.address,
      state: newInv.state,
      date: fmt(today),
      dueDate: isCN ? '—' : fmt(due),
      items: mappedItems,
      status: isCN ? 'issued' : 'pending',
      paymentMethod: isCN ? 'Credit Note' : newInv.paymentMethod,
      type: newInvType,
      storeId: activeStoreId && activeStoreId !== 'NONE' ? activeStoreId : 'GLOBAL',
      storeName: activeStoreObj?.name || shopName,
      storeCode: activeStoreObj?.code || 'HQ-01',
      storeAddress: activeStoreObj?.address || '',
      storeContact: activeStoreObj?.contact || activeStoreObj?.phone || '',
      storeGst: activeStoreObj?.gst || activeStoreObj?.gstin || '',
      createdAt: serverTimestamp()
    };

    try {
      // Trigger download immediately for instant user feedback
      handleDownload({ ...invoice });

      // Save invoice to Firebase in the background
      addDoc(collection(db, 'invoices'), invoice).catch(err => {
        console.error('Error saving invoice to Firebase:', err);
      });

      // Also log the tax transaction in the background
      if (db) {
        addDoc(collection(db, 'tax_transactions'), {
          displayId: id,
          date: fmt(today),
          amount: subtotal,
          gstPerc: 'mixed',
          gstAmount: gstAmt,
          cgst, sgst, igst,
          state: newInv.state,
          type: igst > 0 ? 'IGST' : 'CGST+SGST',
          source: 'invoice_billing',
          createdAt: serverTimestamp()
        }).catch(console.error);
      }

      showToast(`${isCN ? 'Credit Note' : 'Invoice'} ${id} generated!`);
      setShowNewModal(false);
      setNewInv({ customer: '', email: '', phone: '', address: '', state: 'Maharashtra', orderId: '', paymentMethod: 'UPI', items: [{ name: '', qty: 1, rate: '', gst: 3 }] });
    } catch (err) {
      console.error('Error generating invoice:', err);
      showToast('Failed to generate invoice. Please try again.', 'error');
    }
  };

  if (dbLoading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}><Loader className="spin" size={24} color="var(--gold)" /></div>;
  }

  const totalPaid = invoices.filter(i => i.status === 'paid' && i.type === 'invoice').reduce((s, i) => s + calcTotals(i.items, calculateTax, i.state || 'Maharashtra').total, 0);
  const totalPending = invoices.filter(i => i.status === 'pending' || i.status === 'overdue').length;
  const totalCreditNotes = invoices.filter(i => i.type === 'credit_note').length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Invoice & Billing System</h1>
          <p className="page-subtitle">Generate GST-compliant invoices, download PDFs, and issue credit notes.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline" onClick={() => { setNewInvType('credit_note'); setShowNewModal(true); }} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <RefreshCw size={14} /> New Credit Note
          </button>
          <button className="btn btn-gold" onClick={() => { setNewInvType('invoice'); setShowNewModal(true); }} style={{ backgroundColor: 'var(--gold)', color: '#FFFFFF', fontWeight: 800, border: 'none', borderRadius: '8px', padding: '0.6rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Plus size={14} /> Generate Invoice
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Invoices', value: invoices.filter(i => i.type === 'invoice').length, color: 'var(--gold)', border: 'var(--gold)' },
          { label: 'Revenue Billed', value: `₹${(totalPaid / 100000).toFixed(1)}L`, color: 'var(--status-green)', border: 'var(--status-green)' },
          { label: 'Awaiting Payment', value: totalPending, color: 'var(--status-orange)', border: 'var(--status-orange)' },
          { label: 'Credit Notes Issued', value: totalCreditNotes, color: '#88ccff', border: '#88ccff' },
        ].map(c => (
          <div key={c.label} className="admin-card" style={{ borderTop: `3px solid ${c.border}` }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>{c.label}</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: c.color }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs + Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex' }}>
          {[['all','All Documents'],['invoice','Invoices'],['credit_note','Credit Notes'],['overdue','Overdue']].map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)} style={{ padding: '0.7rem 1.2rem', background: 'none', border: 'none', borderBottom: activeTab === key ? '2px solid var(--gold)' : '2px solid transparent', color: activeTab === key ? 'var(--gold)' : 'var(--text-muted)', fontWeight: activeTab === key ? 700 : 400, cursor: 'pointer', fontSize: '0.9rem' }}>
              {label}
            </button>
          ))}
        </div>
        <div className="filter-search" style={{ margin: 0 }}>
          <Search size={14} />
          <input placeholder="Search invoice ID, customer..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Invoice Table */}
      <div className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Invoice / CN #</th>
                {activeStoreId === 'GLOBAL' && <th>Store</th>}
                <th>Order Ref</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Due Date</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="9" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No records found.</td></tr>
              ) : filtered.map(inv => {
                const { total } = calcTotals(inv.items, calculateTax, inv.state || 'Maharashtra');
                const isCN = inv.type === 'credit_note';
                return (
                  <tr key={inv.id}>
                    <td>
                      <div style={{ fontWeight: 700, fontFamily: 'monospace', color: isCN ? '#88ccff' : 'var(--gold)' }}>{inv.id}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{isCN ? 'Credit Note' : 'Tax Invoice'}</div>
                    </td>
                    {activeStoreId === 'GLOBAL' && (
                      <td>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{inv.storeName || 'All Stores'}</div>
                      </td>
                    )}
                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{inv.orderId}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{inv.customer}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{inv.email}</div>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{inv.date}</td>
                    <td style={{ fontSize: '0.85rem', color: inv.status === 'overdue' ? 'var(--status-red)' : 'var(--text-secondary)' }}>{inv.dueDate}</td>
                    <td style={{ fontWeight: 700, color: isCN ? 'var(--status-red)' : 'var(--text-primary)' }}>
                      {isCN ? '-' : ''}₹{total.toLocaleString('en-IN')}
                    </td>
                    <td>
                      <span style={{ padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, background: isCN ? 'rgba(136,204,255,0.15)' : 'rgba(201,168,76,0.1)', color: isCN ? '#88ccff' : 'var(--gold)' }}>
                        {isCN ? 'Credit Note' : 'Invoice'}
                      </span>
                    </td>
                    <td>
                      <span style={{ padding: '0.3rem 0.7rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, background: inv.status === 'paid' ? 'rgba(39, 174, 96, 0.15)' : inv.status === 'overdue' ? 'rgba(231, 76, 60, 0.15)' : 'rgba(243, 156, 18, 0.15)', color: inv.status === 'paid' ? '#27ae60' : inv.status === 'overdue' ? '#c0392b' : '#f39c12' }}>
                        {inv.status?.toUpperCase() || 'PENDING'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className="btn btn-sm btn-outline" title="Preview" onClick={() => setPreviewInv(inv)}>
                          <Eye size={13} />
                        </button>
                        <button className="btn btn-sm btn-outline" title="Download PDF" onClick={() => handleDownload(inv)} style={{ color: 'var(--gold)' }}>
                          <Download size={13} />
                        </button>
                        {inv.status === 'pending' || inv.status === 'overdue' ? (
                          <button className="btn btn-sm btn-gold" style={{ backgroundColor: 'var(--gold)', color: '#FFFFFF', fontWeight: 700, border: 'none', fontSize: '0.75rem' }} onClick={() => handleMarkPaid(inv)}>
                            Mark Paid
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* PREVIEW MODAL */}
      {previewInv && (() => {
        const { subtotal, gstAmt, cgst, sgst, igst, total } = calcTotals(previewInv.items, calculateTax, previewInv.state || 'Maharashtra');
        const isCN = previewInv.type === 'credit_note';
        const accentColor = isCN ? 'var(--status-red)' : 'var(--gold)';
        return (
          <div className="modal-overlay" onClick={() => setPreviewInv(null)}>
            <div className="modal-box" style={{ maxWidth: '680px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
              <div className="modal-header" style={{ borderBottom: `3px solid ${accentColor}`, paddingBottom: '1rem', flexShrink: 0 }}>
                <div>
                  <h3 className="modal-title" style={{ color: accentColor }}>{isCN ? '📋 Credit Note' : '🧾 Tax Invoice'}: {previewInv.id}</h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Order: {previewInv.orderId} · Date: {previewInv.date}</div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-outline btn-sm" onClick={() => handleDownload(previewInv)} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--gold)' }}>
                    <Download size={13} /> PDF
                  </button>
                  <button className="modal-close" onClick={() => setPreviewInv(null)}>×</button>
                </div>
              </div>

              <div className="modal-body" style={{ overflowY: 'auto', flex: 1, paddingRight: '0.5rem', paddingTop: '1.5rem' }}>
                {/* Company Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', padding: '1rem', background: 'var(--surface)', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: accentColor }}>Lumina Jewels</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: accentColor }}>{isCN ? 'CREDIT NOTE' : 'TAX INVOICE'}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>#{previewInv.id}</div>
                    <span style={{ padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, background: previewInv.status === 'paid' ? 'rgba(39, 174, 96, 0.15)' : previewInv.status === 'overdue' ? 'rgba(231, 76, 60, 0.15)' : 'rgba(243, 156, 18, 0.15)', color: previewInv.status === 'paid' ? '#27ae60' : previewInv.status === 'overdue' ? '#c0392b' : '#f39c12' }}>
                      {previewInv.status?.toUpperCase() || 'PENDING'}
                    </span>
                  </div>
                </div>

                {/* Bill To */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ padding: '1rem', background: 'var(--surface)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Bill To</div>
                    <div style={{ fontWeight: 700 }}>{previewInv.customer}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{previewInv.address}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{previewInv.email} · {previewInv.phone}</div>
                  </div>
                  <div style={{ padding: '1rem', background: 'var(--surface)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Payment Details</div>
                    <div style={{ fontWeight: 700 }}>{previewInv.paymentMethod}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Due: {previewInv.dueDate}</div>
                  </div>
                </div>

                {/* Items */}
                <table className="admin-table" style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>
                  <thead>
                    <tr>
                      <th>#</th><th>Description</th><th>Qty</th><th>Rate (₹)</th><th>GST %</th><th>Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewInv.items.map((item, i) => {
                      const rate = Number(item.rate) || Number(item.price) || Number(item.cost) || 0;
                      const lineTotal = item.qty * Math.abs(rate);
                      const lineGST = lineTotal * item.gst / 100;
                      return (
                        <tr key={i}>
                          <td>{i + 1}</td>
                          <td>{item.name}</td>
                          <td>{item.qty}</td>
                          <td>₹{Math.abs(rate).toLocaleString('en-IN')}</td>
                          <td>{item.gst}%</td>
                          <td style={{ fontWeight: 700 }}>₹{(lineTotal + lineGST).toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Totals */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <div style={{ minWidth: '250px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      <span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    {igst > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        <span>IGST</span><span>₹{igst.toFixed(2)}</span>
                      </div>
                    )}
                    {cgst > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        <span>CGST</span><span>₹{cgst.toFixed(2)}</span>
                      </div>
                    )}
                    {sgst > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        <span>SGST</span><span>₹{sgst.toFixed(2)}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', fontSize: '1.1rem', fontWeight: 800, color: accentColor, borderTop: `2px solid ${accentColor}`, marginTop: '0.5rem' }}>
                      <span>{isCN ? 'Credit Amount' : 'Grand Total'}</span>
                      <span>{isCN ? '-' : ''}₹{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* GENERATE INVOICE / CREDIT NOTE MODAL */}
      {showNewModal && (
        <div className="modal-overlay" onClick={() => setShowNewModal(false)}>
          <div className="modal-box" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{newInvType === 'credit_note' ? '📋 New Credit Note' : '🧾 Generate New Invoice'}</h2>
              <button className="modal-close" onClick={() => setShowNewModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Customer Name *</label>
                  <input className="form-input" placeholder="e.g. Priya Sharma" value={newInv.customer} onChange={e => setNewInv({ ...newInv, customer: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Order ID *</label>
                  <input className="form-input" placeholder="#ORD-XXXXX" value={newInv.orderId} onChange={e => setNewInv({ ...newInv, orderId: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" placeholder="customer@email.com" value={newInv.email} onChange={e => setNewInv({ ...newInv, email: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" placeholder="+91 XXXXX XXXXX" value={newInv.phone} onChange={e => setNewInv({ ...newInv, phone: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Billing Address</label>
                <input className="form-input" placeholder="Full address" value={newInv.address} onChange={e => setNewInv({ ...newInv, address: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">State (Place of Supply)</label>
                <select className="form-input" value={newInv.state} onChange={e => setNewInv({ ...newInv, state: e.target.value })}>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                </select>
              </div>
              {newInvType === 'invoice' && (
                <div className="form-group">
                  <label className="form-label">Payment Method</label>
                  <select className="form-input" value={newInv.paymentMethod} onChange={e => setNewInv({ ...newInv, paymentMethod: e.target.value })}>
                    {['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Cash', 'EMI', 'Wallet'].map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
              )}

              <div>
                <div className="form-label" style={{ fontWeight: 700, marginBottom: '0.8rem', color: 'var(--text-primary)' }}>Line Items</div>
                {newInv.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                    <input className="form-input" placeholder="Item description" value={item.name} onChange={e => handleItemChange(idx, 'name', e.target.value)} />
                    <input className="form-input" type="number" placeholder="Qty" value={item.qty} onChange={e => handleItemChange(idx, 'qty', e.target.value)} min="1" />
                    <input className="form-input" type="number" placeholder="Rate ₹" value={item.rate} onChange={e => handleItemChange(idx, 'rate', e.target.value)} />
                    <select className="form-input" value={item.gst} onChange={e => handleItemChange(idx, 'gst', e.target.value)}>
                      {[0,3,5,12,18,28].map(g => <option key={g} value={g}>GST {g}%</option>)}
                    </select>
                    {newInv.items.length > 1 && (
                      <button onClick={() => handleRemoveItem(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--status-red)', fontSize: '1.2rem' }}>×</button>
                    )}
                  </div>
                ))}
                <button className="btn btn-outline btn-sm" onClick={handleAddItem} style={{ marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Plus size={12} /> Add Item
                </button>

                {/* Live Total Preview */}
                {(() => {
                  const items = newInv.items.map(i => ({ ...i, qty: Number(i.qty) || 0, rate: Number(i.rate) || 0, gst: Number(i.gst) || 0 }));
                  const { subtotal, gstAmt, cgst, sgst, igst, total } = calcTotals(items, calculateTax, newInv.state);
                  return (
                    <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(201,168,76,0.08)', borderRadius: '8px', border: '1px solid var(--gold)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                        <span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span>
                      </div>
                      {igst > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                          <span>IGST</span><span>₹{igst.toFixed(2)}</span>
                        </div>
                      )}
                      {cgst > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                          <span>CGST</span><span>₹{cgst.toFixed(2)}</span>
                        </div>
                      )}
                      {sgst > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                          <span>SGST</span><span>₹{sgst.toFixed(2)}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 800, color: 'var(--gold)' }}>
                        <span>Grand Total</span><span>₹{total.toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowNewModal(false)}>Cancel</button>
              <button className="btn btn-gold" onClick={handleGenerateInvoice} style={{ color: '#fff' }}>
                <FileText size={14} /> {newInvType === 'credit_note' ? 'Issue Credit Note' : 'Generate & Download'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
