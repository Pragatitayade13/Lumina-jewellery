import { useState } from 'react';
import { Package, CheckSquare, XSquare, FileText, Camera } from 'lucide-react';

export default function PickupTasks() {
  const [pickups, setPickups] = useState([
    { id: '#PKG-8901', orderId: '#LJ-7891', customer: 'Meera Krishnan', value: 285000, status: 'pending' },
    { id: '#PKG-8902', orderId: '#LJ-7890', customer: 'Sunita Rao', value: 165000, status: 'pending' },
    { id: '#PKG-8903', orderId: '#LJ-7889', customer: 'Ritu Mehta', value: 195000, status: 'pending' },
  ]);

  const [selectedTask, setSelectedTask] = useState(null);
  
  // Checklist State
  const [checklist, setChecklist] = useState({
    detailsVerified: false,
    sealIntact: false,
    docsCollected: false
  });

  const handleCheckbox = (field) => {
    setChecklist(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const isChecklistComplete = checklist.detailsVerified && checklist.sealIntact && checklist.docsCollected;

  const acceptPackage = () => {
    if (!isChecklistComplete) return;
    setPickups(pickups.filter(p => p.id !== selectedTask.id));
    setSelectedTask(null);
    setChecklist({ detailsVerified: false, sealIntact: false, docsCollected: false });
    alert("Package custody accepted! Package is now in transit.");
  };

  return (
    <div style={{ display: 'flex', gap: '2rem', height: 'calc(100vh - 120px)' }}>
      {/* List */}
      <div style={{ flex: 1, background: '#fff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: 0, color: '#0f172a' }}>Warehouse Pickups</h3>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          {pickups.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
              <Package size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p>No more pickups assigned for today.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {pickups.map(task => (
                <div 
                  key={task.id} 
                  onClick={() => { setSelectedTask(task); setChecklist({ detailsVerified: false, sealIntact: false, docsCollected: false }); }}
                  style={{ 
                    padding: '1rem', 
                    border: `1px solid ${selectedTask?.id === task.id ? 'var(--gold)' : '#e2e8f0'}`,
                    background: selectedTask?.id === task.id ? 'rgba(201,168,76,0.05)' : '#fff',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <strong>{task.id}</strong>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{task.orderId}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span style={{ color: '#0f172a' }}>{task.customer}</span>
                    <span style={{ color: '#d97706', fontWeight: 'bold' }}>₹{task.value.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail / Checklist View */}
      <div style={{ flex: 1, background: '#fff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', padding: '2rem' }}>
        {!selectedTask ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
            <CheckSquare size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p>Select a pickup task to verify</p>
          </div>
        ) : (
          <div>
            <h2 style={{ margin: '0 0 1.5rem 0', color: '#0f172a' }}>Verification Checklist</h2>
            
            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', marginBottom: '2rem' }}>
              <div style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Package ID</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#0f172a' }}>{selectedTask.id}</div>
              <div style={{ marginTop: '1rem', display: 'flex', gap: '2rem' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Order Value</div>
                  <div style={{ fontWeight: 'bold', color: '#d97706' }}>₹{selectedTask.value.toLocaleString()}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Customer</div>
                  <div style={{ fontWeight: 'bold' }}>{selectedTask.customer}</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', background: checklist.detailsVerified ? '#f0fdf4' : '#fff' }}>
                <input type="checkbox" checked={checklist.detailsVerified} onChange={() => handleCheckbox('detailsVerified')} style={{ width: '20px', height: '20px', accentColor: '#16a34a' }} />
                <div style={{ flex: 1 }}>
                  <strong style={{ color: '#0f172a', display: 'block' }}>Verify Order Details</strong>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Check package ID against physical label</span>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', background: checklist.sealIntact ? '#f0fdf4' : '#fff' }}>
                <input type="checkbox" checked={checklist.sealIntact} onChange={() => handleCheckbox('sealIntact')} style={{ width: '20px', height: '20px', accentColor: '#16a34a' }} />
                <div style={{ flex: 1 }}>
                  <strong style={{ color: '#0f172a', display: 'block' }}>Verify Tamper-Proof Seal</strong>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Ensure security tape is unbroken and flawless</span>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', background: checklist.docsCollected ? '#f0fdf4' : '#fff' }}>
                <input type="checkbox" checked={checklist.docsCollected} onChange={() => handleCheckbox('docsCollected')} style={{ width: '20px', height: '20px', accentColor: '#16a34a' }} />
                <div style={{ flex: 1 }}>
                  <strong style={{ color: '#0f172a', display: 'block' }}>Collect Shipping Documents</strong>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Original invoice and insurance declaration</span>
                </div>
                <FileText size={20} color="#64748b" />
              </label>
            </div>

            <button 
              onClick={acceptPackage}
              disabled={!isChecklistComplete}
              style={{ 
                width: '100%', 
                padding: '1rem', 
                marginTop: '2rem', 
                background: isChecklistComplete ? '#0f172a' : '#cbd5e1', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: isChecklistComplete ? 'pointer' : 'not-allowed',
                transition: 'background 0.2s'
              }}
            >
              Accept Chain of Custody
            </button>
            {!isChecklistComplete && <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#ef4444', marginTop: '1rem' }}>You must physically verify all requirements before accepting custody.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
