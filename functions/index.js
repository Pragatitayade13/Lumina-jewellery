/**
 * Lumina Jewels Enterprise Backend
 * Firebase Cloud Functions Entry Point
 */

const { onRequest } = require("firebase-functions/v2/https");
const { onDocumentCreated, onDocumentUpdated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();

// --------------------------------------------------------------------
// Express API for Finance & Payment Processing
// --------------------------------------------------------------------
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Example Endpoint: Generate Invoice
app.post("/generateInvoice", async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).send("Order ID required");

    // In a real implementation, you would fetch order details from Firestore
    // and use a library like PDFKit to generate an invoice.
    
    res.status(200).json({ 
      success: true, 
      message: `Invoice generation initiated for order ${orderId}`,
      url: `https://storage.googleapis.com/lumina-jewels.appspot.com/invoices/${orderId}.pdf` 
    });
  } catch (error) {
    console.error("Invoice Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Export Express app as an HTTP Function
exports.api = onRequest(app);


// --------------------------------------------------------------------
// Background Triggers (Database Automation)
// --------------------------------------------------------------------

/**
 * Automatically update inventory when a new order is placed
 */
exports.onOrderCreated = onDocumentCreated("orders/{orderId}", async (event) => {
  const orderData = event.data.data();
  if (!orderData || !orderData.items) return;

  const batch = db.batch();
  
  // Decrement stock for each item in the order
  for (const item of orderData.items) {
    const productRef = db.collection("inventory").doc(item.productId);
    batch.update(productRef, {
      stock: admin.firestore.FieldValue.increment(-item.quantity)
    });
  }

  try {
    await batch.commit();
    console.log(`Inventory updated for order ${event.params.orderId}`);
  } catch (error) {
    console.error("Failed to update inventory:", error);
  }
});

/**
 * Auto-assign delivery partner when an order status changes to "shipped"
 */
exports.onOrderStatusChange = onDocumentUpdated("orders/{orderId}", async (event) => {
  const newData = event.data.after.data();
  const oldData = event.data.before.data();

  // If status changed to 'shipped'
  if (newData.status === 'shipped' && oldData.status !== 'shipped') {
    // Logic to find nearest delivery partner and create a document in 'deliveries' collection
    console.log(`Order ${event.params.orderId} marked as shipped. Triggering logistics...`);
    
    await db.collection('deliveries').add({
      orderId: event.params.orderId,
      customerId: newData.customerId,
      address: newData.address,
      status: 'pending_pickup',
      assignedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }
});
