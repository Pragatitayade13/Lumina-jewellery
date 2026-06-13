import admin from 'firebase-admin';
import { withAuth, withRateLimit } from '../middleware/security.js';

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY
          ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
          : undefined,
      }),
    });
  } catch (error) {
    console.error('Firebase Admin init error in start-delivery API:', error);
  }
}

const db = admin.firestore();

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { orderId, storeId } = req.body;
  if (!orderId || !storeId) {
    return res.status(400).json({ error: 'Missing parameters: orderId and storeId are required' });
  }

  try {
    const uid = req.user.uid;
    const name = req.user.name || req.user.email || 'Delivery Partner';

    // Verify user store access
    const mappingSnap = await db.collection('userStores')
      .where('userId', '==', uid)
      .where('storeId', '==', storeId)
      .get();
      
    if (mappingSnap.empty && req.user.role !== 'superadmin') {
      const mappingSnapAlt = await db.collection('delivery_partner_store_mapping')
        .where('partnerId', '==', uid)
        .where('storeId', '==', storeId)
        .get();

      if (mappingSnapAlt.empty) {
        return res.status(403).json({ error: 'Forbidden: Access denied to this store context' });
      }
    }

    // Generate 6-digit OTP and set expiry (5 minutes)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60000).toISOString();

    const orderRef = db.collection('orders').doc(orderId);
    
    await db.runTransaction(async (transaction) => {
      const orderDoc = await transaction.get(orderRef);
      if (!orderDoc.exists) throw new Error('Order not found');
      
      const orderData = orderDoc.data();
      if (orderData.storeId !== storeId) {
        throw new Error('Store ID mismatch: Order does not belong to requested store');
      }

      transaction.update(orderRef, {
        status: 'in_transit',
        deliveryPartnerId: uid,
        deliveryPartnerName: name,
        otp: otp,
        otpExpiry: otpExpiry,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Update associated shipment if any
      const shipmentsSnap = await db.collection('shipments').where('orderId', '==', orderId).get();
      shipmentsSnap.forEach(sDoc => {
        transaction.update(sDoc.ref, {
          status: 'IN_TRANSIT',
          assignedTo: uid,
          assignedPartnerName: name,
          otp: otp,
          otpExpiry: otpExpiry,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      });
    });

    // Log tracking history
    await db.collection('tracking_history').add({
      orderId,
      storeId,
      status: 'IN_TRANSIT',
      updatedByRole: 'delivery',
      userId: uid,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    return res.status(200).json({
      success: true,
      message: 'Delivery started successfully',
      otp: otp // Returning in response for development/demo ease
    });

  } catch (error) {
    console.error('Start delivery API failed:', error);
    return res.status(500).json({ error: error.message });
  }
}

export default withAuth(withRateLimit(handler, 30, 60000));
