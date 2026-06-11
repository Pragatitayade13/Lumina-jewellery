import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, onSnapshot, addDoc, query, serverTimestamp, where } from 'firebase/firestore';
import { getStoreQuery } from '../utils/storeQuery';

export function useReviews(productId = null, activeStoreId = null) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }
    
    let queryConstraints = [];
    if (productId) {
      queryConstraints.push(where('productId', '==', productId));
    }

    try {
      const q = getStoreQuery(db, 'product_reviews', activeStoreId, queryConstraints);
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        docs.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
        setReviews(docs);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.warn("Reviews listener error:", err);
      setLoading(false);
    }
  }, [productId, activeStoreId]);

  const addReview = async (reviewData) => {
    try {
      await addDoc(collection(db, 'product_reviews'), {
        ...reviewData,
        ...(productId ? { productId } : {}),
        storeId: activeStoreId && activeStoreId !== 'GLOBAL' ? activeStoreId : 'DEFAULT',
        createdAt: serverTimestamp(),
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      });
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return { reviews, loading, addReview };
}
