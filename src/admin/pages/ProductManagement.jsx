// src/admin/pages/ProductManagement.jsx
import { useState } from 'react';
import { products as mockProducts } from '../data/mockData';
import { useProducts } from '../../hooks/useProducts';
import { useApp } from '../../context/AppContext';
import { db } from '../../config/firebase';
import { Gem, Edit2, Trash2, Search, FileCheck, PieChart, Database, Plus, AlertTriangle, CheckCircle, XCircle, Percent } from 'lucide-react';

export default function ProductManagement() {
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory', 'approvals', 'discounts'
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [stockFilter, setStockFilter] = useState('Stock Status');
  const [isSeeding, setIsSeeding] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [certModal, setCertModal] = useState(null);
  const [transparencyModal, setTransparencyModal] = useState(null);
  const [bulkImportModalOpen, setBulkImportModalOpen] = useState(false);
  const [bulkPricingModalOpen, setBulkPricingModalOpen] = useState(false);
  
  const [localProducts, setLocalProducts] = useState([]);
  const [pendingProducts, setPendingProducts] = useState([
    {
      id: 'prd-pend-1',
      name: '24K Gold Antique Bangle',
      sku: 'SKU-PEND-101',
      category: 'Gold Jewellery',
      subcategory: 'Bangles',
      price: 85000,
      mrp: 90000,
      stock: 5,
      status: 'pending_approval',
      purity: '24KT',
      weight: '20g',
      image: ''
    },
    {
      id: 'prd-pend-2',
      name: 'Diamond Solitaire Pendant',
      sku: 'SKU-PEND-102',
      category: 'Diamond Jewellery',
      subcategory: 'Necklaces',
      price: 125000,
      mrp: 140000,
      stock: 2,
      status: 'pending_approval',
      purity: '18KT',
      weight: '8g',
      image: ''
    }
  ]);
  
  const [newProduct, setNewProduct] = useState({ name: '', sku: '', price: '', mrp: '', category: 'Gold Jewellery', subcategory: 'Rings', stock: '', status: 'active', purity: '22KT', weight: '', image: '', modelUrl: '', arOffsetX: 0, arOffsetY: 0, arOffsetZ: 0, arRotX: 0, arRotY: 0, arRotZ: 0, arScale: 1 });
  
  const { user, showToast, globalSearch, currentStore } = useApp();
  const activeStoreId = currentStore || (user?.role === 'superadmin' ? 'GLOBAL' : 'NONE');
  const { products, loading, error, removeProduct, addProduct, updateProduct, bulkAssignStore } = useProducts(activeStoreId);

  const handleSeedDatabase = async () => {
    if (!confirm("This will upload all mock products to your live Firebase database. Proceed?")) return;
    setIsSeeding(true);
    try {
      for (const p of mockProducts) {
        await addProduct(p);
      }
      alert("Database seeded successfully!");
    } catch (err) {
      alert("Failed to seed database: " + err.message);
    }
    setIsSeeding(false);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await removeProduct(id);
        showToast("Product deleted from live database.");
      } catch(e) {
        setLocalProducts(prev => prev.filter(p => p.id !== id));
        showToast("Product deleted locally.");
      }
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const productData = {
      ...newProduct,
      price: Number(newProduct.price),
      mrp: Number(newProduct.mrp),
      stock: Number(newProduct.stock)
    };
    try {
      showToast("Adding product to database...");
      await addProduct(productData);
      showToast("Product added successfully to live database!");
    } catch(e) {
      const fallbackId = `prd-local-${Date.now()}`;
      // By default, staff adding a product goes to pending
      setPendingProducts(prev => [{...productData, id: fallbackId, status: 'pending_approval'}, ...prev]);
      showToast("Product submitted for manager approval.");
    }
    setIsAddModalOpen(false);
    setNewProduct({ name: '', sku: '', price: '', mrp: '', category: 'Gold Jewellery', subcategory: 'Rings', stock: '', status: 'active', purity: '22KT', weight: '', image: '', modelUrl: '', arOffsetX: 0, arOffsetY: 0, arOffsetZ: 0, arRotX: 0, arRotY: 0, arRotZ: 0, arScale: 1 });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const productData = {
      ...editingProduct,
      price: Number(editingProduct.price),
      mrp: Number(editingProduct.mrp),
      stock: Number(editingProduct.stock),
      status: Number(editingProduct.stock) > 0 ? 'active' : 'out_of_stock'
    };
    
    try {
      showToast("Updating product in database...");
      await updateProduct(productData.id, productData);
      showToast(`Product details updated successfully in live database.`);
    } catch(err) {
      setLocalProducts(prev => prev.map(p => p.id === productData.id ? productData : p));
      showToast(`Product details updated locally.`);
    }
    setEditingProduct(null);
  };

  const handleApprove = async (product) => {
    try {
      showToast(`Approving ${product.name}...`);
      await addProduct({...product, status: 'active'});
      setPendingProducts(prev => prev.filter(p => p.id !== product.id));
      setLocalProducts(prev => [{...product, status: 'active'}, ...prev]);
      showToast(`${product.name} has been approved and is now live.`);
    } catch(err) {
      showToast(`Failed to approve ${product.name} in database. Approved locally.`, "error");
      setPendingProducts(prev => prev.filter(p => p.id !== product.id));
      setLocalProducts(prev => [{...product, status: 'active'}, ...prev]);
    }
  };

  const handleReject = (id) => {
    setPendingProducts(prev => prev.filter(p => p.id !== id));
    showToast(`Product listing rejected.`, "error");
  };

  // Products from Firebase (with fallback for unassigned products)
  const displayProducts = [...localProducts, ...products];
  const unassignedCount = products.filter(p => p._needsStoreAssignment).length;

  const effectiveSearchTerm = globalSearch || searchTerm;

  const filteredProducts = displayProducts.filter(p => {
    let matchesSearch = true;
    const s = effectiveSearchTerm.trim();
    if (s) {
      try {
        const regex = new RegExp(`\\b${s}`, 'i');
        matchesSearch = regex.test(String(p.name || '')) || regex.test(String(p.sku || ''));
      } catch (e) {
        matchesSearch = String(p.name || '').toLowerCase().includes(s.toLowerCase()) || String(p.sku || '').toLowerCase().includes(s.toLowerCase());
      }
    }
    const matchesCategory = categoryFilter === 'All Categories' || p.category === categoryFilter || p.subcategory === categoryFilter;
    let matchesStock = true;
    if (stockFilter === 'In Stock') matchesStock = p.status === 'active';
    if (stockFilter === 'Out of Stock') matchesStock = p.status === 'out_of_stock';
    if (stockFilter === 'Low Stock') matchesStock = Number(p.stock) < 10 && Number(p.stock) > 0;
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  const discountedProducts = filteredProducts.filter(p => p.price < p.mrp);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Product & Catalog Management</h1>
          <p className="page-subtitle">Supervise listings, manage pricing strategies, and verify offers.</p>
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button className="btn btn-outline" onClick={() => setBulkPricingModalOpen(true)}>
            <Percent size={16} style={{ marginRight: 8 }} />
            Bulk Pricing
          </button>
          <button className="btn btn-outline" onClick={() => setBulkImportModalOpen(true)}><FileCheck size={16} /> Bulk Import</button>
          <button className="btn btn-gold" onClick={() => setIsAddModalOpen(true)} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'var(--gold)', color: '#000', fontWeight: 'bold' }}>
            <Plus size={16} /> Add New Product
          </button>
        </div>
      </div>

      {/* Store Assignment Banner */}
      {unassignedCount > 0 && activeStoreId && activeStoreId !== 'GLOBAL' && activeStoreId !== 'NONE' && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem',
          background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.3)',
          borderRadius: '10px', padding: '0.875rem 1.25rem', marginBottom: '1.25rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <AlertTriangle size={16} color="var(--gold)" />
            <span style={{ color: 'var(--text-primary)', fontSize: '0.88rem' }}>
              <strong>{unassignedCount} products</strong> exist in the database but aren't assigned to this store.
            </span>
          </div>
          <button
            className="btn btn-gold"
            style={{ background: 'var(--gold)', color: '#000', fontWeight: 'bold', fontSize: '0.8rem' }}
            onClick={async () => {
              try {
                await bulkAssignStore();
                showToast(`✅ ${unassignedCount} products assigned to this store!`);
              } catch(e) {
                showToast('Failed to assign products: ' + e.message, 'error');
              }
            }}
          >
            Assign All to This Store
          </button>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem' }}>
        <button 
          onClick={() => setActiveTab('inventory')}
          style={{ 
            background: 'none', border: 'none', padding: '0.75rem 0', color: activeTab === 'inventory' ? 'var(--gold)' : 'var(--text-muted)', 
            borderBottom: activeTab === 'inventory' ? '2px solid var(--gold)' : '2px solid transparent', cursor: 'pointer', fontWeight: 600
          }}>
          Active Inventory
        </button>
        <button 
          onClick={() => setActiveTab('approvals')}
          style={{ 
            background: 'none', border: 'none', padding: '0.75rem 0', color: activeTab === 'approvals' ? 'var(--gold)' : 'var(--text-muted)', 
            borderBottom: activeTab === 'approvals' ? '2px solid var(--gold)' : '2px solid transparent', cursor: 'pointer', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}>
          Pending Approvals
          {pendingProducts.length > 0 && (
            <span style={{ background: 'var(--status-red)', color: 'white', fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '10px' }}>
              {pendingProducts.length}
            </span>
          )}
        </button>
        <button 
          onClick={() => setActiveTab('discounts')}
          style={{ 
            background: 'none', border: 'none', padding: '0.75rem 0', color: activeTab === 'discounts' ? 'var(--gold)' : 'var(--text-muted)', 
            borderBottom: activeTab === 'discounts' ? '2px solid var(--gold)' : '2px solid transparent', cursor: 'pointer', fontWeight: 600
          }}>
          Discounts & Offers
        </button>
      </div>

      <div className="filter-bar">
        <div className="filter-search">
          <Search size={14} />
          <input 
            placeholder="Search SKU, product name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select className="form-input" style={{ width: '180px', padding: '0.475rem 0.875rem' }} value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          <option>All Categories</option>
          <optgroup label="Main Categories">
            <option>Gold Jewellery</option>
            <option>Diamond Jewellery</option>
            <option>Silver Jewellery</option>
            <option>Bridal Collections</option>
          </optgroup>
          <optgroup label="Subcategories">
            <option>Rings</option>
            <option>Necklaces</option>
            <option>Earrings</option>
            <option>Bangles</option>
          </optgroup>
        </select>
        <select className="form-input" style={{ width: '150px', padding: '0.475rem 0.875rem' }} value={stockFilter} onChange={e => setStockFilter(e.target.value)}>
          <option>Stock Status</option>
          <option>In Stock</option>
          <option>Out of Stock</option>
          <option>Low Stock</option>
        </select>
      </div>

      {/* Tab Content */}
      {activeTab === 'inventory' && (
        filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            No products found matching your filters.
          </div>
        ) : (
          <div className="product-admin-grid">
            {filteredProducts.map(p => (
              <div key={p.id} className="product-admin-card">
                <div style={{ position: 'relative' }}>
                  <div className="product-admin-img">
                    {p.image ? (
                      <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: 'linear-gradient(45deg, #111, #222)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Gem size={32} color="var(--gold)" opacity={0.6} />
                      </div>
                    )}
                  </div>
                  {p.badge && (
                    <div style={{ position: 'absolute', top: 8, left: 8 }}>
                      <span className={`badge ${p.badge === 'hot' ? 'badge-hot' : p.badge === 'new' ? 'badge-new' : 'badge-gold'}`}>
                        {p.badge}
                      </span>
                    </div>
                  )}
                  {p.status === 'out_of_stock' && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="badge badge-cancelled">OUT OF STOCK</span>
                    </div>
                  )}
                </div>
                
                <div className="product-admin-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.2rem' }}>
                    <div style={{ fontSize: '0.6rem', color: 'var(--gold)', letterSpacing: '0.1em' }}>{p.sku}</div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{p.stock} left</div>
                  </div>
                  <h3 className="product-admin-name">{p.name}</h3>
                  <div className="product-admin-cat">{p.category} › {p.subcategory}</div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem', margin: '0.4rem 0', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    <span style={{ background: 'var(--admin-surface)', padding: '0.15rem 0.4rem', borderRadius: 4 }}>{p.purity}</span>
                    <span style={{ background: 'var(--admin-surface)', padding: '0.15rem 0.4rem', borderRadius: 4 }}>{p.weight}</span>
                  </div>

                  <div className="product-admin-foot" style={{ alignItems: 'center' }}>
                    <div>
                      <div className="product-admin-price">₹{p.price.toLocaleString('en-IN')}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>₹{p.mrp.toLocaleString('en-IN')}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.2rem' }}>
                      <button className="btn btn-icon btn-outline" style={{ width: 26, height: 26 }} title="Update Product Details" onClick={() => setEditingProduct(p)}><Edit2 size={12} /></button>
                      <button className="btn btn-icon btn-danger" style={{ width: 26, height: 26 }} title="Delete Product" onClick={() => handleDelete(p.id)}><Trash2 size={12} /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {activeTab === 'approvals' && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Specs</th>
                <th>Proposed Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingProducts.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No pending approvals.</td></tr>
              ) : pendingProducts.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: 40, height: 40, borderRadius: '8px', background: '#222', overflow: 'hidden', flexShrink: 0 }}>
                        {p.image ? <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Gem size={20} color="var(--gold)" style={{ margin: '10px' }} />}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</p>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <p style={{ margin: 0, fontSize: '0.85rem' }}>{p.category}</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.subcategory}</p>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.75rem', background: 'var(--bg-card)', padding: '0.2rem 0.5rem', borderRadius: '4px', marginRight: '0.3rem' }}>{p.purity}</span>
                    <span style={{ fontSize: '0.75rem', background: 'var(--bg-card)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{p.weight}</span>
                  </td>
                  <td>
                    <p style={{ margin: 0, fontWeight: 600, color: 'var(--gold)' }}>₹{p.price.toLocaleString('en-IN')}</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>MRP: ₹{p.mrp.toLocaleString('en-IN')}</p>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-sm btn-outline" style={{ color: 'var(--status-green)', borderColor: 'var(--status-green)' }} onClick={() => handleApprove(p)}>
                        <CheckCircle size={14} style={{ marginRight: '4px' }} /> Approve
                      </button>
                      <button className="btn btn-sm btn-outline" style={{ color: 'var(--status-red)', borderColor: 'var(--status-red)' }} onClick={() => handleReject(p.id)}>
                        <XCircle size={14} style={{ marginRight: '4px' }} /> Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'discounts' && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>MRP</th>
                <th>Selling Price</th>
                <th>Discount %</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {discountedProducts.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No active discounts found.</td></tr>
              ) : discountedProducts.map(p => {
                const discountAmount = p.mrp - p.price;
                const discountPercent = ((discountAmount / p.mrp) * 100).toFixed(1);
                return (
                  <tr key={p.id}>
                    <td>
                      <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.sku}</p>
                    </td>
                    <td>{p.category}</td>
                    <td style={{ color: 'var(--text-muted)', textDecoration: 'line-through' }}>₹{p.mrp.toLocaleString('en-IN')}</td>
                    <td style={{ fontWeight: 600, color: 'var(--gold)' }}>₹{p.price.toLocaleString('en-IN')}</td>
                    <td>
                      <span className="badge badge-active">{discountPercent}% OFF</span>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-outline" onClick={() => setEditingProduct(p)}>Adjust Margin</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Full Edit Product Modal */}
      {editingProduct && (
        <div className="modal-overlay" onClick={() => setEditingProduct(null)}>
          <div className="modal-box modal-box-lg" onClick={e => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
            <div className="modal-header" style={{ flexShrink: 0 }}>
              <h3 className="modal-title">Edit Product Details</h3>
              <button className="modal-close" onClick={() => setEditingProduct(null)}>×</button>
            </div>
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
              <div className="modal-body" style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
                <div className="form-group mb-1">
                  <label className="form-label">Product Name</label>
                  <input type="text" className="form-input" required value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} />
                </div>
                <div className="form-group mb-1">
                  <label className="form-label">Product Description</label>
                  <textarea className="form-input" rows="3" value={editingProduct.description || ''} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} placeholder="Write a compelling description..."></textarea>
                </div>
                <div className="form-row mb-1">
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-input" value={editingProduct.category} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}>
                      <option>Gold Jewellery</option>
                      <option>Diamond Jewellery</option>
                      <option>Silver Jewellery</option>
                      <option>Platinum Jewellery</option>
                      <option>Bridal Collections</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Subcategory</label>
                    <select className="form-input" value={editingProduct.subcategory} onChange={e => setEditingProduct({...editingProduct, subcategory: e.target.value})}>
                      <option>Rings</option>
                      <option>Necklaces</option>
                      <option>Earrings</option>
                      <option>Bangles</option>
                      <option>Pendants</option>
                    </select>
                  </div>
                </div>
                <div className="form-row mb-1">
                  <div className="form-group">
                    <label className="form-label">Selling Price (₹)</label>
                    <input type="number" className="form-input" required value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">MRP (₹)</label>
                    <input type="number" className="form-input" required value={editingProduct.mrp} onChange={e => setEditingProduct({...editingProduct, mrp: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stock Quantity</label>
                    <input type="number" className="form-input" required value={editingProduct.stock} onChange={e => setEditingProduct({...editingProduct, stock: e.target.value})} style={{ borderColor: editingProduct.stock < 10 ? 'var(--status-orange)' : 'var(--border)' }} />
                    {editingProduct.stock < 10 && <small style={{ color: 'var(--status-orange)', marginTop: '4px', display: 'block' }}>Low Stock Warning</small>}
                  </div>
                </div>
                <div className="form-row mb-1">
                  <div className="form-group">
                    <label className="form-label">Purity</label>
                    <input type="text" className="form-input" required value={editingProduct.purity} onChange={e => setEditingProduct({...editingProduct, purity: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Weight</label>
                    <input type="text" className="form-input" required value={editingProduct.weight} onChange={e => setEditingProduct({...editingProduct, weight: e.target.value})} />
                  </div>
                </div>
                <div className="form-group mb-1">
                  <label className="form-label">
                    Update Product Image 
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '0.5rem', fontWeight: 'normal' }}>(Recommended: 800x800px, 1:1 Ratio)</span>
                  </label>
                  <input type="file" accept="image/*" className="form-input" style={{ padding: '0.4rem' }} onChange={e => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setEditingProduct({...editingProduct, image: reader.result});
                      };
                      reader.readAsDataURL(file);
                    }
                  }} />
                  {editingProduct.image && (
                    <div style={{ marginTop: '0.8rem', height: '100px', width: '100px', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                      <img src={editingProduct.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                </div>
                <div className="form-group mb-1">
                  <label className="form-label">
                    3D AR Model (Optional)
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '0.5rem', fontWeight: 'normal' }}>(Provide a direct URL to a .glb or .gltf file for AR Try-On)</span>
                  </label>
                  <input type="text" className="form-input" placeholder="e.g. https://storage.googleapis.com/.../model.glb" value={editingProduct.modelUrl || ''} onChange={e => setEditingProduct({...editingProduct, modelUrl: e.target.value})} />
                </div>
                
                {/* AR Configuration Section */}
                <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                  <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'var(--gold)' }}>AR Try-On Configuration</h4>
                  <div className="form-row mb-1">
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Offset X / Y / Z</label>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input type="number" step="0.1" className="form-input" placeholder="X" value={editingProduct.arOffsetX || 0} onChange={e => setEditingProduct({...editingProduct, arOffsetX: parseFloat(e.target.value) || 0})} />
                        <input type="number" step="0.1" className="form-input" placeholder="Y" value={editingProduct.arOffsetY || 0} onChange={e => setEditingProduct({...editingProduct, arOffsetY: parseFloat(e.target.value) || 0})} />
                        <input type="number" step="0.1" className="form-input" placeholder="Z" value={editingProduct.arOffsetZ || 0} onChange={e => setEditingProduct({...editingProduct, arOffsetZ: parseFloat(e.target.value) || 0})} />
                      </div>
                    </div>
                  </div>
                  <div className="form-row mb-1">
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Rotation X / Y / Z (Degrees)</label>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input type="number" className="form-input" placeholder="X" value={editingProduct.arRotX || 0} onChange={e => setEditingProduct({...editingProduct, arRotX: parseFloat(e.target.value) || 0})} />
                        <input type="number" className="form-input" placeholder="Y" value={editingProduct.arRotY || 0} onChange={e => setEditingProduct({...editingProduct, arRotY: parseFloat(e.target.value) || 0})} />
                        <input type="number" className="form-input" placeholder="Z" value={editingProduct.arRotZ || 0} onChange={e => setEditingProduct({...editingProduct, arRotZ: parseFloat(e.target.value) || 0})} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Scale Multiplier</label>
                      <input type="number" step="0.1" className="form-input" value={editingProduct.arScale || 1} onChange={e => setEditingProduct({...editingProduct, arScale: parseFloat(e.target.value) || 1})} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer" style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '1rem', flexShrink: 0 }}>
                <button type="button" className="btn btn-outline" onClick={() => setEditingProduct(null)}>Cancel</button>
                <button type="submit" className="btn btn-gold" style={{ background: 'var(--gold)', color: '#000', fontWeight: 'bold' }}>Save All Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Product Modal (Reused) */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-box modal-box-lg" onClick={e => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
            <div className="modal-header" style={{ flexShrink: 0 }}>
              <h3 className="modal-title">Add New Product</h3>
              <button className="modal-close" onClick={() => setIsAddModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
              <div className="modal-body" style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
                <div className="form-group mb-1">
                  <label className="form-label">Product Name</label>
                  <input type="text" className="form-input" required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} placeholder="e.g. Royal Gold Necklace" />
                </div>
                <div className="form-row mb-1">
                  <div className="form-group">
                    <label className="form-label">SKU</label>
                    <input type="text" className="form-input" required value={newProduct.sku} onChange={e => setNewProduct({...newProduct, sku: e.target.value})} placeholder="e.g. SKU-1001" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-input" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                      <option>Gold Jewellery</option>
                      <option>Diamond Jewellery</option>
                      <option>Silver Jewellery</option>
                      <option>Bridal Collections</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Subcategory</label>
                    <select className="form-input" value={newProduct.subcategory} onChange={e => setNewProduct({...newProduct, subcategory: e.target.value})}>
                      <option>Rings</option>
                      <option>Necklaces</option>
                      <option>Earrings</option>
                      <option>Bangles</option>
                    </select>
                  </div>
                </div>
                <div className="form-row mb-1">
                  <div className="form-group">
                    <label className="form-label">Selling Price (₹)</label>
                    <input type="number" className="form-input" required value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">MRP (₹)</label>
                    <input type="number" className="form-input" required value={newProduct.mrp} onChange={e => setNewProduct({...newProduct, mrp: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stock Qty</label>
                    <input type="number" className="form-input" required value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} />
                  </div>
                </div>
                <div className="form-row mb-1">
                  <div className="form-group">
                    <label className="form-label">Purity</label>
                    <input type="text" className="form-input" required value={newProduct.purity} onChange={e => setNewProduct({...newProduct, purity: e.target.value})} placeholder="e.g. 22KT" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Weight</label>
                    <input type="text" className="form-input" required value={newProduct.weight} onChange={e => setNewProduct({...newProduct, weight: e.target.value})} placeholder="e.g. 15g" />
                  </div>
                </div>
                <div className="form-group mb-1">
                  <label className="form-label">
                    Product Image
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '0.5rem', fontWeight: 'normal' }}>(Recommended: 800x800px, 1:1 Ratio)</span>
                  </label>
                  <input type="file" accept="image/*" className="form-input" style={{ padding: '0.4rem' }} onChange={e => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setNewProduct({...newProduct, image: reader.result});
                      };
                      reader.readAsDataURL(file);
                    }
                  }} />
                  {newProduct.image && (
                    <div style={{ marginTop: '0.8rem', height: '80px', width: '80px', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                      <img src={newProduct.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                </div>
                <div className="form-group mb-1">
                  <label className="form-label">
                    3D AR Model (Optional)
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '0.5rem', fontWeight: 'normal' }}>(Provide a direct URL to a .glb or .gltf file for AR Try-On)</span>
                  </label>
                  <input type="text" className="form-input" placeholder="e.g. https://storage.googleapis.com/.../model.glb" value={newProduct.modelUrl} onChange={e => setNewProduct({...newProduct, modelUrl: e.target.value})} />
                </div>
                
                {/* AR Configuration Section */}
                <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                  <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'var(--gold)' }}>AR Try-On Configuration</h4>
                  <div className="form-row mb-1">
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Offset X / Y / Z</label>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input type="number" step="0.1" className="form-input" placeholder="X" value={newProduct.arOffsetX || 0} onChange={e => setNewProduct({...newProduct, arOffsetX: parseFloat(e.target.value) || 0})} />
                        <input type="number" step="0.1" className="form-input" placeholder="Y" value={newProduct.arOffsetY || 0} onChange={e => setNewProduct({...newProduct, arOffsetY: parseFloat(e.target.value) || 0})} />
                        <input type="number" step="0.1" className="form-input" placeholder="Z" value={newProduct.arOffsetZ || 0} onChange={e => setNewProduct({...newProduct, arOffsetZ: parseFloat(e.target.value) || 0})} />
                      </div>
                    </div>
                  </div>
                  <div className="form-row mb-1">
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Rotation X / Y / Z (Degrees)</label>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input type="number" className="form-input" placeholder="X" value={newProduct.arRotX || 0} onChange={e => setNewProduct({...newProduct, arRotX: parseFloat(e.target.value) || 0})} />
                        <input type="number" className="form-input" placeholder="Y" value={newProduct.arRotY || 0} onChange={e => setNewProduct({...newProduct, arRotY: parseFloat(e.target.value) || 0})} />
                        <input type="number" className="form-input" placeholder="Z" value={newProduct.arRotZ || 0} onChange={e => setNewProduct({...newProduct, arRotZ: parseFloat(e.target.value) || 0})} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Scale Multiplier</label>
                      <input type="number" step="0.1" className="form-input" value={newProduct.arScale || 1} onChange={e => setNewProduct({...newProduct, arScale: parseFloat(e.target.value) || 1})} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer" style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '1rem', flexShrink: 0 }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-gold" style={{ background: 'var(--gold)', color: '#000', fontWeight: 'bold' }}>Submit for Approval</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Pricing Strategy Modal */}
      {bulkPricingModalOpen && (
        <div className="modal-overlay" onClick={() => setBulkPricingModalOpen(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Bulk Pricing Strategy</h3>
              <button className="modal-close" onClick={() => setBulkPricingModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group mb-1">
                <label className="form-label">Target Category</label>
                <select className="form-input">
                  <option>All Gold Jewellery</option>
                  <option>Diamond Necklaces</option>
                  <option>Silver Rings</option>
                </select>
              </div>
              <div className="form-group mb-1">
                <label className="form-label">Action</label>
                <select className="form-input">
                  <option>Increase Price (Markup)</option>
                  <option>Decrease Price (Discount)</option>
                </select>
              </div>
              <div className="form-group mb-1">
                <label className="form-label">Percentage (%)</label>
                <input type="number" className="form-input" placeholder="e.g. 10" />
              </div>
            </div>
            <div className="modal-footer" style={{ marginTop: '1rem' }}>
              <button className="btn btn-outline" onClick={() => setBulkPricingModalOpen(false)}>Cancel</button>
              <button className="btn btn-gold" onClick={() => { showToast("Bulk pricing applied successfully."); setBulkPricingModalOpen(false); }}>Apply Strategy</button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {bulkImportModalOpen && (
        <div className="auth-modal-overlay" onClick={() => setBulkImportModalOpen(false)}>
          <div className="auth-modal" style={{ maxWidth: '400px', padding: '2rem', background: 'var(--surface)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Bulk Import Inventory</h3>
              <button className="btn-icon btn-outline" onClick={() => setBulkImportModalOpen(false)} style={{ border: 'none' }}>×</button>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Upload a CSV file containing your product catalog. Download our template to ensure correct formatting.
            </p>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <button className="btn btn-outline" style={{ flex: 1, fontSize: '0.8rem' }} onClick={() => showToast("Downloading CSV Template...")}>Download Template</button>
            </div>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <input type="file" accept=".csv" className="form-input" style={{ padding: '0.5rem' }} />
            </div>
            <button className="btn btn-gold" style={{ width: '100%', background: 'var(--gold)', color: '#000', fontWeight: 'bold' }} onClick={() => {
              showToast("Analyzing CSV data...");
              setTimeout(() => {
                showToast("Bulk import completed successfully!");
                setBulkImportModalOpen(false);
              }, 1500);
            }}>Upload & Import</button>
          </div>
        </div>
      )}
    </div>
  );
}
