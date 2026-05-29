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

    const q = query(collection(db, 'users'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const customersData = [];
      snapshot.docs.forEach(doc => {
        try {
          const data = doc.data();
          const safeName = typeof data.name === 'string' ? data.name : String(data.name || 'Anonymous User');
          customersData.push({
            id: doc.id,
            name: safeName,
            email: data.email || 'No Email',
            phone: data.phone || 'No Phone',
            role: typeof data.role === 'string' ? data.role : 'customer',
            department: typeof data.department === 'string' ? data.department : 'Unassigned',
            status: data.status || 'active', // active, vip, inactive
            loyaltyPoints: data.loyaltyPoints || 0,
            totalSpent: data.totalSpent || 0,
            totalOrders: data.totalOrders || 0,
            joinDate: data.createdAt && typeof data.createdAt.toDate === 'function' ? data.createdAt.toDate().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : (typeof data.createdAt === 'string' ? new Date(data.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recently'),
            avatarColor: ['#3498db', '#e74c3c', '#9b59b6', '#1abc9c', '#f1c40f'][Math.floor(Math.random() * 5)],
            avatar: safeName.charAt(0).toUpperCase()
          });
        } catch (e) {
          console.error("Error processing document:", doc.id, e);
        }
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
