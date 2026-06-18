import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, query, where, orderBy, onSnapshot, doc, addDoc, updateDoc, deleteDoc, serverTimestamp, writeBatch } from 'firebase/firestore';

export function useMedia(activeStoreId = null) {
  const [media, setMedia] = useState({
    banners: [],
    cms: {},
    products: [],
    promos: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    const currentStoreId = activeStoreId || 'DEFAULT';
    
    // Fetch all active media documents for the matching store context ordered by position
    const q = query(
      collection(db, 'media'),
      where('storeId', '==', currentStoreId),
      where('isActive', '==', true),
      orderBy('position', 'asc')
    );

    setLoading(true);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const grouped = {
        banners: [],
        cms: {},
        products: [],
        promos: []
      };

      snapshot.docs.forEach((doc) => {
        const item = { id: doc.id, ...doc.data() };
        if (item.type === 'banner') {
          grouped.banners.push(item);
        } else if (item.type === 'promo') {
          grouped.promos.push(item);
        } else if (item.type === 'product') {
          grouped.products.push(item);
        } else if (item.type === 'cms') {
          if (item.referenceId) {
            grouped.cms[item.referenceId] = item;
          }
        }
      });

      setMedia(grouped);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching store media:", err);
      setError(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [activeStoreId]);

  // Admin Methods (Only executable by Super Admins/Authorized roles)
  const addMediaItem = async (mediaItem) => {
    if (!db) throw new Error("Firebase not initialized");
    try {
      const storeIdForMedia = activeStoreId || 'DEFAULT';
      const docRef = await addDoc(collection(db, 'media'), {
        ...mediaItem,
        storeId: storeIdForMedia,
        isActive: mediaItem.isActive ?? true,
        position: mediaItem.position ?? 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (err) {
      console.error("Error creating media item:", err);
      throw err;
    }
  };

  const updateMediaItem = async (id, updateData) => {
    if (!db) throw new Error("Firebase not initialized");
    try {
      await updateDoc(doc(db, 'media', id), {
        ...updateData,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Error updating media item:", err);
      throw err;
    }
  };

  const deleteMediaItem = async (id) => {
    if (!db) throw new Error("Firebase not initialized");
    try {
      await deleteDoc(doc(db, 'media', id));
    } catch (err) {
      console.error("Error deleting media item:", err);
      throw err;
    }
  };

  const reorderMediaItems = async (itemsList) => {
    if (!db) throw new Error("Firebase not initialized");
    try {
      const batch = writeBatch(db);
      itemsList.forEach((item, index) => {
        const docRef = doc(db, 'media', item.id);
        batch.update(docRef, {
          position: index,
          updatedAt: serverTimestamp()
        });
      });
      await batch.commit();
    } catch (err) {
      console.error("Error reordering media:", err);
      throw err;
    }
  };

  return {
    media,
    loading,
    error,
    addMediaItem,
    updateMediaItem,
    deleteMediaItem,
    reorderMediaItems
  };
}
