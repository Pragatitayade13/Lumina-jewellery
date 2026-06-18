// src/components/SocialGallery/SocialGallery.jsx
import { Heart } from 'lucide-react';
import './SocialGallery.css';
import { useCMS } from '../../context/CMSContext';

function IconInstagram({ size = 20, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="ig-grad-gallery" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#fdf497" />
          <stop offset="5%" stopColor="#fdf497" />
          <stop offset="45%" stopColor="#fd5949" />
          <stop offset="60%" stopColor="#d6249f" />
          <stop offset="90%" stopColor="#285AEB" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="url(#ig-grad-gallery)" />
      <path d="M12 7C9.24 7 7 9.24 7 12C7 14.76 9.24 17 12 17C14.76 17 17 14.76 17 12C17 9.24 14.76 7 12 7ZM12 15C10.35 15 9 13.65 9 12C9 10.35 10.35 9 12 9C13.65 9 15 10.35 15 12C15 13.65 13.65 15 12 15Z" fill="white" />
      <circle cx="17.5" cy="6.5" r="1.5" fill="white" />
      <path d="M17 2H7C4.24 2 2 4.24 2 7V17C2 19.76 4.24 22 7 22H17C19.76 22 22 19.76 22 17V7C22 4.24 19.76 2 17 2ZM20 17C20 18.65 18.65 20 17 20H7C5.35 20 4 18.65 4 17V7C4 5.35 5.35 4 7 4H17C18.65 4 20 5.35 20 7V17Z" fill="white" />
    </svg>
  );
}

