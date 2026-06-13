const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Read service credentials from root .env.local
const envPath = path.resolve(__dirname, '..', '.env.local');
let projectId = '';
let clientEmail = '';
let privateKey = '';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  const pIdMatch = envContent.match(/VITE_FIREBASE_PROJECT_ID=["']?([^"\n\r']+)["']?/);
  if (pIdMatch) projectId = pIdMatch[1];

  // Try loading from standard env if exist, otherwise check secondary location or placeholder
  projectId = projectId || process.env.FIREBASE_PROJECT_ID || 'jewellery-website-50d32';
  clientEmail = process.env.FIREBASE_CLIENT_EMAIL || '';
  privateKey = process.env.FIREBASE_PRIVATE_KEY || '';
}

try {
  const serviceAccount = require('./config/serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (e) {
  if (!admin.apps.length) {
    if (projectId && clientEmail && privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n')
        })
      });
    } else {
      // Initialize with local project ID context, allowing Firestore client fallback
      admin.initializeApp({
        projectId: projectId
      });
    }
  }
}

const db = admin.firestore();

async function run() {
  console.log('--- FINDING AMIKSHA ---');
  let usersSnap;
  try {
    usersSnap = await db.collection('users').get();
  } catch (err) {
    console.error('Failed to query users collection. Ensure your gcloud ADC or service credentials are set correctly.', err.message);
    return;
  }

  let amikshaUid = null;
  usersSnap.forEach(doc => {
    const data = doc.data();
    if (data.name && data.name.toLowerCase().includes('amiksha')) {
      console.log(`Found: ${doc.id} | Email: ${data.email} | Role: ${data.role} | Name: ${data.name} | StoreIds: ${JSON.stringify(data.storeIds || data.storeId)}`);
      amikshaUid = doc.id;
    }
  });

  if (amikshaUid) {
    console.log(`\n--- ORDERS FOR AMIKSHA (UID: ${amikshaUid}) ---`);
    const ordersSnap = await db.collection('orders').where('customerId', '==', amikshaUid).get();
    if (ordersSnap.empty) {
      console.log('No orders found for customerId: ' + amikshaUid);
    } else {
      ordersSnap.forEach(doc => {
        const data = doc.data();
        console.log(`Order: ${doc.id} | Status: ${data.status} | StoreId: ${data.storeId} | Amount: ${data.amount}`);
      });
    }

    console.log(`\n--- ALL ORDERS ---`);
    const allOrdersSnap = await db.collection('orders').limit(10).get();
    allOrdersSnap.forEach(doc => {
      const data = doc.data();
      console.log(`Order: ${doc.id} | CustId: ${data.customerId} | Name: ${data.customer} | Status: ${data.status} | StoreId: ${data.storeId}`);
    });
  } else {
    console.log('Amiksha not found in users collection.');
  }
}

run().catch(console.error);
