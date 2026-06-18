import { collection, addDoc, serverTimestamp, writeBatch, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { orders, transactions, supportTickets } from '../admin/data/mockData';

export const seedOrders = async () => {
  if (!db) throw new Error("Firebase not initialized");
  const batch = writeBatch(db);
  
  orders.forEach((order) => {
    // Generate a new document reference
    const docRef = doc(collection(db, 'orders'));
    batch.set(docRef, {
      ...order,
      createdAt: serverTimestamp(),
      _seeded: true
    });
  });

  await batch.commit();
  return orders.length;
};

export const seedTransactions = async () => {
  if (!db) throw new Error("Firebase not initialized");
  const batch = writeBatch(db);
  
  transactions.forEach((txn) => {
    const docRef = doc(collection(db, 'transactions'));
    batch.set(docRef, {
      ...txn,
      createdAt: serverTimestamp(),
      _seeded: true
    });
  });

  await batch.commit();
  return transactions.length;
};

export const seedSupportTickets = async () => {
  if (!db) throw new Error("Firebase not initialized");
  const batch = writeBatch(db);
  
  supportTickets.forEach((ticket) => {
    const docRef = doc(collection(db, 'supportTickets'));
    batch.set(docRef, {
      ...ticket,
      createdAt: serverTimestamp(),
      _seeded: true
    });
  });

  await batch.commit();
  return supportTickets.length;
};
