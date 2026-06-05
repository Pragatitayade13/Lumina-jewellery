import { useState, useMemo } from 'react';
import { FileText, Download, Plus, Search, CheckCircle, Clock, XCircle, RefreshCw, IndianRupee, Printer, Eye, CreditCard } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const COMPANY = {
  name: 'Lumina Jewels',
  address: '412, Jewellers Tower, MG Road, Mumbai – 400 001, Maharashtra',
  gstin: '27AAACL1234F1Z5',
  phone: '+91 22 4821 0000',
  email: 'billing@luminajewels.in',
  logo: '💎'
};

const initialInvoices = [
  { id: 'INV-2026-0041', orderId: '#ORD-88120', customer: 'Priya Sharma', email: 'priya@email.com', phone: '+91 98200 11122', address: 'Flat 12, Andheri West, Mumbai', date: '28 May 2026', dueDate: '07 Jun 2026', items: [{ name: '22K Gold Mangalsutra (8g)', qty: 1, rate: 52800, gst: 3 }, { name: 'Making Charges', qty: 1, rate: 6000, gst: 5 }], status: 'paid', paymentMethod: 'UPI', type: 'invoice' },
  { id: 'INV-2026-0040', orderId: '#ORD-88101', customer: 'Rajesh Mehta', email: 'rajesh@email.com', phone: '+91 97300 55566', address: '22, Juhu Scheme, Mumbai', date: '27 May 2026', dueDate: '06 Jun 2026', items: [{ name: 'Diamond Solitaire Ring (0.5ct)', qty: 1, rate: 95000, gst: 3 }], status: 'pending', paymentMethod: '—', type: 'invoice' },
  { id: 'CN-2026-0012', orderId: '#ORD-88091', customer: 'Anjali Desai', email: 'anjali@email.com', phone: '+91 96400 77788', address: '8, Bandra Hill Road, Mumbai', date: '26 May 2026', dueDate: '—', items: [{ name: 'Silver Oxidised Choker (Returned)', qty: 1, rate: -8500, gst: 3 }], status: 'issued', paymentMethod: 'Credit Note', type: 'credit_note' },
  { id: 'INV-2026-0039', orderId: '#ORD-88080', customer: 'Kavya Nair', email: 'kavya@email.com', phone: '+91 95500 44433', address: 'Block D, Powai, Mumbai', date: '25 May 2026', dueDate: '04 Jun 2026', items: [{ name: '24K Gold Coins (10g x2)', qty: 2, rate: 72800, gst: 3 }, { name: 'Certificate Charges', qty: 1, rate: 500, gst: 18 }], status: 'overdue', paymentMethod: '—', type: 'invoice' },
  { id: 'INV-2026-0038', orderId: '#ORD-88072', customer: 'Sunita Rao', email: 'sunita@email.com', phone: '+91 94600 33322', address: '5, Dadar East, Mumbai', date: '24 May 2026', dueDate: '03 Jun 2026', items: [{ name: 'Polki Kundan Necklace Set', qty: 1, rate: 185000, gst: 3 }], status: 'paid', paymentMethod: 'Net Banking', type: 'invoice' },
];

const calcTotals = (items, calculateTax, customerState) => {
  const subtotal = items.reduce((s, i) => s + i.qty * Math.abs(i.rate), 0);
  let gstAmt = 0;
  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  items.forEach(i => {
    // If the item has a specific gst % hardcoded, we can pass it as a special category or override
    // For simplicity, we'll use calculateTax which handles state logic. 
    // We'll pass the item's gst property directly if it's a number, or fallback to 'gold'.
    const rate = Number(i.gst) || 3;
    const base = i.qty * Math.abs(i.rate);
    
    // Quick inline logic for state splitting to reuse calculateTax's internal logic, 
    // but since we don't have the full hook here, we'll do the splitting.
    // Or we just call the passed `calculateTax` from the hook!
    // Since calculateTax takes (baseAmount, category, destinationState)
    // We will modify useTaxes to accept a raw rate number as category.
    let taxDetails;
    if (calculateTax) {
      taxDetails = calculateTax(base, rate.toString(), customerState || 'Maharashtra', true); // true = isRawRate
    } else {
      taxDetails = { total: (base * rate) / 100, cgst: (base * rate) / 200, sgst: (base * rate) / 200, igst: 0 };
    }
    gstAmt += taxDetails.total;
    cgst += taxDetails.cgst || 0;
    sgst += taxDetails.sgst || 0;
    igst += taxDetails.igst || 0;
  });

  return { subtotal, gstAmt, cgst, sgst, igst, total: subtotal + gstAmt };
};

