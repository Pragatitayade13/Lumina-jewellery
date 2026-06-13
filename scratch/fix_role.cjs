const { initializeApp } = require('firebase/app');
const { getFirestore, doc, updateDoc } = require('firebase/firestore');
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

async function run() {
  const uid = "LFG8eZx2TpY06ENMEACd0RbABLm2";
  try {
    console.log(`Updating role for user ${uid} to 'superadmin'...`);
    await updateDoc(doc(db, 'users', uid), {
      role: 'superadmin'
    });
    console.log("Success! Role updated.");
  } catch (e) {
    console.error("Error updating document:", e.message);
  }
}

run().catch(console.error);
