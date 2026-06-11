import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, doc, updateDoc, where, getDocs, deleteDoc, setDoc, serverTimestamp, query, documentId, onSnapshot } from 'firebase/firestore';
import { getStoreQuery, StoreIsolationError } from '../utils/storeQuery';

export function useCustomers(activeStoreId = null) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    const formatUserData = (id, data) => {
      const safeName = typeof data.name === 'string' ? data.name : String(data.name || 'Anonymous User');
      const formatTime = (ts) => {
        if (!ts) return '--';
        const date = typeof ts.toDate === 'function' ? ts.toDate() : new Date(ts);
        const today = new Date();
        if (
          date.getDate() !== today.getDate() ||
          date.getMonth() !== today.getMonth() ||
          date.getFullYear() !== today.getFullYear()
        ) return '--';
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      };
      return {
        id,
        name: safeName,
        email: data.email || 'No Email',
        phone: data.phone || 'No Phone',
        role: typeof data.role === 'string' ? data.role : 'customer',
        department: typeof data.department === 'string' ? data.department : 'Unassigned',
        status: data.status || 'active',
        loyaltyPoints: data.loyaltyPoints || 0,
        totalSpent: data.totalSpent || 0,
        totalOrders: data.totalOrders || 0,
        joinDate:
          data.createdAt && typeof data.createdAt.toDate === 'function'
            ? data.createdAt.toDate().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            : typeof data.createdAt === 'string'
            ? new Date(data.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            : 'Recently',
        lastCheckIn: formatTime(data.lastCheckIn),
        lastCheckOut: formatTime(data.lastCheckOut),
        schedule: data.schedule || null,
        avatarColor: ['#3498db', '#e74c3c', '#9b59b6', '#1abc9c', '#f1c40f'][safeName.charCodeAt(0) % 5],
        avatar: safeName.charAt(0).toUpperCase(),
        storeId: data.storeId || null,
      };
    };

    setLoading(true);

    if (!activeStoreId || activeStoreId === 'NONE') {
      setCustomers([]);
      setLoading(false);
      return;
    }

    let q;
    if (activeStoreId === 'GLOBAL') {
      q = query(collection(db, 'users'));
    } else {
      q = query(collection(db, 'users'), where('storeIds', 'array-contains', activeStoreId));
    }

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      // Backward compatibility fallback: if query on storeIds array yielded no profiles,
      // fallback to querying users directly assigned via storeId string field (legacy users)
      let docs = snapshot.docs;
      if (snapshot.empty && activeStoreId !== 'GLOBAL') {
        try {
          const fallbackQ = query(collection(db, 'users'), where('storeId', '==', activeStoreId));
          const fallbackSnap = await getDocs(fallbackQ);
          docs = fallbackSnap.docs;
        } catch (e) {
          console.warn("Fallback customer query failed:", e);
        }
      }

      const usersData = docs.map(doc => formatUserData(doc.id, doc.data()));
      setCustomers(usersData);
      setLoading(false);
    }, (err) => {
      console.error("Error listening to customers:", err);
      setError(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [activeStoreId]);

  const updateCustomerStatus = async (userId, newStatus) => {
    if (!db) throw new Error('Firebase not initialized');
    try {
      await updateDoc(doc(db, 'users', userId), { status: newStatus });
    } catch (err) {
      console.error('Error updating customer status:', err);
      throw err;
    }
  };

  const updateUserSchedule = async (userId, scheduleData) => {
    if (!db) throw new Error('Firebase not initialized');
    try {
      await updateDoc(doc(db, 'users', userId), { schedule: scheduleData });
    } catch (err) {
      console.error('Error updating schedule:', err);
      throw err;
    }
  };

  const updateUserPermissions = async (userId, data) => {
    if (!db) throw new Error('Firebase not initialized');
    try {
      await updateDoc(doc(db, 'users', userId), {
        name: data.name,
        role: data.role,
        department: data.department,
      });
    } catch (err) {
      console.error('Error updating user permissions:', err);
      throw err;
    }
  };

  const updateUserStores = async (userId, storeIds) => {
    if (!db) throw new Error('Firebase not initialized');
    try {
      const userStoresQ = query(collection(db, 'userStores'), where('userId', '==', userId));
      const userStoresDocs = await getDocs(userStoresQ);

      const existingAssignments = userStoresDocs.docs.map(d => ({ id: d.id, storeId: d.data().storeId }));
      const existingStoreIds = existingAssignments.map(a => a.storeId);

      const toAdd = storeIds.filter(id => !existingStoreIds.includes(id));
      const toRemove = existingAssignments.filter(a => !storeIds.includes(a.storeId));

      for (const assignment of toRemove) {
        await deleteDoc(doc(db, 'userStores', assignment.id));
      }
      for (const storeId of toAdd) {
        const docId = `${userId}_${storeId}`;
        await setDoc(doc(db, 'userStores', docId), {
          userId,
          storeId,
          assignedRole: 'staff',
          assignedAt: serverTimestamp(),
        });
      }
      // Synced directly to user document
      await updateDoc(doc(db, 'users', userId), {
        storeIds: storeIds,
        storeId: storeIds[0] || null // Maintain backward compatibility
      });
    } catch (err) {
      console.error('Error updating user stores:', err);
      throw err;
    }
  };

  return { customers, loading, error, updateCustomerStatus, updateUserSchedule, updateUserPermissions, updateUserStores };
}
