import { createContext, useContext, useState, useEffect } from 'react';
import { useApp } from './AppContext';

const CMSContext = createContext();

export function CMSProvider({ children }) {
  const [landingPageData, setLandingPageData] = useState(null);
  const [socialMediaData, setSocialMediaData] = useState(null);
  const [systemSettingsData, setSystemSettingsData] = useState(null);
  const [cmsLoading, setCmsLoading] = useState(true);
  const { customerSelectedStore } = useApp() || {};

  useEffect(() => {
    let unsubscribeLandingLegacy = () => {};
    let unsubscribeLandingNewStore = () => {};
    let unsubscribeLandingNewGlobal = () => {};
    let unsubscribeSocial = () => {};
    let unsubscribeSystem = () => {};

    setCmsLoading(true);

    import('../config/firebase').then(async ({ db }) => {
      if (!db) {
        setCmsLoading(false);
        return;
      }
      const { doc, onSnapshot } = await import('firebase/firestore');
      
      // 1. Subscribe to Legacy landingPage data as base for all other CMS sections
      unsubscribeLandingLegacy = onSnapshot(doc(db, 'cms', 'landingPage'), (docSnap) => {
        if (docSnap.exists()) {
          const legacyData = docSnap.data();
          setLandingPageData(prev => {
            return {
              ...legacyData,
              hero: prev?.hero || legacyData.hero
            };
          });
        }
      });

      // Helper function to update state with new hero banner data
      const applyHeroData = (heroDocData) => {
        if (heroDocData) {
          setLandingPageData(prev => ({
            ...prev,
            hero: {
              slides: [
                {
                  title: heroDocData.title || '',
                  subtitle: heroDocData.subtitle || '',
                  ctaText: heroDocData.ctaText || 'Shop Now',
                  ctaLink: '#categories',
                  mediaType: heroDocData.mediaType || 'image',
                  mediaUrl: heroDocData.mediaUrl || '',
                  isActive: heroDocData.isActive !== false,
                  sortOrder: heroDocData.sortOrder || 1
                }
              ]
            }
          }));
        }
      };

      // 2. Subscribe to store-specific/global landingCMS heroBanners
      const storeId = customerSelectedStore || 'global';
      
      unsubscribeLandingNewStore = onSnapshot(doc(db, 'landingCMS', storeId, 'sections', 'heroBanners'), (docSnap) => {
        if (docSnap.exists()) {
          unsubscribeLandingNewGlobal();
          applyHeroData(docSnap.data());
        } else if (storeId !== 'global') {
          // If store-specific does not exist, subscribe to global as fallback
          unsubscribeLandingNewGlobal = onSnapshot(doc(db, 'landingCMS', 'global', 'sections', 'heroBanners'), (globalSnap) => {
            if (globalSnap.exists()) {
              applyHeroData(globalSnap.data());
            } else {
              setLandingPageData(prev => ({
                ...prev,
                hero: prev?.hero || { slides: [] }
              }));
            }
          });
        }
      });

      unsubscribeSocial = onSnapshot(doc(db, 'cms', 'socialMedia'), (docSnap) => {
        if (docSnap.exists()) {
          setSocialMediaData(docSnap.data());
        }
      });

      unsubscribeSystem = onSnapshot(doc(db, 'cms', 'systemSettings'), (docSnap) => {
        if (docSnap.exists()) {
          setSystemSettingsData(docSnap.data());
        }
      });

      setCmsLoading(false);
    }).catch(err => {
      console.warn("CMS Firebase listener error:", err);
      setCmsLoading(false);
    });

    return () => {
      unsubscribeLandingLegacy();
      unsubscribeLandingNewStore();
      unsubscribeLandingNewGlobal();
      unsubscribeSocial();
      unsubscribeSystem();
    };
  }, [customerSelectedStore]);

  return (
    <CMSContext.Provider value={{ landingPageData, socialMediaData, systemSettingsData, cmsLoading }}>
      {children}
    </CMSContext.Provider>
  );
}

export const useCMS = () => useContext(CMSContext);
