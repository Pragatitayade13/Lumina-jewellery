import { Sparkles, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function BridalPlanner() {
  const [budget, setBudget] = useState(1500000);
  
  const plannerItems = [
    { id: 1, category: 'Necklace Set', name: 'Polki Kundan Choker', estimatedCost: 165000 },
    { id: 2, category: 'Bangles', name: '22KT Antique Gold Bangles (Set of 4)', estimatedCost: 210000 },
    { id: 3, category: 'Maang Tikka', name: 'Bridal Maang Tikka Polki', estimatedCost: 55000 },
    { id: 4, category: 'Rings', name: 'Pending Selection', estimatedCost: 0 }
  ];

  const totalCost = plannerItems.reduce((sum, item) => sum + item.estimatedCost, 0);
  const remainingBudget = budget - totalCost;

  return (
    <div>
      <div className="customer-card">
        <h2 className="card-title"><Sparkles /> Bridal Planner Studio</h2>
        <p style={{ color: 'var(--text-muted)' }}>Curate your complete bridal trousseau, set a budget, and track your selections across different ceremonies.</p>
      </div>

      <div className="stat-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-box" style={{ background: 'var(--bg-dark)' }}>
          <div className="stat-label">Total Budget</div>
          <div className="stat-value" style={{ color: 'var(--text-primary)' }}>₹{budget.toLocaleString()}</div>
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
          <button className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
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
              {plannerItems.map(item => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 600 }}>{item.category}</td>
                  <td>
                    {item.estimatedCost > 0 ? (
                      <span style={{ color: 'var(--text-primary)' }}>{item.name}</span>
                    ) : (
                      <button className="btn btn-outline btn-sm">Browse {item.category}</button>
                    )}
                  </td>
                  <td style={{ fontFamily: 'Inter', fontWeight: 600 }}>₹{item.estimatedCost.toLocaleString()}</td>
                  <td>
                    <button className="btn btn-icon btn-outline" style={{ color: 'var(--status-red)', borderColor: 'transparent' }} title="Remove">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div style={{ marginTop: '2rem', textAlign: 'right' }}>
           <button className="btn btn-gold">Book Bridal Consultation</button>
        </div>
      </div>
    </div>
  );
}
