const admin = require('firebase-admin');

let db = null;

if (!process.env.FIREBASE_PROJECT_ID) {
  console.warn("⚠️ Firebase Admin credentials not found. Firebase features will be disabled.");
} else if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY
          ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
          : undefined,
      }),
    });
    console.log('Firebase Admin SDK initialized successfully.');
    db = admin.firestore();
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error);
  }
}

module.exports = { db };
