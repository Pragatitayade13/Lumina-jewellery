import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useCMS } from '../../context/CMSContext';
import FloatingParticles from './FloatingParticles';
import heroBg1 from '../../assets/hero_gold_promo_1779901152036.png';
import heroBg2 from '../../assets/hero_bridal_1779901185653.png';
import heroBg3 from '../../assets/hero_festive_1779901227607.png';
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
  const hasCmsContent = cmsSlides && cmsSlides.some(s => s.title || s.subtitle || s.bgImage);
  const slides = hasCmsContent ? cmsSlides.map((s, i) => ({
    id: i + 1,
    badgeKey: 'hero.slide1.badge', // Default badge
    title: s.title,
    titleAccent: '',
    subtitle: s.subtitle, 
    bg: s.bgImage || defaultSlides[i]?.bg || heroBg1,
    ctas: [
      { label: s.ctaText || 'Shop Now', href: s.ctaLink || '#categories', primary: true }
    ],
    isCms: true
  })) : defaultSlides;




  const heroVideos = [
    "/hero_video_1.mp4",
    "/hero_video_2.mp4"
  ];

  const next = useCallback(() => setActive(p => (p + 1) % heroVideos.length), [heroVideos.length]);
  const prev = useCallback(() => setActive(p => (p - 1 + heroVideos.length) % heroVideos.length), [heroVideos.length]);

  const handleCTA = (href) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 800], ['0%', '30%']);
  const contentY = useTransform(scrollY, [0, 800], ['0%', '40%']);
  const contentOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <section className="hero" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
      {/* Background Slides */}
      <AnimatePresence initial={false}>
        <motion.div 
          key={`video-${active}`}
          className="hero-slide active"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          <video
            autoPlay
            muted
            playsInline
            preload="metadata"
            onEnded={next}
            className="hero-slide-bg"
            src={heroVideos[active]}
          />
          <div className="hero-overlay" />
          <FloatingParticles count={40} />
        </motion.div>
      </AnimatePresence>


      <div className="hero-scroll-indicator">
        <span>{t('common.scrollDown')}</span>
        <div className="scroll-line" />
      </div>
    </section>
  );
}
