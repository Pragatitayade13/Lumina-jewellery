import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { initializeFirestore, getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator, setMaxUploadRetryTime, setMaxOperationRetryTime } from 'firebase/storage';

const cleanEnvVar = (val) => {
  if (typeof val !== 'string') return val;
  let cleaned = val.trim();
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1);
  }
  return cleaned.trim();
};

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: cleanEnvVar(import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: cleanEnvVar(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: cleanEnvVar(import.meta.env.VITE_FIREBASE_PROJECT_ID),
  storageBucket: cleanEnvVar(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: cleanEnvVar(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
  appId: cleanEnvVar(import.meta.env.VITE_FIREBASE_APP_ID)
};

// Initialize Firebase
let app, auth, db, storage;

try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = initializeFirestore(app, {
      experimentalForceLongPolling: true,
    });
    storage = getStorage(app);
    
    // Fail fast on network/CORS issues to trigger local base64 fallback immediately (2 seconds)
    try {
      setMaxUploadRetryTime(storage, 2000);
      setMaxOperationRetryTime(storage, 2000);
    } catch (retryErr) {
      console.warn("Could not set storage retry limits:", retryErr);
    }

    // Connect to local Firebase Emulators only if explicitly configured
    if (import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
      try {
        connectFirestoreEmulator(db, '127.0.0.1', 8080);
        connectAuthEmulator(auth, 'http://127.0.0.1:9099');
        connectStorageEmulator(storage, '127.0.0.1', 9199);
        console.log('🔌 Connected to Firebase Emulators (Auth: 9099, Firestore: 8080, Storage: 9199)');
      } catch (emulatorErr) {
        console.warn('Could not connect to Firebase Emulators:', emulatorErr);
      }
    }
  } else {
    app = getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  }
} catch (error) {
  console.warn("Firebase normal initialization warning (possibly HMR):", error);
  try {
    app = getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (err) {
    console.error("Firebase critical initialization error. Did you forget to add your .env variables?", err);
  }
}

if (storage) {
  try {
    storage.maxUploadRetryTime = 2000;
    storage.maxOperationRetryTime = 2000;
  } catch (retryErr) {
    console.warn("Could not set storage retry limits:", retryErr);
  }
}

export { auth, db, storage, app };
