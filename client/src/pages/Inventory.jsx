import React, { useState } from 'react';
import { Search, Plus, Filter, Edit2, Trash2, Tag, Upload, Barcode } from 'lucide-react';

const ITEMS = [
  { id: 'ITM-001', sku: 'RG-DIA-01', name: 'Rose Gold Diamond Solitaire', type: 'Ring', metal: '18K Rose Gold', weight: '4.5g', purity: '18K', gem: 'Diamond', gemWeight: '1.2ct', makingCharge: 4500, price: 185000, stock: 3, barcode: '890123456701' },
  { id: 'ITM-002', sku: 'YG-BNC-04', name: 'Bridal Gold Necklace', type: 'Necklace', metal: '22K Yellow Gold', weight: '85.2g', purity: '22K', gem: 'None', gemWeight: '-', makingCharge: 12000, price: 580000, stock: 1, barcode: '890123456702' },
  { id: 'ITM-003', sku: 'PT-BND-02', name: 'Platinum Wedding Band', type: 'Ring', metal: 'Platinum', weight: '8.0g', purity: 'PT950', gem: 'None', gemWeight: '-', makingCharge: 6000, price: 42000, stock: 5, barcode: '890123456703' },
  { id: 'ITM-004', sku: 'YG-EMR-01', name: 'Emerald Drop Pendant', type: 'Pendant', metal: '22K Yellow Gold', weight: '12.4g', purity: '22K', gem: 'Emerald', gemWeight: '2.5ct', makingCharge: 3500, price: 145000, stock: 2, barcode: '890123456704' },
  { id: 'ITM-005', sku: 'SV-TMP-05', name: 'Silver Temple Bangle', type: 'Bangle', metal: 'Silver', weight: '45.0g', purity: '925', gem: 'None', gemWeight: '-', makingCharge: 1500, price: 6500, stock: 8, barcode: '890123456705' },
];

const fmt = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

