import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, onSnapshot, addDoc, query, serverTimestamp, where } from 'firebase/firestore';

export function useReviews(productId) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db || !productId) {
      setLoading(false);
      return;
    }
    
    const q = query(collection(db, 'product_reviews'), where('productId', '==', productId));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      docs.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
      setReviews(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [productId]);

  const addReview = async (reviewData) => {
    try {
      await addDoc(collection(db, 'product_reviews'), {
        ...reviewData,
        productId,
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
