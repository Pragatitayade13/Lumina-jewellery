const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc } = require('firebase/firestore');
const fs = require('fs');

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

// Use the local generated image path copied to public directory or base64 data URL
const goldRingUrl = 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80';

async function run() {
  const snap = await getDocs(collection(db, 'products'));
  console.log(`Found ${snap.size} products.`);
  
  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    // Update all products that do not have a valid image or have empty string
    if (!data.image || data.image === '') {
      console.log(`Updating product ${data.name} (${docSnap.id}) with ring image...`);
      await updateDoc(doc(db, 'products', docSnap.id), {
        image: goldRingUrl
      });
    }
  }
  console.log('Update completed successfully!');
}

run().catch(console.error);
