import { useState, useEffect } from 'react';
import { Save, Globe, MessageCircle, RefreshCcw, Loader } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import '../admin.css';

export default function SocialMediaSettings() {
  const { showToast } = useApp();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalData, setOriginalData] = useState(null);
  const [data, setData] = useState({
    global: { enabled: true },
    platforms: {
      instagram: { enabled: true, url: '', handle: '' },
      facebook: { enabled: true, url: '', handle: '' },
      pinterest: { enabled: false, url: '', handle: '' },
      whatsapp: { enabled: false, url: '', phoneNumber: '', floatingButton: false, handle: '' },
      youtube: { enabled: false, url: '', handle: '' },
      twitter: { enabled: false, url: '', handle: '' }
    },
    contact: {
      phone: '',
      email: ''
    },
    integrations: {
      instagramFeed: true,
      headerIcons: true,
      footerIcons: true
    }
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (!db) throw new Error("Database not initialized");
      const docRef = doc(db, 'cms', 'socialMedia');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const fetchedData = docSnap.data();
        setData((prev) => ({
          ...prev,
          ...fetchedData,
          platforms: { ...prev.platforms, ...(fetchedData.platforms || {}) },
          integrations: { ...prev.integrations, ...(fetchedData.integrations || {}) },
          contact: { ...prev.contact, ...(fetchedData.contact || {}) }
        }));
        setOriginalData((prev) => {
          const safePrev = prev || data;
          return {
            ...safePrev,
            ...fetchedData,
            platforms: { ...safePrev.platforms, ...(fetchedData.platforms || {}) },
            integrations: { ...safePrev.integrations, ...(fetchedData.integrations || {}) },
            contact: { ...safePrev.contact, ...(fetchedData.contact || {}) }
          };
        });
      } else {
        setOriginalData(data);
      }
    } catch (e) {
      console.error("Error fetching social media data:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (!db) throw new Error("Database not initialized");
      await setDoc(doc(db, 'cms', 'socialMedia'), {
        ...data,
        updatedAt: serverTimestamp()
      }, { merge: true });
      setOriginalData(data);
      showToast("Social Media Settings saved successfully!");
    } catch (e) {
      console.error("Error saving social media data:", e);
      showToast("Error saving content", "error");
    } finally {
      setSaving(false);
    }
  };

  const togglePlatform = (platform) => {
    const platData = data.platforms[platform] || {};
    setData({
      ...data,
      platforms: {
        ...data.platforms,
        [platform]: { ...platData, enabled: !platData.enabled }
      }
    });
  };

  const updateUrl = (platform, url) => {
    const platData = data.platforms[platform] || {};
    setData({
      ...data,
      platforms: {
        ...data.platforms,
        [platform]: { ...platData, url }
      }
    });
  };

  const updateHandle = (platform, handle) => {
    const platData = data.platforms[platform] || {};
    setData({
      ...data,
      platforms: {
        ...data.platforms,
        [platform]: { ...platData, handle }
      }
    });
  };

  const toggleIntegration = (key) => {
    setData({
      ...data,
      integrations: {
        ...data.integrations,
        [key]: !data.integrations[key]
      }
    });
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}><Loader className="spin" size={24} color="var(--gold)" /></div>;
  }

  const hasChanges = JSON.stringify(data) !== JSON.stringify(originalData);

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Social Media Settings</h1>
          <p className="page-subtitle">Manage all social profiles, floating buttons, and integrations.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-outline" onClick={fetchData} disabled={saving || !hasChanges}><RefreshCcw size={16} style={{ marginRight: 6 }} /> Reset</button>
          <button className="btn btn-gold" onClick={handleSave} disabled={saving || !hasChanges} style={{ color: '#fff', fontWeight: 'bold', opacity: (!hasChanges ? 0.6 : 1) }}>
            {saving ? <Loader className="spin" size={16} /> : <Save size={16} />} 
            <span style={{ marginLeft: 6 }}>{saving ? 'Saving...' : 'Publish Settings'}</span>
          </button>
        </div>
      </div>

      <div className="grid-2">
        <div className="admin-card">
          <div className="card-header"><div className="card-title">Social Platforms</div></div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {Object.keys(data.platforms).filter(p => p !== 'linkedin' && p !== 'telegram' && p !== 'whatsapp').map((platform) => (
              <div key={platform} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ width: '40px', display: 'flex', justifyContent: 'center' }}>
                  {platform === 'whatsapp' ? <MessageCircle size={24} /> : <Globe size={24} />}
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', cursor: 'pointer', textTransform: 'capitalize' }}>
                    <input type="checkbox" checked={!!data.platforms[platform]?.enabled} onChange={() => togglePlatform(platform)} />
                    Enable {platform}
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder={`https://${platform}.com/...`} 
                      value={data.platforms[platform]?.url || ''} 
                      onChange={(e) => updateUrl(platform, e.target.value)} 
                      disabled={!data.platforms[platform]?.enabled}
                      style={{ flex: 2 }}
                    />
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder={`@username`} 
                      value={data.platforms[platform]?.handle || ''} 
                      onChange={(e) => updateHandle(platform, e.target.value)} 
                      disabled={!data.platforms[platform]?.enabled}
                      style={{ flex: 1 }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="admin-card">
            <div className="card-header"><div className="card-title">Visibility & Integrations</div></div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={data.integrations.headerIcons} onChange={() => toggleIntegration('headerIcons')} />
                Show Social Icons in Header
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={data.integrations.footerIcons} onChange={() => toggleIntegration('footerIcons')} />
                Show Social Icons in Footer
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={data.integrations.instagramFeed} onChange={() => toggleIntegration('instagramFeed')} />
                Show Live Instagram Feed on Homepage
              </label>
            </div>
          </div>

          <div className="admin-card">
            <div className="card-header"><div className="card-title">Contact Information</div></div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Support Phone Number (with Country Code)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. +919876543210" 
                  value={data.contact?.phone || data.platforms.whatsapp.phoneNumber} 
                  onChange={(e) => setData({ ...data, contact: { ...data.contact, phone: e.target.value }, platforms: { ...data.platforms, whatsapp: { ...data.platforms.whatsapp, phoneNumber: e.target.value } } })} 
                />
              </div>
              <div className="form-group">
                <label>Support Email Address</label>
                <input 
                  type="email" 
                  className="form-input" 
                  placeholder="e.g. support@luminajewels.com" 
                  value={data.contact?.email || ''} 
                  onChange={(e) => setData({ ...data, contact: { ...data.contact, email: e.target.value } })} 
                />
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
