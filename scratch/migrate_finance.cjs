const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const path = require('path');

// Ensure you have the service account key locally for this script to run.
// You might need to change the path below to match your setup.
const serviceAccount = require(path.join(__dirname, '../jewellery-website-50d32-firebase-adminsdk-h0e5d-16a30fb724.json'));

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function migrateFinance() {
  console.log("Starting Finance Migration...");
  try {
    const ordersSnap = await db.collection('orders').get();
    let migrated = 0;

    for (const doc of ordersSnap.docs) {
      const order = doc.data();
      const storeId = order.storeId || 'GLOBAL';
      const amount = Number(order.amount) || 0;
      
      if (amount <= 0) continue;

      const orderRef = doc.ref.path;
      
      // 1. Transaction (Revenue)
      await db.collection('transactions').add({
        orderId: doc.id,
        type: 'revenue',
        amount: amount,
        status: 'completed',
        paymentMethod: order.paymentMethod || 'Unknown',
        storeId: storeId,
        createdAt: order.createdAt || FieldValue.serverTimestamp(),
        description: `Historical Order Revenue - ${doc.id}`
      });

      // 2. Expense (COGS - 62%)
      await db.collection('expenses').add({
        orderId: doc.id,
        type: 'cogs',
        amount: amount * 0.62,
        storeId: storeId,
        createdAt: order.createdAt || FieldValue.serverTimestamp(),
        description: `Cost of Goods Sold - ${doc.id}`
      });

      // 3. Expense (OPEX - 11%)
      await db.collection('expenses').add({
        orderId: doc.id,
        type: 'opex',
        amount: amount * 0.11,
        storeId: storeId,
        createdAt: order.createdAt || FieldValue.serverTimestamp(),
        description: `Operating Expenses - ${doc.id}`
      });

      migrated++;
      console.log(`Migrated ${migrated}/${ordersSnap.size} orders (${doc.id})`);
    }

    console.log(`\nSuccess! Created finance records for ${migrated} historical orders.`);
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

migrateFinance();
