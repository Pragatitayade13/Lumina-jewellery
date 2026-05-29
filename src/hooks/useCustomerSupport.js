import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, onSnapshot, addDoc, query, orderBy, serverTimestamp, where } from 'firebase/firestore';

export function useCustomerSupport(userId) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db || !userId) {
      setLoading(false);
      return;
    }
    
    // In a real app we might orderBy createdAt, but that requires an index.
    // For simplicity, we filter by customerId.
    const q = query(collection(db, 'support_tickets'), where('customerId', '==', userId));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort by date manually if index is absent
      docs.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
      setTickets(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const createTicket = async (ticketData) => {
    try {
      await addDoc(collection(db, 'support_tickets'), {
        ...ticketData,
        customerId: userId,
        status: 'open',
        createdAt: serverTimestamp(),
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      });
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return { tickets, loading, createTicket };
}
