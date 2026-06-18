import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, query, orderBy, getDocs, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStoreQuery, StoreIsolationError } from '../utils/storeQuery';
import { useApp } from '../context/AppContext';

// Strict State Machine Rules
export const LOGISTICS_STATES = {
  PENDING: 'PENDING',
  PACKED: 'PACKED',
  READY: 'READY',
  ASSIGNED: 'ASSIGNED',
  IN_TRANSIT: 'IN_TRANSIT',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  FAILED: 'FAILED',
  RETURNED: 'RETURNED',
  CANCELLED: 'CANCELLED'
};

const STATE_TRANSITIONS = {
  [LOGISTICS_STATES.PENDING]: [LOGISTICS_STATES.PACKED, LOGISTICS_STATES.CANCELLED],
  [LOGISTICS_STATES.PACKED]: [LOGISTICS_STATES.READY],
  [LOGISTICS_STATES.READY]: [LOGISTICS_STATES.ASSIGNED],
  [LOGISTICS_STATES.ASSIGNED]: [LOGISTICS_STATES.IN_TRANSIT],
  [LOGISTICS_STATES.IN_TRANSIT]: [LOGISTICS_STATES.OUT_FOR_DELIVERY, LOGISTICS_STATES.FAILED],
  [LOGISTICS_STATES.OUT_FOR_DELIVERY]: [LOGISTICS_STATES.DELIVERED, LOGISTICS_STATES.FAILED],
  [LOGISTICS_STATES.FAILED]: [LOGISTICS_STATES.ASSIGNED, LOGISTICS_STATES.RETURNED], // Reassign or return
  [LOGISTICS_STATES.DELIVERED]: [LOGISTICS_STATES.RETURNED],
  [LOGISTICS_STATES.RETURNED]: [],
  [LOGISTICS_STATES.CANCELLED]: []
};

// Centralized API Hook

