import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Search, Plus, X, ShoppingCart, Trash2, Printer, User, IndianRupee } from 'lucide-react';
import { getItems } from '../api';

const GST_RATE = 0.03; // 3% jewellery GST

const DEMO_ITEMS = [
  { id: '1', name: '22K Gold Necklace',    category: 'Gold',    material: '22K Gold',  sellingPrice: 84500,  stock: 3 },
  { id: '2', name: 'Diamond Solitaire Ring',category: 'Diamond', material: 'Diamond',   sellingPrice: 135000, stock: 7 },
  { id: '3', name: 'Antique Jhumka Set',    category: 'Gold',    material: '18K Gold',  sellingPrice: 42000,  stock: 12},
  { id: '4', name: 'Silver Kada',           category: 'Silver',  material: 'Silver',    sellingPrice: 4500,   stock: 24},
  { id: '5', name: 'Pearl Earrings',        category: 'Pearls',  material: 'Pearl',     sellingPrice: 22000,  stock: 8 },
  { id: '6', name: 'Platinum Band',         category: 'Platinum',material: 'Platinum',  sellingPrice: 48000,  stock: 5 },
  { id: '7', name: 'Emerald Pendant',       category: 'Gemstone',material: 'Emerald',   sellingPrice: 67000,  stock: 2 },
  { id: '8', name: 'Gold Bangles Set',      category: 'Gold',    material: '22K Gold',  sellingPrice: 56000,  stock: 6 },
];

