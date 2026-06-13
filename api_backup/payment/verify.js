import crypto from 'crypto';
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
    console.error('Firebase Admin init error in verify:', error);
  }
}

const db = admin.firestore();

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderData) {
    return res.status(400).json({ message: 'Missing parameters' });
  }

  try {
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', key_secret)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    // Idempotency Check: Ensure we don't process the same payment twice
    const existingOrders = await db.collection('orders').where('paymentId', '==', razorpay_payment_id).get();
    if (!existingOrders.empty) {
      return res.status(200).json({ success: true, message: 'Order already processed', orderId: existingOrders.docs[0].id });
    }

    // Attach payment info and confirmed status
    const newOrderData = {
      ...orderData,
      paymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      status: 'confirmed',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // ATOMIC TRANSACTION: Prevent Overselling & Generate Audit Logs
    try {
      const orderRef = db.collection('orders').doc();
      
      await db.runTransaction(async (transaction) => {
        const productRefs = [];
        const productDocs = [];

        // 1. READ: Fetch all current stock levels BEFORE modifying
        if (orderData.items && Array.isArray(orderData.items)) {
          for (const item of orderData.items) {
            if (item.id) {
              const productRef = db.collection('products').doc(item.id);
              productRefs.push({ ref: productRef, qty: item.qty });
              productDocs.push(transaction.get(productRef));
            }
          }
        }
        
        const snapshots = await Promise.all(productDocs);

        // 2. VALIDATE: Check for negative stock
        snapshots.forEach((snap, index) => {
          if (!snap.exists) throw new Error(`Product ${productRefs[index].ref.id} does not exist.`);
          const currentStock = snap.data().stock || 0;
          const requestedQty = productRefs[index].qty;
          if (currentStock < requestedQty) {
            throw new Error(`Insufficient stock for product ${snap.data().name}. Requested: ${requestedQty}, Available: ${currentStock}`);
          }
          // Attach current stock to refs for auditing later
          productRefs[index].currentStock = currentStock;
        });

        // 3. WRITE: Commit updates and audit logs
        transaction.set(orderRef, newOrderData);

        for (const item of productRefs) {
          const newStock = item.currentStock - item.qty;
          
          // Deduct Stock
          transaction.update(item.ref, { stock: newStock });

          // Create inventory_transaction log
          const invTxRef = db.collection('inventory_transactions').doc();
          transaction.set(invTxRef, {
            orderId: orderRef.id,
            productId: item.ref.id,
            type: 'sale',
            qty: -item.qty,
            reason: `Order #${orderRef.id} checkout`,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
          });

          // Create stock_audit_log
          const auditRef = db.collection('stock_audit_logs').doc();
          transaction.set(auditRef, {
            productId: item.ref.id,
            previousStock: item.currentStock,
            newStock: newStock,
            delta: -item.qty,
            action: 'order_checkout',
            referenceId: orderRef.id,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
          });
        }
        
        // 4. Log Tax Transaction for Auditing
        const taxAmount = Number(orderData.gstAmt) || 0;
        if (taxAmount > 0 || Number(orderData.amount) > 0) {
          const taxTxRef = db.collection('tax_transactions').doc();
          transaction.set(taxTxRef, {
            displayId: `#INV-${orderRef.id.slice(0, 8).toUpperCase()}`,
            date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            amount: (Number(orderData.amount) || 0) - taxAmount,
            gstPerc: 'mixed',
            gstAmount: taxAmount,
            cgst: Number(orderData.cgst) || 0,
            sgst: Number(orderData.sgst) || 0,
            igst: Number(orderData.igst) || 0,
            state: orderData.shippingAddress || 'Maharashtra',
            type: (Number(orderData.igst) || 0) > 0 ? 'IGST' : 'CGST+SGST',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            source: 'checkout'
          });
        }
      });

      return res.status(200).json({ success: true, message: 'Payment verified, stock reserved, and order created', orderId: orderRef.id });

    } catch (transactionError) {
      console.error("Transaction aborted:", transactionError);
      // NOTE: Because Razorpay succeeded but our DB transaction failed (likely due to stock out),
      // we must alert admins or trigger an automatic refund here.
      return res.status(400).json({ 
        success: false, 
        message: 'Payment succeeded but order creation failed due to inventory mismatch. A manual refund will be initiated.',
        error: transactionError.message 
      });
    }

  } catch (error) {
    console.error("Payment verification failed:", error);
    return res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
}

export default withAuth(withRateLimit(handler, 10, 60000));
