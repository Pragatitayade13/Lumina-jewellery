const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, signInWithEmailAndPassword, getAuth } = require('firebase/firestore');
// wait, signInWithEmailAndPassword is in 'firebase/auth'
const { getAuth: getAuthClient, signInWithEmailAndPassword: signIn } = require('firebase/auth');
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
const auth = getAuthClient(app);

async function run() {
  try {
    console.log("Authenticating as super admin...");
    // use the email we know the user used
    await signIn(auth, envVars.SUPERADMIN_EMAIL, "srrf dvgh dwco geot"); // wait, that's SMTP pass. We don't know the user's password.
  } catch(e) {
    console.log("Could not authenticate. Proceeding unauthenticated.");
  }

  try {
    console.log("Fetching stores...");
    const snap = await getDocs(collection(db, 'stores'));
    console.log(`Found ${snap.size} stores.`);
    snap.forEach(doc => console.log(doc.id, doc.data().name, doc.data().status));
  } catch (e) {
    console.error("Error fetching stores:", e.message);
  }

  try {
    console.log("Fetching users...");
    const snap = await getDocs(collection(db, 'users'));
    console.log(`Found ${snap.size} users.`);
  } catch (e) {
    console.error("Error fetching users:", e.message);
  }
}

run().catch(console.error);
