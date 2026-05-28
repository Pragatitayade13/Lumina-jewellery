// src/admin/pages/ProductManagement.jsx
import { useState } from 'react';
import { products as mockProducts } from '../data/mockData';
import { useProducts } from '../../hooks/useProducts';
import { useApp } from '../../context/AppContext';
import { Gem, Edit2, Trash2, Search, FileCheck, PieChart, Database, Plus } from 'lucide-react';

export default function ProductManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [stockFilter, setStockFilter] = useState('Stock Status');
  const [isSeeding, setIsSeeding] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [localProducts, setLocalProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', sku: '', price: '', mrp: '', category: 'Gold Jewellery', subcategory: 'Rings', stock: '', status: 'active', purity: '22KT', weight: '', image: '' });
  
  const { products, loading, removeProduct, addProduct } = useProducts();
  const { showToast } = useApp();

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
        showToast("Product deleted locally (Firebase not connected).");
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
      setLocalProducts(prev => [{...productData, id: fallbackId}, ...prev]);
      showToast("Product added locally (Firebase not connected).");
    }
    setIsAddModalOpen(false);
    setNewProduct({ name: '', sku: '', price: '', mrp: '', category: 'Gold Jewellery', subcategory: 'Rings', stock: '', status: 'active', purity: '22KT', weight: '', image: '' });
  };

  // If Firebase is empty or loading failed, we can fallback to mock products for development
  const displayProducts = [...localProducts, ...(products.length > 0 ? products : mockProducts)];

  const filteredProducts = displayProducts.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All Categories' || p.category === categoryFilter;
    let matchesStock = true;
    if (stockFilter === 'In Stock') matchesStock = p.status === 'active';
    if (stockFilter === 'Out of Stock') matchesStock = p.status === 'out_of_stock';
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Product & Catalog Management</h1>
          <p className="page-subtitle">Manage collections, adjust pricing, and organize inventory categories.</p>
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button className="btn btn-outline" onClick={handleSeedDatabase} disabled={isSeeding}>
            <Database size={16} style={{ marginRight: 8 }} />
            {isSeeding ? 'Seeding...' : 'Seed Firebase DB'}
          </button>
          <button className="btn btn-outline"><FileCheck size={16} /> Bulk Import</button>
          <button className="btn btn-gold" onClick={() => setIsAddModalOpen(true)} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'var(--gold)', color: '#000', fontWeight: 'bold' }}>
            <Plus size={16} /> Add New Product
          </button>
        </div>
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
          <option>Gold Jewellery</option>
          <option>Diamond Jewellery</option>
          <option>Bridal Collections</option>
          <option>Silver Jewellery</option>
        </select>
        <select className="form-input" style={{ width: '150px', padding: '0.475rem 0.875rem' }} value={stockFilter} onChange={e => setStockFilter(e.target.value)}>
          <option>Stock Status</option>
          <option>In Stock</option>
          <option>Out of Stock</option>
        </select>
      </div>

      {filteredProducts.length === 0 ? (
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
                    <button className="btn btn-icon btn-outline" style={{ width: 26, height: 26 }} title="Manage Certification"><FileCheck size={12} color="var(--status-green)" /></button>
                    <button className="btn btn-icon btn-outline" style={{ width: 26, height: 26 }} title="Transparency Breakdown"><PieChart size={12} color="var(--gold)" /></button>
                    <button className="btn btn-icon btn-outline" style={{ width: 26, height: 26 }} title="Edit Product"><Edit2 size={12} /></button>
                    <button className="btn btn-icon btn-danger" style={{ width: 26, height: 26 }} title="Delete Product" onClick={() => handleDelete(p.id)}><Trash2 size={12} /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {filteredProducts.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
          <button className="btn btn-outline">Load More Products</button>
        </div>
      )}

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-box modal-box-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add New Product</h3>
              <button className="modal-close" onClick={() => setIsAddModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div className="modal-body" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
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
                      <option>Bridal Collections</option>
                      <option>Silver Jewellery</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Subcategory</label>
                    <input type="text" className="form-input" value={newProduct.subcategory} onChange={e => setNewProduct({...newProduct, subcategory: e.target.value})} placeholder="e.g. Rings, Necklaces" />
                  </div>
                </div>
                <div className="form-row mb-1">
                  <div className="form-group">
                    <label className="form-label">Price (₹)</label>
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
                  <label className="form-label">Product Image</label>
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
              </div>
              <div className="modal-footer" style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-gold" style={{ background: 'var(--gold)', color: '#000', fontWeight: 'bold' }}>Create Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
