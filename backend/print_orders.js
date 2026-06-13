const admin = require('firebase-admin');
const path = require('path');

const serviceAccount = require(path.join(__dirname, '../jewellery-website-50d32-firebase-adminsdk-h0e5d-16a30fb724.json'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function run() {
  const ordersSnap = await db.collection('orders').get();
  console.log(`--- Total Orders: ${ordersSnap.size} ---`);
  ordersSnap.forEach(doc => {
    const data = doc.data();
    console.log(`ID: ${doc.id} | StoreId: ${data.storeId} | Status: ${data.status} | PartnerId: ${data.deliveryPartnerId} | PartnerName: ${data.deliveryPartnerName}`);
  });
}

run().catch(console.error);
