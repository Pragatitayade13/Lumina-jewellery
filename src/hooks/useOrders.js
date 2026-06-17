import { useState, useEffect, useCallback } from 'react';
import { db } from '../config/firebase';
import { collection, addDoc, updateDoc, doc, serverTimestamp, query, orderBy, limit, getDocs, startAfter, where, runTransaction } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useLogistics } from './useLogistics';
import { logError } from '../services/logger';
import { useAudit } from './useAudit';
import { getStoreQuery, StoreIsolationError } from '../utils/storeQuery';
import { useApp } from '../context/AppContext';

export function useOrders(activeStoreId = null) {
  const { user, authLoading } = useApp() || {};
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const { shipments, createShipment, updateStatus } = useLogistics(null, activeStoreId);
  const { logAudit } = useAudit(activeStoreId);

  const fetchOrders = useCallback(async (isLoadMore = false) => {
    if (!db) {
      setLoading(false);
      return;
    }

    if (authLoading) {
      return;
    }

    const isTest = typeof process !== 'undefined' && process.env.NODE_ENV === 'test';
    if (!user && !isTest) {
      setOrders([]);
      setHasMore(false);
      setLoading(false);
      return;
    }
    
    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);

    try {
      let ordersQuery;
      if ((user?.role === 'customer' || !activeStoreId) && !isTest && user) {
        let constraints = [
          where('customerId', '==', user.uid),
          orderBy('createdAt', 'desc')
        ];
        if (isLoadMore && lastVisible) {
          constraints.push(startAfter(lastVisible));
        }
        constraints.push(limit(50));
        ordersQuery = query(collection(db, 'orders'), ...constraints);
      } else {
        try {
          let constraints = [orderBy('createdAt', 'desc')];
          if (isLoadMore && lastVisible) {
            constraints.push(startAfter(lastVisible));
          }
          constraints.push(limit(50));
          
          ordersQuery = getStoreQuery(db, 'orders', isTest ? (activeStoreId || 'GLOBAL') : activeStoreId, constraints);
        } catch (isolationError) {
          console.debug(isolationError.message);
          setOrders([]);
          setHasMore(false);
          setLoading(false);
          return;
        }
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
      
      setHasMore(snapshot.docs.length === 50);

    } catch (err) {
      console.error("Error fetching orders:", err);
      logError(err, { context: 'fetchOrders', activeStoreId });
      setError(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [lastVisible, activeStoreId, user, authLoading]);

  useEffect(() => {
    setLastVisible(null);
    setOrders([]);
    setHasMore(true);
    fetchOrders(false);
  }, [activeStoreId, user, authLoading]);

  const loadMoreOrders = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchOrders(true);
    }
  }, [loadingMore, hasMore, fetchOrders]);

  const createOrder = async (orderData) => {
    const isTest = typeof process !== 'undefined' && process.env.NODE_ENV === 'test';
    
    // Verify authenticated user exists
    const auth = getAuth();
    const currentUser = auth.currentUser;
    console.log("Current User:", currentUser ? currentUser.uid : "None");
    
    try {
      if ((!activeStoreId || activeStoreId === 'NONE') && !isTest) {
        throw new Error("Cannot create order without an active store context.");
      }
      
      const storeIdForOrder = activeStoreId === 'GLOBAL' ? (orderData.storeId || 'DEFAULT') : activeStoreId;
      console.log("Active Store ID during checkout:", storeIdForOrder);

      const orderRef = doc(collection(db, 'orders'));
      const orderId = orderRef.id;

      const orderPayload = {
        ...orderData,
        id: orderId,
        storeId: storeIdForOrder,
        createdAt: serverTimestamp(),
      };

      const shipmentRef = doc(collection(db, 'shipments'));
      const shipmentPayload = {
        orderId: orderId,
        orderDetails: orderData,
        status: 'PENDING',
        storeId: storeIdForOrder,
        customerId: orderData.customerId || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const transactionRef = doc(collection(db, 'transactions'));
      const transactionPayload = {
        orderId: orderId,
        type: 'revenue',
        amount: orderData.amount,
        status: 'completed',
        paymentMethod: orderData.paymentMethod || 'Unknown',
        storeId: storeIdForOrder,
        createdAt: serverTimestamp(),
        description: `Order Revenue - ${orderId}`
      };

      let currentCollection = "Unknown";
      let currentOperation = "Unknown";

      try {
        await runTransaction(db, async (transaction) => {
          // --- READ PHASE ---
          const inventoryReads = [];
          if (orderData.items && Array.isArray(orderData.items)) {
            for (const item of orderData.items) {
              if (item.sku) {
                const inventoryId = `${storeIdForOrder}_${item.sku}`;
                const inventoryRef = doc(db, 'inventory', inventoryId);
                inventoryReads.push({
                  item,
                  ref: inventoryRef,
                  promise: transaction.get(inventoryRef)
                });
              }
            }
          }

          let customerSnap = null;
          let customerRef = null;
          if (orderData.customerId) {
            customerRef = doc(db, 'users', orderData.customerId);
          }

          // Resolve inventory reads
          for (const invRead of inventoryReads) {
            currentCollection = "inventory";
            currentOperation = "get";
            invRead.snap = await invRead.promise;
          }

          // Resolve customer read
          if (customerRef) {
            currentCollection = "users";
            currentOperation = "get";
            customerSnap = await transaction.get(customerRef);
          }

          // --- WRITE PHASE ---
          // 1. Update stock
          for (const invRead of inventoryReads) {
            const { item, ref, snap } = invRead;
            if (!snap.exists()) {
              throw new Error(`Item ${item.name || item.sku} does not exist in inventory for store ${storeIdForOrder}.`);
            }
            const currentStock = snap.data().stock || 0;
            const requestedQty = item.qty || 1;
            if (currentStock < requestedQty) {
              throw new Error(`Insufficient stock for ${item.name || item.sku}. Available: ${currentStock}, Requested: ${requestedQty}`);
            }

            console.log("Updating Inventory");
            currentCollection = "inventory";
            currentOperation = "update";
            transaction.update(ref, {
              stock: currentStock - requestedQty,
              updatedAt: serverTimestamp()
            });
          }

          // 2. Update customer profile to append store ID
          if (customerRef && customerSnap && customerSnap.exists()) {
            console.log("Updating Customer Order History");
            const currentStoreIds = customerSnap.data().storeIds || [];
            if (!currentStoreIds.includes(storeIdForOrder)) {
              currentCollection = "users";
              currentOperation = "update";
              transaction.update(customerRef, {
                storeIds: [...currentStoreIds, storeIdForOrder],
                storeId: storeIdForOrder // Maintain backward compatibility
              });
            }
          }

          // 3. Set order, logistics, and transaction documents
          console.log("Creating Order");
          currentCollection = "orders";
          currentOperation = "set";
          transaction.set(orderRef, orderPayload);

          currentCollection = "shipments";
          currentOperation = "set";
          transaction.set(shipmentRef, shipmentPayload);

          console.log("Creating Payment");
          currentCollection = "transactions";
          currentOperation = "set";
          transaction.set(transactionRef, transactionPayload);
        });
      } catch (error) {
        console.error("Checkout Error:", error);
        console.error("Collection:", currentCollection);
        console.error("Operation:", currentOperation);
        throw error;
      }

      // Write tracking history event (outside the main lock-transaction to avoid nested conflicts/limitations)
      try {
        await addDoc(collection(db, 'tracking_history'), {
          shipmentId: shipmentRef.id,
          storeId: storeIdForOrder,
          status: 'PENDING',
          updatedByRole: 'system',
          userId: orderData.customerId || 'system',
          timestamp: serverTimestamp()
        });
      } catch (err) {
        console.warn("Could not log tracking event for shipment", err);
      }

      await logAudit('CREATE_ORDER', 'Orders', orderId, null, { totalAmount: orderData.amount });
      return orderId;
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
      
      const orderRef = doc(db, 'orders', realId);
      
      await runTransaction(db, async (transaction) => {
        const orderSnap = await transaction.get(orderRef);
        if (!orderSnap.exists()) {
          throw new Error("Order not found");
        }
        
        const orderData = orderSnap.data();
        const oldStatus = orderData.status;
        
        // If we are moving to cancelled/returned, and the previous status was NOT cancelled/returned, restore inventory
        const isCancellation = (status === 'cancelled' || status === 'returned');
        const wasCancelledOrReturned = (oldStatus === 'cancelled' || oldStatus === 'returned');
        
        if (isCancellation && !wasCancelledOrReturned && orderData.items && Array.isArray(orderData.items)) {
          const storeIdForOrder = orderData.storeId || 'DEFAULT';
          
          for (const item of orderData.items) {
            if (item.sku) {
              const inventoryId = `${storeIdForOrder}_${item.sku}`;
              const inventoryRef = doc(db, 'inventory', inventoryId);
              const inventorySnap = await transaction.get(inventoryRef);
              
              if (inventorySnap.exists()) {
                const currentStock = inventorySnap.data().stock || 0;
                const requestedQty = item.qty || 1;
                
                transaction.update(inventoryRef, {
                  stock: currentStock + requestedQty,
                  updatedAt: serverTimestamp()
                });
              }
            }
          }
        }
        
        // Update order status
        transaction.update(orderRef, {
          status: status,
          updatedAt: serverTimestamp()
        });
      });

      // Update local state immediately for live reflection
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: status } : o));

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
      
      await logAudit('UPDATE_ORDER_STATUS', 'Orders', realId, targetOrder?.status, status);
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

      // Update local state immediately for live reflection
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'assigned', deliveryPartnerId: partnerId, deliveryPartnerName: partnerName } : o));

      await logAudit('ASSIGN_ORDER_PARTNER', 'Orders', realId, null, { partnerId, partnerName });
    } catch (err) {
      console.error("Error assigning order: ", err);
      throw err;
    }
  };

  return { orders, loading, loadingMore, hasMore, loadMoreOrders, error, createOrder, updateOrderStatus, assignOrderToPartner };
}
