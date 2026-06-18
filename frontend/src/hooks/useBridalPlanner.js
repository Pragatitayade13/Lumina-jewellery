import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';

export function useBridalPlanner(userId) {
  const [planner, setPlanner] = useState({ budget: 1500000, items: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db || !userId) {
      setLoading(false);
      return;
    }

    const docRef = doc(db, 'bridal_planners', userId);
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setPlanner(docSnap.data());
      } else {
        // Initialize with default items if it doesn't exist
        const defaultData = {
          budget: 1500000,
          items: [
            { id: 1, category: 'Necklace Set', name: 'Pending Selection', estimatedCost: 0 },
            { id: 2, category: 'Bangles', name: 'Pending Selection', estimatedCost: 0 },
            { id: 3, category: 'Maang Tikka', name: 'Pending Selection', estimatedCost: 0 },
            { id: 4, category: 'Rings', name: 'Pending Selection', estimatedCost: 0 }
          ]
        };
        setDoc(docRef, defaultData);
        setPlanner(defaultData);
      }
      setLoading(false);
    }, (err) => {
      console.error("Error fetching bridal planner:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const updateBudget = async (newBudget) => {
    if (!db || !userId) return;
    const docRef = doc(db, 'bridal_planners', userId);
    await updateDoc(docRef, { budget: newBudget });
  };

  const addItem = async (newItem) => {
    if (!db || !userId) return;
    const docRef = doc(db, 'bridal_planners', userId);
    const updatedItems = [...planner.items, { id: Date.now(), ...newItem }];
    await updateDoc(docRef, { items: updatedItems });
  };

  const removeItem = async (itemId) => {
    if (!db || !userId) return;
    const docRef = doc(db, 'bridal_planners', userId);
    const updatedItems = planner.items.filter(item => item.id !== itemId);
    await updateDoc(docRef, { items: updatedItems });
  };

  return { planner, loading, updateBudget, addItem, removeItem };
}