function IconFacebook({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function IconYoutube({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.96-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
      <polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
    </svg>
  );
}

function IconTwitter({ size = 20, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
    </svg>
  );
}

// Using CSS gradient placeholders with product images as backgrounds
import p1 from '../../assets/product_1_1779901454806.png';
import p2 from '../../assets/product_2_1779901470655.png';
import p3 from '../../assets/product_3_1779901487427.png';
import instaPost4 from '../../assets/insta_post_4_new.png';
import p5 from '../../assets/product_5_1779901527769.png';
import catGold from '../../assets/category_gold_1779901256829.png';
import catDiamond from '../../assets/category_diamond_1779901278017.png';
import catBridal from '../../assets/category_bridal_1779901298512.png';
import catRings from '../../assets/category_rings_1779901339180.png';
import mensChain from '../../assets/mens_gold_chain_1780299165278.png';
import mensBand from '../../assets/mens_platinum_band_1780299148559.png';
import womensEarrings from '../../assets/category_earrings_1779901376432.png';
import newInstaPost from '../../assets/new_insta_post_1780552342806.png';
import instaPost1 from '../../assets/insta_post_1.jpg';
import instaPost2 from '../../assets/insta_post_2.jpg';
import instaPost5 from '../../assets/insta_post_5.png';
import instaPost6 from '../../assets/insta_post_6.png';
import instaPost7 from '../../assets/insta_post_7.png';
import instaPost8 from '../../assets/insta_post_8.png';
import instaPost9 from '../../assets/insta_post_9.png';
import instaPost10 from '../../assets/insta_post_10.png';
import instaPost11 from '../../assets/insta_post_11.png';
import instaPost12 from '../../assets/insta_post_12.png';
import instaPost13 from '../../assets/insta_post_13.png';
import instaPost14 from '../../assets/insta_post_14.jpg';
import instaPost15 from '../../assets/insta_post_15.jpg';

function IconPinterest({ size = 20, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.688 0 1.029-.653 2.568-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.163 0 7.398 2.967 7.398 6.923 0 4.136-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
    </svg>
  );
}

const galleryItems = [
  { id: 100, img: instaPost1, likes: 2150, tag: '#BridalSet', postUrl: 'https://www.instagram.com/p/DZJxY91je3Y/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==' },
  { id: 101, img: instaPost2, likes: 1840, tag: '#GoldElegance', postUrl: 'https://www.instagram.com/luminajewels2/p/DZJxI_djfpL/' },
  { id: 99, img: newInstaPost, likes: 3420, tag: '#LuminaRings', postUrl: 'https://www.instagram.com/p/DZJxlsZjd1K/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==' },
  { id: 13, img: instaPost4, likes: 8520, tag: '#GoldBangle', postUrl: 'https://www.instagram.com/p/DZJwGoYjcm3/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==', platform: 'instagram' },
  { id: 102, img: instaPost5, likes: 1250, tag: '#NecklaceSet', postUrl: 'https://www.instagram.com/luminajewels2/p/DZJ3UcIDecN/' },
  { id: 103, img: instaPost6, likes: 1780, tag: '#Jhumkas', postUrl: 'https://www.instagram.com/luminajewels2/p/DZJw1y7jbtE/' },
  { id: 104, img: instaPost7, likes: 2950, tag: '#DiamondRings', postUrl: 'https://www.instagram.com/luminajewels2/p/DZJwsfKDVn1/' },
  { id: 105, img: instaPost8, likes: 3100, tag: '#GoldChoker', postUrl: 'https://www.instagram.com/luminajewels2/p/DZJwmWEDWRs/' },
  { id: 106, img: instaPost9, likes: 1650, tag: '#GoldEarrings', postUrl: 'https://www.instagram.com/luminajewels2/p/DZJwfyiDaG-/' },
  { id: 107, img: instaPost10, likes: 2430, tag: '#DiamondPendant', postUrl: 'https://www.instagram.com/luminajewels2/p/DZJwVYODcS1/' },
  { id: 108, img: instaPost11, likes: 1980, tag: '#PlatinumBand', postUrl: 'https://www.instagram.com/luminajewels2/p/DZJwPQajVos/' },
  { id: 109, img: instaPost12, likes: 4500, tag: '#BridalJewelry', postUrl: 'https://www.instagram.com/luminajewels2/p/DZJv_aJDS8h/' },
  { id: 110, img: instaPost13, likes: 2850, tag: '#DiamondSet', postUrl: 'https://www.instagram.com/luminajewels2/p/DZJv3HHDZNO/' },
  { id: 111, img: instaPost14, likes: 3200, tag: '#RoseGoldSet', postUrl: 'https://www.instagram.com/luminajewels2/p/DZJ74uQjfRx/' },
  { id: 112, img: instaPost15, likes: 3600, tag: '#SilverJewelry', postUrl: 'https://www.instagram.com/luminajewels2/p/DZJ7_UnDZJj/' }
];

const socialLinks = [
  { icon: <IconInstagram size={20} />, label: 'Instagram', handle: '@luminajewels2', color: '#E1306C', href: 'https://www.instagram.com/luminajewels2/' },
  { icon: <IconFacebook size={20} />, label: 'Facebook', handle: '@luminajewels', color: '#4267B2', href: 'https://facebook.com/luminajewels' },
  { icon: <IconPinterest size={20} />, label: 'Pinterest', handle: '@luminajewels', color: '#E60023', href: 'https://pinterest.com/luminajewels' },
  { icon: <IconYoutube size={20} />, label: 'YouTube', handle: 'Lumina Jewels TV', color: '#FF0000', href: 'https://youtu.be/bWR1t-l1Bf8?si=b9LJZdf23ZiA8TIn' },
  { icon: <IconTwitter size={20} />, label: 'Twitter', handle: '@luminajewels', color: '#1DA1F2', href: 'https://twitter.com/luminajewels' },
];

export default function SocialGallery() {
  const { socialMediaData } = useCMS();
  const posts = galleryItems;

  const activeLinks = socialLinks.map(s => {
    const pKey = s.label.toLowerCase();
    const platData = socialMediaData?.platforms?.[pKey];
    
    let customHandle = s.handle;
    if (platData?.handle) {
      customHandle = platData.handle.startsWith('@') ? platData.handle : `@${platData.handle}`;
    } else if (platData && platData.url) {
      try {
        const urlObj = new URL(platData.url);
        const pathSegments = urlObj.pathname.split('/').filter(Boolean);
        if (pathSegments.length > 0) {
          customHandle = '@' + pathSegments[pathSegments.length - 1];
        }
      } catch (e) {
        // Fallback if URL is invalid
      }
    }

    const defaultEnabled = ['instagram', 'facebook', 'whatsapp'].includes(pKey);
    const isEnabled = platData?.enabled !== undefined ? platData.enabled : defaultEnabled;

    return {
      ...s,
      enabled: isEnabled,
      href: platData?.url || s.href,
      handle: customHandle
    };
  }).filter(s => s.enabled);

  return (
    <section className="social-section" id="social-gallery">
      <div className="container">
        <div className="section-header reveal">
          <span className="section-label">Follow Us</span>
          <h2 className="section-title">@LuminaJewels2</h2>
          <div className="gold-divider" />
          <p className="section-subtitle">
            Join our community and be the first to know about new collections, styling tips, and exclusive offers. Share your Lumina moments with <strong style={{ color: 'var(--gold)' }}>#LuminaJewels</strong>
          </p>
        </div>

        {/* Instagram Grid */}
        <div className="social-grid reveal">
          {posts.map((item, i) => (
            <a
              key={item.id}
              href={item.postUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="social-item cursor-pointer"
              id={`social-item-${item.id}`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <img 
                src={item.image || item.img} 
                alt={item.tag || item.title} 
                className="social-img" 
                loading="lazy"
                onError={(e) => { e.target.onerror = null; e.target.src = p1; }}
              />
              <div className="social-overlay">

                <div className="social-insta-icon-link">
                  {item.platform === 'pinterest' 
                    ? <IconPinterest size={28} className="social-insta-icon" /> 
                    : <IconInstagram size={28} className="social-insta-icon" />}
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Social Platforms */}
        <div className="social-platforms reveal">
          <p className="social-platforms-label">Follow us on</p>
          <div className="social-links">
            {activeLinks.map((s, i) => (
              <a
                key={i}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link-card"
                id={`social-link-${s.label.toLowerCase()}`}
                style={{ '--platform-color': s.color }}
                aria-label={`Follow us on ${s.label}`}
              >
                <div className="social-link-icon">{s.icon}</div>
                <div>
                  <div className="social-link-label">{s.label}</div>
                  <div className="social-link-handle">{s.handle}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
