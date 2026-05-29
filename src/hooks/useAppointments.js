import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, query, where, onSnapshot, doc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

export function useAppointments(userId) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db || !userId) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'appointments'), where('userId', '==', userId));
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
  }, [userId]);

  const addAppointment = async (data) => {
    if (!db) throw new Error("Firebase not initialized");
    return await addDoc(collection(db, 'appointments'), {
      ...data,
      userId,
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
