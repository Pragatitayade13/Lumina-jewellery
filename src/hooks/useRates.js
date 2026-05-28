import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

export function useRates() {
  const [rates, setRates] = useState({
    gold24k: 7250,
    gold22k: 6650,
    gold18k: 5440,
    silver: 85,
    diamond: 195000
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }
    const docRef = doc(db, 'settings', 'rates');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setRates(prev => ({ ...prev, ...docSnap.data() }));
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateRates = async (newRates) => {
    if (!db) return;
    await setDoc(doc(db, 'settings', 'rates'), newRates, { merge: true });
  };

  return { rates, loading, updateRates };
}
