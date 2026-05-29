import { Sparkles, Plus, Trash2, Edit2, X, Check } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useBridalPlanner } from '../../hooks/useBridalPlanner';

export default function BridalPlanner() {
  const navigate = useNavigate();
  const { user, showToast } = useApp();
  const { planner, loading, updateBudget, addItem, removeItem } = useBridalPlanner(user?.uid);
  
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState('');
  
  const [modalOpen, setModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({ category: '', name: 'Pending Selection', estimatedCost: 0 });

  if (loading) {
    return <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Loading planner...</div>;
  }

  const { budget, items } = planner;
  const totalCost = items.reduce((sum, item) => sum + Number(item.estimatedCost), 0);
  const remainingBudget = budget - totalCost;

  const handleSaveBudget = async () => {
    if (!tempBudget || isNaN(tempBudget)) {
      showToast("Please enter a valid number", "error");
      return;
    }
    await updateBudget(Number(tempBudget));
    setIsEditingBudget(false);
    showToast("Budget updated!");
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    await addItem({ ...newItem, estimatedCost: Number(newItem.estimatedCost) });
    setModalOpen(false);
    setNewItem({ category: '', name: 'Pending Selection', estimatedCost: 0 });
    showToast("Category added successfully!");
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm("Are you sure you want to remove this item?")) {
      await removeItem(id);
      showToast("Item removed");
    }
  };

  return (
    <div>
      <div className="customer-card">
        <h2 className="card-title"><Sparkles /> Bridal Planner Studio</h2>
        <p style={{ color: 'var(--text-muted)' }}>Curate your complete bridal trousseau, set a budget, and track your selections across different ceremonies.</p>
      </div>

      <div className="stat-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-box" style={{ background: 'var(--bg-dark)' }}>
          <div className="stat-label">Total Budget</div>
          <div className="stat-value" style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {isEditingBudget ? (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="number" 
                  className="form-input" 
                  style={{ width: '120px', padding: '0.2rem 0.5rem', fontSize: '1rem', background: '#000', border: '1px solid var(--gold)', color: '#fff' }}
                  defaultValue={budget}
                  onChange={(e) => setTempBudget(e.target.value)}
                  autoFocus
                />
                <button className="btn btn-icon btn-gold" onClick={handleSaveBudget}><Check size={14} /></button>
                <button className="btn btn-icon btn-outline" onClick={() => setIsEditingBudget(false)}><X size={14} /></button>
              </div>
            ) : (
              <>
                ₹{budget.toLocaleString()} 
                <button className="btn btn-icon" style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)' }} onClick={() => setIsEditingBudget(true)}>
                  <Edit2 size={14} />
                </button>
              </>
            )}
          </div>
        </div>
        <div className="stat-box" style={{ background: 'var(--bg-dark)' }}>
          <div className="stat-label">Estimated Cost</div>
          <div className="stat-value" style={{ color: 'var(--gold)' }}>₹{totalCost.toLocaleString()}</div>
        </div>
        <div className="stat-box" style={{ background: 'var(--bg-dark)' }}>
          <div className="stat-label">Remaining Budget</div>
          <div className="stat-value" style={{ color: remainingBudget < 0 ? 'var(--status-red)' : 'var(--status-green)' }}>
            ₹{remainingBudget.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="customer-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 className="card-title" style={{ margin: 0, fontSize: '1.1rem' }}>Wedding Day Trousseau</h3>
          <button className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }} onClick={() => setModalOpen(true)}>
            <Plus size={14} /> Add Category
          </button>
        </div>

        <div className="customer-table-wrap">
          <table className="customer-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Selected Item</th>
                <th>Estimated Cost</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                    No items added yet. Click 'Add Category' to start planning!
                  </td>
                </tr>
              ) : (
                items.map(item => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 600 }}>{item.category}</td>
                    <td>
                      {item.estimatedCost > 0 ? (
                        <span style={{ color: 'var(--text-primary)' }}>{item.name}</span>
                      ) : (
                        <button className="btn btn-outline btn-sm" onClick={() => navigate('/collections')}>
                          Browse {item.category}
                        </button>
                      )}
                    </td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>₹{Number(item.estimatedCost).toLocaleString()}</td>
                    <td>
                      <button className="btn btn-icon btn-outline" style={{ color: 'var(--status-red)', borderColor: 'transparent' }} title="Remove" onClick={() => handleDeleteItem(item.id)}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div style={{ marginTop: '2rem', textAlign: 'right' }}>
           <button className="btn btn-gold" onClick={() => navigate('/account/appointments')}>
             Book Bridal Consultation
           </button>
        </div>
      </div>

      {/* Add Category Modal */}
      {modalOpen && (
        <div className="modal-overlay" style={{ zIndex: 9999, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-box" style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '400px', border: '1px solid var(--border-color)' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ color: 'var(--gold)', margin: 0 }}>Add Trousseau Category</h3>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20}/></button>
            </div>
            
            <form onSubmit={handleAddItem}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Category Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required 
                  placeholder="e.g. Nath, Anklets, Nose Ring"
                  style={{ width: '100%', padding: '0.8rem', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '4px' }}
                  value={newItem.category}
                  onChange={e => setNewItem({...newItem, category: e.target.value})}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Estimated Cost (₹)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  required 
                  placeholder="0 if pending"
                  style={{ width: '100%', padding: '0.8rem', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '4px' }}
                  value={newItem.estimatedCost}
                  onChange={e => setNewItem({...newItem, estimatedCost: e.target.value})}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-gold">Add Category</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