const AddItemModal = ({ onClose }) => (
  <div className="admin-modal-overlay" onClick={onClose}>
    <div className="admin-modal" style={{ maxWidth: 800 }} onClick={e => e.stopPropagation()}>
      <div className="admin-modal-header">
        <h2 className="admin-modal-title">Add New Jewellery Item</h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(232,224,208,0.5)', cursor: 'pointer' }}>✕</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        {/* Left Col - Images & RFID */}
        <div>
          <div style={{ border: '2px dashed rgba(212,175,55,0.3)', borderRadius: 12, height: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(212,175,55,0.02)', cursor: 'pointer', marginBottom: '1.5rem' }}>
            <Upload size={24} style={{ color: '#d4af37', marginBottom: '0.5rem' }} />
            <span style={{ fontSize: '0.85rem', color: '#f0ebe0', fontWeight: 600 }}>Upload Product Image</span>
            <span style={{ fontSize: '0.7rem', color: 'rgba(232,224,208,0.4)' }}>High-res PNG/JPG</span>
          </div>

          <div className="admin-card" style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Barcode size={16} style={{ color: '#d4af37' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f0ebe0' }}>Barcode / RFID</span>
            </div>
            <input className="admin-form-input" placeholder="Scan or enter code..." style={{ marginBottom: '0.5rem' }} />
            <button className="admin-btn admin-btn-outline" style={{ width: '100%', justifyContent: 'center', padding: '0.4rem', fontSize: '0.75rem' }}>Generate Auto-SKU</button>
          </div>
        </div>

        {/* Right Col - Form */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="admin-form-group" style={{ gridColumn: 'span 2' }}>
            <label className="admin-form-label">Item Name / Description</label>
            <input className="admin-form-input" placeholder="e.g. 22K Gold Antique Choker" />
          </div>
          
          <div className="admin-form-group">
            <label className="admin-form-label">Category / Type</label>
            <select className="admin-form-input">
              <option>Ring</option><option>Necklace</option><option>Earrings</option>
              <option>Bangle/Bracelet</option><option>Pendant</option><option>Chain</option>
            </select>
          </div>
          
          <div className="admin-form-group">
            <label className="admin-form-label">Metal & Purity</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select className="admin-form-input" style={{ flex: 1 }}>
                <option>Gold</option><option>Silver</option><option>Platinum</option><option>Rose Gold</option>
              </select>
              <select className="admin-form-input" style={{ width: 80 }}>
                <option>24K</option><option>22K</option><option>18K</option><option>925</option><option>PT950</option>
              </select>
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Net Weight (g)</label>
            <input className="admin-form-input" type="number" step="0.01" placeholder="e.g. 45.20" />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Making Charges (₹)</label>
            <input className="admin-form-input" type="number" placeholder="e.g. 4500" />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Gemstone Type</label>
            <select className="admin-form-input">
              <option>None</option><option>Diamond</option><option>Emerald</option><option>Ruby</option><option>Sapphire</option><option>Pearl</option>
            </select>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Gemstone Weight (ct)</label>
            <input className="admin-form-input" type="number" step="0.01" placeholder="e.g. 1.50" />
          </div>

          <div className="admin-form-group" style={{ gridColumn: 'span 2', marginTop: '0.5rem' }}>
            <div style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 10, padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(232,224,208,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Calculated Selling Price</p>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.7rem', color: 'rgba(232,224,208,0.4)' }}>Based on live metal rate + making + stones</p>
              </div>
              <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Playfair Display, serif', color: '#f3d078' }}>₹0.00</p>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-divider" />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
        <button className="admin-btn admin-btn-outline" onClick={onClose}>Cancel</button>
        <button className="admin-btn admin-btn-gold">Add Item to Inventory</button>
      </div>
    </div>
  </div>
);

const Inventory = () => {
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const filtered = ITEMS.filter(i => 
    i.name.toLowerCase().includes(search.toLowerCase()) || 
    i.sku.toLowerCase().includes(search.toLowerCase()) ||
    i.barcode.includes(search)
  );

  const totalValue = ITEMS.reduce((sum, item) => sum + (item.price * item.stock), 0);

  return (
    <div className="admin-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventory Management</h1>
          <p className="page-subtitle">Track your jewellery collection, weights, and live valuations</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="admin-btn admin-btn-outline">
            <Barcode size={14} /> Scan RFID
          </button>
          <button className="admin-btn admin-btn-gold" onClick={() => setShowAdd(true)}>
            <Plus size={14} /> Add New Item
          </button>
        </div>
      </div>

      <div className="kpi-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="kpi-card-admin">
          <p className="kpi-label-admin">Total Items</p>
          <p className="kpi-value-admin">{ITEMS.length}</p>
        </div>
        <div className="kpi-card-admin">
          <p className="kpi-label-admin">Low Stock Alerts</p>
          <p className="kpi-value-admin" style={{ color: '#facc15' }}>2</p>
        </div>
        <div className="kpi-card-admin">
          <p className="kpi-label-admin">Total Gold Weight</p>
          <p className="kpi-value-admin">102.1g</p>
        </div>
        <div className="kpi-card-admin">
          <p className="kpi-label-admin">Total Inventory Value</p>
          <p className="kpi-value-admin" style={{ color: '#d4af37' }}>{fmt(totalValue)}</p>
        </div>
      </div>

      <div className="chart-card">
        <div className="chart-header">
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div className="admin-search" style={{ minWidth: 280 }}>
              <Search size={13} style={{ color: 'rgba(232,224,208,0.35)' }} />
              <input placeholder="Search by name, SKU, or scan barcode..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <button className="admin-btn admin-btn-outline" style={{ padding: '0.5rem' }}><Filter size={14} /></button>
          </div>
        </div>

        <div className="admin-table-wrap" style={{ border: 'none' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>SKU / Barcode</th>
                <th>Item Description</th>
                <th>Category</th>
                <th>Metal & Purity</th>
                <th style={{ textAlign: 'right' }}>Weight (g)</th>
                <th>Stones</th>
                <th style={{ textAlign: 'right' }}>Price</th>
                <th style={{ textAlign: 'center' }}>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id}>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 700, color: '#f3d078', fontSize: '0.8rem' }}>{item.sku}</span>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: 'rgba(232,224,208,0.4)' }}>{item.barcode}</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600, color: '#f0ebe0' }}>{item.name}</td>
                  <td><span className="badge badge-gray">{item.type}</span></td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ color: '#e8e0d0', fontSize: '0.8rem' }}>{item.metal}</span>
                      <span style={{ color: 'rgba(212,175,55,0.8)', fontSize: '0.7rem', fontWeight: 600 }}>{item.purity}</span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#e8e0d0' }}>{item.weight}</td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: item.gem !== 'None' ? '#a78bfa' : 'rgba(232,224,208,0.4)' }}>
                      {item.gem !== 'None' ? `${item.gem} (${item.gemWeight})` : 'None'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: '#f3d078' }}>{fmt(item.price)}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`badge ${item.stock > 2 ? 'badge-green' : item.stock > 0 ? 'badge-yellow' : 'badge-red'}`}>
                      {item.stock} in stock
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button style={{ background: 'none', border: 'none', color: 'rgba(212,175,55,0.6)', cursor: 'pointer', padding: 4 }}><Edit2 size={14} /></button>
                      <button style={{ background: 'none', border: 'none', color: 'rgba(248,113,113,0.6)', cursor: 'pointer', padding: 4 }}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && <AddItemModal onClose={() => setShowAdd(false)} />}
    </div>
  );
};

export default Inventory;
