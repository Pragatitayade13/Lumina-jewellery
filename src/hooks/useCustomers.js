import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, query, onSnapshot, doc, updateDoc, orderBy } from 'firebase/firestore';

export function useCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const customersData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || 'Anonymous User',
          email: data.email || 'No Email',
          phone: data.phone || 'No Phone',
          role: data.role || 'customer',
          status: data.status || 'active', // active, vip, inactive
          loyaltyPoints: data.loyaltyPoints || 0,
          totalSpent: data.totalSpent || 0,
          totalOrders: data.totalOrders || 0,
          joinDate: data.createdAt?.toDate().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) || 'Recently',
          avatarColor: ['#3498db', '#e74c3c', '#9b59b6', '#1abc9c', '#f1c40f'][Math.floor(Math.random() * 5)],
          avatar: (data.name || 'U').charAt(0).toUpperCase()
        };
      });
      setCustomers(customersData);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching customers:", err);
      setError(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateCustomerStatus = async (userId, newStatus) => {
    if (!db) throw new Error("Firebase not initialized");
    try {
      const docRef = doc(db, 'users', userId);
      await updateDoc(docRef, { status: newStatus });
    } catch (err) {
      console.error("Error updating customer status:", err);
      throw err;
    }
  };

  return { customers, loading, error, updateCustomerStatus };
}
