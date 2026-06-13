import Razorpay from 'razorpay';
import admin from 'firebase-admin';
import { withAuth, withRateLimit } from '../middleware/security.js';

// Initialize Firebase Admin if not already initialized
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
    console.error('Firebase Admin init error in refund:', error);
  }
}

const db = admin.firestore();

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { paymentId, amount, orderId } = req.body;

  if (!paymentId) {
    return res.status(400).json({ message: 'paymentId is required' });
  }

  try {
    const razorpay = new Razorpay({
      key_id: process.env.VITE_RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const refundPayload = {};
    if (amount) {
      refundPayload.amount = Math.round(amount * 100);
    }

    const refund = await razorpay.payments.refund(paymentId, refundPayload);

    // Update order status in Firestore if an orderId was provided
    if (orderId) {
      const orderRef = db.collection('orders').doc(orderId);
      await orderRef.update({
        status: 'refunded',
        refundId: refund.id,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // Optionally re-increment stock here if returning items
    }

    res.status(200).json({
      success: true,
      refundId: refund.id,
      status: refund.status
    });

  } catch (error) {
    console.error("Razorpay refund failed:", error);
    res.status(500).json({ success: false, message: 'Refund failed', error: error.message });
  }
}

export default withAuth(withRateLimit(handler, 10, 60000), ['superadmin', 'admin']);
