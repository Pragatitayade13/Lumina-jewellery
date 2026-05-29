import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, onSnapshot, query, where, addDoc, updateDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore';

export function useSchemes(userId) {
  const [adminSchemes, setAdminSchemes] = useState([]);
  const [userSchemes, setUserSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch available plans set by Admin
  useEffect(() => {
    if (!db) return;
    const unsubAdmin = onSnapshot(collection(db, 'admin_schemes'), (snapshot) => {
      let plans = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
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
  }, []);

  // 2. Fetch enrolled schemes for specific customer
  useEffect(() => {
    if (!db || !userId) {
      setLoading(false);
      return;
    }
    const q = query(collection(db, 'user_schemes'), where('customerId', '==', userId));
    const unsubUser = onSnapshot(q, (snapshot) => {
      const active = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUserSchemes(active);
      setLoading(false);
    });

    return () => unsubUser();
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
