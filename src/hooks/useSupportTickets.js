import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, addDoc, updateDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';

export function useSupportTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'support_tickets'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ticketsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Format timestamp for display safely
        date: doc.data().createdAt?.toDate().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) || 'Just now',
        sortTime: doc.data().createdAt?.toDate().getTime() || Date.now()
      }));
      setTickets(ticketsData);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching support tickets:", err);
      setError(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addTicket = async (ticketData) => {
    if (!db) throw new Error("Firebase not initialized");
    try {
      const docRef = await addDoc(collection(db, 'support_tickets'), {
        ...ticketData,
        status: 'open', // open, in_progress, resolved
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
