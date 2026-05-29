import { useState } from 'react';
import { RotateCcw, MapPin, CheckSquare, PackageOpen, ClipboardCheck } from 'lucide-react';

export default function ReverseLogistics() {
  const [returns, setReturns] = useState([
    { id: '#RET-4401', orderId: '#LJ-7886', customer: 'Pooja Sharma', address: '88 MG Road, Chennai', item: 'Bridal Maang Tikka', reason: 'Changed mind, 15-day return', value: 55000, step: 'pickup' },
    { id: '#RET-4402', orderId: '#LJ-7881', customer: 'Vikram Singh', address: '12 Linking Road, Mumbai', item: 'Solitaire Ring', reason: 'Sizing Issue', value: 195000, step: 'pickup' }
  ]);

  const [selectedReturn, setSelectedReturn] = useState(null);
  
  // Checklist State for Customer Verification
  const [customerChecklist, setCustomerChecklist] = useState({
    itemMatches: false,
    noDamage: false,
    docsCollected: false
  });

  const handleCustomerCheckbox = (field) => {
    setCustomerChecklist(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const isCustomerChecklistComplete = customerChecklist.itemMatches && customerChecklist.noDamage && customerChecklist.docsCollected;

  const acceptReturnFromCustomer = () => {
    if (!isCustomerChecklistComplete) return;
    setReturns(returns.map(r => r.id === selectedReturn.id ? { ...r, step: 'returning_to_hq' } : r));
    setSelectedReturn(null);
    setCustomerChecklist({ itemMatches: false, noDamage: false, docsCollected: false });
    alert("Return accepted from customer! Package is now in your custody. Proceed to Warehouse.");
  };

  const completeHandoverToWarehouse = (id) => {
    if(window.confirm("Verify: Handing over package to Warehouse Manager. Ensure receipt signature is collected at HQ. Confirm handover?")) {
      setReturns(returns.filter(r => r.id !== id));
      alert("Handover to Warehouse complete. Custody transferred to HQ.");
    }
  };

  return (
    <div style={{ display: 'flex', gap: '2rem', height: 'calc(100vh - 120px)' }}>
      {/* List */}
      <div style={{ flex: 1, background: '#fff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <RotateCcw size={20} color="var(--gold)" /> Reverse Logistics
          </h3>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          {returns.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
              <RotateCcw size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p>No active returns assigned.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {returns.map(task => (
                <div 
                  key={task.id} 
                  onClick={() => { if(task.step === 'pickup') setSelectedReturn(task); }}
                  style={{ 
                    padding: '1rem', 
                    border: `1px solid ${selectedReturn?.id === task.id ? 'var(--gold)' : '#e2e8f0'}`,
                    background: task.step === 'returning_to_hq' ? '#f8fafc' : (selectedReturn?.id === task.id ? 'rgba(201,168,76,0.05)' : '#fff'),
                    borderRadius: '8px',
                    cursor: task.step === 'pickup' ? 'pointer' : 'default',
                    transition: 'all 0.2s',
                    opacity: task.step === 'returning_to_hq' ? 0.8 : 1
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <strong>{task.id}</strong>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{task.orderId}</span>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#0f172a', marginBottom: '0.5rem' }}>{task.customer}</div>
                  
                  {task.step === 'pickup' ? (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', padding: '0.3rem 0.6rem', background: '#fef3c7', color: '#d97706', borderRadius: '4px', fontWeight: 'bold' }}>
                      <MapPin size={14} /> Requires Customer Pickup
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', padding: '0.3rem 0.6rem', background: '#dcfce7', color: '#16a34a', borderRadius: '4px', fontWeight: 'bold' }}>
                        <PackageOpen size={14} /> Returning to HQ
                      </div>
                      <button onClick={() => completeHandoverToWarehouse(task.id)} style={{ padding: '0.4rem 0.8rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer' }}>
                        Handover to HQ
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail / Verification View */}
      <div style={{ flex: 1, background: '#fff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', padding: '2rem' }}>
        {!selectedReturn ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
            <ClipboardCheck size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p>Select a pending return to verify at customer location</p>
          </div>
        ) : (
          <div>
            <h2 style={{ margin: '0 0 1.5rem 0', color: '#0f172a' }}>Customer Pickup Protocol</h2>
            
            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', marginBottom: '2rem' }}>
              <div style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Return ID</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#0f172a' }}>{selectedReturn.id}</div>
              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Item to Recover</div>
                  <div style={{ fontWeight: 'bold' }}>{selectedReturn.item}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Customer Stated Reason</div>
                  <div style={{ color: '#ef4444' }}>"{selectedReturn.reason}"</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', background: customerChecklist.itemMatches ? '#f0fdf4' : '#fff' }}>
                <input type="checkbox" checked={customerChecklist.itemMatches} onChange={() => handleCustomerCheckbox('itemMatches')} style={{ width: '20px', height: '20px', accentColor: '#16a34a' }} />
                <div style={{ flex: 1 }}>
                  <strong style={{ color: '#0f172a', display: 'block' }}>Verify Item Matches Invoice</strong>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Confirm the physical item is the correct product</span>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', background: customerChecklist.noDamage ? '#f0fdf4' : '#fff' }}>
                <input type="checkbox" checked={customerChecklist.noDamage} onChange={() => handleCustomerCheckbox('noDamage')} style={{ width: '20px', height: '20px', accentColor: '#16a34a' }} />
                <div style={{ flex: 1 }}>
                  <strong style={{ color: '#0f172a', display: 'block' }}>Initial Physical Inspection</strong>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Check for obvious major damage or tampering</span>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', background: customerChecklist.docsCollected ? '#f0fdf4' : '#fff' }}>
                <input type="checkbox" checked={customerChecklist.docsCollected} onChange={() => handleCustomerCheckbox('docsCollected')} style={{ width: '20px', height: '20px', accentColor: '#16a34a' }} />
                <div style={{ flex: 1 }}>
                  <strong style={{ color: '#0f172a', display: 'block' }}>Collect Original Docs & Box</strong>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Ensure authenticity certificates are included</span>
                </div>
              </label>
            </div>

            <button 
              onClick={acceptReturnFromCustomer}
              disabled={!isCustomerChecklistComplete}
              style={{ 
                width: '100%', 
                padding: '1rem', 
                marginTop: '2rem', 
                background: isCustomerChecklistComplete ? '#0f172a' : '#cbd5e1', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: isCustomerChecklistComplete ? 'pointer' : 'not-allowed',
                transition: 'background 0.2s'
              }}
            >
              Take Custody of Return
            </button>
            {!isCustomerChecklistComplete && <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#ef4444', marginTop: '1rem' }}>You must physically verify all requirements before taking custody.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
