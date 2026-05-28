import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';

export function useOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }
    
    // Order by createdAt descending
    const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(ordersData);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching orders:", err);
      // Fallback if index is missing (Firestore requires an index for ordering sometimes, 
      // though simple createdAt desc usually works if it's the only field).
      // If error occurs due to missing index, we could fallback to un-ordered.
      setError(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const createOrder = async (orderData) => {
    try {
      const docRef = await addDoc(collection(db, 'orders'), {
        ...orderData,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (err) {
      console.error("Error creating order: ", err);
      throw err;
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      await updateDoc(doc(db, 'orders', id), {
        status: status,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Error updating order: ", err);
      throw err;
    }
  };

  return { orders, loading, error, createOrder, updateOrderStatus };
}
