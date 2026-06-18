import { MessageCircle } from 'lucide-react';
import { useCMS } from '../../context/CMSContext';

export default function FloatingWhatsApp() {
  const { socialMediaData } = useCMS();

  const settings = socialMediaData?.platforms?.whatsapp;
  
  if (!settings || !settings.enabled || !settings.floatingButton) {
    return null;
  }

  const handleClick = () => {
    const phone = settings.phoneNumber || '';
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  return (
    <button 
      onClick={handleClick}
      aria-label="Chat on WhatsApp"
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        backgroundColor: '#25D366',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        width: '60px',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
        cursor: 'pointer',
        zIndex: 9000,
        transition: 'transform 0.2s',
      }}
      onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
      onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
    >
      <MessageCircle size={32} />
    </button>
  );
}
