import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'hi', label: 'हिंदी', short: 'हिं' },
  { code: 'mr', label: 'मराठी', short: 'मरा' },
];

export default function LanguageSwitcher({ variant = 'default' }) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const current = languages.find(l => l.code === i18n.language) || languages[0];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('jw_language', code);
    // Apply Devanagari font for hi/mr
    document.body.style.fontFamily = (code === 'hi' || code === 'mr')
      ? "'Noto Sans Devanagari', 'Inter', sans-serif"
      : "'Inter', sans-serif";
    setOpen(false);
  };

  const isAdmin = variant === 'admin';

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(!open)}
        title="Switch Language"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          padding: isAdmin ? '0.3rem 0.6rem' : '0.4rem 0.75rem',
          background: isAdmin ? 'var(--admin-surface, rgba(255,255,255,0.05))' : 'rgba(201,168,76,0.08)',
          border: `1px solid ${isAdmin ? 'rgba(201,168,76,0.25)' : 'rgba(201,168,76,0.35)'}`,
          borderRadius: '8px',
          color: 'var(--gold, #C9A84C)',
          fontSize: '0.75rem',
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          letterSpacing: '0.03em',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,168,76,0.7)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = isAdmin ? 'rgba(201,168,76,0.25)' : 'rgba(201,168,76,0.35)'}
      >
        <Globe size={13} />
        <span>{current.short}</span>
        <span style={{ fontSize: '0.6rem', opacity: 0.7 }}>▾</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: '110%',
          right: 0,
          background: isAdmin ? '#140E00' : 'var(--bg-card, #1A1000)',
          border: '1px solid rgba(201,168,76,0.3)',
          borderRadius: '10px',
          padding: '0.4rem',
          minWidth: '130px',
          zIndex: 9999,
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
          animation: 'fadeIn 0.15s ease',
        }}>
          {languages.map(lang => (
            <button
              key={lang.code}
              onClick={() => handleChange(lang.code)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                width: '100%',
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                background: i18n.language === lang.code ? 'rgba(201,168,76,0.15)' : 'transparent',
                color: i18n.language === lang.code ? '#C9A84C' : '#C8B89A',
                fontSize: '0.82rem',
                fontWeight: i18n.language === lang.code ? 700 : 500,
                cursor: 'pointer',
                border: 'none',
                textAlign: 'left',
                fontFamily: (lang.code === 'hi' || lang.code === 'mr') ? "'Noto Sans Devanagari', sans-serif" : "'Inter', sans-serif",
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => { if (i18n.language !== lang.code) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
              onMouseLeave={e => { if (i18n.language !== lang.code) e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ width: '24px', fontSize: '0.7rem', opacity: 0.6 }}>{lang.short}</span>
              {lang.label}
              {i18n.language === lang.code && <span style={{ marginLeft: 'auto', color: '#C9A84C' }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
