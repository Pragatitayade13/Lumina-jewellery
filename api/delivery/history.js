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
    console.error('Firebase Admin init error in history API:', error);
  }
}

const db = admin.firestore();

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { storeId } = req.query;
  if (!storeId) {
    return res.status(400).json({ error: 'Missing storeId parameter' });
  }

  try {
    const uid = req.user.uid;
    const role = req.user.role || 'customer';

    // Verify store context permission
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

    // Query historical delivered orders for this store assigned to the user
    const snapshot = await db.collection('orders')
      .where('storeId', '==', storeId)
      .where('deliveryPartnerId', '==', uid)
      .where('status', '==', 'delivered')
      .get();

    const history = [];
    snapshot.forEach(doc => {
      history.push({ id: doc.id, ...doc.data() });
    });

    return res.status(200).json({ success: true, history });

  } catch (error) {
    console.error('History API failed:', error);
    return res.status(500).json({ error: error.message });
  }
}

export default withAuth(withRateLimit(handler, 30, 60000));
