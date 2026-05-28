import { Calculator, ArrowRight, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

export default function BuybackCalculator() {
  const [weight, setWeight] = useState(10);
  const [purity, setPurity] = useState(22);
  
  // Mock live gold rate (per gram for 24K)
  const currentLiveRate24k = 7250; 
  
  // Calculation logic
  const purityFactor = purity / 24;
  const estimatedValue = weight * (currentLiveRate24k * purityFactor);

  return (
    <div>
      <div className="customer-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(90deg, #111, #1a150c)' }}>
        <div>
          <h2 className="card-title"><Calculator /> Gold Exchange & Buyback</h2>
          <p style={{ color: 'var(--text-muted)' }}>Get an instant estimated value for your old gold jewellery based on live market rates.</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Live 24K Rate</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--gold)', fontFamily: 'Inter' }}>₹{currentLiveRate24k}/g</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="customer-card">
          <h3 className="card-title" style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Enter Gold Details</h3>
          
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Approximate Weight (Grams)</label>
            <input 
              type="number" 
              className="form-input" 
              style={{ width: '100%', padding: '1rem', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '1.1rem' }} 
              value={weight}
              onChange={e => setWeight(Number(e.target.value))}
            />
          </div>
          
          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Gold Purity (Karat)</label>
            <select 
              className="form-input" 
              style={{ width: '100%', padding: '1rem', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '1.1rem' }}
              value={purity}
              onChange={e => setPurity(Number(e.target.value))}
            >
              <option value={24}>24 Karat (99.9%)</option>
              <option value={22}>22 Karat (91.6%)</option>
              <option value={18}>18 Karat (75.0%)</option>
              <option value={14}>14 Karat (58.3%)</option>
            </select>
          </div>
          
          <div style={{ padding: '1rem', background: 'rgba(201,168,76,0.1)', borderRadius: '8px', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
             <ShieldCheck color="var(--gold)" size={24} style={{ flexShrink: 0 }} />
             <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
               We offer 100% exchange value on prevailing gold rates for Lumina Jewels products, and highly competitive rates for non-Lumina jewellery.
             </p>
          </div>
        </div>

        <div className="customer-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', border: '1px solid var(--gold)' }}>
          <div style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Estimated Exchange Value</div>
          <div style={{ fontSize: '3.5rem', fontWeight: 700, color: 'var(--gold)', fontFamily: 'Inter', marginBottom: '0.5rem' }}>
            ₹{estimatedValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
            *Final value is subject to physical evaluation and melting purity tests at our store.
          </p>
          
          <button className="btn btn-gold" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 2rem', fontSize: '1.1rem' }}>
            Book Evaluation <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
