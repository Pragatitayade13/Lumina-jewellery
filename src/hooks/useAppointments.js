import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, query, where, onSnapshot, doc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { getStoreQuery } from '../utils/storeQuery';

export function useAppointments(userId = null, activeStoreId = null) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    let queryConstraints = [];
    if (userId) {
      queryConstraints.push(where('userId', '==', userId));
    }

    try {
      const q = getStoreQuery(db, 'appointments', activeStoreId, queryConstraints);
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Sort client-side for simplicity instead of requiring a composite index
        data.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        setAppointments(data);
        setLoading(false);
      }, (err) => {
        console.error("Error fetching appointments:", err);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.warn("Appointments listener error:", err);
      setLoading(false);
    }
  }, [userId, activeStoreId]);

  const addAppointment = async (data) => {
    if (!db) throw new Error("Firebase not initialized");
    return await addDoc(collection(db, 'appointments'), {
      ...data,
      ...(userId ? { userId } : {}),
      storeId: activeStoreId && activeStoreId !== 'GLOBAL' ? activeStoreId : 'DEFAULT',
      createdAt: serverTimestamp()
    });
  };

  const updateAppointment = async (id, data) => {
    if (!db) throw new Error("Firebase not initialized");
    const docRef = doc(db, 'appointments', id);
    return await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  };

  const deleteAppointment = async (id) => {
    if (!db) throw new Error("Firebase not initialized");
    const docRef = doc(db, 'appointments', id);
    return await deleteDoc(docRef);
  };

  return { appointments, loading, addAppointment, updateAppointment, deleteAppointment };
}
