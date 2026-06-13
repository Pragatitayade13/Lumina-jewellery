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
    console.error('Firebase Admin init error in verify-customer API:', error);
  }
}

const db = admin.firestore();

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { orderId, otp } = req.body;
  if (!orderId || !otp) {
    return res.status(400).json({ error: 'Missing parameters: orderId and otp are required' });
  }

  try {
    const orderRef = db.collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();
    if (!orderDoc.exists) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const orderData = orderDoc.data();

    // Check duplicate OTP prevention (already verified)
    if (orderData.otpVerified) {
      return res.status(400).json({ error: 'OTP has already been verified for this order.' });
    }

    if (!orderData.otp) {
      return res.status(400).json({ error: 'No OTP generated for this order. Please start delivery.' });
    }

    if (orderData.otp !== otp) {
      return res.status(403).json({ error: 'Invalid OTP PIN. Please try again.' });
    }

    // Check expiry
    const expiryDate = orderData.otpExpiry ? new Date(orderData.otpExpiry) : null;
    if (expiryDate && expiryDate < new Date()) {
      return res.status(403).json({ error: 'OTP PIN has expired. Please request a new OTP.' });
    }

    // Mark as verified
    await orderRef.update({
      otpVerified: true,
      otpVerifiedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return res.status(200).json({ success: true, message: 'Customer OTP verified successfully' });

  } catch (error) {
    console.error('Verify customer API failed:', error);
    return res.status(500).json({ error: error.message });
  }
}

export default withAuth(withRateLimit(handler, 20, 60000));