const statusMeta = {
  paid: { color: 'var(--status-green)', label: 'PAID' },
  pending: { color: 'var(--status-orange)', label: 'PENDING' },
  overdue: { color: 'var(--status-red)', label: 'OVERDUE' },
  issued: { color: '#88ccff', label: 'ISSUED' },
  draft: { color: 'var(--text-muted)', label: 'DRAFT' },
};

function generateInvoiceHTML(inv, isCreditNote = false, calculateTax) {
  const { subtotal, gstAmt, cgst, sgst, igst, total } = calcTotals(inv.items, calculateTax, inv.state || 'Maharashtra');
  const titleColor = isCreditNote ? '#e74c3c' : '#c9a84c';
  return `<!DOCTYPE html><html><head><title>${isCreditNote ? 'Credit Note' : 'Tax Invoice'} ${inv.id}</title>
  <style>
    body{font-family:Arial,sans-serif;margin:0;padding:2rem;color:#222;font-size:13px}
    .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:2rem;padding-bottom:1.5rem;border-bottom:3px solid ${titleColor}}
    .logo{font-size:2rem;margin-bottom:0.2rem}
    .company-name{font-size:1.4rem;font-weight:800;color:${titleColor};margin:0}
    .doc-type{font-size:1.2rem;font-weight:700;color:${titleColor};text-align:right}
    .doc-id{font-size:0.9rem;color:#666;text-align:right}
    .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:2rem;margin-bottom:1.5rem}
    .info-box{padding:1rem;background:#f9f9f9;border-radius:6px}
    .info-label{font-size:0.7rem;text-transform:uppercase;color:#999;margin-bottom:0.3rem;font-weight:600}
    .info-value{font-size:0.9rem;color:#333}
    table{width:100%;border-collapse:collapse;margin-bottom:1.5rem}
    th{background:${titleColor};color:#fff;padding:10px;text-align:left;font-size:0.8rem}
    td{padding:10px;border-bottom:1px solid #eee;font-size:0.85rem}
    .totals{width:300px;margin-left:auto}
    .total-row{display:flex;justify-content:space-between;padding:0.4rem 0;font-size:0.9rem}
    .total-final{font-weight:800;font-size:1.1rem;color:${titleColor};border-top:2px solid ${titleColor};padding-top:0.5rem;margin-top:0.5rem}
    .footer{text-align:center;margin-top:3rem;padding-top:1rem;border-top:1px solid #eee;font-size:0.75rem;color:#999}
    .badge{display:inline-block;padding:0.3rem 0.8rem;border-radius:12px;font-weight:700;font-size:0.75rem;background:${isCreditNote ? '#fde8e8' : '#e8f5e9'};color:${isCreditNote ? '#c0392b' : '#27ae60'}}
  </style></head>
  <body>
    <div class="header">
      <div>
        <div class="logo">${COMPANY.logo}</div>
        <p class="company-name">${COMPANY.name}</p>
        <p style="margin:0;color:#666;font-size:0.8rem">${COMPANY.address}</p>
        <p style="margin:0;color:#666;font-size:0.8rem">GSTIN: ${COMPANY.gstin} | ${COMPANY.phone}</p>
      </div>
      <div style="text-align:right">
        <div class="doc-type">${isCreditNote ? 'CREDIT NOTE' : 'TAX INVOICE'}</div>
        <div class="doc-id">${inv.id}</div>
        <div style="color:#666;font-size:0.8rem">Date: ${inv.date}</div>
        ${!isCreditNote ? `<div style="color:#666;font-size:0.8rem">Due: ${inv.dueDate}</div>` : ''}
        <span class="badge">${isCreditNote ? 'CREDIT NOTE' : statusMeta[inv.status]?.label}</span>
      </div>
    </div>
    <div class="info-grid">
      <div class="info-box">
        <div class="info-label">Bill To</div>
        <div class="info-value"><strong>${inv.customer}</strong></div>
        <div class="info-value">${inv.address}</div>
        <div class="info-value">${inv.email}</div>
        <div class="info-value">${inv.phone}</div>
      </div>
      <div class="info-box">
        <div class="info-label">Order Reference</div>
        <div class="info-value"><strong>${inv.orderId}</strong></div>
        <div class="info-label" style="margin-top:0.8rem">Payment Method</div>
        <div class="info-value">${inv.paymentMethod}</div>
      </div>
    </div>
    <table>
      <tr><th>#</th><th>Description</th><th>Qty</th><th>Unit Price</th><th>GST %</th><th>GST Type</th><th>GST Amt</th><th>Total</th></tr>
      ${inv.items.map((item, i) => {
        const lineTotal = item.qty * Math.abs(item.rate);
        const rate = Number(item.gst) || 3;
        let taxDetails;
        if (calculateTax) {
          taxDetails = calculateTax(lineTotal, rate.toString(), inv.state || 'Maharashtra', true);
        } else {
          taxDetails = { total: (lineTotal * rate) / 100, type: 'CGST+SGST' };
        }
        return `<tr><td>${i + 1}</td><td>${item.name}</td><td>${item.qty}</td><td>₹${Math.abs(item.rate).toLocaleString('en-IN')}</td><td>${rate}%</td><td><span class="badge" style="background:#f0f0f0;color:#555">${taxDetails.type}</span></td><td>₹${taxDetails.total.toFixed(2)}</td><td>₹${(lineTotal + taxDetails.total).toFixed(2)}</td></tr>`;
      }).join('')}
    </table>
    <div class="totals">
      <div class="total-row"><span>Subtotal:</span><span>₹${subtotal.toLocaleString('en-IN')}</span></div>
      ${igst > 0 ? `<div class="total-row"><span>IGST:</span><span>₹${igst.toFixed(2)}</span></div>` : ''}
      ${cgst > 0 ? `<div class="total-row"><span>CGST:</span><span>₹${cgst.toFixed(2)}</span></div>` : ''}
      ${sgst > 0 ? `<div class="total-row"><span>SGST:</span><span>₹${sgst.toFixed(2)}</span></div>` : ''}
      <div class="total-row total-final"><span>${isCreditNote ? 'Credit Amount:' : 'Grand Total:'}</span><span>${isCreditNote ? '-' : ''}₹${total.toFixed(2)}</span></div>
    </div>
    <div class="footer">Thank you for choosing ${COMPANY.name} | Computer Generated ${isCreditNote ? 'Credit Note' : 'Invoice'} — No Signature Required</div>
  </body></html>`;
}

