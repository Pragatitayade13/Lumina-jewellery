import { useState } from 'react';
import { Search, ShieldCheck, Diamond, CheckCircle, FileText } from 'lucide-react';

export default function CertificateVerification() {
  const [certId, setCertId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [certificateData, setCertificateData] = useState(null);
  const [error, setError] = useState('');

  const handleVerify = (e) => {
    e.preventDefault();
    if (!certId.trim()) {
      setError('Please enter a valid certificate number.');
      return;
    }
    
    setError('');
    setIsSearching(true);
    setCertificateData(null);

    // Mock API delay
    setTimeout(() => {
      setIsSearching(false);
      
      // We accept anything starting with 'IGI', 'GIA', or 'LUM'
      const idUpper = certId.toUpperCase();
      if (idUpper.startsWith('IGI-') || idUpper.startsWith('GIA-') || idUpper.startsWith('LUM-') || idUpper === 'DEMO123') {
        setCertificateData({
          id: idUpper === 'DEMO123' ? 'IGI-9845723' : idUpper,
          date: '12 Oct 2025',
          item: 'Solitaire Diamond',
          carat: '1.50 ct',
          color: 'F',
          clarity: 'VVS1',
          cut: 'Excellent',
          shape: 'Round Brilliant',
          metal: '18K White Gold',
          status: 'Authentic'
        });
      } else {
        setError("Certificate not found. Please ensure you entered the exact ID (e.g., IGI-XXXXXX). Try 'DEMO123'.");
      }
    }, 1500);
  };

  return (
    <div>
      <div className="customer-card">
        <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck /> Certificate Verification
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>
          Verify the authenticity of your Lumina Jewels diamonds and precious stones. Enter your IGI, GIA, or Lumina authenticity number below.
        </p>
      </div>

      <div className="customer-card" style={{ marginTop: '2rem' }}>
        <form onSubmit={handleVerify} style={{ display: 'flex', gap: '1rem', maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <FileText size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Enter Certificate ID (Try 'DEMO123')" 
              value={certId}
              onChange={(e) => setCertId(e.target.value)}
              className="form-input"
              style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', background: 'var(--surface)', border: '1px solid var(--border-color)', color: '#fff', borderRadius: '8px', fontSize: '1rem' }}
            />
          </div>
          <button type="submit" className="btn btn-gold" disabled={isSearching} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0 2rem' }}>
            {isSearching ? 'Verifying...' : <><Search size={18} /> Verify</>}
          </button>
        </form>
        {error && (
          <div style={{ color: 'var(--status-red)', textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}
      </div>

      {certificateData && (
        <div style={{ marginTop: '2rem', animation: 'fadeIn 0.5s ease' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, rgba(212,175,55,0.1) 0%, rgba(13,8,0,1) 100%)', 
            border: '1px solid var(--gold)', 
            borderRadius: '12px', 
            padding: '3rem 2rem',
            maxWidth: '800px',
            margin: '0 auto',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Watermark */}
            <Diamond size={300} style={{ position: 'absolute', right: '-50px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gold)', opacity: 0.03, pointerEvents: 'none' }} />
            
            <div style={{ textAlign: 'center', marginBottom: '3rem', position: 'relative', zIndex: 1 }}>
              <div style={{ color: 'var(--gold)', letterSpacing: '3px', fontSize: '1.5rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Authenticity Certificate
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Lumina Jewels Official Record</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', position: 'relative', zIndex: 1 }}>
              
              <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-primary)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Item Details</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Certificate No.</span>
                  <strong style={{ color: 'var(--gold)', fontFamily: 'monospace' }}>{certificateData.id}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Date of Issue</span>
                  <strong>{certificateData.date}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Description</span>
                  <strong>{certificateData.item}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Metal</span>
                  <strong>{certificateData.metal}</strong>
                </div>
              </div>

              <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-primary)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Grading Results (4C's)</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Shape & Style</span>
                  <strong>{certificateData.shape}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Carat Weight</span>
                  <strong>{certificateData.carat}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Color Grade</span>
                  <strong>{certificateData.color}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Clarity Grade</span>
                  <strong>{certificateData.clarity}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Cut Grade</span>
                  <strong>{certificateData.cut}</strong>
                </div>
              </div>

            </div>

            <div style={{ marginTop: '3rem', textAlign: 'center', position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'rgba(46, 204, 113, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(46, 204, 113, 0.3)' }}>
              <CheckCircle size={24} color="var(--status-green)" />
              <strong style={{ color: 'var(--status-green)', fontSize: '1.1rem', letterSpacing: '1px' }}>VERIFIED AUTHENTIC</strong>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
