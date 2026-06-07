import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, query, orderBy, getDocs, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

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

export function useLogistics(deliveryPartnerId = null) {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }
    
    let shipmentsQuery;
    if (deliveryPartnerId) {
      // Securely filter assigned tasks
      shipmentsQuery = query(collection(db, 'shipments'), where('assignedTo', '==', deliveryPartnerId), orderBy('createdAt', 'desc'));
    } else {
      shipmentsQuery = query(collection(db, 'shipments'), orderBy('createdAt', 'desc'));
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
  }, []);

  const logTrackingEvent = async (shipmentId, status, role, userId = 'system', locationData = null) => {
    await addDoc(collection(db, 'tracking_history'), {
      shipmentId,
      status,
      updatedByRole: role,
      userId,
      locationData,
      timestamp: serverTimestamp()
    });

    // Real Notification via API
    try {
      const auth = getAuth();
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : '';
      await fetch('/api/send-order-alert', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          shipmentId,
          status,
          customerEmail: 'customer@example.com', // Replace with dynamic email if available
          customerName: 'Customer',
          otp: locationData?.otp // Pass OTP if it exists in locationData for this event
        })
      });
      console.log(`[IN-APP NOTIFICATION] System: Shipment ${shipmentId.slice(0,8)} moved to ${status}. Email API triggered.`);
    } catch (e) {
      console.error('Failed to trigger email notification API', e);
    }
  };

  const createShipment = async (orderId, orderDetails) => {
    try {
      const docRef = await addDoc(collection(db, 'shipments'), {
        orderId,
        orderDetails,
        status: LOGISTICS_STATES.PENDING,
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
        assignedPartnerId: partnerId,
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

  return { shipments, loading, createShipment, updateStatus, assignPartner, getTrackingHistory, verifyDeliveryOTP };
}
