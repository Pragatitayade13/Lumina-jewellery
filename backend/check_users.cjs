const admin = require('firebase-admin');

try {
  const serviceAccount = require('./config/serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (e) {
  if (!admin.apps.length) {
    admin.initializeApp();
  }
}

const db = admin.firestore();

async function run() {
  console.log('--- USERS ---');
  const usersSnap = await db.collection('users').get();
  usersSnap.forEach(doc => {
    const data = doc.data();
    console.log(`User: ${doc.id} | Email: ${data.email} | Role: ${data.role} | Name: ${data.name} | StoreIds: ${JSON.stringify(data.storeIds || data.storeId)}`);
  });

  console.log('\n--- RECENT ORDERS ---');
  const ordersSnap = await db.collection('orders').limit(5).get();
  ordersSnap.forEach(doc => {
    const data = doc.data();
    console.log(`Order: ${doc.id} | Cust: ${data.customer || data.customerId} | Status: ${data.status} | Store: ${data.storeId} | Partner: ${data.deliveryPartnerId}`);
  });

  console.log('\n--- RECENT SHIPMENTS ---');
  const shipmentsSnap = await db.collection('shipments').limit(5).get();
  shipmentsSnap.forEach(doc => {
    const data = doc.data();
    console.log(`Shipment: ${doc.id} | OrderId: ${data.orderId} | Status: ${data.status} | Store: ${data.storeId} | Partner: ${data.deliveryPartnerId || data.partnerId}`);
  });
}

run().catch(console.error);
