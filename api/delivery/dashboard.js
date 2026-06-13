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
    console.error('Firebase Admin init error in dashboard API:', error);
  }
}

const db = admin.firestore();

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { storeId } = req.query;
  if (!storeId) {
    return res.status(400).json({ error: 'Missing storeId query parameter' });
  }

  try {
    const uid = req.user.uid;
    const role = req.user.role || 'customer';

    // Validate User Access to the Store
    if (role !== 'superadmin') {
      const mappingSnap = await db.collection('userStores')
        .where('userId', '==', uid)
        .where('storeId', '==', storeId)
        .get();
        
      if (mappingSnap.empty) {
        const mappingSnapAlt = await db.collection('delivery_partner_store_mapping')
          .where('partnerId', '==', uid)
          .where('storeId', '==', storeId)
          .get();

        if (mappingSnapAlt.empty) {
          return res.status(403).json({ error: 'Forbidden: Access denied to this store' });
        }
      }
    }

    // Query orders for this store
    const ordersSnap = await db.collection('orders')
      .where('storeId', '==', storeId)
      .get();

    let todayCount = 0;
    let pendingCount = 0;
    let deliveredCount = 0;
    let failedCount = 0;
    let inTransitCount = 0;
    let returnPickupCount = 0;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    ordersSnap.forEach(doc => {
      const data = doc.data();
      const status = data.status || '';
      
      const isPartnerOrder = role === 'superadmin' || data.deliveryPartnerId === uid;
      if (!isPartnerOrder) return;

      // Filter by time for "Today's Deliveries"
      const createdAt = data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt)) : null;
      if (createdAt && createdAt >= startOfToday) {
        todayCount++;
      }

      if (['assigned', 'packed'].includes(status)) {
        pendingCount++;
      } else if (status === 'delivered') {
        deliveredCount++;
      } else if (['failed', 'cancelled'].includes(status)) {
        failedCount++;
      } else if (['in_transit', 'out_for_delivery'].includes(status)) {
        inTransitCount++;
      } else if (['returned', 'return_requested'].includes(status)) {
        returnPickupCount++;
      }
    });

    return res.status(200).json({
      success: true,
      stats: {
        todaysDeliveries: todayCount,
        pendingDeliveries: pendingCount,
        deliveredOrders: deliveredCount,
        failedDeliveries: failedCount,
        liveOrdersInTransit: inTransitCount,
        returnPickups: returnPickupCount,
        exchangeDeliveries: 0, // Mocked for exchange scope
        customerAwaitingVerification: pendingCount
      }
    });

  } catch (error) {
    console.error('Dashboard API failed:', error);
    return res.status(500).json({ error: error.message });
  }
}

export default withAuth(withRateLimit(handler, 30, 60000));
