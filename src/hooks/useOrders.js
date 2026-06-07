import { useState, useEffect, useCallback } from 'react';
import { db } from '../config/firebase';
import { collection, addDoc, updateDoc, doc, serverTimestamp, query, orderBy, limit, getDocs, startAfter } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useLogistics } from './useLogistics';
import { logAudit } from '../services/logger';

export function useOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const { shipments, createShipment, updateStatus } = useLogistics();

  const fetchOrders = useCallback(async (isLoadMore = false) => {
    if (!db) {
      setLoading(false);
      return;
    }
    
    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);

    try {
      let ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(20));
      
      if (isLoadMore && lastVisible) {
        ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), startAfter(lastVisible), limit(20));
      }

      const snapshot = await getDocs(ordersQuery);
      
      if (snapshot.empty) {
        setHasMore(false);
        setLoading(false);
        setLoadingMore(false);
        return;
      }

      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      
      const ordersData = snapshot.docs.map(document => {
        const data = document.data();
        return {
          ...data,
          id: data.id || document.id,
          firebaseId: document.id
        };
      });

      if (isLoadMore) {
        setOrders(prev => {
          const newOrders = ordersData.filter(newO => !prev.find(o => o.firebaseId === newO.firebaseId));
          return [...prev, ...newOrders];
        });
      } else {
        setOrders(ordersData);
      }
      
      setHasMore(snapshot.docs.length === 20);

    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [lastVisible]);

  useEffect(() => {
    fetchOrders(false);
  }, []);

  const loadMoreOrders = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchOrders(true);
    }
  }, [loadingMore, hasMore, fetchOrders]);

  const createOrder = async (orderData) => {
    try {
      const docRef = await addDoc(collection(db, 'orders'), {
        ...orderData,
        createdAt: serverTimestamp(),
      });
      // Shadow write to Centralized Logistics Engine
      await createShipment(docRef.id, orderData);
      const auth = getAuth();
      await logAudit('CREATE_ORDER', docRef.id, { totalAmount: orderData.amount }, auth.currentUser);
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
      
      const auth = getAuth();
      await logAudit('UPDATE_ORDER_STATUS', realId, { oldStatus: targetOrder?.status, newStatus: status }, auth.currentUser);
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

      const auth = getAuth();
      await logAudit('ASSIGN_ORDER_PARTNER', realId, { partnerId, partnerName }, auth.currentUser);
    } catch (err) {
      console.error("Error assigning order: ", err);
      throw err;
    }
  };

  return { orders, loading, loadingMore, hasMore, loadMoreOrders, error, createOrder, updateOrderStatus, assignOrderToPartner };
}
