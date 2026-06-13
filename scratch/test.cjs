const fs = require('fs');
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');

// Parse .env.local
const envFile = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    let val = match[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    envVars[match[1]] = val;
  }
});

const firebaseConfig = {
  apiKey: envVars.VITE_FIREBASE_API_KEY,
  authDomain: envVars.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: envVars.VITE_FIREBASE_PROJECT_ID,
  storageBucket: envVars.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: envVars.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: envVars.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function test() {
  try {
    // Authenticate as Super Admin
    await signInWithEmailAndPassword(auth, envVars.SUPERADMIN_EMAIL, 'pragati'); // assuming this password or we can fetch it
    console.log('Authenticated as:', auth.currentUser.uid);

    // Query orders
    const q = query(collection(db, 'orders'));
    const snapshot = await getDocs(q);
    console.log('Total orders in DB:', snapshot.size);
    snapshot.docs.forEach(doc => {
      console.log('Order:', doc.id, 'StoreId:', doc.data().storeId, 'Amount:', doc.data().amount);
    });

  } catch (err) {
    console.error('Error:', err.message);
  }
}

test();
