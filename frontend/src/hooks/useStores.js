import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, query, onSnapshot, doc, updateDoc, addDoc, setDoc, serverTimestamp, deleteDoc, getDocs, where } from 'firebase/firestore';

export function useStores() {
  const [stores, setStores] = useState([]);
  const [userStores, setUserStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    const storesQuery = query(collection(db, 'stores'));
    
    const unsubscribeStores = onSnapshot(storesQuery, (snapshot) => {
      const storesData = [];
      snapshot.docs.forEach(doc => {
        try {
          const data = doc.data();
          storesData.push({
            id: doc.id,
            ...data
          });
        } catch (e) {
          console.error("Error processing store document:", doc.id, e);
        }
      });
      setStores(storesData);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching stores:", err);
      setError(err);
      setLoading(false);
    });

    const userStoresQuery = query(collection(db, 'userStores'));
    const unsubscribeUserStores = onSnapshot(userStoresQuery, (snapshot) => {
      const userStoresData = [];
      snapshot.docs.forEach(doc => {
        try {
          const data = doc.data();
          userStoresData.push({
            id: doc.id,
            ...data
          });
        } catch (e) {
          console.error("Error processing userStore document:", doc.id, e);
        }
      });
      setUserStores(userStoresData);
    }, (err) => {
      console.error("Error fetching user stores:", err);
    });

    return () => {
      unsubscribeStores();
      unsubscribeUserStores();
    };
  }, []);

  const addStore = async (storeData) => {
    if (!db) throw new Error("Firebase not initialized");
    try {
      await addDoc(collection(db, 'stores'), {
        ...storeData,
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Error adding store:", err);
      throw err;
    }
  };

  const updateStore = async (storeId, storeData) => {
    if (!db) throw new Error("Firebase not initialized");
    try {
      const docRef = doc(db, 'stores', storeId);
      await updateDoc(docRef, { 
        ...storeData,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Error updating store:", err);
      throw err;
    }
  };

  const toggleStoreStatus = async (storeId, currentStatus) => {
    if (!db) throw new Error("Firebase not initialized");
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const docRef = doc(db, 'stores', storeId);
      await updateDoc(docRef, { 
        status: newStatus,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Error toggling store status:", err);
      throw err;
    }
  };

  const assignUserToStore = async (userId, storeId, role) => {
    if (!db) throw new Error("Firebase not initialized");
    try {
      const docId = `${userId}_${storeId}`;
      const docRef = doc(db, 'userStores', docId);
      await setDoc(docRef, {
        userId,
        storeId,
        assignedRole: role,
        assignedAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Error assigning user to store:", err);
      throw err;
    }
  };

  const removeUserFromStore = async (userStoreId) => {
    if (!db) throw new Error("Firebase not initialized");
    try {
      const docRef = doc(db, 'userStores', userStoreId);
      await deleteDoc(docRef);
    } catch (err) {
      console.error("Error removing user from store:", err);
      throw err;
    }
  };

  return { 
    stores, 
    userStores,
    loading, 
    error, 
    addStore, 
    updateStore, 
    toggleStoreStatus,
    assignUserToStore,
    removeUserFromStore
  };
}
