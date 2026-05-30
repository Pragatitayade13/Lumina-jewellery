import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Shield, FileText, Cookie, RefreshCcw, Ruler, Heart, ChevronRight } from 'lucide-react';

const policies = [
  {
    id: 'privacy-policy',
    title: 'Privacy Policy',
    icon: <Shield size={20} />,
    content: `At Lumina Jewels, we take your privacy seriously. We collect minimal data necessary to process your orders and improve our service. Your payment information is securely processed and never stored on our servers. We do not sell your personal information to third parties. Our comprehensive security measures ensure that your personal data is protected against unauthorized access, alteration, or disclosure. We use SSL encryption for all transactions and comply with international data protection regulations.`
  },
  {
    id: 'terms-of-service',
    title: 'Terms of Service',
    icon: <FileText size={20} />,
    content: `By using Lumina Jewels, you agree to these terms. All prices are subject to change based on daily gold and silver rates. Custom orders cannot be cancelled once production begins. We reserve the right to refuse service to anyone for any reason at any time. You understand that your content (not including credit card information), may be transferred unencrypted and involve transmissions over various networks.`
  },
  {
    id: 'cookies',
    title: 'Cookie Policy',
    icon: <Cookie size={20} />,
    content: `We use cookies to enhance your browsing experience, remember your preferences, and analyze site traffic. Essential cookies are required for the site to function, while analytics and marketing cookies are optional. You can choose to accept or decline cookies through your browser settings. However, declining cookies may prevent you from taking full advantage of the website's features, including maintaining a persistent shopping cart.`
  },
  {
    id: 'returns-policy',
    title: 'Returns Policy',
    icon: <RefreshCcw size={20} />,
    content: `We offer a 14-day return policy for unworn items with all original tags and packaging intact. Custom-made, engraved, or personalized items are final sale and cannot be returned. Refunds will be processed to the original method of payment within 5-7 business days after we receive and inspect the returned item. Customers are responsible for return shipping costs unless the item arrived damaged or incorrect.`
  },
  {
    id: 'size-guide',
    title: 'Size Guide',
    icon: <Ruler size={20} />,
    content: `Choosing the right size is crucial for comfort and style. Please use our comprehensive sizing guide below:

**Rings**
- **Size 5 (49mm)**: Generally fits smaller fingers
- **Size 6 (52mm)**: Average for women
- **Size 7 (54mm)**: Slightly above average
- **Size 8 (57mm)**: Standard for larger fingers
*Tip*: We recommend visiting a local jeweler to have your finger professionally sized if you are unsure.

**Necklaces**
- **14" - 16" (Choker)**: Sits high on the neck or tightly at the base of the throat.
- **18" (Princess)**: Our standard size. Sits elegantly on the collarbone.
- **20" - 24" (Matinee)**: Falls elegantly between the collarbone and the bust.
- **28" - 36" (Opera)**: Hangs below the bust, perfect for statement pendants.

**Bangles (Inner Diameter)**
- **2.4 (57.2mm)**: Small
- **2.6 (60.3mm)**: Medium (Standard)
- **2.8 (63.5mm)**: Large
*Tip*: Measure the inner diameter of a bangle you already own to find your perfect fit.`
  },
  {
    id: 'care-instructions',
    title: 'Care Instructions',
    icon: <Heart size={20} />,
    content: `Fine jewelry requires gentle care to maintain its brilliance. Store your jewelry in a clean, dry place, preferably in the original Lumina Jewels box or a soft pouch. Keep away from harsh chemicals, perfumes, and cosmetics. For gold and platinum, use a soft cloth to gently polish. For diamonds, a soft toothbrush and mild soapy water can be used to remove dirt. Silver items should be kept in airtight bags to prevent tarnishing.`
  }
];

export default function LegalPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname.replace('/', '');
  
  const [activeTab, setActiveTab] = useState(path || 'privacy-policy');

  useEffect(() => {
    if (path && policies.find(p => p.id === path)) {
      setActiveTab(path);
    } else {
      setActiveTab('privacy-policy');
    }
  }, [path]);

  const handleTabChange = (id) => {
    setActiveTab(id);
    navigate(`/${id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activePolicy = policies.find(p => p.id === activeTab) || policies[0];

  return (
    <div style={{ paddingTop: '100px', minHeight: '80vh', paddingBottom: '100px', background: 'var(--bg-dark)' }}>
      <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', color: 'var(--gold)', marginBottom: '1rem' }}>
            Legal & Policies
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Everything you need to know about our policies and your rights.</p>
        </div>

        <div style={{ 
          display: 'flex', 
          gap: '2rem',
          flexDirection: window.innerWidth < 768 ? 'column' : 'row'
        }}>
          {/* Sidebar Navigation */}
          <aside style={{ 
            flex: '0 0 280px', 
            background: 'var(--surface)', 
            padding: '1.5rem', 
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            height: 'fit-content'
          }}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {policies.map(policy => (
                <li key={policy.id}>
                  <button
                    onClick={() => handleTabChange(policy.id)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1rem',
                      background: activeTab === policy.id ? 'rgba(201, 168, 76, 0.15)' : 'transparent',
                      color: activeTab === policy.id ? 'var(--gold)' : 'var(--text-secondary)',
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '1rem',
                      transition: 'all 0.2s ease',
                      fontWeight: activeTab === policy.id ? '600' : '400',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ opacity: activeTab === policy.id ? 1 : 0.6 }}>{policy.icon}</span>
                      {policy.title}
                    </div>
                    {activeTab === policy.id && <ChevronRight size={16} />}
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          {/* Content Area */}
          <main style={{ 
            flex: 1, 
            background: 'var(--surface)', 
            padding: '3rem', 
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)'
          }}>
            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--gold)' }}>
              {React.cloneElement(activePolicy.icon, { size: 32 })}
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: 'var(--text-primary)', margin: 0 }}>
                {activePolicy.title}
              </h2>
            </div>
            
            <div style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '1.1rem' }}>
              {activePolicy.content.split('\n\n').map((paragraph, idx) => (
                <div key={idx} style={{ marginBottom: '1.5rem' }}>
                  {paragraph.split('\n').map((line, i) => {
                    // Process bold text markdown-style
                    const processBold = (text) => {
                      const parts = text.split(/(\*\*.*?\*\*)/g);
                      return parts.map((part, index) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                          return <strong key={index} style={{ color: 'var(--text-primary)' }}>{part.slice(2, -2)}</strong>;
                        }
                        return part;
                      });
                    };

                    // Handle list items
                    if (line.startsWith('- ')) {
                      return <li key={i} style={{ marginLeft: '1.5rem', marginBottom: '0.5rem' }}>{processBold(line.substring(2))}</li>;
                    }
                    
                    // Handle italic tips
                    if (line.startsWith('*') && line.includes('*') && !line.startsWith('**')) {
                      const parts = line.split('*');
                      return <p key={i} style={{ margin: '0.2rem 0', fontStyle: 'italic', fontSize: '0.95rem' }}>
                        <span style={{ color: 'var(--gold)' }}>{parts[1]}</span>{parts[2]}
                      </p>;
                    }

                    return <p key={i} style={{ margin: '0.2rem 0' }}>{processBold(line)}</p>;
                  })}
                </div>
              ))}
            </div>

            <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Last updated: May 30, 2026
            </div>
          </main>
        </div>

      </div>
    </div>
  );
}