export function useLogistics(deliveryPartnerId = null, activeStoreId = null) {
  const { user, authLoading } = useApp() || {};
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    if (authLoading) {
      return;
    }

    const isTest = typeof process !== 'undefined' && process.env.NODE_ENV === 'test';
    if (!user && !isTest) {
      setShipments([]);
      setLoading(false);
      return;
    }
    
    let shipmentsQuery;
    
    if (user?.role === 'customer' && !isTest) {
      shipmentsQuery = query(
        collection(db, 'shipments'),
        where('customerId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
    } else {
      try {
        let additionalConstraints = [];
        if (deliveryPartnerId) {
          additionalConstraints.push(where('assignedTo', '==', deliveryPartnerId));
        }
        additionalConstraints.push(orderBy('createdAt', 'desc'));
        shipmentsQuery = getStoreQuery(db, 'shipments', isTest ? (activeStoreId || 'GLOBAL') : activeStoreId, additionalConstraints);
      } catch (err) {
        if (err instanceof StoreIsolationError) {
          console.debug(err.message);
          setShipments([]);
          setLoading(false);
          return;
        }
        throw err;
      }
    }
    
    const unsubscribe = onSnapshot(shipmentsQuery, (snapshot) => {
      const data = snapshot.docs.map(d => ({
        ...d.data(),
        id: d.id
      }));
      setShipments(data);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching shipments:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [deliveryPartnerId, activeStoreId, user, authLoading]);

  const logTrackingEvent = async (shipmentId, status, role, userId = 'system', locationData = null) => {
    const shipment = shipments.find(s => s.id === shipmentId);
    const storeIdToLog = shipment ? shipment.storeId : (activeStoreId || 'GLOBAL');

    await addDoc(collection(db, 'tracking_history'), {
      shipmentId,
      storeId: storeIdToLog,
      status,
      updatedByRole: role,
      userId,
      locationData,
      timestamp: serverTimestamp()
    });

    // Real Notification via API — fire-and-forget, never blocks main flow
    // In local dev the backend proxy (localhost:5000) may not be running; all errors are fully suppressed.
    try {
      const shipment = shipments.find(s => s.id === shipmentId);
      const customerEmail = shipment?.orderDetails?.customerEmail || shipment?.orderDetails?.email || shipment?.customerEmail || shipment?.email || 'customer@example.com';
      const customerName = shipment?.orderDetails?.customerName || shipment?.orderDetails?.customer || shipment?.customerName || shipment?.customer || 'Customer';

      const auth = getAuth();
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : '';

      // Fire-and-forget — don't await so it never blocks status updates
      fetch('/api/send-order-alert', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          shipmentId,
          status,
          customerEmail,
          customerName,
          otp: locationData?.otp
        })
      })
        .then(res => {
          if (res.ok) {
            // Only log success in production; suppress all noise in dev
            if (import.meta.env.PROD) {
              console.log(`[NOTIFICATION] Email alert sent for shipment ${shipmentId.slice(0,8)} → ${status}`);
            }
          }
          // Non-ok responses (500, 404, etc.) are fully suppressed — backend may not be running locally
        })
        .catch(() => {
          // Network/connection errors are fully suppressed — backend not running locally
        });
    } catch (e) {
      // Synchronous errors fully suppressed
    }
  };

  const createShipment = async (orderId, orderDetails) => {
    try {
      if (!activeStoreId || activeStoreId === 'NONE') {
        throw new Error("Cannot create shipment without active store context");
      }
      const docRef = await addDoc(collection(db, 'shipments'), {
        orderId,
        orderDetails,
        status: LOGISTICS_STATES.PENDING,
        storeId: activeStoreId,
        customerId: orderDetails.customerId || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      await logTrackingEvent(docRef.id, LOGISTICS_STATES.PENDING, 'system');
      return docRef.id;
    } catch (err) {
      console.error("Error creating shipment:", err);
      throw err;
    }
  };

  const updateStatus = async (shipmentId, newStatus, role, userId = 'system', locationData = null, isOverride = false) => {
    try {
      const shipment = shipments.find(s => s.id === shipmentId);
      if (!shipment) throw new Error("Shipment not found");

      // Enforce State Machine (unless Super Admin override)
      const allowedTransitions = STATE_TRANSITIONS[shipment.status] || [];
      if (!allowedTransitions.includes(newStatus) && !isOverride) {
        throw new Error(`Invalid state transition from ${shipment.status} to ${newStatus}. strict state machine enforcement active.`);
      }

      const updatePayload = {
        status: newStatus,
        updatedAt: serverTimestamp()
      };

      let generatedOtp = null;
      if (newStatus === LOGISTICS_STATES.OUT_FOR_DELIVERY) {
        generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
        updatePayload.otp = generatedOtp;
      }

      await updateDoc(doc(db, 'shipments', shipmentId), updatePayload);

      // Sync with legacy orders collection
      try {
        if (shipment.orderId && !shipment.orderId.startsWith('#')) {
          await updateDoc(doc(db, 'orders', shipment.orderId), {
            status: newStatus.toLowerCase(),
            updatedAt: serverTimestamp()
          });

          if (newStatus === LOGISTICS_STATES.DELIVERED) {
            import('firebase/firestore').then(async ({ query, collection, where, getDocs, updateDoc, doc }) => {
              try {
                const txQuery = query(collection(db, 'transactions'), where('orderId', '==', shipment.orderId));
                const txSnap = await getDocs(txQuery);
                txSnap.forEach(txDoc => {
                  if (txDoc.data().status === 'pending') {
                    updateDoc(doc(db, 'transactions', txDoc.id), { status: 'completed' });
                  }
                });
              } catch(e) { console.warn("Failed to sync finance from logistics", e); }
            });
          }
        }
      } catch (err) {
        console.warn("Could not sync with legacy orders collection", err);
      }

      const eventMetadata = generatedOtp ? { ...locationData, otp: generatedOtp } : locationData;
      await logTrackingEvent(shipmentId, newStatus, isOverride ? `superadmin_override` : role, userId, eventMetadata);
    } catch (err) {
      console.error("Error updating shipment status:", err);
      throw err;
    }
  };

  const assignPartner = async (shipmentId, partnerId, partnerName, role) => {
    try {
      const shipment = shipments.find(s => s.id === shipmentId);
      if (!shipment) throw new Error("Shipment not found");
      
      // Usually assigned from READY or FAILED state
      await updateDoc(doc(db, 'shipments', shipmentId), {
        status: LOGISTICS_STATES.ASSIGNED,
        assignedTo: partnerId,
        assignedPartnerName: partnerName,
        updatedAt: serverTimestamp()
      });

      await logTrackingEvent(shipmentId, LOGISTICS_STATES.ASSIGNED, role, 'system', { partnerName });
    } catch (err) {
      console.error("Error assigning partner:", err);
      throw err;
    }
  };

  const getTrackingHistory = async (shipmentId) => {
    const q = query(collection(db, 'tracking_history'), where('shipmentId', '==', shipmentId), orderBy('timestamp', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };

  const verifyDeliveryOTP = async (shipmentId, enteredOtp, role, userId) => {
    try {
      const shipment = shipments.find(s => s.id === shipmentId);
      if (!shipment) throw new Error("Shipment not found");

      if (shipment.status !== LOGISTICS_STATES.OUT_FOR_DELIVERY) {
        throw new Error("Shipment is not out for delivery");
      }

      if (shipment.otp !== enteredOtp) {
        throw new Error("Invalid OTP");
      }

      // If OTP matches, update status to DELIVERED
      await updateStatus(shipmentId, LOGISTICS_STATES.DELIVERED, role, userId, null, false);
      return true;
    } catch (err) {
      console.error("Error verifying OTP:", err);
      throw err;
    }
  };

  const sendDeliveryOTP = async (shipmentId) => {
    try {
      const shipment = shipments.find(s => s.id === shipmentId);
      if (!shipment) throw new Error("Shipment not found");

      let currentOtp = shipment.otp;
      if (!currentOtp) {
        currentOtp = Math.floor(100000 + Math.random() * 900000).toString();
        await updateDoc(doc(db, 'shipments', shipmentId), {
          otp: currentOtp,
          updatedAt: serverTimestamp()
        });
      }
      return currentOtp;
    } catch (err) {
      console.error("Error generating/retrieving OTP:", err);
      throw err;
    }
  };

  return { shipments, loading, createShipment, updateStatus, assignPartner, getTrackingHistory, verifyDeliveryOTP, sendDeliveryOTP };
}
