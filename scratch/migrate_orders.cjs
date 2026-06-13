const fs = require('fs');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, updateDoc, doc } = require('firebase/firestore');

const envFile = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    let val = match[2].trim();
    if (val.startsWith('"')) val = val.slice(1, -1);
    envVars[match[1]] = val;
  }
});

const app = initializeApp({
  apiKey: envVars.VITE_FIREBASE_API_KEY,
  authDomain: envVars.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: envVars.VITE_FIREBASE_PROJECT_ID,
  appId: envVars.VITE_FIREBASE_APP_ID
});

const db = getFirestore(app);

async function run() {
  const snap = await getDocs(collection(db, 'orders'));
  const targetStoreId = 'eoNjBBBlw1edDfPWufPD';
  let count = 0;
  
  for (const document of snap.docs) {
    const data = document.data();
    if (data.storeId !== targetStoreId) {
      await updateDoc(doc(db, 'orders', document.id), {
        storeId: targetStoreId
      });
      count++;
    }
  }
  console.log(`Updated ${count} orders to storeId: ${targetStoreId}`);
}

run().catch(console.error);
