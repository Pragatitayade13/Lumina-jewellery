import { useApprovals } from '../../hooks/useApprovals';
import { useApp } from '../../context/AppContext';
import { Check, X, Loader } from 'lucide-react';

export default function ApprovalDashboard() {
  const { currentStore, showToast } = useApp();
  const { approvals, loading, processApproval } = useApprovals(currentStore);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}><Loader className="spin" size={24} color="var(--gold)" /></div>;
  }

  const pendingApprovals = approvals.filter(a => a.status === 'pending');
  const pastApprovals = approvals.filter(a => a.status !== 'pending');

  const handleAction = async (id, status) => {
    try {
      await processApproval(id, status, `Reviewed and ${status}`);
      showToast(`Approval ${status} successfully!`, status === 'approved' ? 'success' : 'info');
    } catch (err) {
      showToast('Failed to process approval', 'error');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Approval Dashboard</h1>
          <p className="page-subtitle">Review pending requests from staff for high-risk actions.</p>
        </div>
      </div>
      
      <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-title" style={{ marginBottom: '1rem' }}>Pending Requests</div>
        {pendingApprovals.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No pending approvals at this time.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Module</th>
                  <th>Action Type</th>
                  <th>Requested By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingApprovals.map(app => (
                  <tr key={app.id}>
                    <td>{app.timestamp ? new Date(app.timestamp.toDate()).toLocaleString() : 'Just now'}</td>
                    <td>{app.module}</td>
                    <td style={{ fontWeight: 600 }}>{app.type.replace(/_/g, ' ')}</td>
                    <td>{app.requestedBy}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-sm btn-gold" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', backgroundColor: 'var(--status-green)', color: 'white', border: 'none' }} onClick={() => handleAction(app.id, 'approved')}>
                          <Check size={14}/> Approve
                        </button>
                        <button className="btn btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', backgroundColor: 'var(--status-red)', color: 'white', border: 'none' }} onClick={() => handleAction(app.id, 'rejected')}>
                          <X size={14}/> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="admin-card">
        <div className="card-title" style={{ marginBottom: '1rem' }}>Recent Decisions</div>
        {pastApprovals.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No past approvals.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Module</th>
                  <th>Action Type</th>
                  <th>Requested By</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {pastApprovals.map(app => (
                  <tr key={app.id}>
                    <td>{app.timestamp ? new Date(app.timestamp.toDate()).toLocaleString() : 'Unknown'}</td>
                    <td>{app.module}</td>
                    <td style={{ fontWeight: 600 }}>{app.type.replace(/_/g, ' ')}</td>
                    <td>{app.requestedBy}</td>
                    <td>
                      <span style={{ 
                        padding: '0.3rem 0.8rem', 
                        borderRadius: '12px', 
                        fontSize: '0.75rem', 
                        fontWeight: 700, 
                        background: app.status === 'approved' ? 'rgba(46, 204, 113, 0.2)' : 'rgba(231, 76, 60, 0.2)', 
                        color: app.status === 'approved' ? 'var(--status-green)' : 'var(--status-red)' 
                      }}>
                        {app.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
