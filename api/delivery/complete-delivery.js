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
    console.error('Firebase Admin init error in complete-delivery API:', error);
  }
}

const db = admin.firestore();

// Haversine formula to compute distance in meters
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // metres
  const phi1 = lat1 * Math.PI/180;
  const phi2 = lat2 * Math.PI/180;
  const deltaPhi = (lat2-lat1) * Math.PI/180;
  const deltaLambda = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(deltaPhi/2) * Math.sin(deltaPhi/2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda/2) * Math.sin(deltaLambda/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // in meters
}

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { orderId, customerPhoto, signature, latitude, longitude, managerApproved } = req.body;
  if (!orderId || !customerPhoto || !signature) {
    return res.status(400).json({ error: 'Missing required parameters: orderId, customerPhoto, and signature are required' });
  }

  try {
    const uid = req.user.uid;
    const role = req.user.role || 'customer';

    const orderRef = db.collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();
    if (!orderDoc.exists) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const orderData = orderDoc.data();

    // Verify OTP was completed
    if (!orderData.otpVerified) {
      return res.status(400).json({ error: 'OTP verification is mandatory before completing delivery' });
    }

    // Verify Jewellery checks were completed
    if (!orderData.jewelleryVerified) {
      return res.status(400).json({ error: 'Jewellery specification verification is mandatory' });
    }

    // GPS location check (radius 100 meters)
    let gpsVerified = true;
    if (latitude && longitude && orderData.destinationCoords) {
      const dist = getDistance(
        parseFloat(latitude), 
        parseFloat(longitude), 
        parseFloat(orderData.destinationCoords.latitude), 
        parseFloat(orderData.destinationCoords.longitude)
      );

      if (dist > 100) {
        gpsVerified = false;
        if (!managerApproved) {
          return res.status(403).json({ 
            error: `Out of delivery radius (${Math.round(dist)}m away). Manager approval required.`,
            requiresApproval: true,
            distance: dist
          });
        }
      }
    }

    // Record Delivery Verification evidence
    const verificationRef = db.collection('delivery_verification').doc();
    await verificationRef.set({
      orderId,
      storeId: orderData.storeId,
      customerPhoto, // Base64 representation
      signature,     // Base64 representation
      otpVerified: true,
      gpsVerified,
      certificateVerified: orderData.jewelleryChecks?.certificateMatched || false,
      weightVerified: orderData.jewelleryChecks?.weightMatched || false,
      verifiedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Complete order and update associated shipment status
    await db.runTransaction(async (transaction) => {
      transaction.update(orderRef, {
        status: 'delivered',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      const shipmentsSnap = await db.collection('shipments').where('orderId', '==', orderId).get();
      shipmentsSnap.forEach(sDoc => {
        transaction.update(sDoc.ref, {
          status: 'DELIVERED',
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      });
    });

    // Log tracking history
    await db.collection('tracking_history').add({
      orderId,
      storeId: orderData.storeId,
      status: 'DELIVERED',
      updatedByRole: role,
      userId: uid,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    // Audit logs entry
    await db.collection('audit_logs').add({
      action: 'DELIVERY_COMPLETED',
      userId: uid,
      role,
      storeId: orderData.storeId,
      details: { orderId, gpsVerified, managerApproved: !!managerApproved },
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    return res.status(200).json({ success: true, message: 'Delivery completed successfully and recorded in audit trail' });

  } catch (error) {
    console.error('Complete delivery API failed:', error);
    return res.status(500).json({ error: error.message });
  }
}

export default withAuth(withRateLimit(handler, 30, 60000));
