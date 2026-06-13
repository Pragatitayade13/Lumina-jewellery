import admin from 'firebase-admin';
import { withAuth, withRateLimit } from './middleware/security.js';

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
    console.error('Firebase Admin init error in consolidated delivery API:', error);
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
  const action = req.query.action || req.body.action;
  if (!action) {
    return res.status(400).json({ error: 'Missing action parameter' });
  }

  const uid = req.user?.uid;
  const role = req.user?.role || 'customer';
  const name = req.user?.name || req.user?.email || 'Delivery Partner';

  try {
    switch (action) {
      case 'orders': {
        if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });
        const { storeId } = req.query;
        if (!storeId) return res.status(400).json({ error: 'Missing storeId parameter' });
        
        // Verify store context permission
        if (role !== 'superadmin') {
          const mappingSnap = await db.collection('userStores').where('userId', '==', uid).where('storeId', '==', storeId).get();
          if (mappingSnap.empty) {
            const mappingSnapAlt = await db.collection('delivery_partner_store_mapping').where('partnerId', '==', uid).where('storeId', '==', storeId).get();
            if (mappingSnapAlt.empty) return res.status(403).json({ error: 'Forbidden: Access denied to this store' });
          }
        }
        let ordersQuery = db.collection('orders').where('storeId', '==', storeId);
        const isSupervisor = ['superadmin', 'admin', 'manager', 'finance'].includes(role);
        if (!isSupervisor) {
          const snapshot = await ordersQuery.get();
          const list = [];
          snapshot.forEach(doc => {
            const data = doc.data();
            if (data.deliveryPartnerId === uid || data.status === 'packed') {
              list.push({ id: doc.id, ...data });
            }
          });
          return res.status(200).json({ success: true, orders: list });
        }
        const snapshot = await ordersQuery.get();
        const list = [];
        snapshot.forEach(doc => { list.push({ id: doc.id, ...doc.data() }); });
        return res.status(200).json({ success: true, orders: list });
      }

      case 'start-delivery': {
        if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
        const { orderId, storeId } = req.body;
        if (!orderId || !storeId) return res.status(400).json({ error: 'Missing parameters: orderId and storeId are required' });
        
        const mappingSnap = await db.collection('userStores').where('userId', '==', uid).where('storeId', '==', storeId).get();
        if (mappingSnap.empty && role !== 'superadmin') {
          const mappingSnapAlt = await db.collection('delivery_partner_store_mapping').where('partnerId', '==', uid).where('storeId', '==', storeId).get();
          if (mappingSnapAlt.empty) return res.status(403).json({ error: 'Forbidden: Access denied to this store context' });
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 5 * 60000).toISOString();
        const orderRef = db.collection('orders').doc(orderId);
        
        await db.runTransaction(async (transaction) => {
          const orderDoc = await transaction.get(orderRef);
          if (!orderDoc.exists) throw new Error('Order not found');
          const orderData = orderDoc.data();
          if (orderData.storeId !== storeId) throw new Error('Store ID mismatch: Order does not belong to requested store');
          transaction.update(orderRef, {
            status: 'in_transit',
            deliveryPartnerId: uid,
            deliveryPartnerName: name,
            otp: otp,
            otpExpiry: otpExpiry,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
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
        await db.collection('tracking_history').add({
          orderId, storeId, status: 'IN_TRANSIT', updatedByRole: 'delivery', userId: uid, timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
        return res.status(200).json({ success: true, message: 'Delivery started successfully', otp });
      }

      case 'complete-delivery': {
        if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
        const { orderId, customerPhoto, signature, latitude, longitude, managerApproved } = req.body;
        if (!orderId || !customerPhoto || !signature) return res.status(400).json({ error: 'Missing required parameters' });
        
        const orderRef = db.collection('orders').doc(orderId);
        const orderDoc = await orderRef.get();
        if (!orderDoc.exists) return res.status(404).json({ error: 'Order not found' });
        const orderData = orderDoc.data();
        if (!orderData.otpVerified) return res.status(400).json({ error: 'OTP verification is mandatory before completing delivery' });
        if (!orderData.jewelleryVerified) return res.status(400).json({ error: 'Jewellery specification verification is mandatory' });
        
        let gpsVerified = true;
        if (latitude && longitude && orderData.destinationCoords) {
          const dist = getDistance(parseFloat(latitude), parseFloat(longitude), parseFloat(orderData.destinationCoords.latitude), parseFloat(orderData.destinationCoords.longitude));
          if (dist > 100) {
            gpsVerified = false;
            if (!managerApproved) return res.status(403).json({ error: `Out of delivery radius (${Math.round(dist)}m away). Manager approval required.`, requiresApproval: true, distance: dist });
          }
        }
        const verificationRef = db.collection('delivery_verification').doc();
        await verificationRef.set({
          orderId, storeId: orderData.storeId, customerPhoto, signature, otpVerified: true, gpsVerified, certificateVerified: orderData.jewelleryChecks?.certificateMatched || false, weightVerified: orderData.jewelleryChecks?.weightMatched || false, verifiedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        await db.runTransaction(async (transaction) => {
          transaction.update(orderRef, { status: 'delivered', updatedAt: admin.firestore.FieldValue.serverTimestamp() });
          const shipmentsSnap = await db.collection('shipments').where('orderId', '==', orderId).get();
          shipmentsSnap.forEach(sDoc => { transaction.update(sDoc.ref, { status: 'DELIVERED', updatedAt: admin.firestore.FieldValue.serverTimestamp() }); });
        });
        await db.collection('tracking_history').add({
          orderId, storeId: orderData.storeId, status: 'DELIVERED', updatedByRole: role, userId: uid, timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
        await db.collection('audit_logs').add({
          action: 'DELIVERY_COMPLETED', userId: uid, role, storeId: orderData.storeId, details: { orderId, gpsVerified, managerApproved: !!managerApproved }, timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
        return res.status(200).json({ success: true, message: 'Delivery completed successfully and recorded in audit trail' });
      }

      case 'tracking': {
        if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });
        const { orderId } = req.query;
        if (!orderId) return res.status(400).json({ error: 'Missing orderId query parameter' });
        
        const snapshot = await db.collection('delivery_tracking').where('orderId', '==', orderId).orderBy('timestamp', 'desc').limit(10).get();
        const logs = [];
        snapshot.forEach(doc => { logs.push({ id: doc.id, ...doc.data() }); });
        const orderDoc = await db.collection('orders').doc(orderId).get();
        if (!orderDoc.exists) return res.status(404).json({ error: 'Order not found' });
        const orderData = orderDoc.data();
        return res.status(200).json({
          success: true,
          latestCheckpoint: logs[0] || null,
          checkpoints: logs,
          orderDetails: { orderNumber: orderData.id, status: orderData.status, deliveryPartnerName: orderData.deliveryPartnerName || 'Awaiting Assignment', deliveryPartnerId: orderData.deliveryPartnerId || null }
        });
      }

      case 'update-location': {
        if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
        const { orderId, storeId, latitude, longitude, speed, deviceInfo } = req.body;
        if (!orderId || !storeId || latitude === undefined || longitude === undefined) return res.status(400).json({ error: 'Missing required parameters' });
        
        const trackingRef = db.collection('delivery_tracking').doc();
        await trackingRef.set({
          orderId, partnerId: uid, storeId, latitude, longitude, speed: speed || 0, deviceInfo: deviceInfo || 'Unknown Device', timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
        await db.collection('orders').doc(orderId).update({
          latestLocation: { latitude, longitude, speed: speed || 0, timestamp: new Date().toISOString() }
        });
        return res.status(200).json({ success: true, message: 'Location updated successfully' });
      }

      case 'verify-customer': {
        if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
        const { orderId, otp } = req.body;
        if (!orderId || !otp) return res.status(400).json({ error: 'Missing parameters: orderId and otp are required' });
        
        const orderRef = db.collection('orders').doc(orderId);
        const orderDoc = await orderRef.get();
        if (!orderDoc.exists) return res.status(404).json({ error: 'Order not found' });
        const orderData = orderDoc.data();
        if (orderData.otpVerified) return res.status(400).json({ error: 'OTP has already been verified for this order.' });
        if (!orderData.otp) return res.status(400).json({ error: 'No OTP generated for this order. Please start delivery.' });
        if (orderData.otp !== otp) return res.status(403).json({ error: 'Invalid OTP PIN. Please try again.' });
        const expiryDate = orderData.otpExpiry ? new Date(orderData.otpExpiry) : null;
        if (expiryDate && expiryDate < new Date()) return res.status(403).json({ error: 'OTP PIN has expired. Please request a new OTP.' });
        
        await orderRef.update({ otpVerified: true, otpVerifiedAt: admin.firestore.FieldValue.serverTimestamp() });
        return res.status(200).json({ success: true, message: 'Customer OTP verified successfully' });
      }

      case 'verify-jewellery': {
        if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
        const { orderId, packagingIntact, weightMatched, certificateMatched, productMatched } = req.body;
        if (!orderId) return res.status(400).json({ error: 'Missing orderId parameter' });
        if (!packagingIntact || !weightMatched || !certificateMatched || !productMatched) return res.status(400).json({ error: 'All physical checks must be verified and checked' });
        
        const orderRef = db.collection('orders').doc(orderId);
        await orderRef.update({
          jewelleryVerified: true,
          jewelleryChecks: { packagingIntact, weightMatched, certificateMatched, productMatched, verifiedAt: new Date().toISOString() }
        });
        return res.status(200).json({ success: true, message: 'Jewellery specification verification recorded' });
      }

      case 'select-store': {
        if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
        const { storeId, storeName, storeCode } = req.body;
        if (!storeId) return res.status(400).json({ error: 'Missing storeId parameter' });
        
        if (role !== 'delivery' && role !== 'superadmin' && role !== 'admin') return res.status(403).json({ error: 'Forbidden: Delivery role required' });
        if (role !== 'superadmin') {
          const mappingSnap = await db.collection('userStores').where('userId', '==', uid).where('storeId', '==', storeId).get();
          if (mappingSnap.empty) {
            const mappingSnapAlt = await db.collection('delivery_partner_store_mapping').where('partnerId', '==', uid).where('storeId', '==', storeId).where('status', '==', 'active').get();
            if (mappingSnapAlt.empty) return res.status(403).json({ error: 'Forbidden: Partner is not assigned to this store' });
          }
        }
        const sessionRef = db.collection('delivery_partner_store_session').doc();
        await sessionRef.set({ partnerId: uid, selectedStoreId: storeId, selectedStoreName: storeName || 'Store', selectedStoreCode: storeCode || 'ST01', loginTime: admin.firestore.FieldValue.serverTimestamp(), logoutTime: null });
        await db.collection('audit_logs').add({ action: 'DELIVERY_STORE_SELECT', userId: uid, role, storeId, details: { storeCode, storeName }, timestamp: admin.firestore.FieldValue.serverTimestamp() });
        return res.status(200).json({ success: true, session: { id: sessionRef.id, selectedStoreId: storeId, selectedStoreName: storeName || 'Store', selectedStoreCode: storeCode || 'ST01' } });
      }

      case 'dashboard': {
        if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });
        const { storeId } = req.query;
        if (!storeId) return res.status(400).json({ error: 'Missing storeId query parameter' });
        
        if (role !== 'superadmin') {
          const mappingSnap = await db.collection('userStores').where('userId', '==', uid).where('storeId', '==', storeId).get();
          if (mappingSnap.empty) {
            const mappingSnapAlt = await db.collection('delivery_partner_store_mapping').where('partnerId', '==', uid).where('storeId', '==', storeId).get();
            if (mappingSnapAlt.empty) return res.status(403).json({ error: 'Forbidden: Access denied to this store' });
          }
        }
        const ordersSnap = await db.collection('orders').where('storeId', '==', storeId).get();
        let todayCount = 0, pendingCount = 0, deliveredCount = 0, failedCount = 0, inTransitCount = 0, returnPickupCount = 0;
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        
        ordersSnap.forEach(doc => {
          const data = doc.data();
          const status = data.status || '';
          const isPartnerOrder = role === 'superadmin' || data.deliveryPartnerId === uid;
          if (!isPartnerOrder) return;
          const createdAt = data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt)) : null;
          if (createdAt && createdAt >= startOfToday) todayCount++;
          if (['assigned', 'packed'].includes(status)) pendingCount++;
          else if (status === 'delivered') deliveredCount++;
          else if (['failed', 'cancelled'].includes(status)) failedCount++;
          else if (['in_transit', 'out_for_delivery'].includes(status)) inTransitCount++;
          else if (['returned', 'return_requested'].includes(status)) returnPickupCount++;
        });
        return res.status(200).json({
          success: true,
          stats: { todaysDeliveries: todayCount, pendingDeliveries: pendingCount, deliveredOrders: deliveredCount, failedDeliveries: failedCount, liveOrdersInTransit: inTransitCount, returnPickups: returnPickupCount, exchangeDeliveries: 0, customerAwaitingVerification: pendingCount }
        });
      }

      case 'history': {
        if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });
        const { storeId } = req.query;
        if (!storeId) return res.status(400).json({ error: 'Missing storeId parameter' });
        
        if (role !== 'superadmin') {
          const mappingSnap = await db.collection('userStores').where('userId', '==', uid).where('storeId', '==', storeId).get();
          if (mappingSnap.empty) {
            const mappingSnapAlt = await db.collection('delivery_partner_store_mapping').where('partnerId', '==', uid).where('storeId', '==', storeId).get();
            if (mappingSnapAlt.empty) return res.status(403).json({ error: 'Forbidden: Access denied to this store' });
          }
        }
        const snapshot = await db.collection('orders').where('storeId', '==', storeId).where('deliveryPartnerId', '==', uid).where('status', '==', 'delivered').get();
        const history = [];
        snapshot.forEach(doc => { history.push({ id: doc.id, ...doc.data() }); });
        return res.status(200).json({ success: true, history });
      }

      default:
        return res.status(400).json({ error: 'Invalid action parameter' });
    }
  } catch (error) {
    console.error(`Delivery API consolidated handler failed for action ${action}:`, error);
    return res.status(500).json({ error: error.message });
  }
}

export default withAuth(withRateLimit(handler, 100, 60000));
