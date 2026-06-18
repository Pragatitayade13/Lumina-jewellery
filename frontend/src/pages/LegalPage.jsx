import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Shield, FileText, Cookie, RefreshCcw, Ruler, Heart, ChevronRight } from 'lucide-react';

const policies = [
  {
    id: 'privacy-policy',
    title: 'Privacy Policy',
    icon: <Shield size={20} />,
    content: `**1. Introduction**
Welcome to Lumina Jewels. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.

**2. The Data We Collect About You**
Personal data, or personal information, means any information about an individual from which that person can be identified. We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:
- **Identity Data**: includes first name, maiden name, last name, username or similar identifier, marital status, title, date of birth and gender.
- **Contact Data**: includes billing address, delivery address, email address and telephone numbers.
- **Financial Data**: includes bank account and payment card details.
- **Transaction Data**: includes details about payments to and from you and other details of products and services you have purchased from us.

**3. How We Use Your Personal Data**
We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
- Where we need to perform the contract we are about to enter into or have entered into with you.
- Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.
- Where we need to comply with a legal or regulatory obligation.

**4. Data Security**
We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorised way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.

**5. Data Retention**
We will only retain your personal data for as long as necessary to fulfil the purposes we collected it for, including for the purposes of satisfying any legal, accounting, or reporting requirements. By law we have to keep basic information about our customers for six years after they cease being customers for tax purposes.`
  },
  {
    id: 'terms-of-service',
    title: 'Terms of Service',
    icon: <FileText size={20} />,
    content: `**1. Acceptance of Terms**
By accessing and using Lumina Jewels, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.

**2. Product Information and Pricing**
We make every effort to display as accurately as possible the colors, features, specifications, and details of the products available on the Site. However, we do not guarantee that the colors, features, specifications, and details of the products will be accurate, complete, reliable, current, or free of other errors. Prices are subject to change based on daily gold, silver, and diamond market rates.

**3. User Registration**
You may be required to register with the Site. You agree to keep your password confidential and will be responsible for all use of your account and password. We reserve the right to remove, reclaim, or change a username you select if we determine, in our sole discretion, that such username is inappropriate, obscene, or otherwise objectionable.

**4. Prohibited Activities**
You may not access or use the Site for any purpose other than that for which we make the Site available. The Site may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.

**5. Modifications to Service**
We reserve the right at any time to modify or discontinue, temporarily or permanently, the Service (or any part thereof) with or without notice. You agree that we shall not be liable to you or to any third party for any modification, suspension or discontinuance of the Service.`
  },
  {
    id: 'cookies',
    title: 'Cookie Policy',
    icon: <Cookie size={20} />,
    content: `**1. What Are Cookies**
As is common practice with almost all professional websites, this site uses cookies, which are tiny files that are downloaded to your computer, to improve your experience. This page describes what information they gather, how we use it and why we sometimes need to store these cookies.

**2. How We Use Cookies**
We use cookies for a variety of reasons detailed below. Unfortunately, in most cases, there are no industry standard options for disabling cookies without completely disabling the functionality and features they add to this site.

**3. The Cookies We Set**
- **Account related cookies**: If you create an account with us then we will use cookies for the management of the signup process and general administration.
- **Login related cookies**: We use cookies when you are logged in so that we can remember this fact. This prevents you from having to log in every single time you visit a new page.
- **Orders processing related cookies**: This site offers e-commerce or payment facilities and some cookies are essential to ensure that your order is remembered between pages so that we can process it properly.

**4. Third Party Cookies**
In some special cases we also use cookies provided by trusted third parties. This site uses Google Analytics which is one of the most widespread and trusted analytics solutions on the web for helping us to understand how you use the site and ways that we can improve your experience.`
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
