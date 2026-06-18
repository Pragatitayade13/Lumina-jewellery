import { useState } from 'react';
import { Search, X, Package, Save, ShoppingCart } from 'lucide-react';
import { useInventory } from '../../hooks/useInventory';
import { useApp } from '../../context/AppContext';
import { Check } from 'lucide-react';

export default function InventoryManagement() {
  const { showToast, user, currentStore } = useApp();
  const activeStoreId = currentStore || (user?.role === 'superadmin' ? 'GLOBAL' : 'NONE');
  const { inventory, purchaseOrders, stockTransfers, loading, updateStock, addPurchaseOrder, addStockTransfer, receivePurchaseOrder } = useInventory(activeStoreId);
  
  const [activeTab, setActiveTab] = useState('Inventory List');
  const [searchTerm, setSearchTerm] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('Warehouse: All');
  const [statusFilter, setStatusFilter] = useState('Status: All');
  
  const [updateModal, setUpdateModal] = useState({ isOpen: false, item: null });
  const [editForm, setEditForm] = useState({ stock: 0, minStock: 0, warehouse: '' });
  
  const [isPoModalOpen, setIsPoModalOpen] = useState(false);
  const [poForm, setPoForm] = useState({ sku: '', vendor: '', quantity: '', expectedCost: '', deliveryDate: '' });

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferForm, setTransferForm] = useState({ sku: '', from: '', to: '', quantity: '' });

  const [isSaving, setIsSaving] = useState(false);

  // Dynamic KPIs
  const totalSkus = inventory.length;
  const totalStockValue = inventory.reduce((sum, item) => sum + (item.stock * item.price), 0);
  const lowStockItems = inventory.filter(item => item.status === 'low' || item.status === 'critical').length;
  const outOfStockItems = inventory.filter(item => item.status === 'out').length;

  const formatValue = (val) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)} L`;
    return `₹${val.toLocaleString()}`;
  };

  const filteredInventory = inventory.filter(item => {
    let matchesSearch = true;
    const s = searchTerm.trim();
    if (s) {
      try {
        const regex = new RegExp(`\\b${s}`, 'i');
        matchesSearch = regex.test(String(item.sku || '')) || regex.test(String(item.name || ''));
      } catch (e) {
        const searchString = s.toLowerCase();
        matchesSearch = String(item.sku || '').toLowerCase().includes(searchString) || 
                        String(item.name || '').toLowerCase().includes(searchString);
      }
    }
    
    let matchesWarehouse = true;
    if (warehouseFilter !== 'Warehouse: All') matchesWarehouse = item.warehouse === warehouseFilter;

    let matchesStatus = true;
    if (statusFilter === 'Critical/Low') matchesStatus = item.status === 'low' || item.status === 'critical';
    if (statusFilter === 'Out of Stock') matchesStatus = item.status === 'out';
    if (statusFilter === 'Healthy') matchesStatus = item.status === 'ok';

    return matchesSearch && matchesWarehouse && matchesStatus;
  });

  const openUpdateModal = (item) => {
    setEditForm({ stock: item.stock, minStock: item.minStock, warehouse: item.warehouse });
    setUpdateModal({ isOpen: true, item });
  };

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    if (!updateModal.item) return;
    
    setIsSaving(true);
    try {
      await updateStock(updateModal.item.id, {
        stock: parseInt(editForm.stock, 10),
        minStock: parseInt(editForm.minStock, 10),
        warehouse: editForm.warehouse
      });
      showToast(`Stock updated for ${updateModal.item.sku}`);
      setUpdateModal({ isOpen: false, item: null });
    } catch (err) {
      showToast("Failed to update stock", "error");
    }
    setIsSaving(false);
  };

  const handleCreatePO = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await addPurchaseOrder({
        ...poForm,
        quantity: parseInt(poForm.quantity, 10),
        expectedCost: parseFloat(poForm.expectedCost)
      });
      showToast(`Purchase Order created successfully for ${poForm.sku}`);
      setIsPoModalOpen(false);
      setPoForm({ sku: '', vendor: '', quantity: '', expectedCost: '', deliveryDate: '' });
    } catch (err) {
      showToast("Failed to create Purchase Order", "error");
    }
    setIsSaving(false);
  };

  const handleStockTransfer = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await addStockTransfer({
        sku: transferForm.sku,
        from: transferForm.from,
        to: transferForm.to,
        quantity: parseInt(transferForm.quantity, 10)
      });
      showToast(`Successfully transferred ${transferForm.quantity} units of ${transferForm.sku} from ${transferForm.from} to ${transferForm.to}.`);
      setIsTransferModalOpen(false);
      setTransferForm({ sku: '', from: '', to: '', quantity: '' });
    } catch (err) {
      showToast("Failed to transfer stock", "error");
    }
    setIsSaving(false);
  };

  const handleReceivePO = async (po) => {
    try {
      await receivePurchaseOrder(po.id, po.sku, po.quantity);
      showToast(`Received ${po.quantity} units of ${po.sku}. Stock updated.`);
    } catch (err) {
      showToast("Failed to receive PO.", "error");
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventory & Stock Control</h1>
          <p className="page-subtitle">Monitor stock levels, set low-stock alerts, and manage warehouses.</p>
        </div>

      </div>

      <div className="tab-nav">
        {['Inventory List'].map(tab => (
          <button 
            key={tab} 
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => { setActiveTab(tab); setSearchTerm(''); }}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Inventory List' && (
        <>
          <div className="stat-grid mb-15">
        <div className="stat-card">
          <div className="stat-label">Total SKUs</div>
          <div className="stat-value">{totalSkus.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Stock Value</div>
          <div className="stat-value">{formatValue(totalStockValue)}</div>
        </div>
        <div className="stat-card" style={{ borderColor: 'rgba(243,156,18,0.3)' }}>
          <div className="stat-label" style={{ color: '#f39c12' }}>Low Stock Items</div>
          <div className="stat-value" style={{ color: '#f39c12' }}>{lowStockItems}</div>
        </div>
        <div className="stat-card" style={{ borderColor: 'rgba(231,76,60,0.3)' }}>
          <div className="stat-label" style={{ color: '#e74c3c' }}>Out of Stock</div>
          <div className="stat-value" style={{ color: '#e74c3c' }}>{outOfStockItems}</div>
        </div>
      </div>

      <div className="admin-card">
        <div className="card-header">
          <div className="card-title">Real-time Stock Monitor</div>
        </div>
        
        <div className="filter-bar" style={{ marginBottom: '1.25rem' }}>
          <div className="filter-search" style={{ margin: 0, width: '250px' }}>
            <Search size={14} />
            <input 
              placeholder="Search SKU or Product..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select className="form-input" style={{ width: '150px', padding: '0.475rem 0.875rem' }} value={warehouseFilter} onChange={e => setWarehouseFilter(e.target.value)}>
            <option>Warehouse: All</option>
            <option>Mumbai HQ</option>
            <option>Delhi Vault</option>
            <option>Bangalore</option>
          </select>
          <select className="form-input" style={{ width: '150px', padding: '0.475rem 0.875rem' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option>Status: All</option>
            <option>Critical/Low</option>
            <option>Out of Stock</option>
            <option>Healthy</option>
          </select>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>SKU & Product</th>
                <th>Warehouse</th>
                <th>Current Stock</th>
                <th>Status</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>Loading inventory...</td></tr>
              ) : filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No inventory items found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredInventory.map(item => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ color: 'var(--gold)', fontWeight: 700, fontFamily: 'monospace', fontSize: '0.85rem' }}>{item.sku}</div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.8rem', marginTop: '0.1rem' }}>{item.name}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{item.category}</div>
                    </td>
                    <td>{item.warehouse}</td>
                    <td>
                      <div className="stock-bar-wrap">
                        <span className="stock-num" style={{ color: item.stock === 0 ? 'var(--status-red)' : item.stock <= item.minStock ? 'var(--status-orange)' : 'var(--text-primary)' }}>
                          {item.stock}
                        </span>
                        <div className="stock-bar-track">
                          <div 
                            className="stock-bar-fill" 
                            style={{ 
                              width: `${Math.min(100, (item.stock / (item.minStock * 3)) * 100)}%`,
                              background: item.stock === 0 ? 'transparent' : item.stock <= item.minStock ? 'var(--status-orange)' : 'var(--status-green)'
                            }} 
                          />
                        </div>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>/ Min {item.minStock}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${item.status === 'ok' ? 'active' : item.status === 'low' ? 'pending' : item.status === 'out' ? 'cancelled' : 'danger'}`}>
                        {item.status === 'ok' ? 'HEALTHY' : item.status === 'low' ? 'LOW STOCK' : item.status === 'out' ? 'OUT OF STOCK' : 'CRITICAL'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.75rem' }}>{item.lastUpdated}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className="btn btn-sm btn-outline" onClick={() => openUpdateModal(item)}>Update</button>
                        {(item.stock <= item.minStock) && (
                          <button className="btn btn-sm btn-gold" onClick={() => openUpdateModal(item)}>Restock</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}

      {activeTab === 'Purchase Orders' && (
        <div className="admin-card">
          <div className="card-header">
            <div className="card-title">Active Purchase Orders</div>
          </div>
          <table className="admin-table">
            <thead>
              <tr><th>PO ID</th><th>SKU</th><th>Vendor</th><th>Quantity</th><th>Expected Delivery</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {purchaseOrders.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>No purchase orders found.</td></tr>
              ) : purchaseOrders.map(po => (
                <tr key={po.id}>
                  <td style={{ fontFamily: 'monospace', color: 'var(--gold)' }}>{po.id.substring(0,8).toUpperCase()}</td>
                  <td>{po.sku}</td>
                  <td>{po.vendor}</td>
                  <td>{po.quantity} Units</td>
                  <td>{po.deliveryDate}</td>
                  <td><span className={`badge badge-${po.status === 'pending' ? 'warning' : po.status === 'processed' ? 'active' : 'active'}`}>{po.status === 'processed' ? 'PROCESSED' : po.status.toUpperCase()}</span></td>
                  <td>
                    {po.status === 'pending' && (
                      <button className="btn btn-sm btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '4px', borderColor: 'var(--status-green)', color: 'var(--status-green)' }} onClick={() => handleReceivePO(po)}>
                        <Check size={14} /> Receive
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'Stock Transfers' && (
        <div className="admin-card">
          <div className="card-header">
            <div className="card-title">Recent Transfers</div>
          </div>
          <table className="admin-table">
            <thead>
              <tr><th>Date</th><th>SKU</th><th>From</th><th>To</th><th>Quantity</th><th>Status</th></tr>
            </thead>
            <tbody>
              {(!stockTransfers || stockTransfers.length === 0) ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No recent stock transfers.</td></tr>
              ) : stockTransfers.map(t => (
                <tr key={t.id}>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.date}</td>
                  <td style={{ fontFamily: 'monospace', color: 'var(--gold)' }}>{t.sku}</td>
                  <td>{t.from}</td>
                  <td>{t.to}</td>
                  <td style={{ fontWeight: 600 }}>{t.quantity}</td>
                  <td><span className="badge badge-active">{t.status.toUpperCase()}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Stock Update Modal */}
      {updateModal.isOpen && updateModal.item && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-box" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Package size={18} /> Update Inventory</h3>
              <button className="modal-close" onClick={() => setUpdateModal({ isOpen: false, item: null })}><X size={16} /></button>
            </div>
            
            <form onSubmit={handleUpdateStock}>
              <div className="modal-body">
                <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ color: 'var(--gold)', fontWeight: 700, fontFamily: 'monospace', fontSize: '0.9rem' }}>{updateModal.item.sku}</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1rem', marginTop: '0.2rem' }}>{updateModal.item.name}</div>
                </div>

                <div className="form-group">
                  <label>Current Physical Stock</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    min="0"
                    required
                    value={editForm.stock}
                    onChange={(e) => setEditForm({...editForm, stock: e.target.value})}
                  />
                </div>

                <div className="form-group-row">
                  <div className="form-group">
                    <label>Min Stock Alert Level</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      min="0"
                      required
                      value={editForm.minStock}
                      onChange={(e) => setEditForm({...editForm, minStock: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Warehouse</label>
                    <select 
                      className="form-input"
                      value={editForm.warehouse}
                      onChange={(e) => setEditForm({...editForm, warehouse: e.target.value})}
                    >
                      <option>Mumbai HQ</option>
                      <option>Delhi Vault</option>
                      <option>Bangalore</option>
                      <option>Chennai Storage</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setUpdateModal({ isOpen: false, item: null })}>Cancel</button>
                  <button type="submit" className="btn btn-gold" disabled={isSaving} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#000', fontWeight: 'bold' }}>
                    <Save size={14} /> {isSaving ? 'Saving...' : 'Save Updates'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Purchase Order Modal */}
      {isPoModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-box" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ShoppingCart size={18} /> Create Purchase Order</h3>
              <button className="modal-close" onClick={() => setIsPoModalOpen(false)}><X size={16} /></button>
            </div>
            
            <form onSubmit={handleCreatePO}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Select Product / SKU</label>
                  <select 
                    className="form-input" 
                    required
                    value={poForm.sku}
                    onChange={(e) => setPoForm({...poForm, sku: e.target.value})}
                  >
                    <option value="">Select an item to restock...</option>
                    {inventory.map(item => (
                      <option key={item.id} value={item.sku}>{item.sku} - {item.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Vendor Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Diamond Suppliers India"
                    required
                    value={poForm.vendor}
                    onChange={(e) => setPoForm({...poForm, vendor: e.target.value})}
                  />
                </div>

                <div className="form-group-row">
                  <div className="form-group">
                    <label>Quantity to Order</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      min="1"
                      required
                      value={poForm.quantity}
                      onChange={(e) => setPoForm({...poForm, quantity: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Total Expected Cost (₹)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      min="0"
                      required
                      value={poForm.expectedCost}
                      onChange={(e) => setPoForm({...poForm, expectedCost: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Expected Delivery Date</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    required
                    value={poForm.deliveryDate}
                    onChange={(e) => setPoForm({...poForm, deliveryDate: e.target.value})}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setIsPoModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn btn-gold" disabled={isSaving} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#FFFFFF', fontWeight: 'bold' }}>
                    <Save size={14} /> {isSaving ? 'Submitting...' : 'Send Purchase Order'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Transfer Modal */}
      {isTransferModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-box" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Package size={18} /> Initiate Stock Transfer</h3>
              <button className="modal-close" onClick={() => setIsTransferModalOpen(false)}><X size={16} /></button>
            </div>
            
            <form onSubmit={handleStockTransfer}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Select Product / SKU</label>
                  <select className="form-input" required value={transferForm.sku} onChange={(e) => setTransferForm({...transferForm, sku: e.target.value})}>
                    <option value="">Select an item to transfer...</option>
                    {inventory.map(item => (
                      <option key={item.id} value={item.sku}>{item.sku} - {item.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>From Warehouse</label>
                    <select className="form-input" required value={transferForm.from} onChange={(e) => setTransferForm({...transferForm, from: e.target.value})}>
                      <option value="">Select Source...</option>
                      <option value="Mumbai HQ">Mumbai HQ</option>
                      <option value="Delhi Vault">Delhi Vault</option>
                      <option value="Bangalore">Bangalore</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>To Warehouse</label>
                    <select className="form-input" required value={transferForm.to} onChange={(e) => setTransferForm({...transferForm, to: e.target.value})}>
                      <option value="">Select Destination...</option>
                      <option value="Mumbai HQ">Mumbai HQ</option>
                      <option value="Delhi Vault">Delhi Vault</option>
                      <option value="Bangalore">Bangalore</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Quantity to Transfer</label>
                  <input type="number" className="form-input" min="1" required value={transferForm.quantity} onChange={(e) => setTransferForm({...transferForm, quantity: e.target.value})} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setIsTransferModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn btn-gold" disabled={isSaving} style={{ color: '#000', fontWeight: 'bold' }}>
                    {isSaving ? 'Processing...' : 'Transfer Stock'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
