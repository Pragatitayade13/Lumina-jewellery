const admin = require('firebase-admin');
const path = require('path');

const serviceAccount = require(path.join(__dirname, '../jewellery-website-50d32-firebase-adminsdk-h0e5d-16a30fb724.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const storeA = 'OCoSBsKDGGOT5NOqZpP1'; // Khandelval
const storeB = 'eoNjBBBlw1edDfPWufPD'; // gold and jems

async function distribute() {
  console.log("Fetching all orders...");
  const ordersSnap = await db.collection('orders').get();
  console.log(`Found ${ordersSnap.size} orders. Distributing...`);

  let count = 0;
  for (const orderDoc of ordersSnap.docs) {
    const orderId = orderDoc.id;
    // Alternate store assignment
    const targetStore = (count % 2 === 0) ? storeA : storeB;
    console.log(`Assigning Order ${orderId} to store ${targetStore === storeA ? 'Khandelval' : 'Gold & Jems'}`);

    // 1. Update Order
    await db.collection('orders').doc(orderId).update({ storeId: targetStore });

    // 2. Update Shipments with matching orderId
    const shipmentsSnap = await db.collection('shipments').where('orderId', '==', orderId).get();
    for (const sDoc of shipmentsSnap.docs) {
      await sDoc.ref.update({ storeId: targetStore });
    }

    // 3. Update Invoices with matching orderId
    const invoicesSnap = await db.collection('invoices').where('orderId', '==', orderId).get();
    for (const iDoc of invoicesSnap.docs) {
      await iDoc.ref.update({ storeId: targetStore });
    }

    // 4. Update Transactions with matching orderId
    const txSnap = await db.collection('transactions').where('orderId', '==', orderId).get();
    for (const txDoc of txSnap.docs) {
      await txDoc.ref.update({ storeId: targetStore });
    }

    // 5. Update Expenses with matching orderId
    const expSnap = await db.collection('expenses').where('orderId', '==', orderId).get();
    for (const expDoc of expSnap.docs) {
      await expDoc.ref.update({ storeId: targetStore });
    }

    count++;
  }

  console.log("\nDistribution completed successfully!");
}

distribute().catch(console.error);
