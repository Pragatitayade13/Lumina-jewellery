const COMPANY = {
  name: 'Lumina Jewels',
  address: '412, Jewellers Tower, MG Road, Mumbai – 400 001, Maharashtra',
  gstin: '27AAACL1234F1Z5',
  phone: '+91 22 4821 0000',
  email: 'billing@luminajewels.in',
  logo: '💎'
};

const statusMeta = {
  paid: { color: '#27ae60', label: 'PAID' },
  confirmed: { color: '#27ae60', label: 'PAID' },
  delivered: { color: '#27ae60', label: 'PAID' },
  pending: { color: '#f39c12', label: 'PENDING' },
  overdue: { color: '#c0392b', label: 'OVERDUE' },
  issued: { color: '#88ccff', label: 'ISSUED' },
  draft: { color: '#95a5a6', label: 'DRAFT' },
};

export const calcInvoiceTotals = (items, calculateTax, customerState) => {
  const subtotal = items.reduce((s, i) => s + (Number(i.qty) * Math.abs(Number(i.rate) || Number(i.price) || 0)), 0);
  let gstAmt = 0;
  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  items.forEach(i => {
    const ratePercentage = Number(i.gst) || 3;
    const base = Number(i.qty) * Math.abs(Number(i.rate) || Number(i.price) || 0);
    
    let taxDetails;
    if (calculateTax) {
      // If calculateTax is provided, use it
      taxDetails = calculateTax(base, ratePercentage.toString(), customerState || 'Maharashtra', true);
    } else {
      // Fallback manual calc
      taxDetails = { total: (base * ratePercentage) / 100, cgst: (base * ratePercentage) / 200, sgst: (base * ratePercentage) / 200, igst: 0, type: 'CGST+SGST' };
    }
    gstAmt += taxDetails.total;
    cgst += taxDetails.cgst || 0;
    sgst += taxDetails.sgst || 0;
    igst += taxDetails.igst || 0;
  });

  return { subtotal, gstAmt, cgst, sgst, igst, total: subtotal + gstAmt };
};

export function generateInvoiceHTML(inv, isCreditNote = false, calculateTax) {
  const items = inv.items || [];
  const { subtotal, gstAmt, cgst, sgst, igst, total } = calcInvoiceTotals(items, calculateTax, inv.state || inv.shippingAddress || 'Maharashtra');
  
  const titleColor = isCreditNote ? '#e74c3c' : '#c9a84c';
  const displayStatus = inv.paymentStatus === 'paid' ? 'paid' : inv.status;
  const badgeColor = isCreditNote ? '#c0392b' : (statusMeta[displayStatus]?.color || '#f39c12');
  const badgeBg = isCreditNote ? '#fde8e8' : `${badgeColor}22`;
  const badgeLabel = isCreditNote ? 'CREDIT NOTE' : (statusMeta[displayStatus]?.label || 'PENDING');
  
  const dateStr = inv.date || (inv.createdAt ? new Date(inv.createdAt?.seconds * 1000).toLocaleDateString() : new Date().toLocaleDateString());
  const dueDateStr = inv.dueDate || '—';

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
    .badge{display:inline-block;padding:0.3rem 0.8rem;border-radius:12px;font-weight:700;font-size:0.75rem;background:${badgeBg};color:${badgeColor}}
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
        <div style="color:#666;font-size:0.8rem">Date: ${dateStr}</div>
        ${!isCreditNote ? `<div style="color:#666;font-size:0.8rem">Due: ${dueDateStr}</div>` : ''}
        <div style="margin-top: 5px;"><span class="badge">${badgeLabel}</span></div>
      </div>
    </div>
    <div class="info-grid">
      <div class="info-box">
        <div class="info-label">Bill To</div>
        <div class="info-value"><strong>${inv.customer || inv.customerName || 'Customer'}</strong></div>
        <div class="info-value">${inv.address || inv.shippingAddress || 'Address not provided'}</div>
        <div class="info-value">${inv.email || inv.customerEmail || ''}</div>
        <div class="info-value">${inv.phone || ''}</div>
      </div>
      <div class="info-box">
        <div class="info-label">Order Reference</div>
        <div class="info-value"><strong>${inv.orderId || inv.id}</strong></div>
        <div class="info-label" style="margin-top:0.8rem">Payment Method</div>
        <div class="info-value">${inv.paymentMethod || 'Online Payment'}</div>
      </div>
    </div>
    <table>
      <tr><th>#</th><th>Description</th><th>Qty</th><th>Unit Price</th><th>GST %</th><th>GST Type</th><th>GST Amt</th><th>Total</th></tr>
      ${items.map((item, i) => {
        const lineRate = Math.abs(Number(item.rate) || Number(item.price) || 0);
        const lineQty = Number(item.qty) || 1;
        const lineTotal = lineQty * lineRate;
        const ratePercentage = Number(item.gst) || 3;
        
        let taxDetails;
        if (calculateTax) {
          taxDetails = calculateTax(lineTotal, ratePercentage.toString(), inv.state || inv.shippingAddress || 'Maharashtra', true);
        } else {
          taxDetails = { total: (lineTotal * ratePercentage) / 100, type: 'CGST+SGST' };
        }
        
        return `<tr>
          <td>${i + 1}</td>
          <td>${item.name}</td>
          <td>${lineQty}</td>
          <td>₹${lineRate.toLocaleString('en-IN')}</td>
          <td>${ratePercentage}%</td>
          <td><span class="badge" style="background:#f0f0f0;color:#555">${taxDetails.type}</span></td>
          <td>₹${taxDetails.total.toFixed(2)}</td>
          <td>₹${(lineTotal + taxDetails.total).toFixed(2)}</td>
        </tr>`;
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

export const downloadInvoice = (inv, isCreditNote = false, calculateTax) => {
  const htmlStr = generateInvoiceHTML(inv, isCreditNote, calculateTax);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlStr);
    printWindow.document.close();
    printWindow.focus();
    // Use a slight delay so images/fonts load
    setTimeout(() => {
      printWindow.print();
    }, 500);
  } else {
    alert("Please allow popups to download your invoice.");
  }
};
