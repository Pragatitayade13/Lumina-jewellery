import { useState } from 'react';
import { blogPosts } from '../data/mockData';
import { Image, FileText, Mail, Edit2, Trash2, Search, X, Save } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function ContentManagement() {
  const { showToast, user } = useApp();
  const [posts, setPosts] = useState(blogPosts);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals state
  const [templateModal, setTemplateModal] = useState({ isOpen: false, name: '', content: '' });
  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false);
  const [bannerModal, setBannerModal] = useState({ isOpen: false, title: '', subtitle: '' });
  const [legalModal, setLegalModal] = useState({ isOpen: false, pageName: '', content: '' });
  const [postModal, setPostModal] = useState({ isOpen: false, post: null, isEditing: false });
  
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

  const handleEditLegal = (e, pageName) => {
    e.preventDefault();
    setLegalModal({ isOpen: true, pageName, content: `<h1>${pageName}</h1>\n<p>Enter the legal text and policies here...</p>` });
  };

  const handleSaveLegal = () => {
    showToast(`${legalModal.pageName} updated successfully!`);
    setLegalModal({ isOpen: false, pageName: '', content: '' });
  };

  const handleSaveBanner = () => {
    showToast("Homepage banners updated successfully!");
    setBannerModal({ isOpen: false, title: '', subtitle: '' });
  };

  const handleSavePost = (e) => {
    e.preventDefault();
    if (postModal.isEditing) {
      setPosts(posts.map(p => p.id === postModal.post.id ? postModal.post : p));
      showToast("Post updated successfully!");
    } else {
      setPosts([{ ...postModal.post, id: Date.now().toString(), date: new Date().toLocaleDateString('en-GB'), views: 0 }, ...posts]);
      showToast("New post created successfully!");
    }
    setPostModal({ isOpen: false, post: null, isEditing: false });
  };

  const handleDeletePost = (id) => {
    setPosts(posts.filter(p => p.id !== id));
    showToast("Post moved to trash.");
  };

  const filteredPosts = posts.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Content & CMS</h1>
          <p className="page-subtitle">Manage blog posts, homepage banners, and legal pages.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline" onClick={() => setMediaLibraryOpen(true)}>Media Library</button>
          <button className="btn btn-gold" style={{ color: '#000', fontWeight: 'bold' }} onClick={() => setPostModal({ isOpen: true, post: { title: '', author: user?.name || 'Admin', status: 'draft' }, isEditing: false })}>+ Create Post</button>
        </div>
      </div>

      <div className="grid-3 mb-15">
        <div className="content-section-card">
          <div className="content-section-header">
             <div className="content-section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Image size={16} color="var(--gold)" /> Homepage Banners</div>
             <button className="btn btn-sm btn-outline" onClick={() => setBannerModal({ isOpen: true, title: 'Bridal Season Sale', subtitle: 'New Diamond Collection' })}>Edit</button>
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
               <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>Terms & Conditions</span> <a href="#" onClick={(e) => handleEditLegal(e, 'Terms & Conditions')} style={{ color: 'var(--gold)' }}>Edit</a></li>
               <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>Privacy Policy</span> <a href="#" onClick={(e) => handleEditLegal(e, 'Privacy Policy')} style={{ color: 'var(--gold)' }}>Edit</a></li>
               <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>Return Policy</span> <a href="#" onClick={(e) => handleEditLegal(e, 'Return Policy')} style={{ color: 'var(--gold)' }}>Edit</a></li>
               <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>Shipping Info</span> <a href="#" onClick={(e) => handleEditLegal(e, 'Shipping Info')} style={{ color: 'var(--gold)' }}>Edit</a></li>
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
            <input placeholder="Search articles..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
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
              {filteredPosts.map(post => (
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
                        <button className="btn btn-icon btn-outline" title="Edit" onClick={() => setPostModal({ isOpen: true, post, isEditing: true })}><Edit2 size={12} /></button>
                        <button className="btn btn-icon btn-danger" title="Delete" onClick={() => handleDeletePost(post.id)}><Trash2 size={12} /></button>
                      </div>
                  </td>
                </tr>
              ))}
              {filteredPosts.length === 0 && (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No articles found.</td></tr>
              )}
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

      {mediaLibraryOpen && (
        <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={() => setMediaLibraryOpen(false)}>
          <div className="modal-box" style={{ maxWidth: '800px', background: 'var(--surface)' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Image size={18} color="var(--gold)" /> Media Library</h3>
              <button className="modal-close" onClick={() => setMediaLibraryOpen(false)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
                {[1,2,3,4,5,6,7,8].map(i => (
                  <div key={i} style={{ aspectRatio: '1', background: 'linear-gradient(45deg, #111, #222)', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                    <Image size={24} opacity={0.5} />
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', alignItems: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>8 files (24.5 MB used)</div>
                <button className="btn btn-gold" style={{ color: '#000', fontWeight: 'bold' }}>Upload New File</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {bannerModal.isOpen && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-box" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Homepage Banners</h3>
              <button className="modal-close" onClick={() => setBannerModal({ isOpen: false, title: '', subtitle: '' })}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Hero 1 Title</label>
                <input type="text" className="form-input" value={bannerModal.title} onChange={e => setBannerModal({...bannerModal, title: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Hero 2 Title</label>
                <input type="text" className="form-input" value={bannerModal.subtitle} onChange={e => setBannerModal({...bannerModal, subtitle: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Banner Images</label>
                <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => setMediaLibraryOpen(true)}>Select from Media Library</button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button className="btn btn-outline" onClick={() => setBannerModal({ isOpen: false, title: '', subtitle: '' })}>Cancel</button>
                <button className="btn btn-gold" onClick={handleSaveBanner} style={{ color: '#000', fontWeight: 'bold' }}>Save Banners</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {legalModal.isOpen && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-box" style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Legal Page: {legalModal.pageName}</h3>
              <button className="modal-close" onClick={() => setLegalModal({ isOpen: false, pageName: '', content: '' })}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Page Content (HTML supported)</label>
                <textarea className="form-input" rows="12" value={legalModal.content} onChange={e => setLegalModal({...legalModal, content: e.target.value})} style={{ fontFamily: 'monospace' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button className="btn btn-outline" onClick={() => setLegalModal({ isOpen: false, pageName: '', content: '' })}>Cancel</button>
                <button className="btn btn-gold" onClick={handleSaveLegal} style={{ color: '#000', fontWeight: 'bold' }}>Publish Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {postModal.isOpen && postModal.post && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-box" style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h3 className="modal-title">{postModal.isEditing ? 'Edit Post' : 'Create New Post'}</h3>
              <button className="modal-close" onClick={() => setPostModal({ isOpen: false, post: null, isEditing: false })}><X size={16} /></button>
            </div>
            <form onSubmit={handleSavePost}>
              <div className="modal-body">
                <div className="form-group mb-1">
                  <label>Article Title</label>
                  <input type="text" className="form-input" required value={postModal.post.title} onChange={e => setPostModal({...postModal, post: {...postModal.post, title: e.target.value}})} />
                </div>
                <div className="form-row mb-1">
                  <div className="form-group">
                    <label>Author</label>
                    <input type="text" className="form-input" required value={postModal.post.author} onChange={e => setPostModal({...postModal, post: {...postModal.post, author: e.target.value}})} />
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select className="form-input" value={postModal.post.status} onChange={e => setPostModal({...postModal, post: {...postModal.post, status: e.target.value}})}>
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="scheduled">Scheduled</option>
                    </select>
                  </div>
                </div>
                <div className="form-group mb-1">
                  <label>Article Content</label>
                  <textarea className="form-input" rows="8" placeholder="Start writing your amazing article here..."></textarea>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setMediaLibraryOpen(true)}><Image size={14} style={{ marginRight: '6px' }} /> Add Media</button>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button type="button" className="btn btn-outline" onClick={() => setPostModal({ isOpen: false, post: null, isEditing: false })}>Cancel</button>
                    <button type="submit" className="btn btn-gold" style={{ color: '#000', fontWeight: 'bold' }}>{postModal.isEditing ? 'Save Changes' : 'Publish Article'}</button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
