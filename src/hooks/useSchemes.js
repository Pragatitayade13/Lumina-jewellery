import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, onSnapshot, query, where, addDoc, updateDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { getStoreQuery } from '../utils/storeQuery';

export function useSchemes(userId, activeStoreId = null) {
  const [adminSchemes, setAdminSchemes] = useState([]);
  const [userSchemes, setUserSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch available plans — include global schemes + store-specific ones
  useEffect(() => {
    if (!db) return;
    // Always load all admin_schemes; filtering for store-specific is done by storeId field presence
    const unsubAdmin = onSnapshot(collection(db, 'admin_schemes'), (snapshot) => {
      let plans = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // If store context is active, show global schemes + this store's schemes
      if (activeStoreId && activeStoreId !== 'GLOBAL') {
        plans = plans.filter(p => !p.storeId || p.storeId === activeStoreId || p.storeId === 'DEFAULT');
      }

      // Seed default schemes if empty for demo purposes
      if (plans.length === 0) {
        const defaultSchemes = [
          { name: 'Golden Harvest', installment: 10000, durationMonths: 11, benefits: ['Zero Making Charges'] },
          { name: 'Diamond Savings', installment: 25000, durationMonths: 11, benefits: ['Free Insured Delivery'], isPopular: true }
        ];
        defaultSchemes.forEach(s => addDoc(collection(db, 'admin_schemes'), s));
        plans = defaultSchemes;
      }

      setAdminSchemes(plans);
    });

    return () => unsubAdmin();
  }, [activeStoreId]);

  // 2. Fetch enrolled schemes for specific customer
  useEffect(() => {
    if (!db || !userId) {
      setLoading(false);
      return;
    }
    try {
      const q = getStoreQuery(db, 'user_schemes', activeStoreId, [where('customerId', '==', userId)]);
      const unsubUser = onSnapshot(q, (snapshot) => {
        const active = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUserSchemes(active);
        setLoading(false);
      });

      return () => unsubUser();
    } catch (err) {
      console.warn("User schemes listener error:", err);
      setLoading(false);
    }
  }, [userId]);

  // 3. Enroll in a Scheme
  const enrollInScheme = async (plan) => {
    try {
      const schemeId = '#SCH-' + Math.floor(1000 + Math.random() * 9000);
      await addDoc(collection(db, 'user_schemes'), {
        schemeId,
        customerId: userId,
        planName: plan.name,
        installment: plan.installment,
        durationMonths: plan.durationMonths,
        monthsPaid: 0,
        storeId: activeStoreId && activeStoreId !== 'GLOBAL' ? activeStoreId : 'DEFAULT',
        startDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        status: 'active',
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  // 4. Pay Next Installment
  const payInstallment = async (userSchemeId, currentMonthsPaid, durationMonths) => {
    try {
      const newMonths = currentMonthsPaid + 1;
      let newStatus = 'active';
      if (newMonths >= durationMonths) {
        newStatus = 'matured';
      }
      
      await updateDoc(doc(db, 'user_schemes', userSchemeId), {
        monthsPaid: newMonths,
        status: newStatus,
        lastPaymentDate: serverTimestamp()
      });
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return { adminSchemes, userSchemes, loading, enrollInScheme, payInstallment };
}
