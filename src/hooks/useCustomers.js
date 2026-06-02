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
          
          const formatTime = (ts) => {
            if (!ts) return '--';
            const date = typeof ts.toDate === 'function' ? ts.toDate() : new Date(ts);
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
          };
          
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
            lastCheckIn: formatTime(data.lastCheckIn),
            lastCheckOut: formatTime(data.lastCheckOut),
            schedule: data.schedule || null,
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

  const updateUserSchedule = async (userId, scheduleData) => {
    if (!db) throw new Error("Firebase not initialized");
    try {
      const docRef = doc(db, 'users', userId);
      await updateDoc(docRef, { schedule: scheduleData });
    } catch (err) {
      console.error("Error updating schedule:", err);
      throw err;
    }
  };

  const updateUserPermissions = async (userId, data) => {
    if (!db) throw new Error("Firebase not initialized");
    try {
      const docRef = doc(db, 'users', userId);
      await updateDoc(docRef, { 
        name: data.name,
        role: data.role,
        department: data.department
      });
    } catch (err) {
      console.error("Error updating user permissions:", err);
      throw err;
    }
  };

  return { customers, loading, error, updateCustomerStatus, updateUserSchedule, updateUserPermissions };
}
