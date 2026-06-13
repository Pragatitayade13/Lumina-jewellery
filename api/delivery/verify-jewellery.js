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
    console.error('Firebase Admin init error in verify-jewellery API:', error);
  }
}

const db = admin.firestore();

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { orderId, packagingIntact, weightMatched, certificateMatched, productMatched } = req.body;
  if (!orderId) {
    return res.status(400).json({ error: 'Missing orderId parameter' });
  }

  if (!packagingIntact || !weightMatched || !certificateMatched || !productMatched) {
    return res.status(400).json({ error: 'All physical checks must be verified and checked' });
  }

  try {
    const orderRef = db.collection('orders').doc(orderId);
    await orderRef.update({
      jewelleryVerified: true,
      jewelleryChecks: {
        packagingIntact,
        weightMatched,
        certificateMatched,
        productMatched,
        verifiedAt: new Date().toISOString()
      }
    });

    return res.status(200).json({ success: true, message: 'Jewellery specification verification recorded' });

  } catch (error) {
    console.error('Verify jewellery API failed:', error);
    return res.status(500).json({ error: error.message });
  }
}

export default withAuth(withRateLimit(handler, 30, 60000));