const POS = () => {
  const { token } = useSelector(state => state.auth);
  const [items, setItems] = useState(DEMO_ITEMS);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState('');
  const [discount, setDiscount] = useState(0);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getItems({});
        if (data?.length) setItems(data);
      } catch {}
    };
    fetch();
  }, []);

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    (i.category || '').toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(c => c.id !== id));
  const updateQty = (id, qty) => {
    if (qty < 1) return removeFromCart(id);
    setCart(prev => prev.map(c => c.id === id ? { ...c, qty } : c));
  };

  const subtotal = cart.reduce((s, c) => s + c.sellingPrice * c.qty, 0);
  const discountAmt = Math.round(subtotal * discount / 100);
  const gst = Math.round((subtotal - discountAmt) * GST_RATE);
  const total = subtotal - discountAmt + gst;

  const handleComplete = () => {
    if (!cart.length) return;
    setPaid(true);
    setTimeout(() => { setCart([]); setCustomer(''); setDiscount(0); setPaid(false); }, 3000);
  };

  return (
    <div className="admin-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">POS & Billing</h1>
          <p className="page-subtitle">Create bills and process sales</p>
        </div>
      </div>

      <div className="pos-layout">
        {/* Left: Item Search */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: 0 }}>
          <div className="admin-search" style={{ width: '100%' }}>
            <Search size={14} style={{ color: 'rgba(232,224,208,0.35)', flexShrink: 0 }} />
            <input
              placeholder="Search jewellery items…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.85rem', overflowY: 'auto' }}>
            {filtered.map(item => (
              <div
                key={item.id}
                className="admin-card"
                style={{ cursor: 'pointer', padding: '1.1rem' }}
                onClick={() => addToCart(item)}
                id={`item-${item.id}`}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <span className="badge badge-gold" style={{ fontSize: '0.62rem' }}>{item.category || 'Gold'}</span>
                  <span style={{ fontSize: '0.65rem', color: item.stock <= 3 ? '#f87171' : 'rgba(232,224,208,0.35)' }}>
                    {item.stock} in stock
                  </span>
                </div>
                <p style={{ margin: '0 0 0.35rem', fontWeight: 700, color: '#f0ebe0', fontSize: '0.85rem', lineHeight: 1.3 }}>{item.name}</p>
                <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(232,224,208,0.4)' }}>{item.material}</p>
                <p style={{ margin: '0.5rem 0 0', fontWeight: 800, color: '#f3d078', fontSize: '1rem' }}>
                  ₹{item.sellingPrice?.toLocaleString('en-IN')}
                </p>
                <div style={{ marginTop: '0.75rem', padding: '0.5rem', background: 'rgba(212,175,55,0.07)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#d4af37', fontWeight: 600 }}>
                  <Plus size={12} /> Add to Bill
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Bill Sidebar */}
        <div className="pos-bill-sidebar">
          <div style={{ padding: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1rem', color: '#f0ebe0', margin: '0 0 1rem' }}>
              <ShoppingCart size={16} style={{ display: 'inline', marginRight: 6 }} />
              Current Bill
            </h3>
            <div className="admin-search" style={{ width: '100%' }}>
              <User size={13} style={{ color: 'rgba(232,224,208,0.35)', flexShrink: 0 }} />
              <input
                placeholder="Customer name (optional)"
                value={customer}
                onChange={e => setCustomer(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Cart Items */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 1.25rem' }}>
            {cart.length === 0 ? (
              <div className="admin-empty" style={{ padding: '3rem 1rem' }}>
                <div className="admin-empty-icon">🛒</div>
                <h3>Bill is empty</h3>
                <p>Click items to add them to the bill</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {cart.map((item, i) => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.85rem 0', borderBottom: i < cart.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 600, color: '#f0ebe0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                      <p style={{ margin: '0.2rem 0 0', fontSize: '0.72rem', color: 'rgba(212,175,55,0.7)', fontWeight: 700 }}>₹{item.sellingPrice?.toLocaleString('en-IN')}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                      <button onClick={() => updateQty(item.id, item.qty - 1)} style={{ width: 22, height: 22, borderRadius: 6, background: 'rgba(255,255,255,0.06)', border: 'none', color: 'rgba(232,224,208,0.7)', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f0ebe0', minWidth: 16, textAlign: 'center' }}>{item.qty}</span>
                      <button onClick={() => updateQty(item.id, item.qty + 1)} style={{ width: 22, height: 22, borderRadius: 6, background: 'rgba(255,255,255,0.06)', border: 'none', color: 'rgba(232,224,208,0.7)', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                      <button onClick={() => removeFromCart(item.id)} style={{ width: 22, height: 22, borderRadius: 6, background: 'rgba(239,68,68,0.1)', border: 'none', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary */}
          <div style={{ padding: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'rgba(232,224,208,0.45)', whiteSpace: 'nowrap' }}>Discount %</label>
              <input
                type="number" min={0} max={50}
                className="admin-form-input"
                style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                value={discount}
                onChange={e => setDiscount(Math.min(50, Math.max(0, Number(e.target.value))))}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
              {[
                { label: 'Subtotal',   value: `₹${subtotal.toLocaleString('en-IN')}` },
                { label: 'Discount',   value: `-₹${discountAmt.toLocaleString('en-IN')}`, color: '#4ade80' },
                { label: 'GST (3%)',   value: `₹${gst.toLocaleString('en-IN')}` },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: r.color || 'rgba(232,224,208,0.5)' }}>
                  <span>{r.label}</span><span>{r.value}</span>
                </div>
              ))}
              <div className="admin-divider" style={{ margin: '0.4rem 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Playfair Display, serif', fontSize: '1.25rem', fontWeight: 800, color: '#f3d078' }}>
                <span>Total</span><span>₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {paid ? (
              <div style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 12, padding: '1rem', textAlign: 'center', color: '#4ade80', fontWeight: 700 }}>
                ✓ Bill Completed!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <button
                  className="admin-btn admin-btn-gold"
                  style={{ width: '100%', justifyContent: 'center', fontSize: '0.95rem', padding: '0.85rem' }}
                  onClick={handleComplete}
                  disabled={!cart.length}
                  id="complete-sale-btn"
                >
                  <IndianRupee size={15} /> Complete Sale
                </button>
                <button className="admin-btn admin-btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
                  <Printer size={14} /> Print Preview
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default POS;
