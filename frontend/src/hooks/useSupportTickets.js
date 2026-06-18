import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, addDoc, updateDoc, doc, onSnapshot, query, orderBy, serverTimestamp, where } from 'firebase/firestore';
import { getStoreQuery } from '../utils/storeQuery';

export function useSupportTickets(activeStoreId = null) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    if (!activeStoreId || activeStoreId === 'NONE') {
      setTickets([]);
      setLoading(false);
      return;
    }

    try {
      const q = getStoreQuery(db, 'support_tickets', activeStoreId);
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const ticketsData = [];
        snapshot.docs.forEach(doc => {
          try {
            const data = doc.data();
            ticketsData.push({
              firebaseId: doc.id, // The actual Firebase document ID
              id: data.id || doc.id, // Fallback to doc.id if no display ID
              ...data,
              date: data.createdAt && typeof data.createdAt.toDate === 'function' ? data.createdAt.toDate().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : (typeof data.createdAt === 'string' ? new Date(data.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recently'),
              sortTime: data.createdAt && typeof data.createdAt.toDate === 'function' ? data.createdAt.toDate().getTime() : (typeof data.createdAt === 'string' ? new Date(data.createdAt).getTime() : Date.now())
            });
          } catch (e) {
            console.error("Error processing ticket:", doc.id, e);
          }
        });
        // Sort manually since we removed orderBy
        ticketsData.sort((a, b) => b.sortTime - a.sortTime);
        setTickets(ticketsData);
        setLoading(false);
      }, (err) => {
        console.error("Error fetching support tickets:", err);
        setError(err);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.warn("Support tickets listener error:", err);
      setError(err);
      setLoading(false);
    }
  }, [activeStoreId]);

  const addTicket = async (ticketData) => {
    if (!db) throw new Error("Firebase not initialized");
    try {
      const docRef = await addDoc(collection(db, 'support_tickets'), {
        ...ticketData,
        status: 'open', // open, in_progress, resolved
        storeId: activeStoreId && activeStoreId !== 'GLOBAL' ? activeStoreId : 'DEFAULT',
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (err) {
      console.error("Error adding ticket:", err);
      throw err;
    }
  };

  const updateTicket = async (ticketId, updateData) => {
    if (!db) throw new Error("Firebase not initialized");
    try {
      // ticketId here should be the firebaseId
      const docRef = doc(db, 'support_tickets', ticketId);
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Error updating ticket:", err);
      throw err;
    }
  };

  return { tickets, loading, error, addTicket, updateTicket };
}
