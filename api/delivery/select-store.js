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
    console.error('Firebase Admin init error in select-store API:', error);
  }
}

const db = admin.firestore();

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { storeId, storeName, storeCode } = req.body;
  if (!storeId) {
    return res.status(400).json({ error: 'Missing storeId parameter' });
  }

  try {
    const uid = req.user.uid;
    const role = req.user.role || 'customer';

    // Verify role permissions
    if (role !== 'delivery' && role !== 'superadmin' && role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Delivery role required' });
    }

    // Verify store assignment unless superadmin
    if (role !== 'superadmin') {
      const mappingSnap = await db.collection('userStores')
        .where('userId', '==', uid)
        .where('storeId', '==', storeId)
        .get();
        
      if (mappingSnap.empty) {
        // Fallback check in legacy/alternate mapping collection delivery_partner_store_mapping
        const mappingSnapAlt = await db.collection('delivery_partner_store_mapping')
          .where('partnerId', '==', uid)
          .where('storeId', '==', storeId)
          .where('status', '==', 'active')
          .get();

        if (mappingSnapAlt.empty) {
          return res.status(403).json({ error: 'Forbidden: Partner is not assigned to this store' });
        }
      }
    }

    // Create session record
    const sessionRef = db.collection('delivery_partner_store_session').doc();
    await sessionRef.set({
      partnerId: uid,
      selectedStoreId: storeId,
      selectedStoreName: storeName || 'Store',
      selectedStoreCode: storeCode || 'ST01',
      loginTime: admin.firestore.FieldValue.serverTimestamp(),
      logoutTime: null
    });

    // Create Audit Log
    await db.collection('audit_logs').add({
      action: 'DELIVERY_STORE_SELECT',
      userId: uid,
      role,
      storeId,
      details: { storeCode, storeName },
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    return res.status(200).json({
      success: true,
      session: {
        id: sessionRef.id,
        selectedStoreId: storeId,
        selectedStoreName: storeName || 'Store',
        selectedStoreCode: storeCode || 'ST01'
      }
    });

  } catch (error) {
    console.error('Select store API failed:', error);
    return res.status(500).json({ error: error.message });
  }
}

export default withAuth(withRateLimit(handler, 30, 60000));
