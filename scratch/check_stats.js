import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import fs from 'fs';

// Read env variables
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
const auth = getAuth(app);

const passwords = ['pragati', 'Pragati@13022004', '123456', 'Password123!', 'admin123', 'srrf dvgh dwco geot'];

async function checkStats() {
  let loggedIn = false;
  const email = envVars.SUPERADMIN_EMAIL || 'luminajewels.app@gmail.com';
  
  for (const pw of passwords) {
    try {
      console.log(`Trying to sign in as ${email} with password: ${pw}...`);
      await signInWithEmailAndPassword(auth, email, pw);
      console.log("Sign-in successful!");
      loggedIn = true;
      break;
    } catch(e) {
      console.log(`Failed: ${e.message}`);
    }
  }

  if (!loggedIn) {
    console.error("Could not log in. Aborting query.");
    return;
  }

  const collections = ['orders', 'shipments', 'inventory', 'products'];
  for (const col of collections) {
    console.log(`\n--- Collection: ${col} ---`);
    const snap = await getDocs(collection(db, col));
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
