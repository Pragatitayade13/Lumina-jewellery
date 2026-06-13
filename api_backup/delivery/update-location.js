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
    console.error('Firebase Admin init error in update-location API:', error);
  }
}

const db = admin.firestore();

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { orderId, storeId, latitude, longitude, speed, deviceInfo } = req.body;
  if (!orderId || !storeId || latitude === undefined || longitude === undefined) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    const uid = req.user.uid;

    // Save tracking checkpoint
    const trackingRef = db.collection('delivery_tracking').doc();
    await trackingRef.set({
      orderId,
      partnerId: uid,
      storeId,
      latitude,
      longitude,
      speed: speed || 0,
      deviceInfo: deviceInfo || 'Unknown Device',
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    // Also update the active order's latest coordinates
    await db.collection('orders').doc(orderId).update({
      latestLocation: {
        latitude,
        longitude,
        speed: speed || 0,
        timestamp: new Date().toISOString()
      }
    });

    return res.status(200).json({ success: true, message: 'Location updated successfully' });

  } catch (error) {
    console.error('Update location API failed:', error);
    return res.status(500).json({ error: error.message });
  }
}

export default withAuth(withRateLimit(handler, 100, 60000)); // Higher limit for frequent tracking pings