import { useTaxes } from '../../hooks/useTaxes';

export default function InvoiceBilling() {
  const { showToast } = useApp();
  const { calculateTax } = useTaxes();
  const [invoices, setInvoices] = useState(initialInvoices);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [previewInv, setPreviewInv] = useState(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newInvType, setNewInvType] = useState('invoice');
  const [newInv, setNewInv] = useState({ customer: '', email: '', phone: '', address: '', state: 'Maharashtra', orderId: '', paymentMethod: 'UPI', items: [{ name: '', qty: 1, rate: '', gst: 3 }] });

  const filtered = useMemo(() => {
    let list = invoices;
    if (activeTab === 'invoice') list = list.filter(i => i.type === 'invoice');
    if (activeTab === 'credit_note') list = list.filter(i => i.type === 'credit_note');
    if (activeTab === 'overdue') list = list.filter(i => i.status === 'overdue');
    if (search) list = list.filter(i => i.id.toLowerCase().includes(search.toLowerCase()) || i.customer.toLowerCase().includes(search.toLowerCase()) || i.orderId.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [invoices, activeTab, search]);

  const handleDownload = (inv) => {
    showToast(`Generating ${inv.type === 'credit_note' ? 'Credit Note' : 'Invoice'} PDF...`);
    setTimeout(() => {
      const w = window.open('', '_blank');
      w.document.write(generateInvoiceHTML(inv, inv.type === 'credit_note', calculateTax));
      w.document.close();
      w.print();
      showToast('Document ready for download/print!');
    }, 500);
  };

  const handleMarkPaid = (id) => {
    setInvoices(prev => prev.map(i => i.id === id ? { ...i, status: 'paid' } : i));
    showToast('Invoice marked as Paid!');
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
      type: newInvType
    };
    
    // Log tax transaction
    import('firebase/firestore').then(({ collection, addDoc, serverTimestamp }) => {
       import('../../config/firebase').then(({ db }) => {
          if (db) {
            addDoc(collection(db, 'tax_transactions'), {
              displayId: id,
              date: fmt(today),
              amount: subtotal,
              gstPerc: 'mixed', // Invoice has multiple items with different rates
              gstAmount: gstAmt,
              cgst,
              sgst,
              igst,
              state: newInv.state,
              type: igst > 0 ? 'IGST' : 'CGST+SGST',
              source: 'invoice_billing',
              createdAt: serverTimestamp()
            }).catch(console.error);
          }
       });
    });

    setInvoices(prev => [invoice, ...prev]);
    showToast(`${isCN ? 'Credit Note' : 'Invoice'} ${id} generated!`);
    setShowNewModal(false);
    setNewInv({ customer: '', email: '', phone: '', address: '', state: 'Maharashtra', orderId: '', paymentMethod: 'UPI', items: [{ name: '', qty: 1, rate: '', gst: 3 }] });
    setTimeout(() => handleDownload(invoice), 800);
  };

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
                const sm = statusMeta[inv.status] || statusMeta.pending;
                return (
                  <tr key={inv.id}>
                    <td>
                      <div style={{ fontWeight: 700, fontFamily: 'monospace', color: isCN ? '#88ccff' : 'var(--gold)' }}>{inv.id}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{isCN ? 'Credit Note' : 'Tax Invoice'}</div>
                    </td>
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
                      <span style={{ padding: '0.3rem 0.7rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, background: `${sm.color}22`, color: sm.color }}>
                        {sm.label}
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
                          <button className="btn btn-sm btn-gold" style={{ backgroundColor: 'var(--gold)', color: '#FFFFFF', fontWeight: 700, border: 'none', fontSize: '0.75rem' }} onClick={() => handleMarkPaid(inv.id)}>
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
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: accentColor }}>{COMPANY.logo} {COMPANY.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>{COMPANY.address}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>GSTIN: {COMPANY.gstin}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: accentColor }}>{isCN ? 'CREDIT NOTE' : 'TAX INVOICE'}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>#{previewInv.id}</div>
                    <span style={{ padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, background: `${statusMeta[previewInv.status]?.color}22`, color: statusMeta[previewInv.status]?.color }}>
                      {statusMeta[previewInv.status]?.label}
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
                      const lineTotal = item.qty * Math.abs(item.rate);
                      const lineGST = lineTotal * item.gst / 100;
                      return (
                        <tr key={i}>
                          <td>{i + 1}</td>
                          <td>{item.name}</td>
                          <td>{item.qty}</td>
                          <td>₹{Math.abs(item.rate).toLocaleString('en-IN')}</td>
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
          <div className="modal-box" style={{ maxWidth: '640px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ flexShrink: 0 }}>
              <h3 className="modal-title">{newInvType === 'credit_note' ? '📋 New Credit Note' : '🧾 Generate New Invoice'}</h3>
              <button className="modal-close" onClick={() => setShowNewModal(false)}>×</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', flex: 1, paddingRight: '0.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Customer Name *</label>
                  <input placeholder="e.g. Priya Sharma" value={newInv.customer} onChange={e => setNewInv({ ...newInv, customer: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Order ID *</label>
                  <input placeholder="#ORD-XXXXX" value={newInv.orderId} onChange={e => setNewInv({ ...newInv, orderId: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input placeholder="customer@email.com" value={newInv.email} onChange={e => setNewInv({ ...newInv, email: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input placeholder="+91 XXXXX XXXXX" value={newInv.phone} onChange={e => setNewInv({ ...newInv, phone: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Billing Address</label>
                <input placeholder="Full address" value={newInv.address} onChange={e => setNewInv({ ...newInv, address: e.target.value })} />
              </div>
              <div className="form-group">
                <label>State (Place of Supply)</label>
                <select value={newInv.state} onChange={e => setNewInv({ ...newInv, state: e.target.value })} style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                </select>
              </div>
              {newInvType === 'invoice' && (
                <div className="form-group">
                  <label>Payment Method</label>
                  <select value={newInv.paymentMethod} onChange={e => setNewInv({ ...newInv, paymentMethod: e.target.value })}>
                    {['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Cash', 'EMI', 'Wallet'].map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
              )}

              <div>
                <div style={{ fontWeight: 700, marginBottom: '0.8rem', color: 'var(--text-primary)' }}>Line Items</div>
                {newInv.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                    <input placeholder="Item description" value={item.name} onChange={e => handleItemChange(idx, 'name', e.target.value)} />
                    <input type="number" placeholder="Qty" value={item.qty} onChange={e => handleItemChange(idx, 'qty', e.target.value)} min="1" />
                    <input type="number" placeholder="Rate ₹" value={item.rate} onChange={e => handleItemChange(idx, 'rate', e.target.value)} />
                    <select value={item.gst} onChange={e => handleItemChange(idx, 'gst', e.target.value)}>
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
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', flexShrink: 0, borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '1rem' }}>
              <button className="btn btn-outline" onClick={() => setShowNewModal(false)}>Cancel</button>
              <button className="btn btn-gold" onClick={handleGenerateInvoice} style={{ backgroundColor: 'var(--gold)', color: '#FFFFFF', fontWeight: 800, border: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FileText size={14} /> {newInvType === 'credit_note' ? 'Issue Credit Note' : 'Generate & Download'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
