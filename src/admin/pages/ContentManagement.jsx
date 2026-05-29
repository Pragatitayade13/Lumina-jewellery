import { useState } from 'react';
import { blogPosts } from '../data/mockData';
import { Image, FileText, Mail, Edit2, Trash2, Search, X, Save } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function ContentManagement() {
  const { showToast } = useApp();
  const [templateModal, setTemplateModal] = useState({ isOpen: false, name: '', content: '' });
  
  const handleEditTemplate = (e, name) => {
    e.preventDefault();
    setTemplateModal({ 
      isOpen: true, 
      name, 
      content: `Hi [Customer Name],\n\nThis is the default template for ${name}.\n\nBest,\nLumina Jewels Team` 
    });
  };

  const handleSaveTemplate = () => {
    showToast(`Template '${templateModal.name}' updated successfully!`);
    setTemplateModal({ isOpen: false, name: '', content: '' });
  };
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Content & CMS</h1>
          <p className="page-subtitle">Manage blog posts, homepage banners, and legal pages.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline">Media Library</button>
          <button className="btn btn-gold">+ Create Post</button>
        </div>
      </div>

      <div className="grid-3 mb-15">
        <div className="content-section-card">
          <div className="content-section-header">
             <div className="content-section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Image size={16} color="var(--gold)" /> Homepage Banners</div>
             <button className="btn btn-sm btn-outline">Edit</button>
          </div>
          <div className="content-section-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
             <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
               <div style={{ width: 60, height: 35, background: 'linear-gradient(45deg, #111, #333)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: 'var(--gold)' }}>Hero 1</div>
               <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>Bridal Season Sale</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--status-green)' }}>Active</div>
               </div>
             </div>
             <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
               <div style={{ width: 60, height: 35, background: 'linear-gradient(45deg, #111, #333)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: 'var(--gold)' }}>Hero 2</div>
               <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>New Diamond Collection</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--status-green)' }}>Active</div>
               </div>
             </div>
          </div>
        </div>

        <div className="content-section-card">
          <div className="content-section-header">
             <div className="content-section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><FileText size={16} color="var(--gold)" /> Legal Pages</div>
          </div>
          <div className="content-section-body">
             <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.8rem' }}>
               <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>Terms & Conditions</span> <a href="#" style={{ color: 'var(--gold)' }}>Edit</a></li>
               <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>Privacy Policy</span> <a href="#" style={{ color: 'var(--gold)' }}>Edit</a></li>
               <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>Return Policy</span> <a href="#" style={{ color: 'var(--gold)' }}>Edit</a></li>
               <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>Shipping Info</span> <a href="#" style={{ color: 'var(--gold)' }}>Edit</a></li>
             </ul>
          </div>
        </div>

        <div className="content-section-card">
           <div className="content-section-header">
             <div className="content-section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Mail size={16} color="var(--gold)" /> Email Templates</div>
          </div>
          <div className="content-section-body">
             <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.8rem' }}>
               <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>Order Confirmation</span> <a href="#" onClick={(e) => handleEditTemplate(e, 'Order Confirmation')} style={{ color: 'var(--gold)' }}>Edit</a></li>
               <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>Shipping Update</span> <a href="#" onClick={(e) => handleEditTemplate(e, 'Shipping Update')} style={{ color: 'var(--gold)' }}>Edit</a></li>
               <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>Welcome Email</span> <a href="#" onClick={(e) => handleEditTemplate(e, 'Welcome Email')} style={{ color: 'var(--gold)' }}>Edit</a></li>
               <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>Password Reset</span> <a href="#" onClick={(e) => handleEditTemplate(e, 'Password Reset')} style={{ color: 'var(--gold)' }}>Edit</a></li>
             </ul>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <div className="card-header">
          <div className="card-title">Blog & Articles</div>
          <div className="filter-search" style={{ margin: 0, width: '250px' }}>
            <Search size={14} />
            <input placeholder="Search articles..." />
          </div>
        </div>
        
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Article Title</th>
                <th>Author</th>
                <th>Status</th>
                <th>Date</th>
                <th>Views</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {blogPosts.map(post => (
                <tr key={post.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{post.title}</td>
                  <td>{post.author}</td>
                  <td>
                    <span className={`badge badge-${post.status === 'published' ? 'active' : post.status === 'draft' ? 'pending' : 'info'}`}>
                      {post.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.75rem' }}>{post.date}</td>
                  <td style={{ fontWeight: 700 }}>{post.views > 0 ? post.views.toLocaleString() : '-'}</td>
                  <td>
                     <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className="btn btn-icon btn-outline" title="Edit"><Edit2 size={12} /></button>
                        <button className="btn btn-icon btn-danger" title="Delete"><Trash2 size={12} /></button>
                      </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {templateModal.isOpen && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-box" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Template: {templateModal.name}</h3>
              <button className="modal-close" onClick={() => setTemplateModal({ isOpen: false, name: '', content: '' })}><X size={16} /></button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Email Subject</label>
                <input type="text" className="form-input" defaultValue={`Lumina Jewels: ${templateModal.name}`} />
              </div>
              <div className="form-group">
                <label>Email Body (Supports HTML & Variables)</label>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Available variables: [Customer Name], [Order ID], [Tracking Link]</div>
                <textarea 
                  className="form-input" 
                  rows="8" 
                  value={templateModal.content}
                  onChange={(e) => setTemplateModal({ ...templateModal, content: e.target.value })}
                  style={{ fontFamily: 'monospace' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setTemplateModal({ isOpen: false, name: '', content: '' })}>Cancel</button>
                <button type="button" className="btn btn-gold" onClick={handleSaveTemplate} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#000', fontWeight: 'bold' }}>
                  <Save size={14} /> Save Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
