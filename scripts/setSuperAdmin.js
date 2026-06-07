// scripts/setSuperAdmin.js
const admin = require('firebase-admin');
const { ROLE_PERMISSIONS } = require('../backend/utils/rbac');

// Initialize Firebase Admin (assuming you have a serviceAccountKey.json or set GOOGLE_APPLICATION_CREDENTIALS)
// If running locally, you might need to point this to your service account explicitly.
try {
  const serviceAccount = require('../backend/config/serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (e) {
  // Fallback to default if ENV vars are set
  if (!admin.apps.length) {
    admin.initializeApp();
  }
}

const db = admin.firestore();

async function setSuperAdmin(uid) {
  if (!uid) {
    console.error('Please provide a UID: node setSuperAdmin.js <UID>');
    process.exit(1);
  }

  try {
    const role = 'superadmin';
    const permissions = ROLE_PERMISSIONS[role];

    console.log(`Assigning ${role} to ${uid}...`);
    
    // 1. Set custom claims
    await admin.auth().setCustomUserClaims(uid, { role, permissions });
    console.log('✅ Custom claims assigned successfully.');

    // 2. Sync to Firestore
    await db.collection('users').doc(uid).set({
      uid,
      role,
      permissions,
      isActive: true,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
    console.log('✅ Firestore user document synced successfully.');
    console.log(`\n🎉 User ${uid} is now a superadmin. They must log out and log back in for changes to take effect.`);

  } catch (error) {
    console.error('❌ Failed to assign superadmin role:', error);
  } finally {
    process.exit(0);
  }
}

const targetUid = process.argv[2];
setSuperAdmin(targetUid);
