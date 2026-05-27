const admin = require('firebase-admin');

// Initialize Firebase Admin SDK using environment variable credentials.
// The FIREBASE_PRIVATE_KEY env var uses literal "\n" characters which must
// be converted back to real newlines.
if (!admin.apps.length) {
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
}

const db = admin.firestore();

module.exports = { db };
