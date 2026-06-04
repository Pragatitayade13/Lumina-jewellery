import { createContext, useContext, useState, useEffect } from 'react';

const CMSContext = createContext();

export function CMSProvider({ children }) {
  const [landingPageData, setLandingPageData] = useState(null);
  const [socialMediaData, setSocialMediaData] = useState(null);
  const [systemSettingsData, setSystemSettingsData] = useState(null);
  const [cmsLoading, setCmsLoading] = useState(true);

  useEffect(() => {
    let unsubscribeLanding = () => {};
    let unsubscribeSocial = () => {};
    let unsubscribeSystem = () => {};

    import('../config/firebase').then(async ({ db }) => {
      if (!db) {
        setCmsLoading(false);
        return;
      }
      const { doc, onSnapshot } = await import('firebase/firestore');
      
      unsubscribeLanding = onSnapshot(doc(db, 'cms', 'landingPage'), (docSnap) => {
        if (docSnap.exists()) {
          setLandingPageData(docSnap.data());
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
      unsubscribeLanding();
      unsubscribeSocial();
      unsubscribeSystem();
    };
  }, []);

  return (
    <CMSContext.Provider value={{ landingPageData, socialMediaData, systemSettingsData, cmsLoading }}>
      {children}
    </CMSContext.Provider>
  );
}

export const useCMS = () => useContext(CMSContext);
