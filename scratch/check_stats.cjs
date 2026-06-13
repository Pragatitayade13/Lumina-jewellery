const admin = require('firebase-admin');
const path = require('path');

const serviceAccount = require(path.join(__dirname, '../jewellery-website-50d32-firebase-adminsdk-h0e5d-16a30fb724.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkStats() {
  const collections = ['orders', 'shipments', 'inventory', 'products', 'users'];
  for (const col of collections) {
    console.log(`\n--- Collection: ${col} ---`);
    const snap = await db.collection(col).get();
    console.log(`Total documents: ${snap.size}`);
    
    const storeMap = {};
    snap.forEach(doc => {
      const data = doc.data();
      const storeId = data.storeId || 'NO_STORE_ID';
      storeMap[storeId] = (storeMap[storeId] || 0) + 1;
    });
    console.log("Store ID distribution:", storeMap);
  }
}

checkStats().catch(console.error);
