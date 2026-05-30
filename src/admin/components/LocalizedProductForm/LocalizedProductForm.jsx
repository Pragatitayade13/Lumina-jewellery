import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Save } from 'lucide-react';

export default function LocalizedProductForm() {
  const { t } = useTranslation('admin'); // Use the admin namespace
  
  // Track the currently active language tab
  const [activeTab, setActiveTab] = useState('en');

  // Multi-language state
  const [formData, setFormData] = useState({
    title: { en: '', hi: '', mr: '' },
    description: { en: '', hi: '', mr: '' }
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [activeTab]: value
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Formatting the payload as requested
    const payload = {
      title: {
        en: formData.title.en,
        hi: formData.title.hi,
        mr: formData.title.mr
      },
      description: {
        en: formData.description.en,
        hi: formData.description.hi,
        mr: formData.description.mr
      }
    };

    console.log('Submitting Localized Payload:', payload);
    alert('Payload logged to console!');
  };

  return (
    <div style={{
      background: 'var(--bg-card, #1A1000)',
      padding: '2rem',
      borderRadius: '12px',
      border: '1px solid rgba(201, 168, 76, 0.2)',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <Globe color="#C9A84C" />
        <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.5rem' }}>
          {t('products.add', 'Add New Product')}
        </h2>
      </div>

      {/* Language Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '2rem',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        paddingBottom: '0.5rem'
      }}>
        {[
          { code: 'en', label: 'English' },
          { code: 'hi', label: 'हिन्दी' },
          { code: 'mr', label: 'मराठी' }
        ].map(lang => (
          <button
            key={lang.code}
            type="button"
            onClick={() => setActiveTab(lang.code)}
            style={{
              padding: '0.5rem 1.5rem',
              background: activeTab === lang.code ? 'rgba(201, 168, 76, 0.15)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === lang.code ? '2px solid #C9A84C' : '2px solid transparent',
              color: activeTab === lang.code ? '#C9A84C' : 'var(--text-muted)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '1rem',
              transition: 'all 0.2s',
              fontFamily: (lang.code === 'hi' || lang.code === 'mr') ? "'Noto Sans Devanagari', sans-serif" : 'inherit'
            }}
          >
            {lang.label}
          </button>
        ))}
      </div>

      {/* Form Fields */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Title Input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Product Title ({activeTab.toUpperCase()})
          </label>
          <input
            type="text"
            value={formData.title[activeTab]}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder={`Enter title in ${activeTab.toUpperCase()}`}
            style={{
              padding: '0.75rem 1rem',
              background: 'rgba(0,0,0,0.2)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              fontFamily: (activeTab === 'hi' || activeTab === 'mr') ? "'Noto Sans Devanagari', sans-serif" : 'inherit'
            }}
            required
          />
        </div>

        {/* Description Input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Product Description ({activeTab.toUpperCase()})
          </label>
          <textarea
            value={formData.description[activeTab]}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder={`Enter description in ${activeTab.toUpperCase()}`}
            rows={5}
            style={{
              padding: '0.75rem 1rem',
              background: 'rgba(0,0,0,0.2)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              resize: 'vertical',
              fontFamily: (activeTab === 'hi' || activeTab === 'mr') ? "'Noto Sans Devanagari', sans-serif" : 'inherit'
            }}
            required
          />
        </div>

        <button
          type="submit"
          style={{
            marginTop: '1rem',
            background: 'var(--gold, #C9A84C)',
            color: '#000',
            border: 'none',
            padding: '1rem',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '1rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          <Save size={20} />
          {t('buttons.save', 'Save Product')}
        </button>

      </form>
    </div>
  );
}
