import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useCMS } from '../../context/CMSContext';
import FloatingParticles from './FloatingParticles';
import heroBg1 from '../../assets/hero_gold_promo_1779901152036.png';
import heroBg2 from '../../assets/hero_bridal_1779901185653.png';
import heroBg3 from '../../assets/hero_festive_1779901227607.png';
const localHeroVideo1 = '/whatsapp_video.mp4';
const localHeroVideo2 = '/hero_video_2.mp4';
import './Hero.css';

const defaultStats = [
  { valueKey: '25+', labelKey: 'hero.stats.yearsOfCraft' },
  { valueKey: '50K+', labelKey: 'hero.stats.happyCustomers' },
  { valueKey: '10K+', labelKey: 'hero.stats.uniqueDesigns' },
];

export default function Hero() {
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { t } = useTranslation();
  const { landingPageData } = useCMS();
  const cmsSlides = landingPageData?.hero?.slides;

  const currentStats = [
    { valueKey: landingPageData?.brandStory?.yearsOfExcellence || defaultStats[0].valueKey, labelKey: defaultStats[0].labelKey },
    { valueKey: landingPageData?.brandStory?.badges?.[3]?.label || defaultStats[1].valueKey, labelKey: defaultStats[1].labelKey },
    defaultStats[2]
  ];

  const defaultSlides = [
    {
      id: 1,
      badgeKey: 'hero.slide1.badge',
      titleKey: 'hero.slide1.title',
      titleAccentKey: 'hero.slide1.titleAccent',
      subtitleKey: 'hero.slide1.subtitle',
      bg: heroBg1,
      ctas: [
        { labelKey: 'hero.slide1.cta1', href: '#new-arrivals', primary: true },
        { labelKey: 'hero.slide1.cta2', href: '#categories', primary: false },
      ],
    },
    {
      id: 2,
      badgeKey: 'hero.slide2.badge',
      titleKey: 'hero.slide2.title',
      titleAccentKey: 'hero.slide2.titleAccent',
      subtitleKey: 'hero.slide2.subtitle',
      bg: heroBg2,
      ctas: [
        { labelKey: 'hero.slide2.cta1', href: '#categories', primary: true },
        { labelKey: 'hero.slide2.cta2', href: '#exclusive-offers', primary: false },
      ],
    },
    {
      id: 3,
      badgeKey: 'hero.slide3.badge',
      titleKey: 'hero.slide3.title',
      titleAccentKey: 'hero.slide3.titleAccent',
      subtitleKey: 'hero.slide3.subtitle',
      bg: heroBg3,
      ctas: [
        { labelKey: 'hero.slide3.cta1', href: '#exclusive-offers', primary: true },
        { labelKey: 'hero.slide3.cta2', href: '#new-arrivals', primary: false },
      ],
    },
  ];

  // Map CMS data if available, otherwise use defaults
  const hasCmsContent = cmsSlides && cmsSlides.some(s => s.title || s.subtitle || s.bgImage || s.mediaUrl);
  const slides = hasCmsContent ? cmsSlides.map((s, i) => ({
    id: i + 1,
    badgeKey: 'hero.slide1.badge', // Default badge
    title: s.title,
    titleAccent: '',
    subtitle: s.subtitle, 
    bg: s.bgImage || s.mediaUrl || defaultSlides[i]?.bg || heroBg1,
    mediaUrl: s.mediaUrl,
    mediaType: s.mediaType || 'image',
    isActive: s.isActive !== false,
    ctas: [
      { label: s.ctaText || 'Shop Now', href: s.ctaLink || '#categories', primary: true }
    ],
    isCms: true
  })) : [
    {
      id: 1,
      badgeKey: 'hero.slide1.badge',
      titleKey: 'hero.slide1.title',
      titleAccentKey: 'hero.slide1.titleAccent',
      subtitleKey: 'hero.slide1.subtitle',
      mediaType: 'video',
      mediaUrl: '',
      isActive: true,
      ctas: [
        { labelKey: 'hero.slide1.cta1', href: '#new-arrivals', primary: true },
        { labelKey: 'hero.slide1.cta2', href: '#categories', primary: false },
      ],
    }
  ];

  const activeSlides = slides.filter(s => s.isActive);
  console.log("Frontend Hero Component Active Slides:", activeSlides);

  // Auto-play slideshow transition
  const currentSlide = activeSlides[active];
  const isCurrentSlideVideo = currentSlide && (
    currentSlide.mediaType === 'video' ||
    (!currentSlide.mediaUrl && !currentSlide.bg)
  );

  useEffect(() => {
    if (activeSlides.length <= 1 || isPaused || isCurrentSlideVideo) return;
    const interval = setInterval(() => {
      setActive(prev => (prev + 1) % activeSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeSlides.length, isPaused, isCurrentSlideVideo]);

  const handleCTA = (href) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
      {activeSlides.map((slide, idx) => {
        let mediaSource = slide.mediaUrl;
        let isVideo = slide.mediaType === 'video';

        if (!mediaSource || mediaSource.startsWith('blob:')) {
          if (isVideo) {
            mediaSource = idx === 0 ? localHeroVideo2 : localHeroVideo1;
          } else if (slide.bg) {
            mediaSource = slide.bg;
          } else {
            mediaSource = idx === 0 ? localHeroVideo2 : localHeroVideo1;
            isVideo = true;
          }
        }

        return (
          <div key={slide.id || idx} className={`hero-slide ${idx === active ? 'active' : ''}`}>
            {isVideo ? (
              idx === active && (
                <video
                  autoPlay
                  muted
                  playsInline
                  onEnded={() => {
                    if (activeSlides.length > 1) {
                      setActive(prev => (prev + 1) % activeSlides.length);
                    }
                  }}
                  className={`hero-slide-bg ${idx === active ? 'zoom-in' : ''}`}
                  src={mediaSource}
                />
              )
            ) : (
              <img
                className={`hero-slide-bg ${idx === active ? 'zoom-in' : ''}`}
                src={mediaSource}
                alt="Hero Banner"
                onError={(e) => {
                  e.target.onerror = null; 
                  e.target.src = slide.bg || heroBg1;
                }}
              />
            )}
            <div className="hero-overlay" />
            
            {/* Content Overlay */}
            {!isVideo && (
              <div className="hero-content-wrap">
                <div className="hero-container">
                  <div className="hero-slide-content">
                    <div className="hero-badge">
                      <Sparkles size={14} />
                      <span>{t(slide.badgeKey || 'hero.slide1.badge')}</span>
                    </div>
                    {slide.titleKey ? (
                      <h1 className="hero-title">
                        {t(slide.titleKey)} <span>{t(slide.titleAccentKey)}</span>
                      </h1>
                    ) : (
                      <h1 className="hero-title">
                        {slide.title}
                      </h1>
                    )}
                    {slide.subtitleKey ? (
                      <p className="hero-subtitle">
                        {t(slide.subtitleKey)}
                      </p>
                    ) : (
                      <p className="hero-subtitle">
                        {slide.subtitle}
                      </p>
                    )}
                    <div className="hero-actions">
                      {slide.ctas && slide.ctas.map((cta, ctaIdx) => (
                        <button 
                          key={ctaIdx}
                          className={`btn ${cta.primary ? 'btn-gold' : 'btn-outline'}`} 
                          onClick={() => handleCTA(cta.href || '#new-arrivals')}
                          style={cta.primary ? { color: '#fff', fontWeight: 'bold' } : {}}
                        >
                          {cta.labelKey ? t(cta.labelKey) : cta.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <FloatingParticles count={40} />
          </div>
        );
      })}

      {activeSlides.length > 1 && (
        <>
          <button className="hero-arrow hero-arrow-prev" onClick={() => setActive(prev => (prev - 1 + activeSlides.length) % activeSlides.length)}>
            <ChevronLeft size={24} />
          </button>
          <button className="hero-arrow hero-arrow-next" onClick={() => setActive(prev => (prev + 1) % activeSlides.length)}>
            <ChevronRight size={24} />
          </button>
          <div className="hero-dots">
            {activeSlides.map((_, idx) => (
              <button
                key={idx}
                className={`hero-dot ${idx === active ? 'active' : ''}`}
                onClick={() => setActive(idx)}
              />
            ))}
          </div>
        </>
      )}

      <div className="hero-scroll-indicator">
        <span>{t('common.scrollDown')}</span>
        <div className="scroll-line" />
      </div>
    </section>
  );
}
