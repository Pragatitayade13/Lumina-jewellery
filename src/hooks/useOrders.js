import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { useLogistics } from './useLogistics';

export function useOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { shipments, createShipment, updateStatus } = useLogistics();

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }
    
    // Order by createdAt descending
    const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: data.id || doc.id, // Preserve custom ID for UI display
          firebaseId: doc.id     // Keep actual document ID for database updates
        };
      });
      setOrders(ordersData);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching orders:", err);
      // Fallback if index is missing (Firestore requires an index for ordering sometimes, 
      // though simple createdAt desc usually works if it's the only field).
      // If error occurs due to missing index, we could fallback to un-ordered.
      setError(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const createOrder = async (orderData) => {
    try {
      const docRef = await addDoc(collection(db, 'orders'), {
        ...orderData,
        createdAt: serverTimestamp(),
      });
      // Shadow write to Centralized Logistics Engine
      await createShipment(docRef.id, orderData);
      return docRef.id;
    } catch (err) {
      console.error("Error creating order: ", err);
      throw err;
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      // Find the actual Firebase document ID if the provided ID is a display ID
      const targetOrder = orders.find(o => o.id === id);
      const realId = targetOrder?.firebaseId || id;
      
      await updateDoc(doc(db, 'orders', realId), {
        status: status,
        updatedAt: serverTimestamp()
      });

      // Shadow write to Logistics Engine
      const linkedShipment = shipments.find(s => s.orderId === id);
      if (linkedShipment) {
        // Map simple order statuses to strict LOGISTICS_STATES
        let logStatus = status.toUpperCase();
        if (logStatus === 'SHIPPED' || logStatus === 'IN-TRANSIT') logStatus = 'IN_TRANSIT';
        if (logStatus === 'PROCESSING') logStatus = 'PENDING';
        if (logStatus === 'READY_FOR_DISPATCH') logStatus = 'READY';
        
        await updateStatus(linkedShipment.id, logStatus, 'admin', 'system', null, true); // true = override flag
      }
    } catch (err) {
      console.error("Error updating order: ", err);
      throw err;
    }
  };

  const assignOrderToPartner = async (id, partnerId, partnerName) => {
    try {
      // Find the actual Firebase document ID if the provided ID is a display ID
      const targetOrder = orders.find(o => o.id === id);
      const realId = targetOrder?.firebaseId || id;

      await updateDoc(doc(db, 'orders', realId), {
        status: 'assigned',
        deliveryPartnerId: partnerId,
        deliveryPartnerName: partnerName,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Error assigning order: ", err);
      throw err;
    }
  };

  return { orders, loading, error, createOrder, updateOrderStatus, assignOrderToPartner };
}
