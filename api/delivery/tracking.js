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
    console.error('Firebase Admin init error in tracking API:', error);
  }
}

const db = admin.firestore();

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { orderId } = req.query;
  if (!orderId) {
    return res.status(400).json({ error: 'Missing orderId query parameter' });
  }

  try {
    // Fetch tracking logs for this order sorted by timestamp
    const snapshot = await db.collection('delivery_tracking')
      .where('orderId', '==', orderId)
      .orderBy('timestamp', 'desc')
      .limit(10)
      .get();

    const logs = [];
    snapshot.forEach(doc => {
      logs.push({ id: doc.id, ...doc.data() });
    });

    // Get active order details
    const orderDoc = await db.collection('orders').doc(orderId).get();
    if (!orderDoc.exists) {
      return res.status(404).json({ error: 'Order not found' });
    }
    const orderData = orderDoc.data();

    return res.status(200).json({
      success: true,
      latestCheckpoint: logs[0] || null,
      checkpoints: logs,
      orderDetails: {
        orderNumber: orderData.id,
        status: orderData.status,
        deliveryPartnerName: orderData.deliveryPartnerName || 'Awaiting Assignment',
        deliveryPartnerId: orderData.deliveryPartnerId || null
      }
    });

  } catch (error) {
    console.error('Tracking API failed:', error);
    return res.status(500).json({ error: error.message });
  }
}

export default withAuth(withRateLimit(handler, 40, 60000));
