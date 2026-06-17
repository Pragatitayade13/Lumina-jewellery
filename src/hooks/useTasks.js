import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, query, where, onSnapshot, doc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { getStoreQuery } from '../utils/storeQuery';

export function useTasks(userId = null, activeStoreId = null) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    let queryConstraints = [];
    if (userId) {
      queryConstraints.push(where('assigneeId', '==', userId));
    }

    try {
      // Get the scoped query based on the active store if applicable
      const q = getStoreQuery(db, 'tasks', activeStoreId, queryConstraints);
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Sort by createdAt descending (newest tasks first)
        data.sort((a, b) => {
          const aTime = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt || 0).getTime();
          const bTime = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt || 0).getTime();
          return bTime - aTime;
        });
        
        setTasks(data);
        setLoading(false);
      }, (err) => {
        console.error("Error fetching tasks:", err);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.warn("Tasks listener error:", err);
      setLoading(false);
    }
  }, [userId, activeStoreId]);

  const addTask = async (taskData) => {
    if (!db) throw new Error("Firebase not initialized");
    return await addDoc(collection(db, 'tasks'), {
      ...taskData,
      status: taskData.status || 'Pending',
      storeId: activeStoreId && activeStoreId !== 'GLOBAL' ? activeStoreId : 'GLOBAL',
      createdAt: serverTimestamp()
    });
  };

  const updateTaskStatus = async (id, status) => {
    if (!db) throw new Error("Firebase not initialized");
    const docRef = doc(db, 'tasks', id);
    return await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp()
    });
  };

  const deleteTask = async (id) => {
    if (!db) throw new Error("Firebase not initialized");
    const docRef = doc(db, 'tasks', id);
    return await deleteDoc(docRef);
  };

  return { tasks, loading, addTask, updateTaskStatus, deleteTask };
}
