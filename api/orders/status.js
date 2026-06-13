import admin from 'firebase-admin';
import Razorpay from 'razorpay';
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
    console.error('Firebase Admin init error in status API:', error);
  }
}

const db = admin.firestore();

// Strict State Machine Rules
const VALID_TRANSITIONS = {
  customer: {
    pending: ['cancelled'],
    confirmed: ['cancelled'],
    delivered: ['return_requested']
  },
  staff: {
    pending: ['processing', 'cancelled'],
    confirmed: ['processing', 'cancelled'],
    processing: ['packed', 'cancelled'],
    packed: ['shipped'],
    shipped: ['delivered'],
    delivered: ['return_requested'],
    return_requested: ['return_approved', 'return_rejected'],
    return_approved: ['pickup_scheduled'],
    pickup_scheduled: ['refund_processed'],
    cancelled: [],
    refund_processed: [],
    return_rejected: []
  }
};

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { orderId, newStatus } = req.body;
  if (!orderId || !newStatus) {
    return res.status(400).json({ message: 'Missing parameters' });
  }

  try {
    const uid = req.user.uid;
    const role = req.user.role || 'customer';
    
    // Determine the rule set to use (superadmin/admin/delivery all use 'staff' for simplicity here)
    const ruleSet = (role === 'customer') ? 'customer' : 'staff';

    // 2. Fetch Order
    const orderRef = db.collection('orders').doc(orderId);
    
    // 3. ATOMIC TRANSACTION: State Check, Validation, and Processing
    await db.runTransaction(async (transaction) => {
      const orderDoc = await transaction.get(orderRef);
      if (!orderDoc.exists) {
        throw new Error('Order not found');
      }

      const orderData = orderDoc.data();

      // Authorization Check
      if (role === 'customer' && orderData.customerId !== uid && orderData.userId !== uid) {
        throw new Error('Unauthorized: You do not own this order');
      }

      const currentStatus = orderData.status || 'pending';

      // State Machine Validation
      const allowedNextStates = VALID_TRANSITIONS[ruleSet][currentStatus] || [];
      if (!allowedNextStates.includes(newStatus)) {
        throw new Error(`Invalid status transition from '${currentStatus}' to '${newStatus}' for role '${role}'`);
      }

      // If transition is valid, prepare updates
      const updates = {
        status: newStatus,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      // Handle Automated Refunds & Stock Reversals
      if (newStatus === 'cancelled' || newStatus === 'refund_processed') {
        // Refund via Razorpay if paid
        if (orderData.paymentId && !orderData.refundId) {
          const razorpay = new Razorpay({
            key_id: process.env.VITE_RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
          });
          const refund = await razorpay.payments.refund(orderData.paymentId);
          updates.refundId = refund.id;
        }

        // Replenish Stock
        if (orderData.items && Array.isArray(orderData.items)) {
          for (const item of orderData.items) {
            if (item.id) {
              const productRef = db.collection('products').doc(item.id);
              const productSnap = await transaction.get(productRef);
              if (productSnap.exists) {
                const currentStock = productSnap.data().stock || 0;
                transaction.update(productRef, { stock: currentStock + item.qty });

                // Audit Log
                const invTxRef = db.collection('inventory_transactions').doc();
                transaction.set(invTxRef, {
                  orderId: orderId,
                  productId: item.id,
                  type: 'return',
                  qty: item.qty,
                  reason: `Order ${newStatus}`,
                  timestamp: admin.firestore.FieldValue.serverTimestamp()
                });
              }
            }
          }
        }
      }

      transaction.update(orderRef, updates);
    });

    return res.status(200).json({ success: true, message: `Order status updated to ${newStatus}` });

  } catch (error) {
    console.error("Order status update failed:", error);
    // Determine if it's a verification error or a logical error
    const statusCode = error.message.includes('Unauthorized') || error.message.includes('Invalid status') ? 403 : 500;
    return res.status(statusCode).json({ success: false, message: error.message });
  }
}

export default withAuth(withRateLimit(handler, 20, 60000));
