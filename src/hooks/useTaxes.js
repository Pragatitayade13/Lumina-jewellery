import { useState, useEffect } from 'react';
import { doc, getDoc, onSnapshot, setDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const DEFAULT_TAX_SETTINGS = {
  gold: 3,
  silver: 3,
  diamond: 3,
  platinum: 3,
  making: 5,
  services: 18,
  storeOriginState: 'Maharashtra'
};

export function useTaxes() {
  const [taxSettings, setTaxSettings] = useState(DEFAULT_TAX_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }
    
    const docRef = doc(db, 'cms', 'taxSettings');
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setTaxSettings({ ...DEFAULT_TAX_SETTINGS, ...docSnap.data() });
      } else {
        // Initialize default settings if missing
        setDoc(docRef, DEFAULT_TAX_SETTINGS).catch(console.error);
        setTaxSettings(DEFAULT_TAX_SETTINGS);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching tax settings:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateTaxSettings = async (newSettings, user) => {
    if (!db) return false;
    try {
      const docRef = doc(db, 'cms', 'taxSettings');
      await setDoc(docRef, newSettings, { merge: true });
      
      // Audit log
      if (user) {
        await addDoc(collection(db, 'tax_audit_logs'), {
          action: 'UPDATE_TAX_BRACKETS',
          updatedBy: user.email || user.uid,
          updatedAt: serverTimestamp(),
          changes: newSettings
        });
      }
      return true;
    } catch (e) {
      console.error("Error updating tax settings:", e);
      return false;
    }
  };

  /**
   * Calculates GST breakdown (CGST, SGST, IGST) based on category and destination state.
   * @param {number} baseAmount - Pre-tax amount
   * @param {string} category - e.g., 'gold', 'diamond', 'making'
   * @param {string} destinationState - The shipping/billing state
   * @returns {Object} { totalGst, cgst, sgst, igst, rate, type }
   */
  const calculateTax = (baseAmount, category, destinationState) => {
    const rate = taxSettings[category.toLowerCase()] || 3; // default 3% fallback
    const totalGst = (baseAmount * rate) / 100;
    
    const originState = taxSettings.storeOriginState || 'Maharashtra';
    
    const isInterstate = destinationState && destinationState.toLowerCase() !== originState.toLowerCase();
    
    if (isInterstate) {
      return { 
        total: totalGst, 
        cgst: 0, 
        sgst: 0, 
        igst: totalGst, 
        rate, 
        type: 'IGST' 
      };
    } else {
      return { 
        total: totalGst, 
        cgst: totalGst / 2, 
        sgst: totalGst / 2, 
        igst: 0, 
        rate, 
        type: 'CGST+SGST' 
      };
    }
  };

  return { taxSettings, loading, updateTaxSettings, calculateTax };
}
